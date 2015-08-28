module.exports = {

    group: 'demo', // Group name
    //name: 'Demo API',  If disabled path is used as name in swaggerUI
    version: '1.0', // Version
    prefix: ['/demo/v1','/demo/latest'], // Route prefix. Multiple prefixes possible
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
                        name: 'demo-checkAccess',
                        version: '1.0'
                    },
                    {
                        name: 'demo-toDoHandler',
                        function: "listToDoItems",
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultResponse',
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
                        name: 'demo-checkAccess',
                        version: '1.0'
                    },
                    {
                        name: 'demo-toDoHandler',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultResponse',
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
                        name: 'demo-checkAccess',
                        version: '1.0'
                    },
                    {
                        name: 'demo-toDoHandler',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultResponse',
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
                        name: 'demo-checkAccess',
                        version: '1.0'
                    },
                    {
                        name: 'demo-toDoHandler',
                        version: '1.0'
                    },
                    {
                        name: 'generic-defaultResponse',
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
                        name: 'generic-defaultResponse',
                        version: '1.0'
                    }
                ]
            }
        }
    }
};