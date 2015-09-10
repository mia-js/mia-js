module.exports = {

    // Directory names for Middleware modules in projects directory
    path: {
        projects: 'projects',
        modules: {
            routes: 'routes',
            models: 'models',
            controllers: 'controllers',
            crons: 'crons',
            public: 'public',
            libs: 'libs',
            config: 'config',
            init: 'init'
        },
        config: 'config'
    },

    // Default culture and language used by translations
    defaultCulture: {
        language: 'en',
        region: 'gb'
    },

    // Log error codes to db
    logging: {
        logErrorStatus: [400, 403, 404, 500]
    },

    /* ########## Environments #################
     * Define multiple stages with different configuration.*/
    local: {

        /* Define virtual hosts (vhosts) this application should listen to. Use id in routes file definition to apply a route to a host.
         hosts are optional. If a routes file does not have a hostId setting the file is listening to every host pointing to this server
         */
        /*hosts: [
         {
         id: "myApplication1",
         host: "example.com"
         },
         {
         id: "myApplication2",
         host: ["api.example.com", "example-domain.com"]
         }
         ],*/
        server: {
            http: {
                port: 3000
                //,redir: true // forward all traffic to https
            }
            // To use SSL encryption uncomment the following parameters and provide a valid certificate
            /*,https: {
             port: 4000,
             options: {
             key: fs.readFileSync('cert/ssl.key'),
             cert: fs.readFileSync('cert/ssl.crt'),
             ca: fs.readFileSync('cert/ca.pem'),
             passphrase: 'xxxxxx',
             requestCert: true,
             rejectUnauthorized: false
             }
             }*/
        },
        debug: true, // Show more details in error case
        cronJobs: {
            enabled: true, // Enable/Disable cron jobs as a global setting
            allowedHosts: [] // Define specific hosts (host names) to run cronjobs. Leave empty to start cron on any server running this application
        },


        //Wrap each request function in a try catch block to catch all application exceptions automatically
        //This is not recommended for production mode, that's why it is possible to turn this feature on/off from the config for each environment (local, stage, production) separately.
        //But in worst case with the feature turned off, if some exception is not handled the server might go down.
        tryCatchForRouteFunctions: true,

        // Init memcache. Available in controllers with Shared.memcached()
        memcached: {
            servers: 'localhost:11211',
            options: {
                retries: 0,
                retry: 0,
                timeout: 500
            }
        },

        //DB name of mongoDb to use for application
        defaultMongoDatabase: 'mia',

        // Mongodb: Database configuration
        mongoDatabases: {
            // Application db
            mia: {
                url: 'mongodb://api:api@localhost:27017/mia',
                options: {
                    db: {
                        w: 1 //write acknowledgement
                    },
                    server: {
                        poolSize: 15
                    }
                }
            }
            // Tests db
            /*,tests: {
             url: 'mongodb://api:api@localhost:27017/tests',
             options: {
             db: {
             w: 1 //write acknowledgement
             },
             server: {
             poolSize: 15
             }
             }
             }*/
        }
    },

    production: {
        /* Define virtual hosts (vhosts) this application should listen to. Use id in routes file definition to apply a route to a host.
         hosts are optional. If a routes file does not have a hostId setting the file is listening to every host pointing to this server
         */
        /*hosts: [
         {
         id: "myApplication1",
         host: "example.com"
         },
         {
         id: "myApplication2",
         host: ["api.example.com", "example-domain.com"]
         }
         ],*/
        server: {
            http: {
                port: 3000
                //,redir: true // forward all traffic to https
            }
            // To use SSL encryption uncomment the following parameters and provide a valid certificate
            /*,https: {
             port: 4000,
             options: {
             key: fs.readFileSync('cert/ssl.key'),
             cert: fs.readFileSync('cert/ssl.crt'),
             ca: fs.readFileSync('cert/ca.pem'),
             passphrase: 'xxxxxx',
             requestCert: true,
             rejectUnauthorized: false
             }
             }*/
        },
        debug: true, // Show more details in error case
        cronJobs: {
            enabled: true, // Enable/Disable cron jobs as a global setting
            allowedHosts: [] // Define specific hosts (host names) to run cronjobs. Leave empty to start cron on any server running this application
        },

        //Wrap each request function in a try catch block to catch all application exceptions automatically
        //This is not recommended for production mode, that's why it is possible to turn this feature on/off from the config for each environment (local, stage, production) separately.
        //But in worst case with the feature turned off, if some exception is not handled the server might go down.
        tryCatchForRouteFunctions: true,

        // Init memcache. Available in controllers with Shared.memcached()
        memcached: {
            servers: 'localhost:11211',
            options: {
                retries: 0,
                retry: 0,
                timeout: 500
            }
        },

        //DB name of mongoDb to use for application
        defaultMongoDatabase: 'mia',

        // Mongodb: Database configuration
        mongoDatabases: {
            // Application db
            mia: {
                url: 'mongodb://api:api@localhost:27017/mia',
                options: {
                    db: {
                        w: 1 //write acknowledgement
                    },
                    server: {
                        poolSize: 15
                    }
                }
            }
            // Tests db
            /*,tests: {
             url: 'mongodb://api:api@localhost:27017/tests',
             options: {
             db: {
             w: 1 //write acknowledgement
             },
             server: {
             poolSize: 15
             }
             }
             }*/
        }
    }
};