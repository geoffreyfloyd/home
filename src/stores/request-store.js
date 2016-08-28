import http from 'libs/http';
import uuid from 'uuid';
import WebSocketClient from './web-socket-client';
import those from 'those';

var callbacks = [];
var requests = [];
var keys = {};

// Set base url
var baseUrl = '';
if (global.window) {
   baseUrl = window.location.href.split('/').slice(0, 3).join('/');
}

var api = {
   sendRequest (req) {
      return http(`${baseUrl}/api/console/cmd`).post().withJsonBody(req).requestJson().then(json => {
         // Add key for subsequent requests
         if (json.type === 'key') {
            keys = { ...keys, ...json.result };
         }
         var request = those(requests).first(r => r.id && r.id === req.id);
         // Append response to request object
         if (!request.response) {
            request.response = json;
         }
         return request;
      }).catch(err => {
         req.response = {
            status: 'ERR',
            date: (new Date()).toISOString(),
            result: err.statusText,
            type: 'text',
         };
         return req;
      });
   },
};

function handleSocketMessage (data) {
   // Parse json string to an object
   data = JSON.parse(data);

   // Add key for subsequent requests
   if (data.type === 'key') {
      keys = { ...keys, ...data.result };
      return;
   }

   console.log(data.result);

   // Find appropriate request
   var request = those(requests).first(req => req.id && req.id === data.context);
   if (request === null) {
      return;
   }

   if (data.result === null || data.processEnded) {
      // process ended
      request.context = undefined;
   }

   if (data.result !== null) {
      if (!request.response) {
         request.response = {
            type: 'text',
            status: 'OK',
            result: data.result
         };
      }
      else if (typeof request.response.result === 'string' && typeof data.result === 'string') {
         request.response.result += `\r\n${data.result}`;
      }
      else {
         request.response.result = data.result;
      }
   }

   // Notify
   f.notify({ ...request });
}

WebSocketClient.onmessage(handleSocketMessage);

function wrapRequest (cmd, sessionId) {
   return {
      id: uuid.v4(),
      sessionId,
      date: (new Date()).toISOString(),
      cmd,
      response: null,
      keys: keys
   };
}

var f = {
   // startTerminal (query) {
   //    return http(`${baseUrl}/api/console/terminal`).post().withJsonBody(query).requestJson(json => {
   //       return json;
   //    })
   //    .catch(err => {
   //       console.log(err);
   //    });
   // },
   // sendTerminal (pid, req) {
   //    return http(`${baseUrl}/api/console/terminal/${pid}`).post().withJsonBody(req).requestJson(json => {
   //       return json;
   //    })
   //    .catch(err => {
   //       console.log(err);
   //    });
   // },
   send (cmd, sessionId, callback) {
      // No command was given
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

      api.sendRequest(request).then(req => {
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
