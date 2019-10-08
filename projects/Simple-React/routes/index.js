module.exports = {

  name: 'Simple-React',
  group: 'simple-react',
  version: '1.0',
  prefix: '/simple-react',
  routes: {

    './*': {
      list: {
        identity: 'simple-react-service',
        modified: new Date(2019, 9, 25),
        controller: [
          {
            name: 'Simple-React-Service',
            version: '1.0'
          }
        ]
      }
    }

  }
}
