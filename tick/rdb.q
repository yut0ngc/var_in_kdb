
MAXROWS:1000000

optionOLHC:([] time:`timespan$(); sym:`symbol$(); open:`float$())
futureOLHC:([] time:`timespan$(); sym:`symbol$(); open:`float$())

volBTC:([] time:`timespan$(); sym:`symbol$(); maturity:`date$(); strike:`int$(); iv:`float$());
volETH:([] time:`timespan$(); sym:`symbol$(); maturity:`date$(); strike:`int$(); iv:`float$());

if[not "w"=first string .z.o;system "sleep 1"];

// when row number exceeds MAXROWS, clear buffer and only keep last 1000 rows
upd:{[t;data]
    t insert data;
    if[MAXROWS<count value t; 
        @[`.;t;-10000#];
    ]};

.u.x:.z.x,(count .z.x)_(":5010";":5012");

.u.end:{t:tables`.;{delete from x} each t;};

.u.rep:{[x;y] (.[;();:;].)each x};

.u.rep .(h:hopen `$":",.u.x 0)"(.u.sub[`;`];`.u `i`L)";

// load u.q for publishing
\l tick/u.q
.u.init[];

.stream.btcvol:{
    `time`sym xcols update time:.z.t, sym:`BTC from 0!select last iv by maturity, strike from option where ccy = `BTC
    }
.stream.ethvol:{
    `time`sym xcols update time:.z.t, sym:`ETH from 0!select last iv by maturity, strike from option where ccy = `ETH
    }

.stream.futureOLHC:{}

.u.snap:{btcvol}


.z.ts:{
    // publish vol surface
    .u.pub[`volBTC;.stream.btcvol[]];
    .u.pub[`volETH;.stream.ethvol[]]

    // publish OLHC
    / .u.pub[`optionOLHC;.stream.optionOLHC[]];
    / .u.pub[`futureOLHC;.stream.futureOLHC[]]
    }

\t 15000