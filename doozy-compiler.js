import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import config from './doozy.config';
import marked from 'marked';

var logPath = path.resolve('./test.txt');

var stacks = {
   done: [],
   todo: [],
   note: [],
   tag: [],
};

var stack = [];
var stackKind;
var stackable = ['todo', 'done', 'note'];
var indent = '    ';
var newline = /\n/;

var src = fs.readFileSync(logPath, { encoding: 'utf8' });

src = src
   .replace(/\r\n|\r/g, '\n')
   .replace(/\t/g, indent)
   .replace(/\u00a0/g, ' ')
   .replace(/\u2424/g, '\n');

src.split(newline).forEach(line => {
   var logKind, match, append;
   line = line.replace(/ +$/, '');

   if (!line) {
      if (stackKind !== 'note') {
         logKind = 'note';
      }
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
      // Set stack default for next lines if this is a stackable log kind
      if (stackable.indexOf(logKind) > -1) {
         // Push `stack` (if exists) onto `stacks`
         if (stack.length) {
            stacks[(stackKind || 'note')].push(stack);
         }

         // Set the stack kind for next lines
         stackKind = logKind;

         // Add capture group value to a fresh stack
         stack = append ? [append] : [];
      }
      else {
         stacks[logKind].push(append);
      }
   }
});

// Push `stack` onto `stacks`
stacks[(stackKind || 'note')].push(stack);

// Convert notes to markdown html
stacks.note = stacks.note.map(noteStack => marked(noteStack.join('\n')));

console.log(stacks);
