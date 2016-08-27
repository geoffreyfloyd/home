var path = require('path');
module.exports = exports = {
   bit: {
      entry: path.resolve(__dirname, './views/bit.js'),
      route: '/bit/:id',
      template: 'index',
   },
   bits: {
      entry: path.resolve(__dirname, './views/bits/index.js'),
      route: '/bits',
      template: 'gnidbits',
   },
   lif: {
      entry: path.resolve(__dirname, './views/lif.js'),
      route: '/lif',
      template: 'gnidbits',
   },
};
