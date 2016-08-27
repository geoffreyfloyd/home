var path = require('path');
module.exports = exports = {
   cmd: {
      entry: path.resolve(__dirname, './views/cmd/index.js'),
      route: '/cmd',
      template: 'noscroll',
   },
};
