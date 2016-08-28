import cacheStore from 'stores/cache-store';
/**
 * Use this store to abstract the application's host.
 * Wrap up all 'window' and 'document' references here
 * and do not reference them anywhere else in the application
 *
 * All methods are mocked - in a sort, the strategy is
 * to feign success when no implementation exists, however,
 * to proceed as expected when an implementation does exist
 */
class Host {
   constructor () {
      this.context = new ContextHistory();

      // Register store with cache
      cacheStore.register('host', {
         version: 1,
      });

      var formDataMock = function () {
         this.append = function () {
            // just a mock for now
         };
      };

      // Window is default host provider
      /* eslint-disable no-undef */
      if (window) {
         this.providers = {
            go: function (url) {
               window.location.href = url;
            },
            close: function () {
               window.location.href = '/';
            },
            hasRole: function () {
               return true;
            },
            notify: function (msg) {
               window.alert(msg); // eslint-disable-line no-alert
            },
            prompt: function (requestMsg, responseCb) {
               var result = window.prompt(requestMsg); // eslint-disable-line no-alert
               responseCb(result);
            },
            setTitle: function (title) {
               window.document.title = title;
            },
            reportError: function (err) {
               console.log(err);
            },
            closeWindow: function () {
               // DO NOTHING
            },
            newWindow: function (/* component */) {
               // DO NOTHING
            }
         };
         this.FormData = global.window.FormData || formDataMock;

         // Tap in to window navigation history
         var handleBrowserStateChange = function (e) {
            if (e.state) {
               this.context.set(e.state, true);
            }
         }.bind(this);
         window.onpopstate = handleBrowserStateChange;

         // Tap in to window error event
         var handleWindowOnError = function () {
            this.providers.reportError(arguments);
         }.bind(this);
         window.onerror = handleWindowOnError;
      }
      /* eslint-enable no-undef */

      // MOCK
      if (!this.providers) {
         this.providers = {
            go: function () {
               // DO NOTHING
            },
            close: function () {
               // DO NOTHING
            },
            hasRole: function () {
               return true;
            },
            notify: function () {
               // DO NOTHING
            },
            prompt: function (requestMsg, responseCb) {
               responseCb('');
            },
            setTitle: function () {
               // DO NOTHING
            },
            closeWindow: function () {
               // DO NOTHING
            },
            newWindow: function (/* component */) {
               // DO NOTHING
            }
         };
      }
   }

   /*************************************************************
    * METHODS
    *************************************************************/
   go (uri, context) {
      this.providers.go(uri, context);
   }

   close (uri, context) {
      this.providers.close(uri, context);
   }

   hasRole (role) {
      return this.providers.hasRole(role);
   }

   notify (msg, kind) {
      this.providers.notify(msg, kind);
   }

   // always use callback-style prompt
   prompt (request, callback) {
      this.providers.prompt(request, callback);
   }

   reportError (err) {
      this.providers.reportError(err);
   }

   setTitle (title) {
      this.providers.setTitle(title);
   }

   closeWindow () {
      this.providers.closeWindow();
   }

   newWindow (component) {
      this.providers.newWindow(component);
   }
}


/**
 * Simple Pub/Sub Implementation that uses window.history to store history of context value
 */
class ContextHistory {
   constructor () {
      this._context = {};
      this._subscribers = [];
   }

   get () {
      return cacheStore.getCache('host').then(cache => Object.assign(this._context, cache));
   }

   set (context) {
      cacheStore.getCache('host').then(cache => {
         cacheStore.update('host', Object.assign(this._context, cache, context));
         this.notify(this._context);
      });
   }

   notify (context) {
      this._subscribers.slice().forEach(s => s(context));
   }

   subscribe (notifyCb) {
      this._subscribers.push(notifyCb);
      this.get().then(cache => notifyCb(cache));
   }

   unsubscribe (notifyCb) {
      for (var i = 0; i < this._subscribers.length; i++) {
         if (this._subscribers[i] === notifyCb) {
            this._subscribers.splice(i, 1);
            break;
         }
      }
   }
}

// Export instance
var singleton = new Host();
export default singleton;
