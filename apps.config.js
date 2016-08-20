var path = require('path');

module.exports = exports = {
   //
   // Apps
   // -------------------------------------------------------
   apps: {
      console: path.resolve(__dirname, './src/apps/console'),
      doozy: path.resolve(__dirname, './src/apps/doozy'),
      gnidbits: path.resolve(__dirname, './src/apps/gnidbits'),
   },
   plugins: [],
};
