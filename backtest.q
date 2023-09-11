// open connection to hdb to source data
h: hopen `::5012

\l ml/ml.q
\l util.q
\l volmodel.q

//coverage test
// .bt global table for exceedance
.bt.i:([] date:`date$(); time:`timespan$();lvarhar:`float$();rvarhar:`float$();lvarewma:`float$();rvarewma:`float$();lvargarch:`float$();rvargarch:`float$();lvarin:`float$();rvarin:`float$();lactual:`float$(); ractual:`float$(); exceedanceHAR: `boolean$(); exceedanceEWMA: `boolean$(); exceedanceGARCH: `boolean$(); exceedanceIn: `boolean$(); lossq: `float$();cm2HAR:`float$(); cm2EWMA:`float$(); cm2GARCH:`float$(); cm2In:`float$())
// @param p {table} table containing portfolio holding
// @param q {float} confidence interval
// @param d {date} as-of estimation date
// @param t {timespan} as-of estimation time
// @return {float} estimated 1-day Value-at-Risk as-of d-t
.bt.histvar:{[p;q;d;t]
    p: update underlying: "-"{`$first x vs y}/: string sym from p;
    ticks: .hdb.gettickprice[h;d;1;t;p`sym];
    idx: .hdb.getidxprice[h;d;1;t;p`underlying];
    underlyings: key adjustedGreeks:.VaR.adjustgreeks[p;ticks;idx;1];
    adjustedGreeks: 0!adjustedGreeks;
    // get TWAP series of 30-min interval and convert to log return series
    logrs:(underlyings`sym)!{[d;t;x] .util.getidxtwap[h;h;t+d-5;t+d;x;0D00:30]}[d;t;] each underlyings`sym;
    cov_matrix_ewma:(count logrs; count logrs)#{[lambda;t;eps;k] (48*t)*.ewma.forecast[(eps[k 0])`logr; (eps[k 1])`logr;lambda;t]}[0.94;1;logrs] peach (key logrs) cross key logrs;
    //show 5#flip {(flip x)[`logr]} each value logrs;
    cov_matrix_garch: 48* $[1=count key logrs;enlist enlist .garch.forecast[(value logrs)`logr;1];.mgarch.forecast[flip {(flip x)[`logr]} each value logrs;1]];
    logrs_har: (underlyings`sym)!{[d;t;x] .util.getidxtwap[h;h;t+d-15;t+d;x;0D00:01]}[d;t;] each underlyings`sym;
    cov_matrix_har: .har.forecast[logrs_har;1;1<count logrs_har];
    logrs_in: (underlyings`sym)!{[d;t;x] .util.getidxtwap[h;h;t+d;t+d+1;x;0D00:01]}[d;t;] each underlyings`sym;
    cov_matrix_in: (count logrs_in; count logrs_in)#{first (.util.logr2rcv[x y 0; x y 1;1D;0D00:05;last differ y])`rv}[logrs_in] peach (key logrs_in) cross key logrs_in;
    params_ewma: .util.moments[adjustedGreeks`delta; adjustedGreeks`gamma; adjustedGreeks`theta; cov_matrix_ewma];
    params_garch: .util.moments[adjustedGreeks`delta; adjustedGreeks`gamma; adjustedGreeks`theta; cov_matrix_garch];
    params_har: .util.moments[adjustedGreeks`delta; adjustedGreeks`gamma; adjustedGreeks`theta; cov_matrix_har];
    params_in: .util.moments[adjustedGreeks`delta; adjustedGreeks`gamma; adjustedGreeks`theta; cov_matrix_in];
    z2cf_ewma: .util.z2cf[params_ewma;q];
    z2cf_garch: .util.z2cf[params_garch;q];
    z2cf_har: .util.z2cf[params_har;q];
    z2cf_in: .util.z2cf[params_in;q];
    qtl_ewma: z2cf_ewma`qtl;
    qtl_har: z2cf_har`qtl;
    qtl_garch: z2cf_garch`qtl;
    qtl_in: z2cf_in`qtl;
    returnLoss_ewma: (-1) + exp qtl_ewma;
    returnLoss_har: (-1) + exp qtl_har;
    returnLoss_garch: (-1) + exp qtl_garch;
    returnLoss_garch:0f;
    returnLoss_in: (-1) + exp qtl_in;
    `VaRHAR`ReturnHAR`VaREWMA`ReturnEWMA`VaRG`ReturnG`VaRIn`ReturnIn`MktVal`Moments`MomentsHAR`MomentsEWMA`MomentsGARCH`MomentsIn!(returnLoss_har * sum adjustedGreeks`value_usd;returnLoss_har;returnLoss_ewma * sum adjustedGreeks`value_usd;returnLoss_ewma;returnLoss_garch * sum adjustedGreeks`value_usd;returnLoss_garch;returnLoss_in * sum adjustedGreeks`value_usd;returnLoss_in;(sum adjustedGreeks`value_usd);params_har;params_har`cm2;params_ewma`cm2;params_garch`cm2;params_in`cm2)
    //`VaRHAR`ReturnHAR`VaREWMA`ReturnEWMA`VaRG`ReturnG`VaRIn`ReturnIn`MktVal`Domain`Moments`Vol1HAR`Vol2HAR`Vol1EWMA`Vol2EWMA`Vol1GARCH`Vol2GARCH`Vol1In`Vol2In!(returnLoss_har * sum adjustedGreeks`value_usd;returnLoss_har;returnLoss_ewma * sum adjustedGreeks`value_usd;returnLoss_ewma;returnLoss_garch * sum adjustedGreeks`value_usd;returnLoss_garch;returnLoss_in * sum adjustedGreeks`value_usd;returnLoss_in;(sum adjustedGreeks`value_usd);z2cf_har`domain;params_har;sqrt (cov_matrix_har)[0][0]; sqrt (cov_matrix_har)[1][1];sqrt (cov_matrix_ewma)[0][0]; sqrt (cov_matrix_ewma)[1][1];sqrt (cov_matrix_garch)[0][0]; sqrt (cov_matrix_garch)[1][1];sqrt (cov_matrix_in)[0][0]; sqrt (cov_matrix_in)[1][1])
    }

// @param p {table} table containing portfolio holding
// @param d {date} start date, same as as-of estimation date
// @param t {timespan} start time, same as as-of estimation time
// @return {float} actual loss of portfolio across 1 day period
.bt.histloss:{[p;d;t]
    // get tick prices for syms in holdings
    ticks:.hdb.gettickprice[h;d+1;2;t;p`sym];
    hd: select sum unit by sym from p;
    // consolidate option holdings and transform total value to usd
    op: select sym, total: price * hd[([] sym:sym);`unit], underlyings: "-"{`$first x vs y}/: string sym from ticks`option;
    op: select sum total by underlyings from op;
    up: `underlyings xcol .hdb.getidxprice[h;d+1;2; 0D00:30 xbar t;(key op)`underlyings];
    op: select sym:underlyings, total*up[([] underlyings:underlyings); `twap] from op;
    // consolidate futures holdings 
    ft: select sym, total: price*hd[([] sym:sym);`unit] from ticks`future;
    loss: sum ({x[1]-x[0]} each op`total), {x[1]-x[0]} each ft`total;
    val: sum ({x[0]}each op`total), {x[0]}each ft`total;
    `Loss`Return`MktVal!(loss;loss%val;val)
    }

// @param q {float} quantile of loss
// @param f {symbol} csv file of test portfolio with holdings preloaded
.bt.coverage:{[q;f]
    testp: ("DNSSFF";enlist ",") 0:f;
    periods: select distinct date, time from testp;
    (testp;q){
        p: x[0] where (x[0][`date]=y`date) & (x[0][`time]=y`time);
        est: .bt.histvar[p;x[1];y`date;y`time];
        loss: .bt.histloss[p;y`date;y`time];
        .bt.i: .bt.i upsert (y`date;y`time;(est`VaRHAR);(est`ReturnHAR);(est`VaREWMA);(est`ReturnEWMA);(est`VaRG);(est`ReturnG);(est`VaRIn);(est`ReturnIn);(loss`Loss);(loss`Return);(loss`Loss)<est`VaRHAR;(loss`Loss)<est`VaREWMA;(loss`Loss)<est`VaRG;(loss`Loss)<est`VaRIn;.util.cf2z[est`Moments;loss`Return];(est`MomentsHAR);(est`MomentsEWMA);(est`MomentsGARCH);(est`MomentsIn))
    }/:periods
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
    adjp: adjp lj update price:1.0, delta: 1.0, gamma: 0.0, theta: 0.0 from ticks`future;
    // adjust greeks for leverage in options, adjust price to USD
    greekslev: update p_usd: price*twap, deltalev: delta*?[price=0;0;reciprocal price], gammalev:twap*gamma*?[price=0;0;reciprocal price], thetalev: t*theta%twap*price from adjp;
    totalval: (greekslev`unit) wsum greekslev`p_usd;
    // adjust greeks for weights
    greekslev:update deltaw:deltalev*unit*p_usd%totalval, gammaw:gammalev*unit*p_usd%totalval, thetaw: thetalev*unit*p_usd%totalval, val_usd: unit*p_usd from greekslev;
    select delta: sum deltaw, gamma: sum gammaw, theta: sum thetaw, value_usd: sum val_usd by sym:underlying from greekslev
    }