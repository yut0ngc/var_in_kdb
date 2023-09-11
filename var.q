// sample use
// q var.q -rts ://5009 -hdb ://5012 -tp :5010 -p 5013

// initialisation steps
// format command line paramters
default:`rts`hdb`tp!("://5009";"://5012";":5010")
args: default,.Q.opt .z.x
args:{$[0h = type x; first x; x]} each args
// create a table to keep positions in portfolio
portfolio:([] pid:`symbol$();sym:`symbol$();position:`float$();unit:`float$())
cachedLogRHAR:([sym:`symbol$();tmp:`timestamp$()];logr:`float$())
// open connection to hdb
hdbh: hopen `$":unix", args`hdb
// open connection to rts
rtsh: hopen `$":unix", args`rts

// load scripts for volatility estimate
\l util.q
\l volmodel.q

// initialise tables for latest data on products and indices
LatestProduct:([sym:`symbol$()] price:`float$(); delta:`float$(); gamma:`float$(); theta:`float$(); vega:`float$(); rho:`float$())
LatestIndex:([sym:`symbol$()] price:`float$())

// subscribe to TP for latest data on indices and products
updateOption:{[d] `LatestProduct upsert select last price, last delta, last gamma, last theta, last vega, last rho by sym from d}
updateFuture:{[d] `LatestProduct upsert select last price, delta:1.0, gamma: 0.0, theta: 0.0, vega: 0.0, rho:0.0 by sym from d}
updateIndex:{[d] LatestIndex,:select last price by sym from d}
upd:`option`future`index!(updateOption;updateFuture;updateIndex)
.u.end:{}
.VaR.init:{
    h:hopen `$":",args`tp;
    u:h".u.sub[`;`];`.u `i`L";
    u
    }

// estimate Value-at-Risk for a portfolio
// @param id {symbol} portfolio identifier
// @param ci {float} confidence interval of VaR, e.g. 0.95 for 95%
// @param t {int} time horizon for estimation, e.g. 1 for 1-day
// @param inf {symbol} inference model used for covariance matrix forecast
// @return dict {dictionary} current market value and VaR of portfolio
.VaR.estimate:{[id; ci; t; inf]
    lambda:0.9;
    ci: $[ci>=1 and ci <100; ci%100; ci];
    t: 1^t;
    positions: update underlying: "-"{`$first x vs y}/: string sym from (select from portfolio where pid = id, unit <> 0f);
    // get tick price in crypto
    symgrp: group {count "-" vs string x} each syms: distinct positions`sym;
    ticks:`option`future!((flip (enlist `sym)!enlist syms symgrp[4])#LatestProduct;(flip (enlist `sym)!enlist syms symgrp[2])#LatestProduct);   
    // get crypto index price in USD
    idx: `sym`twap xcol (flip (enlist `sym)! enlist distinct positions`underlying)#LatestIndex;
    // mapping: adjust greeks of positions by their size/value
    underlyings: key adjustedGreeks:.VaR.adjustgreeks[positions;ticks;idx;t]; 
    adjustedGreeks: 0!adjustedGreeks;
    // inference for volatility
    cov_matrix: $[`HAR = inf;[
          // HAR model
          // get log return series of 1-min interval and convert to realised variance series
          logrs: (underlyings`sym)!{[s] .har.cachedLogRQuery[s]} each underlyings`sym;
          .har.forecast[logrs;t;1<count logrs]
        ];
        [ // EWMA model
          // get TWAP series of 30-min interval and convert to log return series
          logrs:(underlyings`sym)!{[x] .util.getidxtwap[hdbh;rtsh;.z.t+.z.d-5;.z.d+.z.t;x;0D00:30]} each underlyings`sym;
          (count logrs; count logrs)#{[lambda;t;eps;k] (48*t)*.ewma.forecast[(eps[k 0])`logr; (eps[k 1])`logr;lambda;t]}[lambda;t;logrs] peach (key logrs) cross key logrs
        ]];
    // estimate quantile for portfolio return
    params: .util.moments[adjustedGreeks`delta; adjustedGreeks`gamma; adjustedGreeks`theta; cov_matrix];
    qtl: .util.z2cf[params;ci];
    // convert quantile to value
    returnLoss: (-1) + exp qtl`qtl;
    `MktVal`VaR`Loss`CovM!(sum adjustedGreeks`value_usd; returnLoss * sum adjustedGreeks`value_usd;returnLoss; cov_matrix)
    }

// calculate greeks adjusted by positions' size/market value
// @param p {table} positions in the portfolio
// @param ticks {dict} current tick price in option / future key-value pair
// @param idx {keyed table} current index price keyed by sym
// @param t {int} no of days of VaR estimation, used in theta factor calculation
// @return {keyed table} delta, gamma and market value by underlying index
.VaR.adjustgreeks:{[p; ticks; idx; t]
    // link with price, transform price from list to float atom
    adjp: select sym, unit, underlying, 
	twap:max each idx[([] sym:underlying);`twap], 
	price:max each (ticks`option)[([] sym:sym);`price],
	delta:max each (ticks`option)[([] sym:sym);`delta],
	gamma:max each (ticks`option)[([] sym:sym);`gamma],
    theta:max each (ticks`option)[([] sym:sym);`theta] 
	from p;
    adjp: adjp lj update price:1.0 from ticks`future;
    // adjust greeks for leverage in options, adjust price to USD
    greekslev: update p_usd: price*twap, deltalev: delta*?[price=0;0;reciprocal price], gammalev:twap*gamma*?[price=0;0;reciprocal price], thetalev: t*theta%twap*price from adjp;
    totalval: (greekslev`unit) wsum greekslev`p_usd;
    // adjust greeks for weights
    greekslev:update deltaw:deltalev*unit*p_usd%totalval, gammaw:gammalev*unit*p_usd%totalval, thetaw: thetalev*unit*p_usd%totalval, val_usd: unit*p_usd from greekslev;
    select delta: sum deltaw, gamma: sum gammaw, theta: sum thetaw, value_usd: sum val_usd by sym:underlying from greekslev
    }

.har.cachedLogRQuery:{[s] 
    ranges: exec l: 0D00:01 xbar min tmp, h:0D00:01 xbar max tmp from (key cachedLogRHAR) where sym = s;
    // if nothing cached - query all data from hdb & rts
    $[0=count select from cachedLogRHAR where sym = s;[
        logr: .util.getidxtwap[hdbh;rtsh;.z.t+.z.d-15;.z.d+.z.t;s;0D00:01];
        cachedLogRHAR,:2!`sym`tmp xcols update sym:s from logr];
    // else if cached data does not provide sufficient coverage
    (ranges[`l]) > 0D00:01 xbar .z.t+.z.d-15;[
        show "using cache";
        logr1: .util.getidxtwap[hdbh;rtsh;.z.t+.z.d-15;ranges[`l];s;0D00:01]; //query missing part
        logr2: .util.getidxtwap[hdbh;rtsh;ranges[`h];.z.t+.z.d;s;0D00:01];  //query missing part
        cached: select tmp, logr from (0!cachedLogRHAR) where sym = s, tmp within (.z.t+.z.d-15;.z.d+.z.t); //query cached 
        cachedLogRHAR,:2!`sym`tmp xcols update sym:s from logr1,logr2; //cache missing part
        logr:0!(1!cached) uj (1!logr1,logr2)
        ];
    // else 
    [ show "using cache";
        logr2: .util.getidxtwap[hdbh;rtsh;ranges[`h];.z.t+.z.d;s;0D00:01];
        cached: select tmp, logr from (0!cachedLogRHAR) where sym = s, tmp within (.z.t+.z.d-15;.z.d+.z.t);
        cachedLogRHAR,:2!`sym`tmp xcols update sym:s from logr2; //cache missing part
        logr:0!(1!cached) uj (1!logr2)
        ]];
    logr
    }


u:.VaR.init[]