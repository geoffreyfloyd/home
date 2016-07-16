var fs = require('fs');
var path = require('path');
var Lexer = require('./build/apps/doozy/core/markdone');

// var logPath = path.resolve('./test.txt');
// var text = fs.readFileSync(logPath, { encoding: 'utf8' });

var scriptPath = path.resolve('./compile.txt');
var script = fs.readFileSync(scriptPath, { encoding: 'utf8' });

var scriptLexer = new Lexer.default(script);
console.log(scriptLexer.tokenize());

// var logLexer = new Lexer(text);
// console.log(logLexer.parse());
