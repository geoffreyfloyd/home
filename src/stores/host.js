import cacheStore from 'stores/cache-store';

/**
 * WARNING: ALL STORES RETURN AN INSTANCE AND ARE IMPLICIT SINGLETONS THAT SHOULD
 * NEVER BE SHARED INDIRECTLY BETWEEN MODULES, AS IT COULD
 * RESULT IN TWO SEPARATE RUNNING INSTANCES (TWO SEPARATE WEBPACKED FUNCTIONS)
 *
 * justjs.com/posts/singletons-in-node-js-modules-cannot-be-trusted-or-why-you-can-t-just-do-var-foo-require-baz-init
 *
 * Use this store to abstract the application's host
 * , wrap up all 'window' and 'document' references here
 * and do not reference them anywhere else in the application
 *
 * All methods are mocked - in a sort, the strategy is
 * to feign success when no implementation exists, however,
 * to proceed as expected when an implementation does exist
 *
 * IN THE FUTURE!!!
 * Choose host provider based on current context, this means we can have multiple providers
 * of a single host function and have it pick the one that fits the current user context
 * -- this means if the user's context includes do-not-disturb, applications that would have otherwise
 * used a 'notify' provider that have disturbed the user can either be silently ignored or simply put
 * a less in-you-face placement, such as upping the number of notifications in a notification icon.
 */
// TODO: do provider (ie. window) specific setup when requiring.
//       resulting functions should be swift and direct to the appropriate provider
var Host = function () {
   // store.Store.call(this);
   // var me = this;

   this.context = new Context();

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
   if (global.window) {
      this.providers = {
         go (url) {
            global.window.location.href = url;
         },
         notify (msg) {
            global.window.alert(msg); // eslint-disable-line no-alert
         },
         prompt (requestMsg, responseCb) {
            var result = global.window.prompt(requestMsg); // eslint-disable-line no-alert
            responseCb(result);
         },
         setTitle (title) {
            global.window.document.title = title;
         },
      };
      this.FormData = global.window.FormData || formDataMock;
   }
   /* eslint-enable no-undef */

   // MOCK
   if (!this.providers) {
      this.providers = {
         go () {
            // DO NOTHING
         },
         notify () {
            // DO NOTHING
         },
         prompt (requestMsg, responseCb) {
            responseCb('');
         },
         setTitle () {
            // DO NOTHING
         },
      };
      this.FormData = formDataMock;
   }
};

Host.prototype = {

   go (uri, context) {
      this.providers.go(uri, context);
   },

   notify (msg, kind) {
      this.providers.notify(msg, kind);
   },

   // always use callback-style prompt
   prompt (request, callback) {
      this.providers.prompt(request, callback);
   },

   setTitle (title) {
      this.providers.setTitle(title);
   },
};

var Context = function () {
   this._context = {};
   this._subscribers = [];
};

Context.prototype = {
   get () {
      return cacheStore.getCache('host').then(cache => Object.assign(this._context, cache));
   },
   set (context) {
      cacheStore.getCache('host').then(cache => {
         cacheStore.update('host', Object.assign(this._context, cache, context));
         this.notify(this._context);
      });
   },
   notify (context) {
      this._subscribers.slice().forEach(s => s(context));
   },
   subscribe (notifyCb) {
      this._subscribers.push(notifyCb);
      notifyCb(this.get());
   },
   unsubscribe (notifyCb) {
      for (var i = 0; i < this._subscribers.length; i++) {
         if (this._subscribers[i] === notifyCb) {
            this._subscribers.splice(i, 1);
            break;
         }
      }
   },
};

const host = new Host();
export default host;
