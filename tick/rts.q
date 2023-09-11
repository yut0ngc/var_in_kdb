default:`tp`hdb`db!(":5010";":5012";"OnDiskDB/")
args: .Q.opt .z.x
args: default,args
/ time windows for TWAP of index and derivative data
twapwindows: 0D00:01

indextwap:([sym:`symbol$(); time:`timespan$()] pcnt:`long$(); psum:`float$(); twap:`float$())
optiontwap: ([sym:`symbol$(); time:`timespan$()] cnt:`long$(); price:`float$(); iv:`float$(); delta:`float$(); gamma:`float$(); theta:`float$(); vega:`float$(); rho:`float$())
futuretwap:([sym:`symbol$(); time:`timespan$()] pcnt:`long$(); psum:`float$(); twap:`float$(); delta:`float$(); gamma:`float$())

updOption:{[d]
    c: `time`sym`price`iv`delta`gamma`theta`vega`rho;
    if[0h=type d; d: flip c!d[0,1,15,16,27+til 5]]; /for read from logfile, convert list to table
    d: update time: twapwindows xbar time, cnt: count sym by sym, twapwindows xbar time from c#/:d; / keep only relevant cols
    d: d pj optiontwap;
    optiontwap,: d;
    }

updFuture:{[d]
    c: `time`sym`price;
    if[0h=type d; d: flip c!d[0,1,11]];
    d: delete price from update time:twapwindows xbar time, pcnt:count price, psum:(sum price) by sym, twapwindows xbar time from c#/:d;
    d: update twap:psum%pcnt, delta:1.0, gamma: 0.0 from d pj futuretwap;
    futuretwap,:d;
    }

updIndex:{[d]
    if[0h=type d;
        d: flip `time`sym`date`price!d];
    d: delete date, price from update time:twapwindows xbar time, pcnt:count price, psum:(sum price) by sym, twapwindows xbar time from d;
    d: update twap:psum%pcnt from d pj indextwap;
    indextwap ,: d;
    }

upd:`option`future`index!(updOption;updFuture;updIndex)

/ end of day: save, clear, hdb reload
.u.end:{
    t:tables `.;
    {(upper x) set 0!(select from x); .Q.dpfts[`$":.";.z.D-1;`sym;upper x;`$"sym",string x]} each t;
    {delete from x}each tables `.
    }


/ subscribe to TP
init:{
   / open handle to TP
   h:hopen `$":", args`tp;
   / subscribe to tables in TP
   u:h".u.sub[`;`];`.u `i`L";
   / replay log
   -11!(u[0];u[1]);
   system "cd ",1_-10_string u[1]
 }


if[not "w"=first string .z.o;system "sleep 1"]

init[]
