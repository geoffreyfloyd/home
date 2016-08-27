var path = require('path');
module.exports = exports = {
   calendar: {
      entry: path.resolve(__dirname, './views/calendar/index.js'),
      route: '/calendar',
      template: 'index',
   },
   log: {
      entry: path.resolve(__dirname, './views/log.js'),
      route: '/log/:id',
      template: 'index',
   },
   logs: {
      entry: path.resolve(__dirname, './views/logs.js'),
      route: '/logs',
      template: 'index',
   },
   target: {
      entry: path.resolve(__dirname, './views/target.js'),
      route: '/target/:id',
      template: 'index',
   },
   targets: {
      entry: path.resolve(__dirname, './views/targets.js'),
      route: '/targets',
      template: 'index',
   },
};
