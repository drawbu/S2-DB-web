# Add environment variables for psql
export PGHOST=/tmp/$LOGNAME
export PGPORT=$UID

# Start the database on the CREMI computers
if [ -f /usr/lib/postgresql/11/bin/pg_ctl ]; then
  /usr/lib/postgresql/11/bin/pg_ctl  -D /tmp/$LOGNAME/ -l /tmp/$LOGNAME/startup.log start
fi

# To fix on macOS
if [[ ! -f /var/pgsql_socket/ ] && [ "$OSTYPE" == "darwin"* ]]; then
  mkdir /var/pgsql_socket/
  ln -s /private/tmp/.s.PGSQL.5432 /var/pgsql_socket/
fi
