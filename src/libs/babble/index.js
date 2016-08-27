'use strict';

var core = require('./core');
Object.assign(core, require('./durations'));
Object.assign(core, require('./moments'));
Object.assign(core, require('./numbers'));
module.exports = core;
