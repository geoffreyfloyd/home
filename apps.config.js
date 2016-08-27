var path = require('path');

module.exports = exports = {
   //
   // Apps
   // -------------------------------------------------------
   apps: {
      console: path.resolve(__dirname, './build/apps/console'),
      doozy: path.resolve(__dirname, './build/apps/doozy'),
      gnidbits: path.resolve(__dirname, './build/apps/gnidbits'),
   },
   plugins: [],
};
