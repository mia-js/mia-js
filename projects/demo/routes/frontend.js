module.exports = {

    group: 'demo',
    version: '1.0',
    prefix: ['/'], //Multiple prefixes are possible, use Array
    routes: {

        // Home
        './web/*': {
            list: {
                identity: 'home',
                modified: new Date(2014, 1, 23, 15, 0, 0),
                controller: [
                    {
                        name: 'demo-home',
                        version: '1.0'
                    },
                    {
                        name: 'html-output',
                        version: '1.0'
                    }
                ]
            }
        }
    }
};