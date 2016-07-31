var path = require('path');
module.exports = exports = {
   bit: {
      entry: path.resolve(__dirname, './bit/index.js'),
      route: '/bit/:id',
      view: 'index',
   },
   bits: {
      entry: path.resolve(__dirname, './bits/index.js'),
      route: '/bits',
      view: 'gnidbits',
   },
   lif: {
      entry: path.resolve(__dirname, './lif/index.js'),
      route: '/lif',
      view: 'gnidbits',
   },
};
