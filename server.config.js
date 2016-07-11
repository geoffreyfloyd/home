module.exports = exports = function (debug) {
   return {
      hostName: debug ? 'localhost' : 'home.gnidbits.com',
      port: debug ? 8081 : 80,
      socketPort: debug ? 8080 : 8181,
   };
};