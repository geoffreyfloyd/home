/**
 * @module gnode-store
 * @description Store for gathering, storing, and distributing gnode objects to
 *              client components.
 */
// PACKAGES
import uuid from 'uuid';
// LIBS
import http from '../libs/http';
import { getType } from '../libs/type';
// STORES
import cacheStore from './cache-store';
import ContextStore from './context-store';

// Set base url
var baseUrl = '';
if (global.window) {
   baseUrl = window.location.href.split('/').slice(0, 3).join('/');
}

/**
 * GnodeStore Class
 */
export default class GnodeStore extends ContextStore {

   static uuid () {
      return uuid.v4();
   }

   constructor (appName, storeName, version) {
      super();

      // Field level variables
      this.appName = appName;
      this.storeName = storeName;
      this.retry = 5;
      this.url = `${baseUrl}/api/${this.appName.toLowerCase()}/${this.storeName.toLowerCase()}`;

      // Register store with cache
      cacheStore.register(storeName, {
         entities: {},
         lastChanged: '1900-01-01T00:00:00.000Z',
         version: version,
      });

      // Initialize server failure retry interval to 15 seconds
      this.retry = 15;

      this.updateStore = this.updateStore.bind(this);
   }

   /**
    * Store Methods
    */
   create (model) {
      return http(this.url).post().withCreds().withJsonBody(model).requestJson().then(this.updateStore);
   }

   destroy (id) {
      return http(`${this.url}/${id}`, { method: 'DELETE' }).withCreds().requestJson().then(this.updateStore);
   }

   get (key) {
      // Check if key is a stringified JSON object
      var requestBody = null;
      if (typeof key === 'string' && key.indexOf('{') > -1) {
         try {
            var jsonObj = JSON.parse(key);
            if (typeof jsonObj === 'object') {
               requestBody = jsonObj;
            }
         }
         catch (e) {
            console.log(e);
         }
      }

      if (requestBody === null) {
         return http(`${this.url}/${key}`).withCreds().requestJson();
      }
      return http(`${this.url}/filter`).post().withCreds().withJsonBody(requestBody).requestJson();
   }

   update (model) {
      return http(this.url).put().withCreds().withJsonBody(model).requestJson().then(this.updateStore);
   }

   updateStore (newModel) {
      this.updateCache(newModel.id || newModel.key, newModel);
      this.updateContext(newModel, { key: newModel.id || newModel.key });
      this.updateContext(cacheStore.cache[this.storeName].entities, { key: '*' });
      return newModel;
   }

   /***********************************************************************
    * VIRTUALS
    **********************************************************************/
   /**
    * Override in inherited store to reduce calls to server
    */
   isCacheValid (cacheItem) {
      if (this.defaultRefresh && cacheItem && (cacheItem.lastChecked || cacheItem.lastChanged) && (cacheItem.isCacheInvalid || false) === false) {
         var preferDate = cacheItem.lastChecked || cacheItem.lastChanged;
         var compareTime = new Date(Date.parse(preferDate)).getTime();
         var timeNow = new Date().getTime();
            // Check if enough time has passed to expect new data
         return Math.abs(timeNow - compareTime) < (this.defaultRefresh * 1000);
      }
      return false;
   }

   _onSubscribe (need) {
      if (need.context.key === undefined) {
         throw new Error('Key cannot be undefined!');
      }

        // Get entity from cache and update value / subscribers
      cacheStore.getCache(this.storeName).then(store => {
         var entity = store.entities[need.context.key];
         if (entity) {
            this.updateContext(entity, need.context);
         }

            // Is the current cache sufficient?
         if (!entity || !this.isCacheValid(entity)) {
                // If this need already has a request in progress
                // then do not start another request
            if (!need.requestInProgress) {
               var funcFinally = function () {
                  need.requestInProgress = null;
               };
                    // Check server for update to this entity, passing entity with
                    // lastChanged value if available
               need.requestInProgress = this.requestLatestData(need.context.key);
               var abort = need.requestInProgress.abort;

               need.requestInProgress = need.requestInProgress.then(funcFinally).catch(funcFinally);
               need.requestInProgress.abort = abort;
            }
         }
      });
   }

