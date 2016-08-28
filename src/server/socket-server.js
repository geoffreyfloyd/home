const DEBUG = process.argv.indexOf('--release') === -1;
var socketPort = require('../../server.config')(DEBUG).socketPort;

var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer((request, response) => {
   console.log((new Date()) + ' Received request for ' + request.url);
   response.writeHead(404);
   response.end();
});

server.listen(socketPort, () => {
   console.log(`Socket Server is listening on port ${socketPort}`);
});

var wss = new WebSocketServer({
   httpServer: server,
   // You should not use autoAcceptConnections for production
   // applications, as it defeats all standard cross-origin protection
   // facilities built into the protocol and the browser.  You should
   // *always* verify the connection's origin and decide whether or not
   // to accept it.
   autoAcceptConnections: false
});

function originIsAllowed (/* origin */) {
   // put logic here to detect whether the specified origin is allowed.
   return true;
}

wss.on('request', request => {
   // Make sure we only accept requests from an allowed origin
   if (!originIsAllowed(request.origin)) {
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
   }

   var connection = request.accept('echo-protocol', request.origin);
   var connectionId = `${connection.remoteAddress}-${Object.keys(connections).length}`;
   connections[connectionId] = connection;
   connection.sendUTF(JSON.stringify({
      status: 'OK',
      date: (new Date()).toISOString(),
      result: { connectionId },
      type: 'key',
   }));

   console.log((new Date()) + ' Connection accepted.');
   // Handle Message
   connection.on('message', message => {
      if (message.type === 'utf8') {
         console.log('Received Message: ' + message.utf8Data);
         var reqBody = JSON.parse(message.utf8Data);
         (messageHandlers[reqBody.uri] || function () {
            console.log('No handler registered for ' + reqBody.uri);
         })(reqBody);
      }
      else {
         console.log(message);
      }
   });
   connection.on('close', (/* reasonCode, description */) => {
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
      closeHandlers.forEach(cb => cb(connection));
   });
});

var connections = {};
var messageHandlers = {};
var closeHandlers = [];

module.exports = exports = {
   getConnections: function () {
      return connections; //Object.keys(connections).map(key => connections[key]);
   },
   onMessage: function (uri, callback) {
      messageHandlers[uri] = callback;
   },
   onClose: function (callback) {
      closeHandlers.push(callback);
   }
};
