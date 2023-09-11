
#### HDB

[dbmaint.q](https://github.com/KxSystems/kdb/blob/master/utils/dbmaint.q) for maintainance on partitioned DB tables

- updating sym cols in a table against an existing sym file (backup before running command)

    ``fncol[`:.;`tablename;`sym;`:dir/to/sym/file?get@]``
    
    ``{fncol'[`:.;x;exec c from meta x where t="s";`:dir/to/sym/file?get@]}each{x where -1h=(type .Q.qp get@)each x}tables[]``
