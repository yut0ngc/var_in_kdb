import asyncio
import requests
import websockets

from qpython import qconnection
from typing import Dict
import json
import argparse
import logging
from datetime import datetime, timedelta, date
import sys

import smtplib
from email.message import EmailMessage
# import time

# try:
#     import thread
# except ImportError:
#     import _thread as thread


q = None
last_message_datetime = None
message_count = 0

def send_email(t:str, e: str) -> None:
    smtp_server = 'smtp.office365.com'
    smtp_port = 587
    smtp_username = 'removed_for_privacy'
    smtp_password = 'removed_for_privacy'
    recipient_email = 'removed_for_privacy'
    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(smtp_username, smtp_password)
        msg = EmailMessage()
        now = datetime.now()
        msg["Subject"] = t + now.strftime("%Y-%m-%d %H:%M:%S")
        msg['From'] =smtp_username
        msg['To'] = recipient_email
        msg.set_content(e)
        server.send_message(msg)

class DeribitFH:
    def __init__(self, config_dir: str) -> None:
        # self.config_dir = "keys.txt"
        with open(config_dir, "r") as f:
            config = f.read().split(" ")
        self.client_id: str = config[0]
        self.client_secret: str = config[1]
        self.websocket_client = None
        self.refresh_token: str = None
        self.refresh_token_expiry_time: int = None
        self.subscribed_products = []

        self.auth_msg = {
            "jsonrpc": "2.0",
            "id": 0,
            "method": "public/auth",
            "params": {
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
            },
        }

        self.data_msg = {
            "jsonrpc": "2.0",
            "id": 3600,
            "method": "private/subscribe",
            "params": {"channels": ["ticker.ETH-29DEC23-5000-P.raw"]},
        }

        self.unsubscribe_msg = {
            "jsonrpc": "2.0",
            "id": 3601,
            "method": "private/unsubscribe",
            "params": {"channels": ["ticker.ETH-29DEC23-5000-P.raw"]},
        }

        self.loop = asyncio.get_event_loop()

        self.loop.run_until_complete(
            self.ws_manager()
            )
    
    def get_ws_channels(self, currency: str, product: str) -> list:
        url = f"https://www.deribit.com/api/v2/public/get_instruments?currency={currency}&kind={product}"
        logging.info("Fetching instruments with currency=%s, product=%s" % (currency, product))
        r = requests.get(url)
        js = r.json()
        instruments = js["result"]
        instrument_names = [i["instrument_name"] for i in instruments]
        return [r"ticker."+name+r".raw" for name in instrument_names]

    @staticmethod
    def connect_to_port(host, port):
        logging.info("Connecting to tickerplant on host=%s, port=%d" % (host, port))
        q = qconnection.QConnection(host=host, port=port)
        q.open()
        return q

    async def ws_manager(self) -> None:
        logging.info("Try authentication with provided id and secret")
        logging.info("Opening WebSocket connection")
        async for websocket in websockets.connect("wss://www.deribit.com/ws/api/v2"):
            self.websocket_client = websocket
            self.subscribed_products = []
            try:
                await self.ws_auth()
                await self.establish_heartbeat()
                self.loop.create_task(
                    self.ws_refresh_auth()
                )

                self.loop.create_task(
                    self.ws_operation(
                        operation='subscribe',
                        ws_channel=self.get_ws_channels("BTC","future")
                        )
                )

                self.loop.create_task(
                    self.ws_operation(
                        operation='subscribe',
                        ws_channel=self.get_ws_channels("BTC","option")
                        )
                )

                self.loop.create_task(
                    self.ws_operation(
                        operation='subscribe',
                        ws_channel=self.get_ws_channels("ETH","future")
                        )
                )

                self.loop.create_task(
                    self.ws_operation(
                        operation='subscribe',
                        ws_channel=self.get_ws_channels("ETH","option")
                        )
                )

                self.loop.create_task(
                self.ws_operation(
                    operation='subscribe',
                    ws_channel=["deribit_price_index.btc_usd", "deribit_price_index.eth_usd"]
                    )
            )

                while True:
                    message: bytes = await self.websocket_client.recv()
                    message: Dict = json.loads(message)

                    if 'id' in list(message):
                        if message['id'] == 9929:
                            if self.refresh_token is None:
                                logging.info('Successfully authenticated WebSocket Connection')
                            else:
                                logging.info('Successfully refreshed the authentication of the WebSocket Connection')

                            self.refresh_token = message['result']['refresh_token']

                            # Refresh Authentication well before the required datetime
                            if message['testnet']:
                                expires_in: int = 300
                            else:
                                expires_in: int = message['result']['expires_in'] - 240

                            self.refresh_token_expiry_time = datetime.utcnow() + timedelta(seconds=expires_in)

                        elif message['id'] == 8212:
                            # Avoid logging Heartbeat messages
                            continue

                    elif 'method' in list(message):
                        # Respond to Heartbeat Message
                        if message['method'] == 'heartbeat':
                            await self.heartbeat_response()
                        # Push subscription data to TP
                        elif message['method'] == 'subscription':
                            logging.debug("Subscription receiving, pushing to TP")
                            self.on_message(message)
            
            except websockets.ConnectionClosed:
                send_email("FH|INFO|", "WebSocket connection has broken. Re-opening connection...")
                logging.warning('WebSocket connection has broken. Re-opening connection...')
                continue

    async def establish_heartbeat(self) -> None:
        """
        Requests DBT's `public/set_heartbeat` to
        establish a heartbeat connection.
        """
        msg: Dict = {
                    "jsonrpc": "2.0",
                    "id": 9098,
                    "method": "public/set_heartbeat",
                    "params": {
                              "interval": 10
                               }
                    }

        await self.websocket_client.send(json.dumps(msg))

    async def heartbeat_response(self) -> None:
        """
        Sends the required WebSocket response to
        the Deribit API Heartbeat message.
        """
        msg: Dict = {
                    "jsonrpc": "2.0",
                    "id": 8212,
                    "method": "public/test",
                    "params": {}
                    }

        await self.websocket_client.send(json.dumps(msg))

    async def ws_auth(self) -> None:
        """
        Requests DBT's `public/auth` to
        authenticate the WebSocket Connection.
        """
        msg: Dict = {
                    "jsonrpc": "2.0",
                    "id": 9929,
                    "method": "public/auth",
                    "params": {
                              "grant_type": "client_credentials",
                              "client_id": self.client_id,
                              "client_secret": self.client_secret
                               }
                    }

        await self.websocket_client.send(json.dumps(msg))

    async def ws_refresh_auth(self) -> None:
        """
        Requests DBT's `public/auth` to refresh
        the WebSocket Connection's authentication.
        """
        while True:
            if self.refresh_token_expiry_time is not None:
                if datetime.utcnow() > self.refresh_token_expiry_time:
                    msg: Dict = {
                                "jsonrpc": "2.0",
                                "id": 9929,
                                "method": "public/auth",
                                "params": {
                                          "grant_type": "refresh_token",
                                          "refresh_token": self.refresh_token
                                            }
                                }

                    await self.websocket_client.send(json.dumps(msg))

            await asyncio.sleep(150)

    async def ws_operation(
        self,
        operation: str,
        ws_channel: list
            ) -> None:
        """
        Requests `private/subscribe` or `private/unsubscribe`
        to DBT's API for the specific WebSocket Channel.
        """
        await asyncio.sleep(5)

        msg: Dict = {
                    "jsonrpc": "2.0",
                    "method": f"private/{operation}",
                    "id": 42,
                    "params": {
                        "channels": ws_channel
                        }
                    }
        logging.info(f"Sending {operation} request")
        if operation == "subscribe":
            self.subscribed_products.extend(ws_channel)
            logging.info(f"subcribed channels are {ws_channel}")
        await self.websocket_client.send(json.dumps(msg))

    def on_message(self, message):
        global last_message_datetime
        global message_count
        global q
        try:
            if q is not None:
                import numpy as np
                from qpython.qcollection import qlist
                from qpython.qtype import (
                    QDATE_LIST,
                    QTIMESPAN_LIST,
                    QSYMBOL_LIST,
                    QINT_LIST,
                    QLONG_LIST,
                    QDOUBLE_LIST,
                    QBOOL_LIST
                )
                if "method" in message and message["method"] == "subscription":
                    logging.debug("Reformatting received data")
                    datum = message["params"]["data"]
                    if datum.get("state") == "closed" or datum.get("estimated_delivery_price") == "expired":
                        ticker_to_unsubscribe = message["params"]["channel"]
                        self.loop.create_task(
                            self.ws_operation(
                                operation='unsubscribe',
                                ws_channel=[ticker_to_unsubscribe]
                                )
                        )
                        logging.info(f"Unsubscribe to expired ticker {ticker_to_unsubscribe}")
                    else:
                        if message["params"]["channel"].split(".")[0] == "deribit_price_index":
                            timestamp = np.datetime64(int(datum.get("timestamp")), "ms")
                            feed_date = np.datetime64(timestamp, "D")
                            feed_time = timestamp - feed_date
                            symbol = datum.get("index_name").split("_")[0].upper()
                            price = datum.get("price")
                            data = [
                                    # info
                                    qlist([np.timedelta64(feed_time,"ns")], qtype=QTIMESPAN_LIST),
                                    qlist([symbol], qtype=QSYMBOL_LIST),
                                    qlist([feed_date], qtype=QDATE_LIST),
                                    qlist([price], qtype=QDOUBLE_LIST)
                                ]
                            q.sendSync(".u.upd", np.string_("index"), data)
                        elif len(message["params"]["channel"].split(".")[1].split("-")) == 4:
                            # the channel is for an option
                            # info
                            timestamp = np.datetime64(int(datum.get("timestamp")), "ms")
                            feed_date = np.datetime64(timestamp, "D")
                            feed_time = timestamp - feed_date
                            symbol = datum.get("instrument_name")
                            option = datum.get("instrument_name").split("-")
                            currency = option[0]
                            maturity = np.datetime64(datetime.strptime(option[1],"%d%b%y"),'D')
                            day_to_maturity = int((maturity - np.datetime64(date.today()))/np.timedelta64(1, 'D'))
                            strike_price = int(option[2])
                            option_type = option[3]
                            underlying_price=datum.get("underlying_price")
                            underlying_index=datum.get("underlying_index")
                            state=(datum.get("state") == "open")
                            settlement_price=datum.get("settlement_price")
                            # prices
                            open_interest=datum.get("open_interest")
                            min_price=datum.get("min_price")
                            max_price=datum.get("max_price")
                            mark_price=datum.get("mark_price")
                            mark_iv=datum.get("mark_iv")
                            last_price=datum.get("last_price")
                            interest_rate=datum.get("interest_rate")
                            index_price=datum.get("index_price")
                            estimated_delivery_price=datum.get("estimated_delivery_price")
                            # bid/ask
                            biv=datum.get("bid_iv")
                            bid=datum.get("best_bid_price")
                            bsize=datum.get("best_bid_amount")
                            ask=datum.get("best_ask_price")
                            asize=datum.get("best_ask_amount")
                            aiv=datum.get("ask_iv")
                            # greeks
                            delta = datum.get("greeks").get("delta")
                            gamma = datum.get("greeks").get("gamma")
                            theta = datum.get("greeks").get("theta")
                            vega = datum.get("greeks").get("vega")
                            rho = datum.get("greeks").get("rho")
                            # stats
                            volume = datum.get("stats").get("volume")
                            price_change = datum.get("stats").get("price_change")
                            low = datum.get("stats").get("low")
                            high = datum.get("stats").get("high")
            
                            data = [
                                    # info
                                    qlist([np.timedelta64(feed_time,"ns")], qtype=QTIMESPAN_LIST),
                                    qlist([symbol], qtype=QSYMBOL_LIST),
                                    qlist([feed_date], qtype=QDATE_LIST),
                                    qlist([currency], qtype=QSYMBOL_LIST),
                                    qlist([maturity], qtype=QDATE_LIST),
                                    qlist([day_to_maturity], qtype=QINT_LIST),
                                    qlist([strike_price], qtype=QINT_LIST),
                                    qlist([option_type], qtype=QSYMBOL_LIST),
                                    qlist([underlying_price], qtype=QDOUBLE_LIST),
                                    qlist([underlying_index], qtype=QSYMBOL_LIST),
                                    qlist([state], qtype=QBOOL_LIST),
                                    qlist([settlement_price], qtype=QDOUBLE_LIST),
                                    # prices
                                    qlist([open_interest], qtype=QDOUBLE_LIST),
                                    qlist([min_price], qtype=QDOUBLE_LIST),
                                    qlist([max_price], qtype=QDOUBLE_LIST),
                                    qlist([mark_price], qtype=QDOUBLE_LIST),
                                    qlist([mark_iv], qtype=QDOUBLE_LIST),
                                    qlist([last_price], qtype=QDOUBLE_LIST),
                                    qlist([interest_rate], qtype=QDOUBLE_LIST),
                                    qlist([index_price], qtype=QDOUBLE_LIST),
                                    qlist([estimated_delivery_price], qtype=QDOUBLE_LIST),
                                    # bid/ask
                                    qlist([bid], qtype=QDOUBLE_LIST),
                                    qlist([bsize], qtype=QLONG_LIST),
                                    qlist([biv], qtype=QDOUBLE_LIST),
                                    qlist([ask], qtype=QDOUBLE_LIST),
                                    qlist([asize], qtype=QLONG_LIST),                            
                                    qlist([aiv], qtype=QDOUBLE_LIST),
                                    # greeks
                                    qlist([delta], qtype=QDOUBLE_LIST),
                                    qlist([gamma], qtype=QDOUBLE_LIST),
                                    qlist([theta], qtype=QDOUBLE_LIST),
                                    qlist([vega], qtype=QDOUBLE_LIST),
                                    qlist([rho], qtype=QDOUBLE_LIST),
                                    # stats
                                    qlist([volume], qtype=QDOUBLE_LIST),
                                    qlist([price_change], qtype=QDOUBLE_LIST),
                                    qlist([low], qtype=QDOUBLE_LIST),
                                    qlist([high], qtype=QDOUBLE_LIST)
                                ]
                            q.sendSync(".u.upd", np.string_("option"), data)
                        elif len(message["params"]["channel"].split(".")[1].split("-")) == 2:
                            # the channel is for a future
                            timestamp = np.datetime64(int(datum.get("timestamp")), "ms")
                            feed_date = np.datetime64(timestamp, "D")
                            feed_time = timestamp - feed_date
                            symbol = datum.get("instrument_name")
                            future = datum.get("instrument_name").split("-")
                            currency = future[0]
                            if future[1] == "PERPETUAL":
                                maturity = np.datetime64(datetime.strptime("31Dec2222","%d%b%Y"), "D")
                                day_to_maturity = 999999
                            else:
                                maturity = np.datetime64(datetime.strptime(future[1],"%d%b%y"), "D")
                                day_to_maturity = int((maturity - np.datetime64(date.today()))/np.timedelta64(1, 'D'))
                            state=(datum.get("state") == "open")
                            settlement_price=datum.get("settlement_price")
                            open_interest=datum.get("open_interest")
                            min_price=datum.get("min_price")
                            max_price=datum.get("max_price")
                            mark_price=datum.get("mark_price")
                            last_price=datum.get("last_price")
                            index_price=datum.get("index_price")
                            estimated_delivery_price=datum.get("estimated_delivery_price")
                            bid=datum.get("best_bid_price")
                            bsize=datum.get("best_bid_amount")
                            ask=datum.get("best_ask_price")
                            asize=datum.get("best_ask_amount")
                            volusd = datum.get("stats").get("volume_usd")
                            volume = datum.get("stats").get("volume")
                            price_change = datum.get("stats").get("price_change")
                            low = datum.get("stats").get("low")
                            high = datum.get("stats").get("high")
                
                            data = [
                                    # info
                                    qlist([np.timedelta64(feed_time,"ns")], qtype=QTIMESPAN_LIST),
                                    qlist([symbol], qtype=QSYMBOL_LIST),
                                    qlist([feed_date], qtype=QDATE_LIST),
                                    qlist([currency], qtype=QSYMBOL_LIST),
                                    qlist([maturity], qtype=QDATE_LIST),
                                    qlist([day_to_maturity], qtype=QINT_LIST),
                                    qlist([state], qtype=QBOOL_LIST),
                                    qlist([settlement_price], qtype=QDOUBLE_LIST),
                                    # prices
                                    qlist([open_interest], qtype=QDOUBLE_LIST),
                                    qlist([min_price], qtype=QDOUBLE_LIST),
                                    qlist([max_price], qtype=QDOUBLE_LIST),
                                    qlist([mark_price], qtype=QDOUBLE_LIST),
                                    qlist([last_price], qtype=QDOUBLE_LIST),
                                    qlist([index_price], qtype=QDOUBLE_LIST),
                                    qlist([estimated_delivery_price], qtype=QDOUBLE_LIST),
                                    # bid/ask
                                    qlist([bid], qtype=QDOUBLE_LIST),
                                    qlist([bsize], qtype=QLONG_LIST),
                                    qlist([ask], qtype=QDOUBLE_LIST),
                                    qlist([asize], qtype=QLONG_LIST),  
                                    # stats
                                    qlist([volusd], qtype=QDOUBLE_LIST),
                                    qlist([volume], qtype=QDOUBLE_LIST),
                                    qlist([price_change], qtype=QDOUBLE_LIST),
                                    qlist([low], qtype=QDOUBLE_LIST),
                                    qlist([high], qtype=QDOUBLE_LIST)
                                ]
                            q.sendSync(".u.upd", np.string_("future"), data)
                        logging.debug("Data pushed to tickerplant")
            last_message_datetime = datetime.now()
            message_count += 1
        except Exception as e:
            send_email("FH|ISSUE|",str(e))
            logging.error(e)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Deribit feedhandler")
    parser.add_argument(
        "--host",
        help="kdb+/q tickerplant host",
        action="store",
        dest="host",
        default="localhost",
    )
    parser.add_argument(
        "--port",
        help="kdb+/q tickerplant port",
        action="store",
        dest="port",
        type=int,
        default=5010,
    )
    parser.add_argument(
        "--keys",
        help="feedhandler authentication credentials",
        action="store",
        dest="keys",
        type=str,
        default="keys.txt",
    )
    parser.add_argument(
        "--console-log-level",
        help="console log level: 10=DEBUG, 20=INFO, 30=WARN, 40=ERROR, 50=CRITICAL",
        action="store",
        dest="console_log_level",
        type=int,
        default=40,
    )
    parser.add_argument(
        "--file-log-level",
        help="file log level: 10=DEBUG, 20=INFO, 30=WARN, 40=ERROR, 50=CRITICAL",
        action="store",
        dest="file_log_level",
        type=int,
        default=20,
    )
    parser.add_argument(
        "--log-file",
        help="path to log file",
        action="store",
        dest="log_file",
        default="feedhandler.log",
    )
    args = parser.parse_args()
    if args.log_file is not None:
        logging.basicConfig(
            filename="feedhandler.log",
            level=args.file_log_level,
            format="%(asctime)s %(pathname)s:%(lineno)d %(levelname)s %(message)s",
        )
        console = logging.StreamHandler()
        console.setLevel(logging.DEBUG)
        formatter = logging.Formatter("%(asctime)s %(levelname)s %(message)s")
        console.setFormatter(formatter)
        logging.getLogger("").addHandler(console)
    else:
        logging.basicConfig(
            level=args.console_log_level, format="%(asctime)s %(levelname)s %(message)s"
        )

    logging.info("Starting Deribit Feedhandler")

    logging.debug("host: %s" % args.host)
    logging.debug("port: %s" % args.port)
    logging.debug("console-log-level: %s" % args.console_log_level)
    logging.debug("file-log-level: %s" % args.file_log_level)
    logging.debug("log-file: %s" % args.log_file)

    q = DeribitFH.connect_to_port(args.host, args.port)
    fh = DeribitFH(args.keys)
