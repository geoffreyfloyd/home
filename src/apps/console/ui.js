var path = require('path');
module.exports = exports = {
   cmd: {
      entry: path.resolve(__dirname, './cmd/index.js'),
      route: '/cmd',
      view: 'noscroll',
   },
};
