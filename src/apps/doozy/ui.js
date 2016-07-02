var path = require('path');
module.exports = exports = {
   calendar: {
      entry: path.resolve(__dirname, './calendar/index.js'),
      route: '/calendar',
      view: 'index',
   },
   log: {
      entry: path.resolve(__dirname, './log/index.js'),
      route: '/log/:id',
      view: 'index',
   },
   // logs: {
   //    entry: path.resolve(__dirname, './logs/index.js'),
   //    route: '/logs',
   //    view: 'index',
   // },
   target: {
      entry: path.resolve(__dirname, './target/index.js'),
      route: '/target/:id',
      view: 'index',
   },
   targets: {
      entry: path.resolve(__dirname, './targets/index.js'),
      route: '/targets',
      view: 'index',
   },
};
