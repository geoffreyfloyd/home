/**
 * @module entity-store
 * @description Store for gathering, storing, and distributing entity objects to
 *              client components.
 */
import cacheStore from './cache-store';
import ContextStore from './context-store';
import timerStore from '../timer-store';
import http from 'Libs/http';
import { getType } from 'Libs/type';

/**
 * EntityStore Class
 * inherits from ContextStore. It also implements cacheStore and HubApi.
 */
export default class EntityStore extends ContextStore {
    
    constructor (storeName, version) {
        super();

        // Set storename
        this.storeName = storeName;

        // hubApi.register(storeName, this.requestLatestData);

        // Register store with cache
        cacheStore.register(storeName, {
            entities: {},
            lastChanged: '1900-01-01T00:00:00.000Z',
            version: version
        });
        
        // Initialize server failure retry interval to 15 seconds
        this.retry = 15;
    }
    
    abort (context) {
        // Subscribe need to go through the normal caching pipeline
        var need = this.needOf(context);
        
        // Abort the api call if it is still in progress
        if (need && need.requestInProgress && typeof need.requestInProgress.abort === 'function') {
            need.requestInProgress.abort();
        }
    }

    invalidate (key) {
        return new Promise(resolve => {
            cacheStore.getCache(this.storeName).then(cache => {
                // Get the entity from cache
                var entity = cache.entities[key];
                if (entity) {
                    var need = this.needOf({ key: key });
                    if (need && need.value && need.consumers.length) { 
                        // Invalidate the cache
                        entity.isCacheInvalid = true;
                        
                        // Request latest data from server
                        this.requestLatestData(key);
                    }
                    else {
                        // Cache exists, delete it
                        delete cache.entities[key];
                        
                        // Request persistance of updated cache
                        cacheStore.update(this.storeName, cache);
                    }
                }
                
                // Resolve promise
                resolve();
            });
            return true;
        });
    }
    
    // Subscribes to get the value once, then
    // drops the subsciption
    request (callback, context) {
        // Define Response Handler
        var onResponse = function (cb, result) {
            // Unsubscribe from the node store query
            ContextStore.prototype.unsubscribe.call(this, onResponse, context);
            
            // Invoke original callback
            cb(result);
        }.bind(this, callback);
        
        // Subscribe needs to go through the normal caching pipeline
        ContextStore.prototype.subscribe.call(this, onResponse, context);
    }
    
