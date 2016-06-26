const DEBUG = process.env.NODE_ENV !== 'production';

module.exports = exports = {
   hostName: DEBUG ? 'localhost' : 'home.hoomanlogic.com',
   port: DEBUG ? 8081 : 80,
   socketPort: DEBUG ? 8080 : 8181,
};
