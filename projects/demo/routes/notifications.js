// An example of how to use notifications manager of mia.js

module.exports = {

    group: 'demo', // Group name
    name: 'Demo API to send a email notification',
    version: '1.0', // Version
    prefix: ['/notification-demo/v1'], // Route prefix. Multiple prefixes possible
    routes: {

        // API ROUTES
        './sendmail': {
            list: {
                identity: 'sendmail',
                modified: new Date(2015, 7, 14, 12, 0, 0),
                docs: true,
                description: "A an email to the notification queue",
                controller: [
                    {
                        name: 'demo-notification',
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
};