var path = require('path');

module.exports = exports = function (DEBUG) {
   var rootDir = DEBUG ? './src/' : './build/';
   return {
      //
      // Apps
      // -------------------------------------------------------
      apps: {
         console: path.resolve(__dirname, rootDir + 'apps/console'),
         doozy: path.resolve(__dirname, rootDir + 'apps/doozy'),
         gnidbits: path.resolve(__dirname, rootDir + 'apps/gnidbits'),
      },
      plugins: [],
   };
};