    // Call Web API to request new data
    requestLatestData (key, done, fail) {
        var promisePlus = _api.getEntity(key, this);
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
            this.update(result, { key: key });

            // Update the global need
            this.update(cacheStore.cache[this.storeName].entities, {});

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
                this.update({ error: err }, { key: key });
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

    /***********************************************************************
     * VIRTUALS
     **********************************************************************/
    /**
     * Override in inherited store to reduce calls to server
     */
    isCacheValid (cacheItem) {
        if (this.defaultRefresh && cacheItem && (cacheItem.lastChecked || cacheItem.lastChanged) && (cacheItem.isCacheInvalid || false) === false ) {
            var preferDate = cacheItem.lastChecked || cacheItem.lastChanged;
            var compareTime = new Date(Date.parse(preferDate)).getTime();
            var timeNow = new Date().getTime();
            // Check if enough time has passed to expect new data
            return Math.abs(timeNow - compareTime) < (this.defaultRefresh * 1000);
        }
        else {
            return false;
        }
    }

    /***********************************************************************
     * CACHE ACCESS
     **********************************************************************/
    getEntityFromCache (key) {
        return new Promise((resolve, reject) => {
            cacheStore.getCache(this.storeName).then(cache => {
                var entity = cache.entities[key] || null;
                // For entity sets, we cache an array of keys
                // and then cache each item separately
                // so to get the entity from cache we need to
                // reconstruct it
                if (getType(entity) === 'array') {
                    entity = entity.map(itemKey => cache.entities[itemKey]);
                }
                resolve(entity);
            }).catch(err => {
                reject(err);
            });
            return true;
        });
    }

    getAllFromCache () {
        return new Promise((resolve, reject) => {
            cacheStore.getCache(this.storeName).then(cache => {
                var entities = cache.entities;
                resolve(entities);
            }).catch(err => {
                reject(err);
            });
            return true;
        });
    }

    /***********************************************************************
     * CONTEXT STORE IMPLEMENTS AND OVERRIDES
     **********************************************************************/
    _onSubscribe (need) {
        if (need.context.key === undefined) {
            throw new Error('Key cannot be undefined!');
        }

        // Get entity from cache and update value / subscribers
        cacheStore.getCache(this.storeName).then(store => {
            var entity = store.entities[need.context.key];
            if (entity) {
                this.update(entity, need.context);
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

    // _onContextInitialize (need) {
    //     if (need.context.hasOwnProperty('key')) {
    //         // Subcribe to be notified of updates to this entity
    //         _hubApi.subscribe(this.storeName, need.context);
    //     }
    //     else {
    //         // Subscribe to be notified of updates to these entities
    //         _hubApi.subscribe(this.storeName, cacheStore.cache[this.storeName].entities);
    //     }
    // }
        
    _onContextDispose (need) {
        // Abort the api call if it is still in progress
        if (need && need.requestInProgress && typeof need.requestInProgress.abort === 'function') {
            need.requestInProgress.abort();
        }
        
        // if (need.context.hasOwnProperty('key')) {
        //     // DO NOT DELETE: Hub API will be in use once DataStreamer is live
        //     // _hubApi.unsubscribe(this.storeName, need.context);
        // }
        // else {
        //     // DO NOT DELETE: Hub API will be in use once DataStreamer is live
        //     // _hubApi.unsubscribe(this.storeName, cacheStore.cache[this.storeName].entities);
        // }
    }
    

    /**
     * Subscribe includes an interval function / number / array of numbers
     * for polling the server
     */
    subscribe (callback: Function, context: {key: string | number}, interval) {
        var need = super.subscribe(callback, context);

        // If interval is a number, then set a refresh interval to check the server
        if (interval) {
            if (typeof interval === 'function') {
                interval = interval(context); // eslint-disable-line no-param-reassign
            }
            if (typeof interval === 'number' && interval > 0) {
                need.intervals = need.intervals || [];

                // Find an existing interval that matches the need context key
                // and the interval number
                var intervalIndex = _indexByInterval(need, context.key, interval);
                var intervalObj;
                if (intervalIndex === -1) {
                    // Create a new interval for this need key and interval number
                    var handleStoreUpdate = this._onChange.bind(this, context.key);
                    intervalObj = {
                        key: context.key,
                        interval: interval,
                        handler: handleStoreUpdate,
                        callbacks: [callback]
                    };
                    need.intervals.push(intervalObj);
                }
                else {
                    // Get ref to intervalobj
                    intervalObj = need.intervals[intervalIndex];
                    // Add this callback
                    intervalObj.callbacks.push(callback);
                }

                // Have TimerStore callback on set interval for polling
                var timerContext = { key: this.storeName + '_' + intervalObj.interval + '_' + context.key, intervals: [intervalObj.interval] };
                timerStore.subscribe(intervalObj.handler, timerContext);
            }
        }
        return need;
    }

    unsubscribe (callback: Function, context: {key: string | number}) {
        // Call ContextStore.unsubscribe
        var need = ContextStore.prototype.unsubscribe.call(this, callback, context);
        // Warn if unsubscribe fails (context wasn't found)
        if (!need) {
            console.warn(new Date().toISOString() + ' : ' + this.storeName + ' could not unsubscribe from: ' + JSON.stringify(context));
        }
        // Clear any intervals that are set on the need
        if (need && need.intervals) {
            // Find the interval by the callback that was used for entity store subscription
            var index = _indexByCallback(need, context.key, callback);
            if (index > -1) {
                // Get reference to interval
                var intervalObj = need.intervals[index];

                // Remove this callback from the interval
                intervalObj.callbacks.splice(_indexOfCallback(intervalObj, callback), 1);
                
                // If this interval has no callbacks left, remove interval from need
                if (intervalObj.callbacks.length === 0) {
                    var timerContext = { key: this.storeName + '_' + intervalObj.interval + '_' + context.key, intervals: [intervalObj.interval] };
                    // Unsubscribe from timer store
                    timerStore.unsubscribe(intervalObj.handler, timerContext);
                    // Remove interval from the need's list
                    need.intervals.splice(index, 1);
                }
                
            }
            else {
                // Warn if timer unsubscribe fails (context wasn't found by need)
                console.warn(new Date().toISOString() + ' : ' + this.storeName + ' could not find timer subscription by callback');
            }
        }

        return need;
    }
    
    updateCache (key, value) {
        return new Promise(function (resolve) {
            cacheStore.getCache(this.storeName).then(function (cache) {
                var lastChecked = new Date().toISOString();
                // Value is null when there is nothing new from the server
                if (value === null) {
                    // Update a lastChecked field to help validate cache
                    if (key) {
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
                    if (value && this.subEntities && getType(value[this.subEntities]) === 'array') {
                        // call for each individual entity
                        // Flatten Sub Entity Results in Cache
                        value[this.subEntities].forEach(function (each) {
                            // Recursive call to add/update this entity
                            cache.entities[each.key] = { ...each, lastChecked };
                            
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
            }.bind(this));
            return true;
        }.bind(this));
    }

    /***********************************************************************
     * STORE TO STORE SUBSCRIBER CALLBACK
     **********************************************************************/
    /**
     * This is used when subscribing to the timer store for polling
     * because subscribing to requestLatestData result in passing 'done' the
     * timer-store updated result
     */
    _onChange (key) {
        this.requestLatestData(key);
    }
}

/***********************************************************************
 * METHODS
 **********************************************************************/
var _indexByCallback = function (need, key, callback) {
    for (var i = 0; i < need.intervals.length; i++) {
        if (key === need.intervals[i].key) {
            for (var j = 0; j < need.intervals[i].callbacks.length; j++) {
                if (need.intervals[i].callbacks[j] === callback) {
                    return i;
                }
            }
        }
    }
    return -1;
};

var _indexOfCallback = function (interval, callback) {
    for (var j = 0; j < interval.callbacks.length; j++) {
        if (interval.callbacks[j] === callback) {
            return j;
        }
    }
    return -1;
};

var _indexByInterval = function (need, key, interval) {
    for (var i = 0; i < need.intervals.length; i++) {
        if (key === need.intervals[i].key && interval === need.intervals[i].interval) {
            return i;  
        }
    }
    return -1;
};

/***********************************************************************
 * REST API
 **********************************************************************/
var _api = {
    /**
     * Call the REST API using a conventions-based url
     * to return a single entity
     */
    getEntity: function (key, me) {
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
        
        var lastChanged = '1900-01-01T00:00:00.000Z';
        var version = 0;
        
        // Get last changed from entity
        var entities = cacheStore.cache[me.storeName] ? cacheStore.cache[me.storeName].entities || {} : {};
        var entity = entities[key] || null;
        if (entity !== null) {
            lastChanged = entity.lastChanged || lastChanged;
            version = entity.version || version;
        }
        else if (cacheStore.cache[me.storeName]) {
            // Get last changed from entity collection
            lastChanged = cacheStore.cache[me.storeName].lastChanged || lastChanged;
            version = cacheStore.cache[me.storeName].version || version;
        }

        if (requestBody === null) {    
            // GET Simple Url Request
            return http(
                clientApp.HOST_NAME + '/api/'
                    + me.storeName + '/' + String(key || 0)
                    + '?lastChanged=' + lastChanged
                    + '&version=' + version).withCreds().requestJson();
        }
        else {
            // POST Json Request Body
            return http(
                clientApp.HOST_NAME + '/api/' + me.storeName
                    + '?lastChanged=' + lastChanged
                    + '&version=' + version).post().withCreds().withJsonBody(requestBody).requestJson();
        }
    },
};

// DO NOT DELETE: Hub API will be in use once DataStreamer is live
// var _hubApi = {
//     /**
//      * Subscribe to receive notifications of updates to an entity
//      * @param storeName {string} The type of entity
//      * @param value {object, Array} An object or array of objects that has
//      *        a property named 'key' of type int.
//      */
//     subscribe: function (storeName, value) {
//         if (getType(value) === 'array') {
//             for (var i = 0; i < value.length; i++) {
//                 _hubApi.subscribe(storeName, value[i]);
//             }
//         }
//         else {
//             hubApi.subscribe(storeName, value.key);
//         }
//     },
//     /**
//      * Unsubscribe to stop receiving notifications of updates to an entity
//      * @param storeName {string} The type of entity
//      * @param value {object, Array} An object or array of objects that has
//      *        a property named 'key' of type int.
//      */
//     unsubscribe: function (storeName, value) {
//         if (getType(value) === 'array') {
//             for (var i = 0; i < value.length; i++) {
//                 _hubApi.unsubscribe(storeName, value[i]);
//             }
//         }
//         else {
//             hubApi.unsubscribe(storeName, value.key);
//         }
//     }
// };
