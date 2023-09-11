# Real-time Calculation of VaR for crypto derivative portfolio

### Requirements

- kdb+/q from [here](https://code.kx.com/q/learn/install/)
- basic kdb+tick from [here](https://github.com/KxSystems/kdb-tick)
- KX dashboard from [here](https://code.kx.com/dashboards/)
- python packages required for feedhandler can be installed via: `pip install -r fh/requirements.txt`
- embedPy if using GARCH model

### Setup and Load

- Start tickerplant(TP): `tables` refers to the schema file `tables.q` which resides in the subdirectory `tick`. This schema file defines the tables existing in the TP.

    ```
    q tick.q tables OnDiskDB -p 5010
    ```

- Start feedhandler(FH): `host` and `port` specify the host/port that TP is running on; `keys` contains authentication details required for subscribing to private channels on Deribit See [here](https://www.deribit.com/account/BTC/api) for details.

    ```
    python fh/fh.py --host localhost --port 5010  --keys fh/keys.txt
    ```

- Start real-time subscriber and HDB for VaR calculation data source

    ```
    q tick/rts.q -p 5009
    q OnDiskDB/tables -p 5012
    ```

- Start VaR calculation process: `rts` and `hdb` parameters should be consistent with the ports used by rts and hdb processes above

    ```
    q var.q -rts ://5009 -hdb ://5012 -p 5013
    ```

- Start Dashboard and the associated rdb process (optional)

    ```
    cd dash
    q dash.q -p 10001 -u 1
    q tick/rdb.q -p 5011
    ```

### Folder Structure

```
VaR_in_kdb
│   README.md
│   var.q
│   varmodel.q
│   util.q
│   eda.q
│   backtest.q
│   tick.q 
├───fh
│   │   fh.py
│   │   requirements.txt
│   └───keys.txt
│   
├───tick
│   │   u.q
│   │   rts.q
│   │   rdb.q
│   └───tables.q
│   
├───dash(folder for KX dashboard)
│   │   dash.q
│   │   go.q_
│   │   version.txt
│   ├───data
│   │   │   url
│   │   ├───connections
│   │   │   │   Deribit.json
│   │   │   │   TWAP.json
│   │   │   └───VaRCalculator.json
│   │   │   
│   │   └───dashboards
│   └───www 
│
└───OnDiskDB
│   │   tables2023.08.01 (log file)
│   │   tables2023.08.02 (log file)
│   │   ...
│   └───tables
│       ├───2023.08.01
│       │   ├───INDEXTWAP 
│       │   │   │   .d
│       │   │   │   sym
│       │   │   │   time
│       │   │   └───...
│       │   │   
│       │   ├───FUTURETWAP 
│       │   │   │   .d
│       │   │   │   sym
│       │   │   │   time
│       │   │   └───...
│       │   │   
│       │   └───OPTIONTWAP 
│       │       │   .d
│       │       │   sym
│       │       │   time
│       │       └───...
│       ├───2023.08.02
│       ├───...
│       │   symindextwap
│       │   symfuturetwap
│       └───symoptiontwap
```

### Example 

Perform calculation in q process directly:
```
// add positions
q)portfolio,:(`test;`$"BTC-29DEC23";1f;1f);

// calculate VaR
q).VaR.estimate[`testportfolio;0.95;1;`HAR]
q).VaR.estimate[`testportfolio;0.99;10;`EWMA]
```

Access via KX dashboard: open `localhost:10001` in a browser, go to `VaR calculation` tab to add positions and trigger calculation.