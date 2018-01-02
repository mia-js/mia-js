module.exports = {

    group: 'web',
    name: 'Frontend demo',
    version: '1.0',
    prefix: '/web',
    routes: {

        './*': {
            list: {
                identity: 'web',
                modified: new Date(2017, 7, 11, 12, 0, 0),
                controller: [
                    {
                        name: 'Web-ServerSideRendering',
                        version: '1.0'
                    }
                ]
            }
        }
    }
};
