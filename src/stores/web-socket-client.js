var W3CWebSocket = require('websocket').w3cwebsocket;
const DEBUG = process.env.NODE_ENV !== 'production';
var serverConfig = require('../../server.config')(DEBUG);

var client = new W3CWebSocket(`ws://${serverConfig.hostName}:${serverConfig.socketPort}/`, 'echo-protocol');

client.onerror = () => {
   console.log('Connection Error');
};

client.onopen = (conn) => {
   console.log(conn);
   console.log('WebSocket Client Connected');
};

client.onclose = () => {
   console.log('WebSocket Client Closed');
};

client.onmessage = function (e) {
   callbacks.forEach(cb => cb(e.data));
   if (typeof e.data === 'string') {
      console.log(`Received: '${e.data}'`);
   }
};

var callbacks = [];

module.exports = exports = {
   client,
   onmessage (callback) {
      callbacks.push(callback);
   },
};
