var path = require('path');
module.exports = exports = {
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
};
