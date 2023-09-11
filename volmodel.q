// \l ml/ml.q // load ml algos
\l util.q

//EWMA model
// volatility forecast with ewma model
// @param eps1 {list} daily log returns series for factor i
// @param eps2 {list} daily log returns series for factor j
// @param lambda {float} decay factor
// @param t {int} number of days to forecast
.ewma.forecast:{[eps1; eps2; lambda; t]
    cov0:first eps: eps1 * eps2;
    {[x;y;lambda] (lambda * x) + (1-lambda) * y}/ [cov0; eps; lambda]
    }

//GARCH model
.garch.forecast:{[eps;t]
    am: .p.import[`arch;`:arch_model][eps;`dist pykw "t"];
    forecast: (((am`:fit)[::])`:forecast)[`horizon pykw t];
    last trim .p2q.df2tbl[forecast`:variance][`$"h.",string t]
    }

//multivariate GARCH
.mgarch.forecast:{[eps;t]
    // import mgarch package
    mg:.p.import[`mgarch];
    // create an instance with distribution Student-t
    mg:(mg`:mgarch)[`t];
    // fit with data t*n, t for number of days, n for number of instruments
    mgfitted: (mg`:fit)[eps];
    // forecast
    forecast:(mg`:predict)[t];
    // get covariance matrix
    .p2q.np2lst (.p.value forecast)[@;2]
    }

// HAR model
// @param logrs {dict} key: sym; value: table of 1-min log return data with columns: tmp, logr
// @param t {int} time horizon for forecast
// @param isCov {bool} indicating if the estimation is for realised variance or covariance
// @return {list of list} covariance matrix forecast
.har.forecast:{[logrs;t;isCov]
    rvs: symx!{.util.logr2rcv[(x 0); (x 1);0D12;0D00:05;last differ x]} peach logrs symx:raze (key logrs){x,/:y where y >= max x}\: key logrs;
    n: count syms: key logrs;
    // univariate HAR forecast for variance; covariance terms are set to -2f
    cm: (n;n)#{[x;y;z] $[last differ z;-2f;.har.rvrq2forecast[x z;y]]}[rvs;t] peach symx;
    // obtain covariance from forecasted correlation
    if[isCov;
        cm:symx!{[cm;syms;rvs;symx]
                $[last differ symx;
                    [(sqrt (cm[syms?symx 0;syms?symx 0]) * (cm[syms?symx 1;syms?symx 1])) *.har.rhoforecast[rvs[2#symx 0]`rv;rvs[2#symx 1]`rv;rvs[symx]`rv]
                    ];
                    cm[syms?symx 0;syms?symx 1]
                ]}[cm;syms;rvs] peach symx;
        cm: (n;n)#{[cm;x] cm[asc x]}[cm] peach (key logrs) cross (key logrs);];
    cm
    }

// univariate HAR for variance forecast
.har.rvrq2forecast:{[realised; t]
    lev: ?[(realised`lev)>0;0;realised`lev]; // leverage component
    x1: log rvs: realised`rv;
    x2: log rvs * sqrt realised`rq;
    x3: log 4 mavg rvs;
    x4: log 10 mavg rvs;
    x_predict: 1f,last peach (lev;x1;x2;x3;x4);
    y: 5_x1;
    x: {4_-1_x} peach (lev;x1;x2;x3;x4);
    n: count x 0;
    x: (enlist n#1f),x;
    betas: (enlist y) lsq x;    
    t * 2 * exp (betas mmu x_predict)[0]
    }

// AR for correlation
.har.rhoforecast:{[rv1;rv2;rv12]
    rhoforecast: .har.rholinear[rv1;rv2;rv12];
    $[rhoforecast within (-1;1);rhoforecast;avg -5#rv12 % sqrt rv1 * rv2]
    }

.har.rholinear:{[rv1;rv2;rv12]
    rhos: rv12 % sqrt (rv1 * rv2);
    past1: 2 mavg rhos;
    past2: 5 mavg rhos;
    x_predict: 1f, last peach (rhos;past1;past2);
    y: 5_rhos;
    x: {4_-1_x} peach (rhos;past1;past2);
    n: count x 0;
    x: (enlist n#1f),x;
    betas: (enlist y) lsq x;
    (betas mmu x_predict)[0]
    }