    // Call Web API to request new data
   requestLatestData (key, done, fail) {
      var promisePlus = this.get(key);
      var abort = promisePlus.abort;
      promisePlus = promisePlus.then(result => {
         // Reset retry interval to 5 seconds
         // on a successful call
         this.retry = 15;

         // Returns null when no update is available
         // based on the latest update
         if (!result) {
            // done callback
            this.updateCache(key, result);
            (done || function () { })(null);
            return;
         }

         // Merge Result Store Hook (result must have truthy `merge` prop)
         if (result.merge && this._onMergeResult) {
            var entity = cacheStore.cache[this.storeName].entities[key];
            if (entity) {
               this._onMergeResult(key, result, entity);
            }
         }

         // Process Result Store Hook
         if (this._onProcessResult) {
            this._onProcessResult(key, result);
         }

         // Update the local stash of entities
         this.updateCache(key, result);

         // Call Got New Data handler
         if (typeof this.onGotNewData === 'function') {
            this.onGotNewData(result);
         }

         // if a specific need exists for this key
         // then update the value and notify subscribers
         this.updateContext(result, { key: key });

         // Update the global need
         this.updateContext(cacheStore.cache[this.storeName].entities, { key: '*' });

         // done callback
         (done || function () { })(result);
      }).catch(err => {
         // Get response object
         var response;
         if (err && err.response) {
            response = err.response;
         }
         else {
            response = err;
         }

         // jQuery Promise Aborted
         if (response && response.statusText && response.statusText === 'abort') {
            return;
         }

         // Bad Request
         if (response && response.status === 400) {
                // Notify subscribers of bad request
                // if a specific need exists for this key
                // then update the value and notify subscribers
            this.updateContext({ error: err }, { key: key });
            (fail || function () { })(err);
            return;
         }

         // These http response statuses could be
         // temporary problems and should be retried
         var retryOnHttpStatusCodes = [
            404, // Not Found (but may be available in the future)
            408, // Request Timed Out
            429, // Too many requests
            503, // Service unavailable
            504, // Gateway Timeout
         ];

         // Check if this request should be retried
         if (response && response.status && this.retry <= 120 && retryOnHttpStatusCodes.indexOf(response.status) > -1) {
            // Log to console that an error occurred
            if (process.env.NODE_ENV !== 'production') {
               console.log(this.storeName + ' store got an error response from the server, trying again in ' + this.retry + ' seconds...');
            }

            // Retry this request in 15-120 seconds
            setTimeout(() => this.requestLatestData(key), this.retry * 1000);

            // If it fails again, we'll wait 15 additional
            // seconds to give it enough time to resolve itself
            this.retry += 15;
         }

         if (!response || retryOnHttpStatusCodes.indexOf(response.status) === -1) {
            // fail callback
            (fail || function () { })(err);
            // Throw the error so the global error handler catches this
            throw err;
         }
      });
      promisePlus.abort = abort;
      return promisePlus;
   }

   updateCache (key, value) {
      return new Promise(resolve => {
         cacheStore.getCache(this.storeName).then(cache => {
            var lastChecked = new Date().toISOString();
            // Value is null when there is nothing new from the server
            if (value === null) {
               // Update a lastChecked field to help validate cache
               if (key !== '*') {
                  var entity = cache.entities[key];
                  if (entity) {
                     entity.lastChecked = lastChecked;
                  }
               }
               else {
                  cache.lastChecked = lastChecked;
               }
            }
            else {
               // Value contains an Entity Set
               if (value && getType(value.results) === 'array') {
                  // call for each individual entity
                  // Flatten Sub Entity Results in Cache
                  value.results.forEach(each => {
                     // Recursive call to add/update this entity
                     cache.entities[each.id] = { ...each, lastChecked };

                     // Get the latest last changed value
                     // from the entities in the array
                     if (each.lastChanged > cache.lastChanged) {
                        cache.lastChanged = each.lastChanged;
                     }
                     // Get the version value
                     // from the entities in the array
                     if (each.version > cache.version) {
                        cache.version = each.version;
                     }
                  });
               }

               // Value is an Entity
               cache.entities[key] = { ...value, lastChecked };
            }

            // Request persistance of updated cache
            cacheStore.update(this.storeName, cache);

            // Resolve promise
            resolve(cache);
         });
         return true;
      });
   }
}
