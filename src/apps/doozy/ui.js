var path = require('path');
module.exports = exports = {
   calendar: {
      entry: path.resolve(__dirname, './views/calendar/index.js'),
      route: '/calendar',
      view: 'index',
   },
   log: {
      entry: path.resolve(__dirname, './views/log.js'),
      route: '/log/:id',
      view: 'index',
   },
   logs: {
      entry: path.resolve(__dirname, './views/logs.js'),
      route: '/logs',
      view: 'index',
   },
   target: {
      entry: path.resolve(__dirname, './views/target.js'),
      route: '/target/:id',
      view: 'index',
   },
   targets: {
      entry: path.resolve(__dirname, './views/targets.js'),
      route: '/targets',
      view: 'index',
   },
};
