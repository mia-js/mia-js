module.exports = {
  title: 'Mia.js Demo API (Test)',
  description: 'API documentation',
  version: '1.0',
  logLevel: 'warn',
  server: {
    http: {
      port: 4000
    }
  },
  debug: false,
  cronJobs: {
    enabled: false,
    allowedHosts: [],
    ensureIndexes: {
      enabled: false,
      startUp: false,
      background: false
    }
  },
  tryCatchForRouteFunctions: false,
  memcached: {
    flushOnStart: true,
    servers: 'localhost:11211',
    options: {
      retries: 0,
      retry: 5000,
      timeout: 500
    }
  },
  skipDatabaseIndexingOnNewCollections: true,
  defaultMongoDatabase: 'miaTest',
  mongoDatabases: {
    miaTest: {
      url: 'mongodb://localhost:27017/miaTest',
      options: {
        writeConcern: { w: 1 }, // write acknowledgement
        poolSize: 15,
        useUnifiedTopology: true
      }
    }
  }
}
