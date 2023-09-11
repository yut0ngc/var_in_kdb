\l util.q
\l p.q // for importing python modules

// get twap date for analysis
getidxtwapforanalysis:{[h;start;end;syms]
    twapraw: h ({[start;end;symList] `sym xgroup `date`time xasc select sym, date, time, twap from INDEXTWAP where date within(start;end+1), sym in symList}; start; end; raze enlist syms);
    twap: (start;end) {`tmp xasc select tmp, twap from (update tmp:date+time from update date:date-1 from (flip y) where time >=0D23:00:00.000) where date within (x[0];x[1])}/: twapraw; // correct for timezone
    twap
    }

// calculate mean, variance, skewness, kurtosis of time series
// @param x {list of float}
stat:{
    stat:()!();
    stat[`]:(::);
    stat[`observations]: count x;
    stat[`mean]: avg x;
    stat[`variance]: var x; 
    stat[`skew]: avg ((x-stat[`mean])%(sqrt stat[`variance])) xexp 3;
    stat[`kurt]: avg ((x-stat[`mean])%(sqrt stat[`variance])) xexp 4;
    jb: .p.import[`statsmodels.stats.stattools;`:jarque_bera][x]; //test for normality
    dw: .p.import[`statsmodels.stats.stattools;`:durbin_watson][x xexp 2]; //test for serial correlation
    adf: .p.import[`statsmodels.tsa.stattools;`:adfuller][x]; //test for unit root
    lbr: .p.import[`statsmodels.stats.diagnostic;`:acorr_ljungbox][x]; //Ljung-Box test for serial correlation
    lbr2: .p.import[`statsmodels.stats.diagnostic;`:acorr_ljungbox][x xexp 2]; //Ljung-Box test for serial correlation in vol
    acf: .p.import[`statsmodels.tsa.stattools;`:acf][x xexp 2;pykwargs`qstat`fft!11b];
    stat[`jb_stat]: (jb[@;0])`;
    stat[`jb_pval]: (jb[@;1])`;
    stat[`dw]: dw`;
    stat[`adf_stat]: (adf[@;0])`;
    stat[`adf_pval]: (adf[@;1])`;
    stat[`lb2_stat]: (.p2q.df2tbl lbr2)[2]`lb_stat;
    stat[`lb2_pval]: (.p2q.df2tbl lbr2)[2]`lb_pvalue;
    stat[`lb5_stat]: (.p2q.df2tbl lbr2)[5]`lb_stat;
    stat[`lb5_pval]: (.p2q.df2tbl lbr2)[5]`lb_pvalue;  
    stat[`lb10_stat]: (.p2q.df2tbl lbr2)[10]`lb_stat;
    stat[`lb10_pval]: (.p2q.df2tbl lbr2)[10]`lb_pvalue;   
    stat[`acf_rho]: enlist .p2q.np2lst acf[@;0];
    stat[`acf_stat]: enlist .p2q.np2lst acf[@;1];
    stat[`acf_pval]: enlist .p2q.np2lst acf[@;2];
    stat}

// function to output statistical properties by index
// @param x {dict} keyed by index sym, value includes dictionary containing tmp and twap keys
analysis:{
    intervals:0D00:01 * 1 5 10 15 30 60 120 360 720 1440;
    result: {[x;y]
        twaps:0!select last twap by y xbar tmp from x; 
        returns: {`interval`twap!(x[`tmp]-y[`tmp];log x[`twap]%y[`twap])}':[twaps];
        sampled: exec twap from returns where interval=y;
        stat[sampled]
        }/:\: [x;intervals];
    {[x;y] `sym`interval`observations`mean`vol_annualised xcols update vol_annualised: sqrt variance*(365D%interval) from update interval: x from `interval xcol update sym:y[0] from y[1]}/: [intervals;flip ((key result)`sym;value result)]
    }

h: hopen `::5012;
twaps:getidxtwapforanalysis[h;2023.04.11;2023.07.31;`BTC`ETH];
summary:analysis[twaps];

show summary[0];
show summary[1];
sumcols: cols summary[0];
sumcols: sumcols where not ((sumcols like "acf*"));
`:btc_summary.csv 0: csv 0: sumcols#/:summary[0]
`:eth_summary.csv 0: csv 0: sumcols#/:summary[1]
`:btc_acf.csv 0: csv 0: select sym, interval, acf_rho:{"," sv string raze raze raze x}'[acf_rho],acf_stat:{"," sv string raze raze raze x}'[acf_stat],acf_pval:{"," sv string raze raze raze x}'[acf_pval] from summary[0]
`:eth_acf.csv 0: csv 0: select sym, interval, acf_rho:{"," sv string raze raze raze x}'[acf_rho],acf_stat:{"," sv string raze raze raze x}'[acf_stat],acf_pval:{"," sv string raze raze raze x}'[acf_pval] from summary[1]
// `:btc_lb_acf.csv 0: csv 0:
// `:eth_lb_acf.csv 0: csv 0: