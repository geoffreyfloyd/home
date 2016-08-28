import pty from 'pty.js';

module.exports = function (operator) {

   var logs = {};
   var terminals = {};
   var connectionTerminalMap = {};
   var requests = {};

   operator.server.get('/api/gnodes/pretty', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      operator.getDb(db => {
         // Get all gnodes from db
         var results = [];
         results = results.concat(db.allOf('doozy.action'));
         results = results.concat(db.allOf('doozy.focus'));
         results = results.concat(db.allOf('doozy.logentry'));
         results = results.concat(db.allOf('doozy.plan'));
         results = results.concat(db.allOf('doozy.planstep'));
         results = results.concat(db.allOf('doozy.tag'));
         results = results.concat(db.allOf('doozy.target'));
         results = results.concat(db.allOf('gnidbits.bit'));
         results = results.concat(db.allOf('gnidbits.strip'));
         results = results.concat(db.allOf('tag'));

         results.forEach(gnode => {
            console.log('Set state');
            // Set state to itself
            gnode.setState(gnode.state);
         });

         // Commit the updated gnode states
         db.commitChanges();

         // Done
         res.end();
      });
   });

   operator.server.post('/api/console/cmd', (req, res) => {
      console.log('Cmd request:\n', req.body);
      var cmd = req.body.cmd.split(' ');
      var responseHandled = false;
      switch (cmd[0]) {
         case 'term':
            switch (cmd[1]) {
               case 'start':
                  responseHandled = terminalStart(req, res);
                  break;
               default:
                  responseHandled = terminalCmd(req.body.keys.terminalId, cmd.slice(1).join(' '), req, res);
                  break;
            }
            break;
      }

      if (!responseHandled) {
         res.end(JSON.stringify({
            status: 'OK',
            date: (new Date()).toISOString(),
            result: 'Command received: ' + req.body.cmd,
            type: 'text',
         }));
      }
   });

   function terminalStart (req, res) {
      // var cols = req.body.cols;
      // var rows = req.body.rows;

      // Initialize terminal
      var term = pty.spawn(process.platform === 'win32' ? 'cmd.exe' : 'bash', [], {
         name: 'xterm-color',
         cols: 80,
         rows: 24,
         cwd: process.env.PWD,
         env: process.env
      });

      console.log('Created terminal with PID: ' + term.pid);
      terminals[term.pid] = term;
      logs[term.pid] = '';

      var socketClient = operator.socketServer.getConnections()[req.body.keys.connectionId];
      // Handle data
      term.on('data', data => {
         logs[term.pid] += data;
         try {
            var sendData = {
               status: 'OK',
               date: (new Date()).toISOString(),
               result: data,
               type: 'text',
               context: requests[term.pid] || null
            };
            socketClient.sendUTF(JSON.stringify(sendData));
         }
         catch (ex) {
            // The WebSocket is not open, ignore
            console.log(ex);
         }
      });

      // Handle close
      operator.socketServer.onClose(() => {
         try {
            process.kill(term.pid);
            console.log('Closed terminal ' + term.pid);
            // Clean things up
            delete terminals[term.pid];
            delete logs[term.pid];
         }
         catch (ex) {
            console.log(ex);
         }
      });

      // Send success and terminal key
      res.end(JSON.stringify({
         status: 'OK',
         date: (new Date()).toISOString(),
         result: { terminalId: term.pid.toString() },
         type: 'key'
      }));
      return true;
   }

   function terminalCmd (terminalId, cmd, req, res) {
      // Send command to terminal
      var term = terminals[parseInt(terminalId, 10)];
      console.log('Sending command to terminal ' + term.pid + ': ' + cmd);

      requests[term.pid] = req.body.id;

      // Send cmd
      term.write(cmd + '\r');

      // Send success
      res.end(JSON.stringify({
         status: 'OK',
         date: (new Date()).toISOString(),
         result: cmd,
         type: 'text',
      }));
      return true;
   }

   // operator.socketServer.onMessage('terminal', conn => {
      
   // });

   // operator.socketServer.registerHandler('terminal', ;

   // operator.server.ws('/terminals/:pid', (ws, req) => {
   //    var term = terminals[parseInt(req.params.pid, 10)];
   //    console.log('Connected to terminal ' + term.pid);
   //    ws.send(logs[term.pid]);
   //    term.on('data', data => {
   //       try {
   //          ws.send(data);
   //       }
   //       catch (ex) {
   //          // The WebSocket is not open, ignore
   //       }
   //    });
   //    ws.on('message', msg => {
   //       term.write(msg);
   //    });
   //    ws.on('close', () => {
   //       process.kill(term.pid);
   //       console.log('Closed terminal ' + term.pid);
   //       // Clean things up
   //       delete terminals[term.pid];
   //       delete logs[term.pid];
   //    });
   // });
};
