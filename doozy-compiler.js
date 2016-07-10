import fs from 'fs';
import path from 'path';
import { parse } from './src/apps/doozy/core/markdone';

var logPath = path.resolve('./test.txt');
var text = fs.readFileSync(logPath, { encoding: 'utf8' });


console.log(parse(text));
