// Auth protected api using generic authorization controller
// with device register routes
// For testing use key defined in config/init.js

module.exports = {

    group: 'demo', // Group name
    name: 'Demo API with autorization required',
    version: '1.0', // Version
    prefix: ['/demo-auth/v1'], // Route prefix. Multiple prefixes possible
    routes: {

        // API ROUTES
        './todo': {
            list: {
                identity: 'todos',
                modified: new Date(2015, 7, 14, 12, 0, 0),
                docs: true,
                description: "List todos",
                controller: [
                    {
                        name: 'generic-validateAccessKey',
                        version: '1.0'
                    },
                    {
                        name: 'demo-toDoHandler',
                        function: "listToDoItems",
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            },
            index: {
                identity: 'todo',
                modified: new Date(2015, 7, 14, 12, 0, 0),
                docs: true,
                description: "Get single todo",
                controller: [
                    {
                        name: 'generic-validateAccessKey',
                        version: '1.0'
                    },
                    {
                        name: 'demo-toDoHandler',
                        function: "getToDoItem",
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            },
            create: {
                identity: 'create-todo',
                modified: new Date(2015, 7, 14, 12, 0, 0),
                docs: true,
                description: "Create a todo item",
                controller: [
                    {
                        name: 'generic-validateAccessKey',
                        version: '1.0'
                    },
                    {
                        name: 'demo-toDoHandler',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            },
            update: {
                identity: 'update-todo',
                modified: new Date(2015, 7, 14, 12, 0, 0),
                docs: true,
                description: "Update a todo item",
                controller: [
                    {
                        name: 'generic-validateAccessKey',
                        version: '1.0'
                    },
                    {
                        name: 'demo-toDoHandler',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            },
            delete: {
                identity: 'delete-todo',
                modified: new Date(2015, 7, 14, 12, 0, 0),
                docs: true,
                description: "Delete a todo item",
                controller: [
                    {
                        name: 'generic-validateAccessKey',
                        version: '1.0'
                    },
                    {
                        name: 'demo-toDoHandler',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            }
        },

        // SERVICE LISTING
        './services': {
            list: {
                identity: 'services',
                modified: new Date(2015, 3, 5, 16, 0, 0),
                description: "Services list of all available services",
                docs: true,
                controller: [
                    {
                        name: 'generic-listServices',
                        version: '2.0'
                    },
                    {
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            }
        },

        // Device register
        './devices': {
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
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            },
            update: {
                identity: 'device',
                modified: new Date(2014, 1, 23, 15, 0, 0),
                description: "Update device profile",
                authorization: true,
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
                        name: 'generic-defaultJSONResponse',
                        version: '1.0'
                    }
                ]
            }
        }
    }
};