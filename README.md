<a href="#"><img src="http://mia-js.github.io/mia-js/images/miajs.png" title="mia.js"/></a>

mia.js is an API framework based on [node.js](http://nodejs.org), [Express](https://github.com/strongloop/express) and [mongoDB](https://www.mongodb.org/) that makes it easy to build custom or enterprise-grade api's and web frontend's.
Focus of mia.js is to work as middleware backend for mobile apps to have all your communication in one place and avoid overloading your mobile apps.
Pass-through, aggregate or modify other external api's or create your own one in mia.js and provide them bundled as your project api.
Use multiple project folders to keep track of all your api's and connect them by loose coupling of ids. Mia.js provides predefined functionality like user management, device profile management, session handling, authorization layers or notification handlers (push, email). There is also an iOS and Android SDK available to work with mia.js.

You can use it to serve isomorphic frontend apps too. Thanks to webpack you can even use hot module replacement right in the server which will speed up your development pace.

# Installation
**Install [node.js](http://nodejs.org) >6.xx and [mongoDB](https://www.mongodb.org/) >2.6x**

## Get the latest stable release of mia.js
Download or clone this repository in a directory

# Quick start

To run the mia.js demo project first set up a mongoDB and create a database named `mia`.
If using authorization for mongoDB please make sure to create the user `api` with password `api` on database `mia` or modify the preset configuration.

Install dependencies:

```bash
$ npm install
```

Start mia.js

```bash
# Run mia.js with node.js in local mode. Pass environment mode as argument.
$ node server.js local

# Or just type
$ npm start

# Start the development server (HMR) with
$ npm run dev-server
```

At this point, if you visit [http://localhost:3000/docs](http://localhost:3000/docs) you will see the [Swagger::Docs](https://github.com/richhollis/swagger-docs) documentation of the demo project api.
To visit the demo frontend based on facebook's React.js that uses the demo api go to [http://localhost:3000/web/](http://localhost:3000/web/)

# Development
If you experience a non responsive IDE during development with mia.js please ignore the pattern `.webpack`. You can do this via your IDE or project settings.
Especially if you want to use HMR in the server itself.

# Features
  * Easy routing and nesting of controllers
  * Hierarchically chaining of controllers
  * Manage and connect controller by ids not by physical existence in a folder
  * Supports multiple projects folders
  * Build-in cron job handler
  * Predefined functionality for device profile handling
  * Predefined functionality for user management
  * Notifications Handler for email and push (iOS ready, Android will follow soon)
  * Define database models for auto validation of mongoDB collections
  * Use preconditions for automatically validate request data
  * Auto-generates swagger docs based on routing definitions file
  * Compile and serve individual frontend projects using the WebpackCompiler lib [[Read more]](#compile-and-serve-individual-frontend-projects-using-the-webpackcompiler-lib)
  * Use [hot module replacement (HMR)](https://webpack.js.org/concepts/hot-module-replacement/) to speed up development [[Read more]](#hot-module-replacement)
  * Write cutting edge syntax powered by [Babel](https://babeljs.io)


# Configuration
Configuration can be done on a global and on a project level. To customize the global environment settings modify the files in the directory `config/*`.
Mia.js comes with a boilerplate configuration for the included demo project application and some demos of how to use mia.js generic controllers.

#### Global environment configuration
You can define multiple environments like local, stage, production or your own with different environment configurations. See `config/system.js` to modify the following parameters:

  * Paths of mia.js project working directories
  * HTTP/HTTPS server settings like port, ssl 
  * Virtual hosts to run multiple domains on same application server
  * CronJob configuration
  * MongoDB settings like replica sets, ports, host-names 
  * Memcache settings
  * Default culture and language settings
  * Logging level
  * Debug mode

##### Configuration example:
```js
module.exports = {
    // Directory names for mia-js modules in projects directory
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

    // Default culture and language used for translations
    defaultCulture: {
        language: 'en',
        region: 'gb'
    },

     // Define multiple stages with different configuration i.e. local, stage, production
    local: {
        logLevel: "info", // none, fatal, error, warn, info, debug, trace

        // Rate Limiter requests per interval per IP address
        rateLimit: {
             maxRequests: 1000, // Requests per IP per rate limit window
             interval: 5 // Rate limit window in minutes
        },

         // Maximum amount of time in milliseconds that the event queue is behind, before consider the application as too busy and reject incoming requests
        maxLag: 100,

        /* Define virtual hosts (vhosts) this application should listen to. Use id in routes file definition to apply a route to a host. Hosts are optional. If a routes file does not have a hostId setting the file is listening to every host pointing to this server
         */
        hosts: [
            {
                id: "myApplication1",  // HostId
                host: "example.com" // Host name of this hostId.
            },
            {
                id: "myApplication2", // HostId
                host: ["api.example.com", "example-domain.com"] // Host names of this hostId.
            }
        ],
        server: { // Optional define http, https or both
            http: { 
                port: 3000, // Port for http
                redir: true // Forward all traffic to https
            }
            , https: { // Optional define http, https or both
                port: 4000, // Port for https
                options: { // SSL Options
                    key: fs.readFileSync('cert/ssl.key'),
                    cert: fs.readFileSync('cert/ssl.crt'),
                    ca: fs.readFileSync('cert/ca.pem'),
                    passphrase: 'xxxxxx',
                    requestCert: true,
                    rejectUnauthorized: false
                }
            }
        },
        debug: true, // Show more details in error case
        cronJobs: {
            enabled: true, // Enable/Disable cron jobs as a global setting
            allowedHosts: [] // Define specific hosts (host names) to run cron-jobs. Leave empty to start cron on any server running this application
        },

        //Wrap each request function in a try catch block to catch all application exceptions automatically
        tryCatchForRouteFunctions: true,

        // Memcache settings if you want to use memcache to cache data in your controllers
        memcached: {
            flushOnStart: true, // Flush mem cache content on initial first usage of memcache after server start
            servers: 'localhost:11211',
            options: {
                retries: 0,
                retry: 5000,
                timeout: 500
            }
        },

        //Default db name of mongoDb to use for application
        defaultMongoDatabase: 'mia',
        
        // Helpful in test environments to prevent the database from indexing if whole collections are frequently created and dropped again
        skipDatabaseIndexingOnNewCollections: false,

        // Mongodb: Database configuration
        mongoDatabases: {
            // Application dbs. You can define multiple databases
            mia: {
                url: 'mongodb://api:api@localhost:27017/mia',
                options: { // MongoDB options see MongoClient definition
                    db: {
                        w: 1 //write acknowledgement
                    },
                    server: {
                        poolSize: 15
                    }
                }
            }
        }
    }
};
```

#### Translations configuration
Mia.js is designed to support multiple languages for response and error handling messages. See `config/translations.js` to modify theses messages on a global level.

# Global structure

  *  `config` - Global environment configuration
  *  `init` - Generate initial data. All files providing a function `init()` are called on server startup.
  *  `projects` - Contains your projects

# Project structure
A project is a folder with all your controllers, functions and other files in one place that logically belong together. Create as many projects as you like by creating sub directories with a name of your choice with the following structure within the folder `projects`. 

  *  `config` - *optional* - Project configurations, i.e. global project variables like api keys or host names or translation strings for error and response handling or notification templates for push or email messaging
  *  `controllers` - Contains your project controllers. Controllers can be chained in routing.
  *  `crons` - *optional* - Project cron-jobs
  *  `init` - *optional* - Generate project data. All files providing a function `init()` are called on server startup.
  *  `libs` - *optional* - Extract functions to lib files to make them reusable in your project or global in all projects.
  *  `models` - *optional* - Define custom mongoDB database models to validate and modify data before writing them to the database
  *  `public` - *optional* - Put public assets or frontend web applications in this folder. This folder will be available public using the url like `/{YOUR PROJECT}/assets/`
  *  `routes` - Define all your project routes and define which controllers to call within this route. Controllers can be chained simply by definition in your projects route files. All routes files in this directory will be registered at server startup.

All files inside the project working directories are connected by ids and version number. So feel free to create sub directories or drag around your files as you need them. That's cool - huh?

If you put all project specific content in a project folder you can easily move your whole project to any other mia.js server or even split up your projects later to deploy them on single servers.

### Config
Usually projects have to deal with config variables like api keys, host-names, external urls or localization keys. All files in the config directory gets parsed on server startup so you can use them on runtime in your controller functions by referencing `Shared` - see [Globals](#globals). 

### Controllers
Create your own api or web application by writing controllers placed in the sub directory `controllers` of your project folder. To organize your project you can use sub-directories at any depth as well. A controller is a small segment that is performing a certain task i.e. request an external api or getting results from an internal database or simply just returning some text. Controllers can be chained in the routes definition files. So you can split up all your needed functionality in multiple controllers and chain them. You can reuse controllers in routes i.e. write a controller that validates an access key and prefix this controller to every single route.
Due to chaining you can also do things like: A controller gets data from a source, the second controller in the chain modified this data and a third controller is responding the request and outputs your data as a json, xml or text document. Whatever you need, whatever you like!

#### Defining a controller
<a name="definingAController"></a>
```js
function thisModule() {
    var self = this;
    self.disabled = false; // Enable /disable controller
    self.identity = 'myIceCreamController'; // Unique controller id used in routes, policies and followups
    self.version = '1.0'; // Version number of service
    self.created = '2015-07-14T12:00:00'; // Creation date of controller
    self.modified = '2015-07-14T12:00:00'; // Last modified date of controller
    self.group = 'demo'; // Group this service to a origin

    self.preconditions = {
        icecream: {
            parameters: {
                query: {
                    flavour: {
                        type: String,
                        allow: ["cookies and cream","vanilla","strawberry"],
                        convert: "lower"
                    }
                }
            },
            responses: {
                200: "Success"
            }
        }
    };

    self.favoriteFlavour = function (req, res, next) {
        var color = req.miajs.validatesParameters.query.flavour;
        res.response = "I love "+flavour+" icecream";
        next();
    };

    return self;
}

module.exports = new thisModule();
```

To define a controller you need to set some variables like identity, version and group and write functions that perform an action. 

##### Use preconditions
When using preconditions you can define what is necessary to run this controller.
If a condition does not match mia.js returns a qualified error response to the requesting client and prevents this code to run.
Preconditions consists of `parameters` and `responses`. In parameters you can use the following segments:
* `query` - Parameters that are expected in the query part of the url i.e. `/icecream?sortBy=flavour`
* `body` - Parameters that are expected in the body part of the request
* `path` - Parameters that are expected in the path part of the url i.e. `/icecream/:flavour/...`
* `header` - Parameters that are expected in the header part of the request

##### Available precondition validation rules
 * `type`      *'Boolean','String','Number','Date','Array'* - defines the type of the value
 * `subType`   *'Boolean','String','Number','Date','Array'* - defines the type of the value of elements of an object type array
 * `maxLength` *Number i.e. 32* - Maximum length of chars of a value
 * `minLength` *Number i.e. 32* - Minimum length of chars of a value
 * `required`  *true|false* - Set if value is required
 * `convert`   *'upper','lower'* - Convert value to upper or lower case
 * `match`     *RegEx] i.e. /[a-zA-Z]{2}/i* - Value must match to regular expression
 * `default`   *Number|Boolean|String|Function i.e. 'inactive'* - Set a default value if not set
 * `nullable`  *Boolean* - Defines if a value is allowed to be set to null in case of no given value
 * `virtual`   *String|Function* - Apply a defined virtual function to convert a value with a custom function and add to values
 * `max`       *Number i.e. 20* - Max number a value can have, only for numbers
 * `min`       *Number i.e. 1* - Min number a value must have, only for numbers
 * `allow`     *Array|Number|String i.e. [2, 3, 4]* - Define allowed values (case-in-sensitive)
 * `deny`      *Array|Number|String i.e. [2, 3, 4]* - Denied values that are not allowed (case-in-sensitive)

##### Assign to the next controller
All controllers are chained using the express function `next()`. Append variables to `req` to make them available to the next controller in the routing chain or directly add to `res.response` and use `res.send(res.response, 200)` to output the result. See [Express](https://github.com/strongloop/express) for details.
You can use a predefined json output controller available in `generic` project to respond to a request or write your own output controller i.e. to render html, xml or even soap.

### Cron-Jobs
Mia.js comes with a build in cron job manager to support cron jobs. If you like to run tasks time-based like clean up a database or send data to an external api you can define a cron job and it will run at the time you defined. Mia.js handles job execution and job concurrency on all servers your applications is currently running so all you need to set up is time and number of instances that should run this job. You can also define a single server to run all your cron-jobs defined in mia.js global configuration.

#### Run single cron job immediately without bootstrapping the web server

```bash
$ node server.js local cron=CronjobName

# Or as an alternative you could use
$ npm start cron=CronjobName
```

#### Run multiple cron jobs immediately without bootstrapping the web server

```bash
$ node server.js local cron=CronjobA,CronjobB,CronjobC

# Or as an alternative you could use
$ npm start cron=CronjobA,CronjobB,CronjobC
```

#### Don't run any cron job at all (only bootstrap web server)

```bash
$ node server.js local nocron

# Or as an alternative you could use
$ npm start nocron
```

#### Defining a cron job
To define a cron job place a file in the folder `crons` and add the following code
```js
var _ = require('lodash')
    , MiaJs = require('mia-js-core') // include Mia.js core module 
    , CronJobs = MiaJs.CronJobs // use cron functionality of mia.js core module
    , BaseCronJob = CronJobs.BaseCronJob // extend the cron definition to your cron model
    , Q = require('q'); // Promise lib

module.exports = BaseCronJob.extend({},
    {
        disabled: false, // Enable /disable job definition
        time: { // Times are used as default timings. To change after first run see mongodb collection cronJobTypes
            hour: '0-23',
            minute: '0-59',
            second: '0-59/10',
            dayOfMonth: '0-31',
            dayOfWeek: '0-7', // (0 or 7 is Sun, or use names)
            month: '0-12',   // names are also allowed
            timezone: 'CET'
        },

        isSuspended: false, // set to true to suspend this job
        debugOutput: false, // set to true to get detailed output of job startup and terminating
        allowedHosts: [], // define hosts to run this job. Leave empty if every host is allowed to

        maxInstanceNumberTotal: 1, // max number of parallel running instances on all application host 
        maxInstanceNumberPerServer: 1, // max number of parallel running instances on this host

        identity: 'randomlyGenerateNewIcecreamFlavours', // Job name

        worker: function () {
            // RUN A TASK HERE
            return Q(); // Cron-job has to return a promise
        },
        created: '2015-07-14T12:00:00', // Creation date
        modified: '2015-07-14T12:00:00' // Last modified date
    }
);

module.exports = new thisModule();
```
The task that is executed time-based should be placed in the function `worker`.

### Init
Sometimes you need to set some initial data to run your project i.e. write access keys to a database or do some logging. Simply create a file in the init project folder and provide a function called `init()`. All files inside this folder gets parsed and executed on server startup.

#### Defining a init function
```js
function thisModule() {
    var self = this;
    self.init = function () {
        // Do you initializing here
    };
    return self;
};
module.exports = new thisModule();
```

### Libs
A project usually consists of several controller files that handle different tasks. To avoid duplication of your code you can move code i.e. functions that should be reused to a file in the folder `lib`. All files in the lib directory gets parsed on server startup so you can use them on runtime in your controllers functions by referencing `Shared` - see Section `Globals`. 

#### Defining a lib
```js
function thisModule() {
    var self = this;
    self.identity = 'MyIcecreamLib'; // Controller name used in routes, policies and followups
    self.version = '1.0'; // Version number of service
    self.getAllIcecreamFlavoursFromDatabase = function (sortBy, ascending, limit, skip) {
         // Perform a database task and return a list of all icecream flavours
         return listOfIcecreams;
    };
    return self;
};
module.exports = new thisModule();
```

### Models
When handling with user generated data you always have to deal with validation to achieve consistency. Particularly when using a NoSQL database like mongoDB you have to take care that your data in a table or collection is somehow equal to use indexing and speed up your application. Mia.js supports models to define what your data should look like. The build-in base model component and model validator of mia-js core module takes care of consistency by validating the data and can also modify your data i.e. by adding default values or calling custom functions on a model object. You can also defined your indexes for your database inside your model definition file. The collection is auto-added to the database on first usage if it does not exists and all indexed are set up automatically. When ever you want something to be stored to your database just use the mia.js base model functions that handles all for you.

#### Defining a model

```js
var BaseModel = require("mia-js-core/node_modules/baseModel");
module.exports = BaseModel.extend({
        data: {
            _id: {},
            flavour: {
                type: String,
                index: true,
                required: true,
                unique: true
            },
            serveIn: {
                type: String,
                allowed: ["cup","cone"],
                default: "cone"
            },
            created: {
                type: Date,
                index: true,
                required: true
            }
        }
        /*
        Add compound indexes as followed:
        ,compoundIndexes: [
         {
             fields: ["name", "group"],
             unique: true
         }
         ]
         */
    },
    {
        disabled: false, // Enable /disable model
        identity: 'icecream-model', // Model name
        version: '1.0', // Version number
        created: '2015-07-14T12:00:00', // Creation date
        modified: '2015-07-14T12:00:00', // Last modified date
        collectionName: 'icecreams'
    });
```

##### Available db model validation rules
<a name="modelValidationRules"></a>
 * `type`      *'Boolean','String','Number','Date','Array'* - defines the type of the value
 * `subType`   *'Boolean','String','Number','Date','Array'* - defines the type of the value of elements of an object type array
 * `maxLength` *Number i.e. 32* - Maximum length of chars of a value
 * `minLength` *Number i.e. 32* - Minimum length of chars of a value
 * `required`  *true|false* - Set if value is required
 * `unique`    *true|false* - Set if value should be unique
 * `public`    *true|false* {set:true,get:false} - Allow values to be set or the get. Set=false means disallow this value to be added manually. Use virtual to generate value by function instead. Get=false means this value is not part of the output of validation. Values will be deleted after processing
 * `index`     *true|false* - Set if an index should be applied to value
 * `convert`   *'upper','lower'* - Convert value to upper or lower case
 * `match`     *RegEx] i.e. /[a-zA-Z]{2}/i* - Value must match to regular expression
 * `default`   *Number|Boolean|String|Function i.e. 'inactive'* - Set a default value if not set
 * `nullable`  *Boolean* - Defines if a value is allowed to be set to null in case of no given value
 * `virtual`   *String|Function* - Apply a defined virtual function to convert a value with a custom function and add to values
 * `max`       *Number i.e. 20* - Max number a value can have, only for numbers
 * `min`       *Number i.e. 1* - Min number a value must have, only for numbers
 * `allow`     *Array|Number|String i.e. [2, 3, 4]* - Define allowed values (case-in-sensitive)
 * `deny`      *Array|Number|String i.e. [2, 3, 4]* - Denied values that are not allowed (case-in-sensitive)
 * `extend`    *Function* - Define a function that extends a schema definition dynamically i.e. iterate function [1...20] ==> name: 1,{type: Number, default: 0}

## Routes
Routes are the key functionality to build your application. Define routes of your project in the routes definition of mia.js. The build in routes handler connects all your controllers, registers the routes and handles route parameters of your application. You can have multiple routes files in your projects `routes` folder to logically separate routes or create routes with different compilation of chained controllers i.e. routes for version v1, routes for version v2 or routes for testing.

#### Defining a route
<a name="definingARoute"></a>
```js
module.exports = {
    group: 'demo', // Group name
    name: 'My icecream API',  // if disabled path is used as name in api documentation
    version: '1.0', // Version
    hostId: ['myDomain1','myDomain2'], // Optional if vhosts are defined in global mia.js config.
    environment: ['local','production'], // Define environments where this route file should be registered
    prefix: ['/icecream/v1','/icecream/latest'], // Route prefix. Multiple prefixes possible
    corsHeaders: { // Optionally set CORS headers to routes definition or to a single route
        "Access-Control-Allow-Origin": "*", // See CORS header definition 
        "Access-Control-Allow-Headers": "Content-Type",  // See CORS header definition 
        "Access-Control-Allow-Credentials": true  // See CORS header definition 
    },
    // Rate Limiter requests per interval per IP address
    rateLimit: {
        maxRequests: 1000, // Requests per IP per rate limit window
        interval: 5 // Rate limit window in minutes
    },
    routes: {
        // Route /unicorn
        './flavours': {
            list: {
                identity: 'icecreamFlavours',
                modified: new Date(2015, 7, 14, 12, 0, 0),
                docs: true,
                description: "List of icecream flavours",
                rateLimit: {
                        maxRequests: 500, // Requests per IP per rate limit window
                        interval: 5 // Rate limit window in minutes
                },
                controller: [
                    {
                        name: 'generic-accessKeyService',
                        version: '1.0'
                    },
                    {
                        name: 'myIceCreamController',
                        function: "favoriteFlavour",
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultResponse',
                        version: '1.0'
                    }
                ],
                errorController: [
                    {
                        name: 'myCustomErrorController',
                        version: '1.0'
                    }
                ],
                responseSchemes: {
                    // Response Schemes are optional to describe what scheme the response will look like
                    success: {
                        "status": {
                            type: "Number"
                        },
                        response: {
                            param1: {
                                type: "String"
                            },
                            param2: {
                                type: "Number"
                            }
                        }
                    },
                    error: {
                        "status": {
                            type: "Number"
                        },
                        errors: [
                            {
                                code: {
                                    type: "String"
                                },
                                msg: {
                                    type: "String"
                                }
                            }
                        ]
                    }
                }
            }
        }
    }
};
```
In this example a route is registered with the method `GET` and the paths `/icecream/v1/flavours` and `/icecream/latest/flavours`. 
##### Routes parameters
There are some global parameters of your routes file to adjust the routes behaviour.

* `group` - Connect your project files by giving it a group name. When a request is processed this group name will be available to all controllers to identify what route is currently calling this controller. Due to your controllers can be nested in multiple routes this is kind of important to identify from which routes this request came from. You can use this variable to write a controller function with different return values depending on the route path.
* `name` - *optional* All routes will be grouped by this optional name in auto generated documentation. Using this parameter gives your routes a more 	meaningfully name. If not set the path is taken as group name for all routes in this file the documentation.
* `hostId` - When using vhosts in mia.js global configuration you can bind all routes of this route file to a specific vhost i.e. my.domain.tld. In consequence this route is only available for requests coming from this domain. You can assign multiple hostIds to a route. Notice: Use a host ID here not a domain name. Domains names for vhosts should be defined in mia.js global config matching to a hostId.
* `version` - Mia.js is designed to work with versioning. Giving your routes file and also your controllers a version number makes it easy to use versioning for your route by simply duplicating the routes file and make your modifications.
* `envrionment` - *optional* Define environments for a routes file. The routes file is only registered and available public if the environment name matches the current environment name on server startup. You can creates routes for testing purpose and i.e. just deploy them to your staging servers and disable and hide them on your production environment.
* `prefix` - *optional* You can prefix a route or even use multiple prefixes to make sure not to have conflicts with other route files or other projects. When building api routes we recommend to use the version number as part of the prefix i.e. `/icecream/v1/flavours`. It's up to you!
* `corsHeaders` - Apply CORS headers to a routes file i.e. for Cross Domain Policy. Defining the CORS header automatically enables all routes of this routes definition file to response to a browsers CORS requests methods OPTIONS
* `rateLimit` - Limit the request rate for an interval time range and max request for all routes within this routes file. Memcached needed to use rateLimit
* `routes` - All of your application routes
* `decrecated` - *optional* Add this flag to mark all methods of this route as deprecated. The will lead to a notice field when requesting an api and highlighting in [Swagger::Docs](https://github.com/richhollis/swagger-docs) documentation

##### Routes
Define multiple routes for your application project. Mia.js has some build in methods and parameters to describe the route. First give your route a name see example `./flavours`. This name is directly used as route path and appended to the prefix. You can use variable names inside of your routes path to allow routes like `/icecream/v1/:flavour/ingredient/:name`. Use a `:` as variable prefix of a path variable. A route always needs a request method your route is listening to - use one of the following.

###### Routes methods
* `list` - GET request method, alias of `get`
* `index` - GET request method with a required query parameter `/:id` automatically appended to routes path
* `create` - POST request method, alias of `post`
* `update` - PUT request method with a required query parameter `/:id` automatically appended to routes path
* `delete` - DELETE request method with a required query parameter `/:id` automatically appended to routes path
* `get` - GET request method
* `post` - POST request method
* `put` - PUT request method 
* `del` - DELETE request method

 **IMPORTANT**: Your controllers inside of a route need to provide a function with the same name (i.e. `self.list`, `self.update`) or you define a custom method (`self.favoriteFlavour`) to be called see `function: "favoriteFlavour"` in the [example](#definingARoute) above. If you want a controller function to be available for any request method use `all` as function name in your controller. See [Defining a controller](#definingAController)


###### Routes methods parameters
* `identity` - Identity of this route method. This identity has to be unique in this routes file
* `decrecated` - *optional* Add this flag to mark a route as deprecated. The will lead to a notice field when requesting the api and highlighting in [Swagger::Docs](https://github.com/richhollis/swagger-docs) documentation
* `modified` - Date when is route has been modified. Used in generic controllers `generic-listServices`
* `rateLimit` - Limit the request rate for an interval time range and max request for this single route. Memcached needed to use rateLimit
* `docs` - *optional* Set to true|false to make this route method available in automatically generated documentation
* `description` - *optional* Give your route a more details description of what this services does. Used in automatically generated documentation.
* `environment` - *optional* Define environments for a route method. The route method is only registered and available public if the environment name matches the current environment name on server startup. You can creates routes for testing purpose and just deploy them to your staging servers and disable and hide them on your production environment.
* `bodyparser {type:'json',limit:'512kb'` - *optional* Mia.js automatically parses a request body as json. To change this behaviour set the body-parser type to `none` or change the limit of the body size.
* `controllers` - Array of your project controllers to use for this route
* `authorization` - *optional* Indicates if this route requires authorization. This flag is available in `generic-listServices` controller to indicate that this service is somehow protected and needs authorization.
* `corsHeaders` - *optional* Apply CORS headers to single route i.e. for Cross Domain Policy. Defining the CORS header automatically enables this route to response to a browsers CORS requests methods OPTIONS
* `responseSchemes` - *optional* To describe what the excepted response in case of a successful response or an error response will look like you can specify the response schema. This will be visible in the [Swagger::Docs](https://github.com/richhollis/swagger-docs) documentation
*

####### Define controllers of a route method
Controllers are defined as array in the routes file definition of your route method. The order of elements follows the chaining of your controllers. You can chain as many controllers as you need to perform a request and return a response. Controllers are chained by calling `next()` in a controller file. The last controller should handle the response output i.e. `res.send()` see [Express](https://github.com/strongloop/express)

* `name` - Identity of the controller alias the field `identity` in your controller file. We should rename this ;-)
* `version` - Version of the controller
* `function` - Name of the custom function to use with this route request. Skip this parameter if you provide a method with the same name as the request method in your controller i.e. `self.list`

####### Define error controllers of a route
In the same way `controllers` are nested and used you can define `errorController` to provide a custom error handler to your route. In every case an error occures in the controller chain and `next(err)` is called all controllers are skipped and the `errorController` chain is executed. You can use as many error handler controllers as you like to finsih your task i.e. write some logs, cleanup some data or output a custom response to the client.

 
# Globals
<a name="globals"></a>
Mia.js middleware framework uses the node modules `mia-js-core` which offers various functionality you can use inside of your project controllers during runtime of a request.

#### Shared
Get access to shared configs, libs, variables, models of your projects inside your project controller by requiring `mia-js-core` module:
```js
var MiaJs = require('mia-js-core')
    , Shared = MiaJs.Shared;
```
*  `Shared.config("environment.{VARIABLE}")` - Access a variable with placeholder `{VARIABLE}` (or function) inside the global enviroment config `config/system.js`
*  `Shared.config("{ID")` - Access a config file with identifier `{ID}` define in a project `config` folder
*  `Shared.config("{ID}.{VARIABLE}")` - Access a variable with placeholder `{VARIABLE}` (or function) inside a config file with identifier placeholder `{ID}`
*  `Shared.libs("{ID}.{VARIABLE}")` - Access a variable with placeholder `{VARIABLE}` (or function) inside a lib file with identifier placeholder `{ID}`
*  `Shared.models("{ID}")` - Access a model with identifier `{id}` defined in a project model file

Example: `Shared.config("environment.server.http.port")` - Get current server port

# Notification Manager
Mia.js comes with a build-in notification manager to handle email and push notifications triggered from any controller of your project i.e. to send signup welcome emails to a user or send custom push notification. See generic lib [generic-notificationManager`](#generic-notificationManager)

#### req.miajs
When a url request is running mia.js processes the chain of controllers defined in the routes file. Mia.js automatically appends runtime data to the [Express](https://github.com/strongloop/express) variable `req` available in `req.miajs` so it is available in your project controllers.

  *  `req.miajs.route` - All route variables like current controller id, version, routes group name, current url and many more
  *  `req.miajs.validatesParameters` - *optional* When defining preconditions in your controller all defined request data automatically gets validated and passed to `req.miajs.validatedParameters`. So you don't need to take care of invalid data. Your controller only gets those variables that are defined in this particular controller. The next following controller might have defined different preconditions so the variable `req.miajs.validatedParameters` might have a different value.
  *  `req.miajs.userData` - *optional* If using a predefined `generic-users` controller the variable contains the requesting users profile.
  *  `req.miajs.device` - *optional* When using the predefined `generic-validateAccessKey` controller a requesting devices profile data is automatically added to this variable and is available for all following chained controllers to deal with device specific request.


# Generic Controllers
Mia.js comes with some predefined generic controllers to make your life a little easier. You can use these generic controllers by adding them to your route method controllers definition in your projects routes file. All generic controllers used in your projects route files automatically adds their required precondition parameters to the route. Also see Generic Libs

## Available predefined controllers
* `generic-defaultResponse` - A simple output controller to return JSON documents. Attach your request response to the variable `res.response` in your controllers and set `generic-defaultResponse` as your last controller of your controller chain at it will output this variable as response. 
* `generic-listServices` - Outputs a JSON object of all available services in the project route file where you defined this controller as a machine-readable services listing.
* `generic-deviceProfile` - Creates a device profile for the requesting client and returns a device id as identifier. When using `generic-validateAccessKey` or `generic-accessKeyService` this service is mandatory. Device profile data of a requesting device is available in all chained controllers during a request. 
* `generic-validateAccessKey` - Requires and validates a client generated signature key to secure the communication between a requesting client and your api methods. There is an iOS and Android SDK available to work with the `generic-validateAccessKey` controller. 
* `generic-users` - Provides user management services like signup, login, facebook-login (third-party logins), password reset, user profile services. Simple use one of there functions of this controller to enhance your project.
* `generic-evaluateOptionalUserLogin` - Verifies a device if requesting device is logged in a user account and appends the user profile data of this user to gloabl variable `req.miajs.userData`. When using this controller a logged in user is optional and the next controller is called in any case.
* `generic-validateUserLogin` - Verifies a device if requesting device is logged in a user account and appends the user profile data of this user to global variable `req.miajs.userData`. When using this controller a logged in user is mandatory and and error is returned to the user if the user is not logged in.

Deprecated generic controllers
Mia.js offers some controllers, that are already deprecated so we do not describe them in detail but you can use them anyway. 
* `generic-accessKeyService` - *deprecate* Validates a client generated access key token based on a device profile id and a client deposited secret token. This key is static per device and does not change over time. Use this i.e. to protect against unauthorized access of 'generic-generateSession'.
* `generic-generateSession` - *deprecate* Generate a session key and attach it to the requesting devices profile. When using `generic-generateSession` this use of the service `generic-deviceProfile` is mandatory. 
* `generic-validateSession` - *deprecate* Validates a server generated session key (see `generic-generateSession`) to authorize a device to access a service.

## Predefined controllers

## generic-defaultResponse
#### Function: `all` (available for all request method)
Outputs the [Express](https://github.com/strongloop/express) variable `res.response` as JSON document and sets http response code `200` by default. To set different http response code modify the variable `res.statusCode` in one of the prefixed controllers. Additionally `generic-defaultResponse` registers a query variable named `filter` to filter the response by JSON element name. If debug mode is enabled in global environment configuration and the request header field `debug` is set to true additional debug information is returned in the request response.

## generic-listServices
#### Function: `list` (available for request method `list`)
Mia.js supports a machine-readable version of a projects routes file. Clients can process this service listing i.e. to get all available services and all service urls and request methods. When using this services listing you can enable your clients to automatically update service url - if they change (usually you don't do this). We recommend to cache this listing on client side and update i.e. once per day. To access an api do not hard code the api url in your client simply use the identifier name of the service and lookup all relevant request requirements in your service listing.

#### Example service listing response
```js
{
    "status": 200,
    "response": [
        {
            "modified": "2015-01-17T10:00:00.000Z",
            "method": "GET",
            "url": "https://my.domain.com/icecream/v1/flavour",
            "id": "icecreamFlavours",
            "parameters": {
                "header": {
                    "key": {
                        "desc": "Authorization access key",
                        "type": String,
                        "required": true
                    },
                    "signaturemethod": {
                        "desc": "Authorization access key signature method. Default SHA256 if not set",
                        "allow": [
                            "sha256"
                        ],
                        "type": String
                    },
                    "requestdate": {
                        "desc": "Date string when client request was initiated i.e. 2015-01-01T00:00:00",
                        "type": "Date"
                    }
                },
                "query": {
                    "flavour": {
                        type: String,
                        allow: ["cookies and cream","vanilla","strawberry"],
                        convert: "lower"
                    },
                    "filter": {
                        "desc": "Filter response by filter string i.e. 'id' to only return elements with name id. To receive multiple elements use , as delimiter",
                        "type": String
                    }
                }
            },
            "responses": {
                "200": [
                    "Success"
                ]
            },
            "authorization": true
        }
    ]
}
```

## generic-deviceProfile
In order to deliver device specific content i.e. image urls depending on the device's screen resolution or culture code specific localisations mia.js supports device profiles. It is always recommended to know who is performing the current request and you don't want to pass to much data with every request redundant like language and region of the requesting device.
To use device profiles add a route to your projects routes file and use the functions of this controller. Ensure that your clients call the register device route on first usage of your application api to initially create a device profile with all relevant profile data.
`generic-deviceProfile` controller offers two functions to register and update a devices profile. When using generic authorization controllers `generic-deviceProfile` is mandatory and the requesting devices profile data is automatically fetched and made available for all following chained controllers in the variable `req.miajs.device`.

#### Function: `create` (available for request method `create`)
Use this function to register a device initially. Submit device profile data in the request body - all parameters are optional. If you register a device profile without passing body data you will a least receive a device id to identify the requesting device. We recommend to use this device id on client side to identify your device so you might persist this id somehow. If you use the generic controllers `generic-accessKeyService` the device id is mandatory and used to authorize the registered device.

**Using device create in routes file**
```js
module.exports = {
    group: 'demo', // Group name
    name: 'My icecream API',  // if disabled path is used as name in api documentation
    version: '1.0', // Version
    environment: ['local','production'], // Define environments where this route file should be registered
    prefix: ['/icecream/v1','/icecream/latest'], // Route prefix. Multiple prefixes possible
    routes: {
        './device': {
            create: {
                identity: 'devices',
                modified: new Date(2014, 1, 23, 15, 0, 0),
                description: "Register devices and receive device id",
                docs: true,
                controller: [
                    {
                        name: 'generic-deviceProfile',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultResponse',
                        version: '1.0'
                    }
                ]
            }
        }
    }
}
```

###### Device profile parameters available to pass in body
```js
    culture: {
        code: {
            type: String,
            minLength: 5,
            maxLength: 5,
            match: /[a-zA-Z]{2}-[a-zA-Z]{2}/i
        }
    },
    app: {
        id: {
            type: String,
            minLength: 5,
            maxLength: 50
        },
        version: {
            type: String,
            minLength: 1,
            maxLength: 7,
            match: /^([\d]{1,3}\.)?([\d]{1,3}\.)?([\d]{1,3}\.)?[\d]{1,3}$/i //Match up to 1.2.3.4
        },
        vendor: {
            id: {
                type: String,
                minLength: 5,
                maxLength: 50
            }
        },

        advertiser: {
            id: {
                type: String,
                minLength: 5,
                maxLength: 50
            }
        }
    },

    // Rate Limiter requests per interval for this device (when using authentication->validateAccessKey controller)
    rateLimit: {
         maxRequests: 1000, // Requests for this device per rate limit window
         interval: 5 // Rate limit window in minutes
    },

    device: {
        model: {
            type: String,
            minLength: 1,
            maxLength: 50
        },
        os: {
            type: { // OS type like iOs, Android, Desktop
                type: String,
                minLength: 2,
                maxLength: 50
            },
            version: { // OS version like 1.2.3.4
                type: String,
                minLength: 1,
                maxLength: 7,
                match: /^([\d]{1,3}\.)?([\d]{1,3}\.)?([\d]{1,3}\.)?[\d]{1,3}$/i //Match up to 1.2.3.4
            }
        },
        carrier: {
            type: { // Carrier name
                type: String,
                minLength: 1,
                maxLength: 50
            }
        },
        screen: {
            resolution: { // Screen resoultion in format i.e. 1080x720
                type: String,
                match: /(\d+)x(\d+)/i
            }
        },
        notification: { // Push token to send push notifications to the device
            token: {
                type: String 
            }
        }
    }
```

##### Function: `update` (available for request method `update`)
To update a device profile create a route in your projects route file and use the generic controller `update`. You can submit the same parameters as used in function `create`

**Using device update in routes file**
```js
module.exports = {
    group: 'demo', // Group name
    name: 'My icecream API',  // if disabled path is used as name in api documentation
    version: '1.0', // Version
    environment: ['local','production'], // Define environments where this route file should be registered
    prefix: ['/icecream/v1','/icecream/latest'], // Route prefix. Multiple prefixes possible
    routes: {
        './device': {
            update: {
                identity: 'devices',
                modified: new Date(2014, 1, 23, 15, 0, 0),
                description: "Register devices and receive device id",
                docs: true,
                controller: [
                    {
                        name: 'generic-validateAccessKey',
                        version: '1.0'
                    },
                    {
                        name: 'generic-deviceProfile',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultResponse',
                        version: '1.0'
                    }
                ]
            }
        }
    }
}
```

### generic-validateAccessKey
##### Function: `all` (available for all request method)
To protect your api against unauthorized access you can use the generic controller `generic-validateAccessKey` as prefix for every route method. See example [Defining a route](#definingARoute).<br/>
**IMPORTANT:** Using the mia.js iOS and Android SDK you'll get all the access and device profile handling out of the box.<br/>
<br/>
Using this controller as prefix a header field `key` is automatically required with the request. There are two way of using the `key` field. One is using a client-side generates signature and the other is use a static key (length 32 char) that is directly bound to a device profile.

###### Signature method
What this controller does in particular is validating the signature in the header field `key` and matches it against the request url and method and device profile id to grant access. The `key` signature is generated with every request on client side and consists of the following parameters:

>signature=[deviceId]+[secretId]+[timestamp]+HASH([deviceId] + [secret] + [timeStamp] + [requestMethod] + [baseUrl] + [urlPath] + HASH([bodyHash])).toLowerCase())
 
**Fields**
* deviceId = Id of device, see device register service, length 32 char
* secretId = Identifier of used secret, to allow different secrets with different projects/releases
* timestamp = UTC time stamp of current time in seconds since 1.1.1970, 10 digits
* requestMethod = Used request method post, get, put, delete
* baseUrl = Protocol and domain of request i.e. https://mydomain.com
* urlPath = Path and Query Parameters of request UTF-8 encoded i.e. /api/v1/service?my=first&parameter=settings
* bodyHash = Hash of plain JSON document of request. Default in SHA256
 
**Notice**
Query parameters must be encoded as UTF-8 to avoid hash conflicts on server side. Make sure that all data inside the hash is converted to lower case. The timestamp is used to block requests that are older than a defined expire time. Make sure that the client has the correct UTC time. If not the request will fail and the server returns the current server datetime as header field "date". Uses this date to make a time correction client side and retry the request with adjusted date time. It is also possible to use a different hash algorithm than SHA256. This can be set in header field "signatureMethod". Currently this functionality is not fully implemented so default is SHA256.<br/>
<br/>
>We know this sounds complicated so we really recommend to use the iOS or Android SDKs. But why do we do all of this? First we don't want someone to get access to your services. So we need somehow an access key. But to prevent man-in-the-middle attacks and manipulation during your request the whole request url and parameters are hashed inside the signature. So the signature is dynamically generated and changes with every request - it is not a static key. Due to there is a secret part that is deposed on client and not submitted with the request any man-in-the-middle can not modify the request without breaking the signature hash or regenerate a modified hash by him self. To prevent replay attacks a time component is added to the signature. 

**Secrets**
Authorization requires secret tokens and secrets ids deposed on client device. These tokens consists of random strings with a length of 32 chars. They can be group specific to be valid only for certain groups (see groups settings in your routes file). Give the secret and the secret id to the client developer. Make sure that the secret stays secret and never gets published. The secret id is visible unencrypted in the `key` signature when using authorization. The secret itself is only used to create the hash part. To create your own secrets we recommend to add them manually to the `secrets` collection of the database or add them to the `init` controller of your project. This is what a secret entry looks like in the `secrets` collection of the database:

```
{
    "id" : "a72d0761805ecfd8733a82e3c4e35439",
    "secret" : "190c5535a16ad38d909fac7179aef9be",
    "groups" : [ 
        "demo"
    ],
    "enabled" : true,
    "created" : ISODate("2015-07-21T14:08:22.148Z")
}
```

###### Static method
The static method of the `generic-validateAccessKey` header field `key` is mainly used for testing purpose or giving an external server with fixed ip access to your application services. You can add the following parameters to assign a static key to a device profile and grant access. (Add this manually to a device profile in the database)
```
"access" : {
     "key" : "ec04611599e17a459b93d01c319e7b2b", // any key - generate one by yourself. Must be 32 char long so we recommend pick a md5 hash
     "cidr" : [  // use a cidr to restrict this key to an ip range
         "0.0.0.0/0"
     ],
     "blockcidr" : [  // use a cidr to block ip ranges
         "0.0.0.0/0"
     ],
     "groups" : [ // use groups to restrict this key to an routes group
         "demo" 
     ]
 }
```

### generic-users
Mia.js comes with build-in user management controllers to handle signup, login, manage user profiles and assign device profiles to a user profile. To prevent redundant data send with every request mia.js uses device profiles to identify a requesting device by a device id hashed in the `key` signature when using using the `generic-validateAccessKey` controller. A device can be assigned to a user profile and so be marked i.e. as logged in user. In your controllers you can respond to this by giving access to a service or deny access to users who are not logged in. Use the `generic-evaluateOptionalUserLogin` or `generic-validateUserLogin` controllers as prefix of your route to validate the login status of a device and get access in the following chained controllers to the user profile data. 

#####Example route of a signup process#####
<a name="ExampleRouteOfASignupProcess"></a>
Due to the whole user management is a little more complex let take a look how to use it in a route file with a **custom** user profile model and **custom** user profile settings
```js
module.exports = {
   group: 'demo', // Group name
    name: 'My icecream API',  // if disabled path is used as name in api documentation
    version: '1.0', // Version
    environment: ['local','production'], // Define environments where this route file should be registered
    prefix: ['/icecream/v1','/icecream/latest'], // Route prefix. Multiple prefixes possible
    routes: {
        './users/me': {
            post: {
                identity: 'signUp',
                modified: new Date(2014, 10, 3, 15, 0, 0),
                description: "Sign up a user",
                docs: true,
                authorization: true,
                controller: [
                    {
                        name: 'generic-validateAccessKey', // Make sure device id is valid and authorized
                        version: '1.0'
                    },
                    {
                        name: 'custom-userProfile',
                        function: 'prepareParametersForSignup', // prepare require custom parameters
                        version: '1.0'
                    },
                    {
                        name: 'generic-users',
                        function: 'setParametersForSignup', // setup parameters for signup
                        version: '1.0'
                    },
                    {
                        name: 'generic-users',
                        function: 'signUp', // create user profile
                        version: '1.0'
                    },
                    {
                        name: 'custom-userProfile',
                        function: 'onSignupSuccessful', // do something after successfull profile create
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultResponse', // outputs res.response as json document
                        version: '1.0'
                    }
                ]
            }
        }
    }
}
```
So what is happening here. First we use the controller `generic-validateAccessKey` so that no unauthorized device is using this service. Second we call a controller `custom-userProfile` what is the identifier of your custom controller (see `self.identifier` in your controller file) with a function `prepareParametersForSignup` (name it as you like). This controller aggregates some custom signup settings and makes it available to the following controllers. Lets take a look at the function `prepareParametersForSignup` in particular
```js
    var _options = { // all options are optional
        salt: '04473ac659ffaf31a4be2dc03ece0934lwe67q3b2cdvk23vkadv', // a hash used for password hashing of the user profile
        maxDeviceCount: 5, // Max number of devices allowed for this user profile
        loginOnSignUp: true // set to no if you just want to sign up and login later separately
    };
    
    self.prepareParametersForSignup = function (req, res, next) {
        var data = req.miajs.validatedParameters.body;
        // Set userProfile variables to use in generic user controller signUp method
        req.miajs.userService = {};
        req.miajs.userService.userProfileData = data;
        req.miajs.userService.options = _options;
        req.miajs.userService.userProfileModel = UserProfileModel;
        req.miajs.userService.group = req.miajs.route.group;
        req.miajs.userService.appId = req.miajs.route.group;
    
        // Add some custom data:
        req.miajs.userService.userProfileData.createdAt = new Date(Date.now());
        req.miajs.userService.userProfileData.updatedAt = new Date(Date.now());
    
        next();
    };
```
The function `prepareParametersForSignup` fills a variable `req.miajs.userService` with a some of configurations i.e. the `userProfileModel` that should be used for the user data and the variable `userProfileData` that contains the request body data submitted by the client. If you do not want to adjust the signup parameters or add custom user profile data to the user profile you can remove the `prepareParametersForSignup` controller from your routes file and directly call the `generic-users` controller.
Next the `generic-users` with function `setParametersForSignup` is called to set all collected data followed by the `signUp` function which creates the user profile. After successful signup you can call i.e. a custom controller function like `onSignupSuccessful` (name it as you like) to return the profile or send a welcome email to the user. At the end a `generic-defaultResponse` controller is called to response the request. 

#### Using a custom user profile data model#####
If you want to add some custom fields to a user profile i.e. phone number, fist name, last name, image url or whatever you need to fulfill your task you can create a custom user profile model. Just create a file in the folder `models` of your project and define the model. To use the model pass it in the variable `req.miajs.userProfileModel` before routing to the function `signUp` of generic controller `generic-users`.

Example of a custom user profile model
<a name="ExampleOfACustomUserProfileModel"></a>
```js
var BaseModel = require("mia-js-core/node_modules/baseModel");
function thisModule() {
    var model = BaseModel.extend({
            data: {
                name: {
                    type: String,
                    required: true
                },
                phone: {
                    type: Number,
                    required: true
                },
                createdAt: {
                    type: Date
                },
                updatedAt: {
                    type: Date
                }
            }
        },
        {
            disabled: false, // Enable /disable model
            identity: 'my-userProfile-model', // Model name
            version: '1.0', // Version number
            created: '2014-10-31T19:00:00', // Creation date
            modified: '2014-10-31T19:00:00', // Last modified date
            collectionName: 'userProfile'
        });

    return model;
}
module.exports = thisModule();
```
#### Function: `setParametersForSignup` (available for all request methods as custom function)
This controller needs to be placed before routing to `signUp` of generic controller `generic-users` to assign and validate all user profile data. See [Example route of a signup process](#ExampleRouteOfASignupProcess)

#### Function: `signUp` (available for all request methods as custom function)
Signup adds the user profile to the database and returns the user profile data in the variable `req.miajs.userData` on successful sign up. You can use this variable in all your following chained controllers defined in your routes file. So if you want to response the request with the user profile data simple write a controller that adds this variable to `res.response`. If the option `loginOnSignUp` is set to true `signUp` automatically assigns the currently requesting device id to the user profile. See [Example route of a signup process](#ExampleRouteOfASignupProcess) 


#### Function: `loginUserWithFacebook` (available for all request methods as custom function)
Mia.js supports login with facebook. You can do a facebook login similar to the signup example above. To use facebook mia.js requires a facebook token to automatically fetch the users profile data. 

**Using loginUserWithFacebook in routes file**
```js
module.exports = {
    group: 'demo', // Group name
    name: 'My icecream API',  // if disabled path is used as name in api documentation
    version: '1.0', // Version
    environment: ['local', 'production'], // Define environments where this route file should be registered
    prefix: ['/icecream/v1', '/icecream/latest'], // Route prefix. Multiple prefixes possible
    routes: {
        './users/me/login/fb': {
            post: {
                identity: 'loginFacebook',
                modified: new Date(2015, 7, 1, 15, 0, 0),
                description: "Login user with Facebook",
                docs: true,
                authorization: true,
                controller: [
                    {
                        name: 'generic-validateAccessKey',
                        version: '1.0'
                    },
                    {
                        name: 'custom-userProfile',
                        function: 'prepareParametersForFbLogin',
                        version: '1.0'
                    },
                    {
                        name: 'generic-users',
                        function: 'setParametersForFbLogin',
                        version: '1.0'
                    },
                    {
                        name: 'generic-users',
                        function: 'loginUserWithFacebook',
                        version: '1.0'
                    },
                    {
                        name: 'custom-userProfile',
                        function: 'getProfile',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultResponse',
                        version: '1.0'
                    }
                ]
            }
        }
    }
}
```

So what is happening here. First we use the controller `generic-validateAccessKey` so that no unauthorized device is using this service. Second we call a controller `custom-userProfile` what is the identifier of your custom controller (see `self.identifier` in your controller file) with a function `prepareParametersForFbLogin` (name it as you like). This controller aggregates some custom signup settings and makes it available to the following controllers. Lets take a look at the function `prepareParametersForFbLogin` in particular
```js

var FacebookLoginProvider = Shared.libs('generic-fbLoginProvider');
   var _options = { // all options are optional
        salt: '04473ac659ffaf31a4be2dc03ece0934lwe67q3b2cdvk23vkadv', // a hash used for password hashing of the user profile
        maxDeviceCount: 5, // Max number of devices allowed for this user profile
        loginOnSignUp: true // set to no if you just want to sign up and login later separately
   };
    
   self.prepareParametersForSignup = function (req, res, next) {
        req.miajs = req.miajs || {};
        req.miajs.userService = req.miajs.userService || {};
        var body = req.miajs.validatedParameters.body || {};

       var fields = "name,id,email"; // Define the field-names of facebook graph api to fetch.
        FacebookLoginProvider.checkCredentialsAndLoadProfile(body.fbUserToken, "v2.4", fields).then(function (params) {
            // Prepare user data
            req.miajs.userService.options = _options;
            req.miajs.userService.group = req.miajs.route.group;
            req.miajs.userService.appId = req.miajs.route.group;
            req.miajs.userService.thirdPartyLogin = params.thirdPartyLogin;
            req.miajs.userService.email = params.email;
            var now = new Date(Date.now());
            // Facebook login can be used initially to create an account or to update or merge with an existing profile
            req.miajs.userService.onMerge = {
                userProfileData: {
                    name: params.me.name,
                    updatedAt: now
                }
            };
            req.miajs.userService.onCreate = {
                userProfileData: {
                    name: params.me.name,
                    createdAt: now,
                    updatedAt: now
                }
            };
            req.miajs.userService.userProfileModel = UserProfileModel;
            next();
        }).fail(function (err) {
            next(err);
        }).done();
    };
```

The function above prepares and fetches all user data from facebook's graph api using the generic lib function `checkCredentialsAndLoadProfile` and passes all the collected data to the next controller. `setParametersForFbLogin` prepares and validates all parameters and the controller function `loginUserWithFacebook` creates the user profile.
If a login already exists in user database collection as non-facebook user profile mia.js merges and updates the user profile data if the user profile has been validated before. Otherwise a merge and login is rejected due to security policy.

#### Function: `setParametersForFbLogin` (available for all request methods as custom function)
Prepares and validates user profile data for creating a user profile. See `loginUserWithFacebook`

#### Function: `login` (available for all request methods as custom function)
With the login function you can assign the currently requesting device to a user profile. To use login use the following example in your routes definition of your project

**Using login in routes file**
```js
module.exports = {
   group: 'demo', // Group name
    name: 'My icecream API',  // if disabled path is used as name in api documentation
    version: '1.0', // Version
    environment: ['local','production'], // Define environments where this route file should be registered
    prefix: ['/icecream/v1','/icecream/latest'], // Route prefix. Multiple prefixes possible
    routes: {
        './users/me/login': {
            post: {
                identity: 'login',
                modified: new Date(2014, 7, 1, 15, 0, 0),
                description: "Login user",
                docs: true,
                authorization: true,
                controller: [
                    {
                        name: 'generic-validateAccessKey', // Make sure device id is valid and authorized
                        version: '1.0'
                    },
                    {
                        name: 'custom-userProfile',
                        function: 'login', // prepare required parameters
                        version: '1.0'
                    },
                    {
                        name: 'generic-users',
                        function: 'login', // perfom login
                        version: '1.0'
                    },
                    {
                        name: 'custom-userProfile',
                        function: 'getProfile', // gets the users profile and append it to res.response
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultResponse', // outputs res.response as json document
                        version: '1.0'
                    }
                ]
            }
        }
    }
}
```

This is alike the `signup` routing. In this example a custom user profile model is used so we need to prefix a controller that fills the variable `req.miajs.userService.userProfileModel` with the custom model. 

```js
self.login = function (req, res, next) {
        // Set userProfile variables to use in generic user controller signUp method
        req.miajs.userService = {};
        req.miajs.userService.options = _options;
        req.miajs.userService.userProfileModel = UserProfileModel;
        req.miajs.userService.group = req.miajs.route.group;
        req.miajs.userService.appId = req.miajs.route.group;
        next();
};
```

Next the generic controller `generic-users` with the function `login` is called to assing the current device to the user profile. Optionally use a chained controller function like `getProfile` i.e. to response the request with the user profile data or whatever you like to response the request with.
When a device requests a service with prefixed `generic-validateAccessKey` you can lookup if the device is currently in logged-in state and is assigned to a user profile by prefix the generic controllers `generic-evaluateOptionalUserLogin` or `generic-validateUserLogin`.

#### Function: `logout` (available for all request method as custom function)
To decouple a device from a user profile create a route in your projects route file that calls the `logout` function of controller `generic-users`. The device id gets removed from the list of known devices of the users profile. Due to the connection between device and user is decouple now you can not access services anymore that require a logged-in user.

**Using logout in routes file**
```js
module.exports = {
   group: 'demo', // Group name
    name: 'My icecream API',  // if disabled path is used as name in api documentation
    version: '1.0', // Version
    environment: ['local','production'], // Define environments where this route file should be registered
    prefix: ['/icecream/v1','/icecream/latest'], // Route prefix. Multiple prefixes possible
    routes: {
        './users/me/logout': {
            post: {
                identity: 'logout',
                modified: new Date(2014, 7, 1, 15, 0, 0),
                description: "Logout user",
                docs: true,
                authorization: true,
                controller: [
                    {
                        name: 'generic-validateAccessKey', // Make sure device id is valid and authorized
                        version: '1.0'
                    },
                    {
                        name: 'generic-users',
                        function: 'logout', // decouple device from user account
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultResponse', // outputs res.response as json document
                        version: '1.0'
                    }
                ]
            }
        }
    }
}
```

#### Function: `requestPasswordReset` (available for all request methods as custom function)
Resetting a password is a functionality you should provide to your customers. Mia.js does **not** define the way a password is reset. When requesting a password reset the `requestPasswordReset` of the `generic-users` controller look-ups up the user profile and adds a reset token to the user profile. This token is passed to the next controller following defined in your projects route file in the variable `req.miajs.userData.inspectTokens.passwordResetToken.token`. It's up to you how to send the token to the user. 

>**Example usage:** Send an email to the users email address given in his user profile with a link to click. The link opens a micro-page that lets the user reset the password and set a new one. Submit the new password and the reset token to an api route of your project using the `resetPassword` function of `generic-users` that accepts those parameters and resets the password. You could also send a push notification to the user or reset the password in an app ui view.

**Using request a password reset in routes file**
```js
module.exports = {
   group: 'demo', // Group name
    name: 'My icecream API',  // if disabled path is used as name in api documentation
    version: '1.0', // Version
    environment: ['local','production'], // Define environments where this route file should be registered
    prefix: ['/icecream/v1','/icecream/latest'], // Route prefix. Multiple prefixes possible
    routes: {
        './users/me/requestPasswordReset': {
            post: {
                identity: 'requestPasswordReset',
                description: "Request password reset token",
                docs: true,
                authorization: true,
                modified: new Date(2014, 10, 3, 15, 0, 0),
                controller: [
                    {
                        name: 'generic-validateAccessKey', // Make sure device id is valid and authorized
                        version: '1.0'
                    },
                    {
                        name: 'generic-users',
                        function: 'requestPasswordReset', // create a reset password token and assign it to user profile
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultResponse', // outputs res.response as json document
                        version: '1.0'
                    }
                ]
            }
        }
    }
}
```

#### Function: `resetPassword` (available for all request methods as custom function)
As mentioned before you will need a `passwordResetToken` to reset a users password. Create a route in your projects route file that uses the `resetPassword` function of `generic-users`. This service will accept the token and a new password and resets the users password in the users profile.

**Using password reset in routes file**
```js
module.exports = {
   group: 'demo', // Group name
    name: 'My icecream API',  // if disabled path is used as name in api documentation
    version: '1.0', // Version
    environment: ['local','production'], // Define environments where this route file should be registered
    prefix: ['/icecream/v1','/icecream/latest'], // Route prefix. Multiple prefixes possible
    routes: {
        './users/me/resetPassword': {
            post: {
                identity: 'resetPassword',
                description: "Reset password",
                docs: true,
                authorization: true,
                modified: new Date(2014, 10, 3, 15, 0, 0),
                controller: [
                    {
                        name: 'generic-users',
                        function: 'resetPassword', // resets a password of a user profile
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultResponse', // outputs res.response as json document
                        version: '1.0'
                    }
                ]
            }
        }
    }
}
```
>This service does not need `generic-validateAccessKey` due to the user needs to have a valid password reset token for his account and this service might get called from a website or a client app directly.

#### Function: `getProfile` (available for all request method as custom function)
The user profile data consist of several parts. A global profile management model with data like all assigned devices, login and password and a custom profile part (if you use one) connected to the variables `req.miajs.userService.group` and `req.miajs.userService.appId`. If you have assign a custom model (see [Example of a custom user profile model](#ExampleOfACustomUserProfileModel)) you can access this section by using the function `getProfile` of the `generic-users` controller.

**Using get profile reset in routes file**
```js
module.exports = {
   group: 'demo', // Group name
    name: 'My icecream API',  // if disabled path is used as name in api documentation
    version: '1.0', // Version
    environment: ['local','production'], // Define environments where this route file should be registered
    prefix: ['/icecream/v1','/icecream/latest'], // Route prefix. Multiple prefixes possible
    routes: {
        get: {
            identity: 'getProfile',
            modified: new Date(2014, 10, 3, 15, 0, 0),
            description: "Get own profile. User must be logged in in order to be able to use this service.",
            docs: true,
            authorization: true,
            controller: [
                {
                    name: 'generic-validateAccessKey', // Make sure device id is valid and authorized
                    version: '1.0'
                },
                {
                    name: 'generic-validateUserLogin', // Make sure the requesting device is logged in
                    version: '1.0'
                },
                {
                    name: 'generic-users',
                    function: 'getProfile', // gets the users profile and append it to res.response
                    version: '1.0'
                },
                {
                    name: 'generic-defaultResponse', // outputs res.response as json document
                    version: '1.0'
                }
            ]
        }
    }
}
```

#### Function: `updateProfile` (available for all request methods as custom function)
To update a users profile create a route in your projects route file and assign the controller function `updateProfile` of the controller `generic-users`. As described in `signUp` you can use a custom user profile model to append any data you need in the users profile for your application. 

**Using updateProfile in routes file**
```js
module.exports = {
   group: 'demo', // Group name
    name: 'My icecream API',  // if disabled path is used as name in api documentation
    version: '1.0', // Version
    environment: ['local','production'], // Define environments where this route file should be registered
    prefix: ['/icecream/v1','/icecream/latest'], // Route prefix. Multiple prefixes possible
    routes: {
        put: {
            identity: 'updateProfile',
            modified: new Date(2014, 10, 3, 15, 0, 0),
            description: "Update own profile. User must be logged in in order to be able to use this service.",
            docs: true,
            authorization: true,
            controller: [
                {
                    name: 'generic-validateAccessKey', // Make sure device id is valid and authorized
                    version: '1.0'
                },
                {
                    name: 'generic-validateUserLogin', // Make sure the requesting device is logged in
                    version: '1.0'
                },
                {
                    name: 'custom-userProfile',
                    function: 'updateProfile', // prepare required parameters
                    version: '1.0'
                },
                {
                    name: 'generic-users',
                    function: 'updateProfile', // updates the user profile
                    version: '1.0'
                },
                {
                    name: 'custom-userProfile',
                    function: 'getProfile', // gets the users profile and append it to res.response
                    version: '1.0'
                },
                {
                    name: 'generic-defaultResponse', // outputs res.response as json document
                    version: '1.0'
                }
            ]
        },
    }
}
```
To make use of a custom profile model you will need to prefix a controller that appends the userProfileModel to the variable `req.miajs.userService.userProfileModel` see `updateProfile` in controller `custom-userProfile` in the example above. This function could look this:

```js
self.updateProfile = function (req, res, next) {
        var data = req.miajs.validatedParameters.body || {};
        // Set userProfile variables to use in generic user controller signUp method
        req.miajs.userService = {};
        req.miajs.userService.userProfileData = data;
        req.miajs.userService.options = _options;
        req.miajs.userService.userProfileModel = UserProfileModel;
        req.miajs.userService.group = req.miajs.route.group;
        req.miajs.userService.appId = req.miajs.route.group;
        // Add some static custom data:
        req.miajs.userService.userProfileData.updatedAt = new Date(Date.now());
        next();
    };
```
After setting your custom adjustments call the function `updateProfile` in `generic-users` controller and the user profile get updated with the new data. You only need to pass the parameters that changed. We recommend to use preconditions to define what data this services expects in body part of a request.

#### Function: `deleteAccount` (available for all request methods as custom function)
If you want to provider the functionality to delete a user account create a route in your projects route file that calls the function `deleteAccount` of the controller `generic-users`.

**Using deleteAccount in routes file**
```js
module.exports = {
   group: 'demo', // Group name
    name: 'My icecream API',  // if disabled path is used as name in api documentation
    version: '1.0', // Version
    environment: ['local','production'], // Define environments where this route file should be registered
    prefix: ['/icecream/v1','/icecream/latest'], // Route prefix. Multiple prefixes possible
    routes: {
        del: {
            identity: 'deleteAccount',
            modified: new Date(2014, 10, 3, 15, 0, 0),
            description: "Delete own profile. User must be logged in in order to be able to use this service.",
            docs: true,
            authorization: true,
            controller: [
                {
                    name: 'generic-validateAccessKey', // Make sure device id is valid and authorized
                    version: '1.0'
                },
                {
                    name: 'generic-validateUserLogin', // Make sure the requesting device is logged in
                    version: '1.0'
                },
                {
                    name: 'generic-users',
                    function: 'deleteAccount', // delete a user account
                    version: '1.0'
                },
                {
                    name: 'generic-defaultResponse', // outputs res.response as json document
                    version: '1.0'
                }
            ]
        }
    }
}
```
If you need to do some kind of custom clean up after a user account gets deleted we recommend to create a cron job or chain a controller after calling the `deleteAccount` function that removes data that was related to the users profile.

#### Function: `validateUser` (available for all request methods as custom function)
When a user account is created using `signUp` function a validation token is generated and assigned to the email address in the user profile. To validate an email address and the account itself somehow pass this token to the user.

>**Example usage:** Send an email to the users email address given in the user profile with a validation link to click. The link opens a micro-page that passes the validation token from the email to an api route of your project using the `validateUser` function of `generic-users` that accepts the validation token. You could also send a push notification to the user or validate the user profile by calling the `validateUser` route by an app.

The validation token in the user profile usually is accessible in the variable:  `req.miajs.userData.messaging[i].inspectTokens.validateToken.token`

**Using validateUser in routes file**
```js
module.exports = {
   group: 'demo', // Group name
    name: 'My icecream API',  // if disabled path is used as name in api documentation
    version: '1.0', // Version
    environment: ['local','production'], // Define environments where this route file should be registered
    prefix: ['/icecream/v1','/icecream/latest'], // Route prefix. Multiple prefixes possible
    routes: {
        './users/me/validate': {
            post: {
                identity: 'validateUser',
                description: "Validate user",
                docs: true,
                authorization: true,
                modified: new Date(2014, 10, 3, 15, 0, 0),
                controller: [
                    {
                        name: 'generic-users',
                        function: "validateUser", // requires a validation token and if it matches the corresponding user account will be marked as validated
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultResponse', // outputs res.response as json document
                        version: '1.0'
                    }
                ]
            }
        }
    }
}
```
>This service does not need `generic-validateAccessKey` due to the user needs to have a valid validation token and this service might get called from a website or a client app directly.

#### Function: `invalidateUser` (available for all request methods as custom function)
Invalidate a user profile is pretty similar to `validateUser` but obviously is doing the opposite. 

>**Example usage:** If a user account is created using an email address of a user that does not own this email address you could send an email to the given email address with a link to validate the user profile and a second link to remove it. 
The link in the email opens a micro-page that passes the invalidation token from the email to an api route of your project using the `invalidateUser` function of `generic-users` that accepts the invalidation token. The user profile gets removed. You could also send a push notification to the user or invalidate the user profile by calling the `invalidateUser` route by an app.
You can find the validation token in the user profile and as response i.e. of `signUp` in the variable `req.miajs.userData.inspectTokens.invalidateToken.token`

The invalidation token in the user profile usuably is accessable in the variable: 
 `req.miajs.userData.messaging[i].inspectTokens.validateToken.token`

```js
module.exports = {
   group: 'demo', // Group name
    name: 'My icecream API',  // if disabled path is used as name in api documentation
    version: '1.0', // Version
    environment: ['local','production'], // Define environments where this route file should be registered
    prefix: ['/icecream/v1','/icecream/latest'], // Route prefix. Multiple prefixes possible
    routes: {
        './users/me/invalidate': {
            post: {
                identity: 'invalidateUser',
                description: "Invalidate user",
                docs: true,
                authorization: true,
                modified: new Date(2014, 10, 3, 15, 0, 0),
                controller: [
                    {
                        name: 'generic-users',
                        function: "invalidateUser", // requires a invalidate token and removes a user profile by giving a valid invalidate token
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultResponse', // outputs res.response as json document
                        version: '1.0'
                    }
                ]
            }
        }
    }
}
```
>This service does not need `generic-validateAccessKey` due to the user needs to have a valid invalidation token and this service might get called from a website or a client app directly.

# Generic Libs
Additionally to the usage of generic controllers you can also directly use the functionality of several generic libs. Most of the generic controllers are based on functions provided by the generic libs in the folder `libs` of the `generic` project. Mia.js provides the following libs:

* `generic-userAuthManager`
* `generic-deviceAndSessionAuth`
* `generic-notificationManager`
* `generic-servicesManager` 
* `generic-fbLoginProvider` 

## generic-userAuthManager
The user auth manager bundles function concerning the autorization and user profile handling. It provides the following function:

* `getUserDataById` - Input: userId, returns the user profile
* `getUserDataByEmailAndGroup` - Input: email and groupId, returns a user profile  
* `getDevicesUserIsLoggedInOn` - Input: userprofile, returns a list of logged-in devices
* `getDevicesUserIsLoggedInOnByUserId` - Input: userId, returns a list of logged-in devices
* `isUserLoggedInOnDeviceByLoginAndGroup` - Input: login, group, deviceId, appId, returns a user profile
* `getUserLoggedInOnDevice` - Input: deviceId, appId, returns a user profile
* `logoutAnyUserFromDevice` - Input: deviceId, appId, unregisters the given device id any user profile
* `logoutUserFromDevice` - Input: userId, deviceId, appId, unregisters the given device id from a user profile
* `processProfileData` - Input params, validates given profile create/update params 
* `updateUserProfileData` - Input params, updates a user profile with the given params
* `getUserDataEnsuringEtag` - Input userId, returns a user profile with eTag
* `hashCredentials` - Input group, password, options, returns a hash of the password value based on options and group
* `getUserAccountResponse` - Input userData, appId, returns a user profile cleared by sensitiv data
* `deleteUser` - Input login, group, deletes a user profile
* `prepareDataForSignup` - Input params, validates params before using signup
* `signUpUser` - Input params, creates a user profile
* `signupWithThirdPartyProvider`- Input params, creates a user profile based on third party provider i.e. facebook
* `validateUser` - Input token - sets a user profile and user profile email address to validated when token is valid
* `invalidateUser` - Input token - sets user profile to deleted when invalidate token is valid
* `getPasswordResetToken` - Input login, group, returns a password reset token and adds it to the user profile
* `resetPassword`- Input passwordResetToken, newPassword, options, resets a user password
* `loginUserCore` - Input params, logs in a user based on params
* `loginUser` - Input params, logs in a user based on params with validating user credentials

## generic-deviceAndSessionAuth
Provides functions to create device profiles and session tokens. 

* `createDevice` - Input options, deviceData, retryCount - creates a device profile based on deviceData
* `updateDevice` - Input options, id, deviceData, updates a device profile based on deviceData
* `checkAccessKey` - *deprecated* - Used for access key validation
* `generateSessionId` - *deprecated* - Used for session key generation
* `validateSessionToken` - *deprecated* - Used for session key generation
 
## generic-notificationManager
<a name="generic-notificationManager"></a>
With mia.js comes a build-in notification manager. You can call its functions from everywhere in your controllers to add notifications to a messaging queue collection in database that gets processed by the notification handler cron. Currently mia.js supports notification via email and push. 

### Notification Manager configuration
To use the notification manager lib you need to provide some notification settings in your project. Create a file and add the following syntax. We recommend to create this file in your project in folder `config` to make it accessible with global variable `Shared.config('notification-templates')`
```js
function thisModule() {
    var self = this;
    self.disabled = false; // Enable /disable controller
    self.identity = 'notification-templates'; // Unique controller id used in routes, policies and followups
    self.version = '1.0'; // Version number of service
    self.created = '2015-07-17T11:00:00'; // Creation date of controller
    self.modified = '2015-07-17T11:00:00'; // Last modified date of controller
    self.group = 'demo'; // Group this service to a origin

    self.notifications = {
        connectors: {
            smtp: {
                user: "my@domain.com",
                password: "your password",
                host: "mail.domain.com"
            },
            apns: {
                production: true,
                cert: new Buffer("your cert string"),
                key: new Buffer("your key string"),
                passphrase: "your password"
            }
        },
        templates: {
            resetPassword: { // Template name
                push: { // Template type
                    apns: {
                        alert: {
                            title: "Reset password",
                            body: "Hi [NAME], you requested a password reset"
                        },
                        badge: 1,
                        sound: "default",
                        "content-available": 1
                    },
                    android: {
                        //Not implemented so far but will be soon
                    }
                },
                mail: { // Template type
                    smtp: { // SMTP settings to take has to match with connectors.smtp
                        sender: "My Project <noreply@myproject.com>",
                        subject: "Reset password",
                        html: "<html><body><h1>Hi [NAME], you requested a password reset</h1></body>",
                        text: "Hi [NAME], you requested a password reset"
                    }
                }
            },
            welcome: { // Template name
                mail: { // Template type
                    smtp: { // SMTP settings to take has to match with connectors.smtp
                        sender: "My Project <noreply@myproject.com>",
                        subject: "Welcome to my project",
                        html: "<html><body><b>Hi [Name]</b>, we are so happy that you joined our project</body></html>",
                        text: "Hi [Name] we are so happy that you joined our project"
                    }
                }
            }
        }
    };
    return self;
};
module.exports = new thisModule();
```

### Example of a notification
To create a notification use the following sniplet in your project controller wherever this action should be initiated
```js
var NotificationManager = Shared.libs("generic-notificationManager");
NotificationManager.mail({
    configId: "notification-templates", // Config identifier of your project
    template: "resetPassword", // Template name to use
    replacements: { // Replace occurrences of i.e [name] with value of name given in replacements
        name: "John",
        lastName: "Wayne"
    }
}).address("me@domain.com").fail(function (err) {
    //Error handling. Will only fail if not possible to add to queue
}).done();
```

There multiple way to send a notification. First you always initialize the notification with the type of the message see `mail` in the example above or use `push` for a push notification. Then you put in the notification parameters.

* `configId` - String with the identifier of your config file where you defined notification settings
* `template` - Name of the template to use for this notification
* `replacemants` - To replace parts of your predefined template message use replacements. All variables in your message text with bracket i.e. [name] will be replaced by the value
* `schedule` - define a time when to deliver the notification. If this field is missing the notification is send immediately
 
After defining the notification parameters append 

Type `mail`:
* `address` - Input email address - Send email to the adress
 
Type `push`
* `device` - Input deviceId - Send a push notification to a device with given id
* `user` - Input userId - Send a push notification to all logged in devices of the user with given userId

When a notification is successfully added to the notification queue in the database using the notification example above it automatically gets processed by a notification cron job. If the delivery of the notification fails you should have a look at the database collection `notifications` for further details. Message can have the states `pending`, `fulfilled` or `rejected`


## generic-servicesManager 
This lib function returns a machine-readable version of your routes file listing. It provides the function `getFilteredServicesInfo` to return a structured object.

## generic-fbLoginProvider
When using login and signup functionality of mia.js this function is used to fetch data from facebook's graph api. To fetch data from the api it requires a valid facebook auth token.

# Core Functions
A essential node-module of mia.js is the the mia-js-core module. This module offers several functionalities you can also use within your custom controllers.

## Cached
To use caching setup a memcache server and configure the connection parameters in mia.js global configuration. Use the mia-js-core module `Cached` to set and get cached data from your memcache server.

```js
var MiaJs = require('mia-js-core')
    , Cached = MiaJs.Cached;
Cached("myIdentifier", 86400, _mycustomfunction);
```
Cached looksup the identifier in your memcache server and returns the value as a promise. If the value does not exists it calls the custom function you can provide.

# Database collections
If you use the generic controllers or generic libs of mia.js it creates several database collections to handle all tasks. 

* `cronJobTypes` - Handling of cron-job startup and runtime
* `devices` - Device profiles of registered devices
* `errorLogEntries` - Collect error log entries 
* `notifications` - Notification Queue. See for status of your notifications
* `secrets` - Secrets are used for authorisation and validation of devices against your application
* `users` - User profiles of registered users

# Compile and serve individual frontend projects using the WebpackCompiler lib
Thanks to the WebpackCompiler lib which is shipped with mia-js-core you can put webpack config files right into individual project folders. This way mia-js takes responsibility of the build process, watches for file changes and applies them to the running bundles using HMR.
An example frontend project called "web" is included.<br/>
Within this project there is a simple web app written in [React](https://reactjs.org). It's isomorphic what means that the same app can run on the server as well as in the browser. Therefore we have two compilation targets, server and client.
Additionally you can have a production version (for building into the file system without watching and HMR) and/or a development version (for building into memory, watching for changes to files and apply them using HMR).
Place these config files directly in the root of the project folder, like so:

+-- My Awesome Project<br/>
| +-- config<br/>
| +-- controllers<br/>
| +-- ...<br/>
| +-- webpack.client.fs.config.js<br/>
| +-- webpack.client.watch.config.js<br/>
| +-- webpack.server.fs.config.js<br/>
| +-- webpack.server.watch.config.js<br/>

Where `*.fs.*` presents production builds and `*.watch.*` development builds. Every single file is optional.<br/>
Please find an example configuration for every file in the "web" project. To prevent code duplication most of the configuration can be found in the "tools" folder.
  
# Hot Module Replacement
For an introduction to hot module replacement you can look [here](https://webpack.js.org/concepts/hot-module-replacement/).<br/>
With mia.js HMR can be used in two different places. First place is the development build of individual projects where file changes will be watched, recompiled and pushed into the bundles. Here we are using webpack's own "HotModuleReplacement" plugin which makes use of the [integrated HMR API](https://webpack.js.org/api/hot-module-replacement/) to replace modules in memory on the fly. This use case is very straight forward, recommended by webpack and very well documented on various websites.<br/>
The other place is in the server itself where we don't execute the webpack build but our server code and therefore we can't take advantage of the injected HMR API. You'll get more details about this solution in the next paragraph.

## Server implementation
The following lines will give you some background information about how we implemented HMR into the server.

### The goal
The goal was to write project code which immediately comes to effect without restarting the server.

### The Challenge
Loose coupling of dependencies. With mia.js all your modules (controllers, libs, etc) can have an unique identifier therefore you don't need to know where they actually are in the file system. With that you have to use something like `Shared.libs('Some-Lib')` to do the actual import into another module.
So every project file is required by the Shared lib on server start and residents in memory until the server is shut down - similar to the require cache in node.js.
Another difficulty is the fact that mia-js-core does this all from within the node_modules folder and normally you do ignore everything in there for the webpack build.

### Overview of components
- **StaticDependencies lib**: For creating a file which requires all the dependencies (which are basically project files/modules) and another file which maps those dependencies to their unique identifiers
- **A Babel plugin** to transpile `Shared.X('Y')` imports to proper CommonJS requires
- **A Webpack plugin** to handle the actual HMR
- **WebpackCompiler lib**: Connecting the dots

### Process overview
The whole process happens in parallel during server start if you specify `hmr` as the third node argument or simply use `npm run dev-server`.
1. Creation of the static dependencies file into `node_modules/mia-js-core/lib/webpackCompiler/.webpack`
2. Creation of the mappings file into the same directory (this directory will be emptied on every server start)
3. Require static dependencies file (using file path as string)
4. Compilation of server bundle using Babel loader and our Babel plugin
5. Right now webpack knows the whole dependency tree
6. Watching for file changes and trigger our Webpack plugin
7. HMR is happening!

### A closer look into the Webpack plugin (HotMia)
Besides replacing the changed module within the Shared lib there can be more work to do depending on the type of module:

#### Config module
Replaced in Shared only.

#### Init module
Replaced in Shared. However init modules are going to be executed during server start only.

#### Routes module
Replaced in Shared and express routers (there can be multiple via vhosts) will be reinitialized.

#### Model module
Replaced in Shared only.

#### Lib module
Replaced in Shared only.

#### Controller module
Replaced in Shared and express routers (there can be multiple via vhosts) will be reinitialized.

#### Cron module
Old cronjob will be properly stopped and replaced in Shared. New version of cronjob will be started.
