// utility function that transform pandas dataframe to table
.p2q.df2tbl:{n:$[.p.isinstance[x`:index;.p.import[`pandas]`:RangeIndex]`;0;x[`:index.nlevels]`];n!flip $[n;x[`:reset_index][];x][`:to_dict;`list]`}
.p2q.np2lst:{((x`:tolist)[::])`}

// cdf/quantile function for Gaussian distribution @ https://github.com/KxSystems/kdb/blob/master/stat.q
pi:acos -1
// @param x {float} sample of a random variable ~ N(0,1)
// @return {float} cdf
.util.gaussian.cdf:{abs(x>0)-(exp[-.5*x*x]%sqrt 2*pi)*t*.31938153+t*-.356563782+t*1.781477937+t*-1.821255978+1.330274429*t:1%1+.2316419*abs x}

// @param x {float} quantile
// @return {float} corresponding value of random variable
.util.gaussian.qtl:{$[.5>x;0-.z.s 1-x;.92>x;
    (x*2.50662823884+l*-18.61500062529+l*41.39119773534+l*-25.44106049637)%1+l*-8.47351093090+l*23.08336743743+l*-21.06224101826+3.13082909833*l:x*x-:.5;
    0.3374754822726147+l*0.9761690190917186+l*0.1607979714918209+l*0.0276438810333863+l*0.0038405729373609+l*0.0003951896511919+l*0.0000321767881768+l*0.0000002888167364+0.0000003960315187*l:log 0-log 1-x]}

// calculate trace of matrix
// @param x {list of list} n*n matrix
// @return {float} trace of matrix
.util.tr:{sum x ./: 2#'(til count@x)}

// calculate central moments of portfolio return from factors/underlyings' delta, gamma and covariance matrix
// @param d {list} delta of factors/underlyings
// @param g {list} gamma of factors/underlyings
// @param t {list} theta of factors/underlyings
// @param cm {list} covariance matrix of factors/underlyings
// @return {dict} dictionary of 1st - 4th central moments of portfolio return
.util.moments:{[d;g;t;cm]
    /if[100b~differ count each(d;g;cm);
        gc2: gc$gc: @'[cm;til count@cm;*;g];
        gc3: gc2$gc;
        params:`cm1`cm2!(0.0;0.0);
        params[`cm1]: (sum t) + 0.5 * .util.tr[gc];
        params[`cm2]: (d$cm$d) + 0.5 * .util.tr[gc$gc];
        params[`cm3]: (3 * d$cm$gc$d) + .util.tr[gc$gc$gc];
        params[`cm4]: (12 * d$cm$gc$gc$d) + (3 * .util.tr[gc$gc$gc$gc]) + (3*(params`cm2) xexp 2);
        params}
    /]    

// estimate quantitle of portfolio return using Cornish Fisher expansion
// i.e. expressing quantile of r_p as a polynomial of standard Gaussian cdf
// @param {dict} dictionary representing nth central moments, n = 1, 2, 3, 4
// @param {float} confidence interval
// @return {dict} estimated quantile & domain of validity
.util.z2cf:{[params; ci]
    q: 1 - ci;
    s: (params`cm3) % (params`cm2) xexp 1.5; // standardise 3rd central moments
    k: -3 + (params`cm4) % (params`cm2) xexp 2; // standardise 4th central moments
    z2: (z1:.util.gaussian.qtl[q]) xexp 2;
    z3: z1 xexp 3;
    cfz: z1 + ((z2-1) * s%6) + ((z3 - 3*z1) * k%24) - ((z3*2) - z1*5) * s * s % 36;
    // cfsigma: sqrt (params`cm2)% 1 + ((k xexp 2) % 96) + ((s xexp 4) * 25 %1296) - (k*s*s%36);
    // $[cfsigma > sqrt params`cm2; show (cfsigma; sqrt params`cm2); ];
    cdq: (params`cm1) + cfz * sqrt params`cm2; // reverse the standardisation
    domain: (s*s%9) - 4 *((k%8) - s*s%6)* (1-(k%8)-(s*s*5%36)); 
    `qtl`domain!(cdq;domain)
    }

.util.cf2z:{[params;x]
    x: (x - params`cm1) % sqrt params`cm2;
    k3: params`cm3;
    k4: (params`cm4) + neg 3*(params`cm2) xexp 2;
    b0: neg k3%6;
    b1: neg k4%8 + (k3 xexp 2)%72;
    b2: neg b0 * b1+1;
    b3: (k4%24) + neg (0.5 * b1 xexp 2) + b0*b2;
    zq:  neg b0 + (x*b1-1) + (b2* x xexp 2) + b3* x xexp 3;
    .util.gaussian.cdf[zq]
    }

// @param {table} table of twaps with columns: tmp, twap
.util.twap2eps:{
    exec twap from ({`interval`twap!(x[`tmp]-y[`tmp];log x[`twap]%y[`twap])}':[x]) where interval = 0D00:30
    }

// @param tbl1 {table} table of logr with columns: tmp, logr
// @param tbl2 {table} table of logr with columns: tmp, logr
// @param intervalrv {timespan} interval for realised variance computation
// @param intervalp {timespan} interval for logr used
// @param isCov {bool} indicating if realised variance /covariance should be computed: 1b for covariance, 0b for variance
.util.logr2rcv:{[tbl1;tbl2;intervalrv;intervalsampling;isCov]
    si: `int$`minute$intervalsampling;
    r1: 0!select logr1:(si%count logr) * sum logr by intervalsampling xbar tmp from tbl1;
    ni: `int$intervalrv%intervalsampling;
    rvs:0!$[isCov;
        [r2: 0!select logr2:(si%count logr) * sum logr by intervalsampling xbar tmp from tbl2;
         select n:count tmp, rv: sum logr1*logr2, rq: sum (logr1*logr2) xexp 2, lev: 0f by ni xbar i from select from (r1 lj `tmp xkey r2) where not null logr1&logr2
        ];
        [select n:count logr1, rv: sum logr1 xexp 2, rq: sum logr1 xexp 4, lev: sum logr1 by ni xbar i from r1]
        ];
    exec rv: rv*ni%n, rq: rq*(ni*ni%(3*n)), lev:lev*ni%n from rvs
    //exec rv from 0!rvs where n = ni
    }

// get TWAP price series for an index from rdb & hdb
// @param hdbh {int} connection handle to hdb
// @param rtsh {int} connection handle to rts
// @param start {timestamp} start of price series
// @param end {timestamp} end of price series
// @param sym {symbol} symbol representing indices
// @param interval {timespan} interval for twap calculation
// @return {dict table} log return ordered by date & time, keyed by symbol 
.util.getidxtwap:{[hdbh; rtsh; start; end; sym; interval]
    n: `int$`minute$interval;
    current: $[.z.d < end;
        [periods:"j"$(end - "p"$.z.d)%0D00:01;
        pairs: sym cross (distinct (0D00:01*til 1+periods), 0D00:01* 1380 + til 60);
        tbl: rtsh ({[end; pairs] 1_select tmp, log ratios twap from 
                        (`tmp xasc select tmp:?[time >= 0D23:00:00.000;end-1;end]+time, twap from 0!pairs#indextwap) 
                        where 0D00:01 = deltas tmp, not null twap
                    }; "d"$end; flip `sym`time!flip pairs)
        ];
        ([] tmp:`timestamp$();twap:`float$())
        ];
    past: $[.z.d>start;[hdbh ({[start; end; s] //select all from date range, correct for UTC, filter out time before on start date and time after on end date
        1_select tmp, log ratios twap from (
            `tmp xasc select tmp: ?[time>=0D23:00:00.000;date-1;date]+time, twap from INDEXTWAP where date within ("d"$start;"d"$end+1D), sym = s)
        where tmp within(start;end), 0D00:01 = deltas tmp};start;end;sym)];
        ([] tmp:`timestamp$();twap:`float$())
        ];
    0!select logr: (n%count twap)*sum twap by tmp:interval xbar tmp from past,current
    }

// get historical price series from hdb
// @param h {int} connection handle to hdb
// @param lastd {date} end date of price series
// @param days {int} number of previous days for which the strike price will be retrieved
// @param t {timespan} time of the day
// @param syms {list} list of symbols representing indices
// @return {keyed table} twaps ordered by date, keyed by symbol 
.hdb.getidxprice:{[h; lastd; days; t; syms] 
    h ({[lastd; d; t; symList] `sym xgroup `date xasc select sym, date, twap from INDEXTWAP where date within (lastd+1-d; lastd), time = t, sym in symList}; lastd; days; t; raze enlist syms)
    }

.hdb.gettickprice:{[h; lastd; days; t; syms]
    syms: raze enlist syms;
    ticks: group {count "-" vs string x} each syms;
    // get raw price in crypto
    op: h ({[lastd;d;t;symList] `date xasc select date, price%cnt, delta%cnt, gamma%cnt, theta%cnt by sym from OPTIONTWAP where date within (lastd+1-d; lastd), time = t, sym in symList}; lastd; days; t; syms ticks[4]);
    ft: h ({[lastd;d;t;symList] `date xasc select date, price:twap, delta, gamma by sym from FUTURETWAP where date within (lastd+1-d; lastd), time = t, sym in symList}; lastd; days; t; syms ticks[2]);
    `option`future!(op;ft)
    }

// get latest TWAP for underlying index / derivatives
// @param h {int} connection handle to rts
// @param syms {list} list of symbols
// @return {keyed table} latest twap keyed by symbol
.rdb.getidxprice:{[h; syms]
    h ({[syms] select last twap by sym from indextwap where sym in syms}; raze enlist syms)
    }
.rdb.gettickprice:{[h; syms]
    syms: raze enlist syms;
    ticks: group {count "-" vs string x} each syms;
    op: h ({[lst] select price%cnt, delta%cnt, gamma%cnt, theta%cnt by sym from (select by sym from (0!optiontwap) where sym in lst)};syms ticks[4]);
    ft: h ({[lst] select price: twap, delta, gamma by sym from (0!futuretwap) where sym in lst}; syms ticks[2]);
    `option`future!(op;ft)
    }

.rdb.gettickprice2:{[h; syms]
    syms: raze enlist syms;
    ticks: group {count "-" vs string x} each syms;
    op: h ({[pairso] select price%cnt, delta%cnt, gamma%cnt, theta%cnt by sym from 0!pairso#optiontwap}; flip `sym`time!flip (syms ticks[4]) cross 0D00:01 xbar `timespan$.z.t);
    ft: h ({[pairsf] select price: twap, delta, gamma by sym from 0!pairsf#futuretwap}; flip `sym`time!flip (syms ticks[2]) cross 0D00:01 xbar `timespan$.z.t);
    `option`future!(op;ft)
    }
