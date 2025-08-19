FROM couchdb:3.3

# Set up CouchDB admin user and password via environment variables
ENV COUCHDB_USER=admin
ENV COUCHDB_PASSWORD=admin

EXPOSE 5984

# CouchDB will run with default config, admin user, and exposed port
CMD ["/opt/couchdb/bin/couchdb"]
