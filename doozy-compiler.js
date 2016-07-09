import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import config from './doozy.config';

var logPath = path.resolve('./test.txt');

var stacks = {
   done: [],
   todo: [],
   note: [],
};

var stack = [];
var stackKind;

var linePattern = /\r?\n/;
var logText = fs.readFileSync(logPath, { encoding: 'utf8' });
logText.split(linePattern).forEach(line => {
   var logKind, match, append;
   line = line.replace(/ +$/, '');
   
   if (!line) {
      logKind = 'note';
      append = line;
   }
   else {
      // Return the first kind that has a positive match
      logKind = _.find(Object.keys(config.log), kind =>
         _.find(config.log[kind], pattern => {
            var find = new RegExp(pattern);
            match = find.exec(line);
            return match && match[0];
         })
      );
      if (logKind) {
         append = match[1];
      }
   }

   if (!logKind) {
      // Append to the stack
      stack.push(line);
   }
   else {
      // Push `stack` (if exists) onto `stacks` and reset
      if (stack.length) {
         stacks[(stackKind || 'note')].push(stack);
      }
      stack = [];
      stackKind = logKind;
      // Add capture group value to the stack
      if (append) {
         stack.push(append);
      }
   }
});

// Push `stack` onto `stacks`
stacks[(stackKind || 'note')].push(stack);
console.log(stacks);
