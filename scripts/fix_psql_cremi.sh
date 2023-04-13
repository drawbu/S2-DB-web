./env_psql.sh

/usr/lib/postgresql/11/bin/pg_ctl  -D /tmp/$LOGNAME/ -l /tmp/$LOGNAME/startup.log start
