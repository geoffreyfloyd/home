import http from 'libs/http';
import uuid from 'uuid';
import WebSocketClient from './web-socket-client';
import those from 'those';

var callbacks = [];
var requests = [];

var api = {
   sendRequest (request, callback) {
      http(`http://${window.location.href.split('/').slice(2, 3).join('/')}/_/cmd/`).withJsonBody(request).requestJson(json => {
         request.response = json;
         callback(request);
      }).catch(err => {
         request.response = {
            status: 'ERR',
            date: (new Date()).toISOString(),
            result: err.statusText,
            type: 'text',
         };
         callback(request);
      });
   },
};

function handleSocketMessage (data) {
   // Parse json string to an object
   data = JSON.parse(data);

   // Find appropriate request
   var request = those(requests).first(req => req.context && req.context.processId === data.id);
   if (request === null) {
      return;
   }

   if (data.result === null || data.processEnded) {
      // process ended
      request.context.processId = void 0;
   }

   if (data.result !== null) {
      if (request.response === null) {
         request.response = {};
      }
      if (typeof request.response.result === 'string' && typeof data.result === 'string') {
         request.response.result += `\r\n${data.result}`;
      }
      else {
         request.response.result = data.result;
      }
   }

   // Notify
   f.notify(request);
}

WebSocketClient.onmessage(handleSocketMessage);

function wrapRequest (cmd, sessionId) {
   return {
      id: uuid.v4(),
      sessionId,
      context: {},
      date: (new Date()).toISOString(),
      cmd,
      response: null,
   };
}

var f = {
   send (cmd, sessionId, callback) {

      if (!cmd) {
         return;
      }

      var request = wrapRequest(cmd, sessionId);
      requests.push(request);

      // notify subscribers
      f.notify(request);

      // A managed type of object.assign to
      // add logic based on property name being updated
      // var assignFilter = function (root, other, on) {
      //    for (var prop in other) {
      //       if (other.hasOwnProperty(prop)) {
      //          if (!root.hasOwnProperty(prop) || root[prop] != other[prop]) {
      //             if (on(prop)) {
      //                root[prop] = other[prop];
      //             }
      //          }
      //       }
      //    }
      // }

      api.sendRequest(request, req => {
         // if (req.response.hasOwnProperty('setContext')) {
         //    var context = req.response.setContext;
         //    req.response.setContext = void 0;

         //    // If we're getting a process id, then let's
         //    // spawn a new session
         //    assignFilter(req.context, context, prop => {
         //       if (prop === 'processId') {
         //          req.sessionId = uuid.v4();
         //       }
         //       return true;
         //    });
         // }

         // notify subscribers
         f.notify(req);

         if (callback) {
            callback(req);
         }
      });
   },
   repeat (id) {
      var i, repeatRequest;

      for (i = 0; i < requests.length; i++) {
         if (requests[i].id === id) {
            repeatRequest = requests[i];
            break;
         }
      }

      f.send(repeatRequest.cmd, repeatRequest.sessionId, request => {
         // notify subscribers
         f.notify(request);
      });
   },
   getRequests (sessionId) {
      return those(requests).like({ sessionId });
   },
   closeSession (sessionId) {
      // Filter out all requests for this session
      requests = requests.filter(req => req.sessionId !== sessionId);

      f.notify(sessionId);
      if (requests.length === 0) {
         f.new();
      }
   },
   getSessionIds () {
      var sessionIds = [];
      requests.forEach(req => {
         if (sessionIds.indexOf(req.sessionId) === -1) {
            sessionIds.push(req.sessionId);
         }
      });
      return sessionIds;
   },
   subscribe (callback, id) {
      callbacks.push({
         callback,
         id,
      });
   },
   new () {
      var welcome = wrapRequest('', uuid.v4());
      welcome.response = {
         status: 'OK',
         date: new Date(),
         result: '', // WebPrompt\r\nby HoomanLogic
         type: 'text',
      };
      requests.push(welcome);
      f.notify(welcome);
      return welcome.sessionId;
   },
   notify (request) {
      // notify subscribers
      callbacks.slice().forEach(cb => {
         if (!cb.id || request.id === cb.id || request.sessionId === cb.id) {
            cb.callback(request);
         }
      });
   },
};

module.exports = exports = f;
