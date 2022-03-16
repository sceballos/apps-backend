FROM postgres
ENV POSTGRES_PASSWORD supersecretpassword
ENV POSTGRES_DB appsmanagerdb
COPY apps_manager.sql /docker-entrypoint-initdb.d/