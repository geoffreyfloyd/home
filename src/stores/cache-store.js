import localForage from 'localforage';
import AES from 'crypto-js/aes';
import utf8 from 'crypto-js/enc-utf8';
import Promise from 'bluebird';
import EventHandler from '../libs/event-handler';

const defaultCache = {
   version: 1, // increment this when changes to the caching could fail with old cache
};

const secret = 'sr89hcsjk8923';

/**
 * Cache & Local Storage
 * :: This is shared by all stores that utilize client-side caching
 */
export class CacheStore {
   constructor (name) {
      this.name = name;
      this.cache = Object.assign({}, defaultCache);
      this.queue = [];
      this.loaded = false;
      this.load();
      this.registration = {};

      // 10 second throttle to wrapper around
      // method to only persist to client-side
      // storage once all the stores are done updating.
      // It could be beneficial to push this throttle
      // even higher without significant negative consequences.
      this.save = EventHandler.create();
      this.save
         .debounce(10000)
         .subscribe(this.saveNow.bind(this));
   }

   // Clear this cache
   clear () {
      localForage.removeItem(this.name);
   }

   // Clear entire database linked to this url
   clearAll () {
      localForage.clear();
   }

   /**
    * Update the store's cache.
    * @param storeName {string} The type of entity
    * @param cache {object} The store's new cache
    */
   update (storeName, cache) {
      var func = function () {
         // Set store's cache
         this.cache[storeName] = cache;

         // Request persistance of updated cache
         this.save();
      }.bind(this);

      if (!this.loaded) {
         this.queue.push(func);
      }
      else {
         func();
      }
   }

   /**
    * Load the local cache from local storage using an
    * encryption key unique to the user, so if the user
    * has changed (and thus the encryption key has changed)
    * then the cache will be set to an empty object.
    */
   load () {
      return localForage.getItem(this.name).then(function (encrypted) {
         var cache, reg;

         // Try to decrypt stored data
         try {
            var decrypted = AES.decrypt(encrypted, secret);
            cache = JSON.parse(decrypted.toString(utf8));
         }
         catch (ex) {
            cache = encrypted;
         }

         // Check Cache-Store version and reset cache to default if it doesn't match current
         if (!cache || typeof cache === 'string' || cache.version !== defaultCache.version) {
            cache = Object.assign({}, defaultCache);
         }

         // Process store registrations
         for (reg in this.registration) {
            // Check Registered-Store version and reset cache to default if it doesn't match current
            if (this.registration[reg] && (!cache[reg] || (cache[reg] && cache[reg].version !== this.registration[reg].version))) {
               // No Cache Loaded or Loaded Cache doesn't match registered version
               cache[reg] = Object.assign({}, this.registration[reg]);
            }
         }

         // Safe copy to ensure we don't mess up the clean cache
         this.cache = Object.assign({}, this.cache, cache);

         // We're loaded up
         this.loaded = true;

         // Process queue of funcs that were waiting on load
         this.queue.forEach(function (func) { func(); });
         this.queue = [];
      }.bind(this));
   }

   /**
    * Register store with clean state to ensure we properly
    * initialize them and give it to them as soon as its available.
    */
   register (storeName, clean) {
      this.registration[storeName] = clean;
      if (this.loaded) {
         this.cache[storeName] = this.cache[storeName] || clean;
         if (clean.version && this.cache[storeName].version !== clean.version) {
            this.cache[storeName] = Object.assign({}, this.registration[storeName]);
         }
      }
   }

   /**
    * Save the local cache of entities to local storage using an
    * encryption key unique to the user.
    */
   saveNow () {
      var value = JSON.stringify(this.cache);
      var encrypted = AES.encrypt(value, secret);
      return localForage.setItem(this.name, encrypted.toString());
   }

   /**
    * Retrieve entity object from local cache, or null if the entity is
    * not found
    * @param storeName {string} The type of entity
    * @param id {int, string} The id of the entity
    * @return Entity object of matching id, or null if not found
    */
   getCache (storeName) {
      return new Promise(function (resolve, reject) {

         var _isLoaded = function () {
            if (!this.cache[storeName]) {
               reject(new Error(storeName + ' is not a registered cache store'));
            }
            resolve(this.cache[storeName]);
         }.bind(this);

         if (!this.loaded) {
            this.queue.push(_isLoaded);
         }
         else {
            _isLoaded();
         }
         return;
      }.bind(this));
   }
}

/**
 * Return singleton CacheStore
 */
var singleton = new CacheStore('clientCache');
// Make the clear cache method available in the console
// so dev and support can utilize this to resolve issues
global.ae = global.ae || {};
global.ae.clearAllCache = singleton.clearAll;
if (process.env.NODE_ENV !== 'production') {
   global.ae.cacheStore = singleton;
}
export default singleton;
