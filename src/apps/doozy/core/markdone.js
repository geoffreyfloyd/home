import _ from 'lodash';
import marked from 'marked';
import config from '../../../../doozy.config';

const stackable = ['todo', 'done', 'note'];
const indent = '    ';
const newline = /\n/;

const grammar = {
    true: /true/i,
    false: /false/i,

};

const TAG = {
   NUM: 'NUM',
   VARIABLE: 'VARIABLE',
   if: 'if',
   else: 'else',

   EQUALS: '==',
   ASSIGN: '=',
   GT: '>',
};

const keywords = {
   if: 'if',
   else: 'else',
   do: 'do',
   while: 'while',
   for: 'for',
}

const equals = {
    
}

const compare = {
   '>': '>',
   '>=': '>=',
   '<': '<',
   '<=' : '<=',
}

class Token {
   constructor (tag) {

   }
}

export default class Lexer {
   constructor (src) {
      this.src = src;

      this.words = {
         true: 'true',
         false: 'false',
      };
   }

   tokenize () {
      var tokens = [];
      var token;

      // Field level variables used during tokenization
      this.src = preparse(this.src);
      this.position = 0;
      this.line = 1;
      this.linePosition = 1;

      // Parse source until we can't find any more tokens
      while (token = this._nextToken()) {
         // Add words to word map
         if (token[0] === TAG.WORD) {
            this.words[token[1]] = token[1];
         }

         // Add token to tokens
         tokens.push(token);
      }

      return tokens;
   }

   _nextToken () {
      // Here's looking at you, char.
      var peek = this.src[this.position];

      // Advance to next non-whitespace character
      // and advance accordingly
      while (peek === ' ' || peek === '\n') {
         peek = this._read();
      }

      // Here's where the fun starts
      var tokenStart = this.position;

      // Parse a number
      if (!isNaN(parseInt(peek, 10))) {
         var num = 0;
         while (!isNaN(parseInt(peek, 10))) {
            num = 10 * num + parseInt(peek, 10);
            peek = this._read();
         }
         return [TAG.NUM, num];
      }

      // Parse a word (keyword or variable)
      if (/[a-z_]/i.test(peek)) {
         var word = '';
         while (/[a-z0-9_]/i.test(peek)) {
            word += peek;
            peek = this._read();
         }
         return [TAG.WORD, word];
      }

      // Parse equality symbols
      if (peek === '=') {
         var symbol = '';
         while (/[=]/.test(peek)) {
            symbol += peek;
            peek = this._read();
         }
         if (symbol === '==') {
            return [TAG.EQUALS, '=='];
         }
         else if (symbol === '=') {
            return [TAG.ASSIGN, '='];
         }
      }
   }

   _read () {
      this.position++;
      var peek = this.src[this.position];
      peek = this.src[this.position];
      if (peek === '\n') {
         this.line++;
         this.linePosition = 1;
      }
      else {
         this.linePosition++;
      }
      return peek;
   }

   parse () {
      var stacks = {
         done: [],
         todo: [],
         note: [],
         tag: [],
      };

      var stack = [];
      var stackKind;

      var src = preparse(this.src);

      src.split(newline).forEach((line, lineNum) => {
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
      stacks.todo = stacks.todo.map(todoStack => todoStack.join('\n'));
      stacks.done = stacks.done.map(doneStack => doneStack.join('\n'));

      // Return calc
      var calc = {
         done: stacks.done,
         todo: stacks.todo,
         notes: stacks.note,
         tags: stacks.tag,
      };

      return calc;
   }
}

function preparse (src) {
    // Normalize the source's whitespace
    return src
      .replace(/\r\n|\r/g, '\n')
      .replace(/\t/g, indent)
      .replace(/\u00a0/g, ' ')
      .replace(/\u2424/g, '\n');
}
