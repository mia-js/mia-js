module.exports = {

    title: "Mia.js Demo API",
    description: "API documentation",
    version: "1.0",

    logLevel: "info", // none, fatal, error, warn, info, debug, trace

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

    // Rate Limiter requests per interval per IP address
    /*rateLimt: {
     maxRequests: 1000, // Requests per IP per rate limit window
     interval: 5 // Rate limit window in minutes
     },*/

    // Maximum amount of time in milliseconds that the event queue is behind, before consider the application as too busy and reject incoming requests
    maxLag: 100,

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

    // External Requests Keep Alive Agent Settings
    /*keepAliveAgentOptions: {
     maxSockets: 200,
     maxFreeSockets: 10,
     timeout: 60000,
     keepAliveTimeout: 30000 // free socket keepalive for 30 seconds
     },*/

    cronJobs: {
        enabled: true, // Enable/Disable cron jobs as a global setting
        allowedHosts: [], // Define specific hosts (host names) to run cronjobs. Leave empty to start cron on any server running this application
        ensureIndexes: {
            enabled: false,
            startUp: false,
            background: true
        }
    },

//Wrap each request function in a try catch block to catch all application exceptions automatically
//This is not recommended for production mode, that's why it is possible to turn this feature on/off from the config for each environment (local, stage, production) separately.
//But in worst case with the feature turned off, if some exception is not handled the server might go down.
    tryCatchForRouteFunctions: true,

    // Init memcache. Available in controllers with Shared.memcached()
    memcached: {
        flushOnStart: true, // Flush mem cache content on initial first usage of memcache after server start
        servers: 'localhost:11211',
        options: {
            retries: 0,
            retry: 5000,
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
                w: 1, //write acknowledgement
                poolSize: 15
            }
        }
    }
}