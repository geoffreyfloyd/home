import those from 'those';

function areExact (source, matchArg) {
    var matchArgType, matchProp, sourceProp;
    
    // Get normalized type of object
    matchArgType = getType(matchArg);
    
    if (['string', 'number', 'date'].indexOf(matchArgType) > -1) {
        // Simple equals comparison
        return source === matchArg;
    }
    else if (matchArgType === 'function') {
        // Predicate function comparison
        return matchArg(source);
    }
    else {
        // Object props comparison (everything in matchArg[object] should match in source)
        for (matchProp in matchArg) { // eslint-disable-line one-var
            if (matchArg.hasOwnProperty(matchProp)) {
                var matchPropType = getType(matchArg[matchProp]);
                // If it's not the same type, then it's not alike
                if (matchPropType !== getType(source[matchProp])) {
                    return false;
                }
                // A nested array would need to have exactly the same array items
                if (matchPropType === 'array' && !those(matchArg[matchProp]).hasOnly(source[matchProp])) {
                    return false;
                }
                else if (!areExact(source[matchProp], matchArg[matchProp])) {
                    return false;
                }
            }
        }
        // Object props comparison (everything in source should match in matchArg[object])
        for (sourceProp in source) { // eslint-disable-line one-var
            if (source.hasOwnProperty(matchProp)) {
                var sourcePropType = getType(source[sourceProp]);
                // If it's not the same type, then it's not alike
                if (sourcePropType !== getType(matchArg[sourceProp])) {
                    return false;
                }
                // A nested array would need to have exactly the same array items
                if (sourcePropType === 'array' && !those(source[sourceProp]).hasOnly(matchArg[sourceProp])) {
                    return false;
                }
                else if (!areExact(matchArg[sourceProp], source[sourceProp])) {
                    return false;
                }
            }
        }
        // Nothing was unalike, so the object matches!
        return true;
    }
}

// get sane type names for string, number, date, and array
function getType (arg) {
    return Object.prototype.toString.call(arg).slice(8, -1).toLowerCase();
}


/**
 * Consumer is a callback along with any options
 * that the subscriber registered with.
 */
class Consumer {
    constructor (callback, options) {
        this.callback = callback;
        this.options = options;
    }
}

/**
 * Need is a collection of consumers subscribed to a context,
 * along with the current value.
 */
class Need {
    constructor (context) {
        this.value = null;
        this.consumers = [];
        this.context = context;
    }
}

/**
 * ContextStore is a store that separates values by the 
 * context object passed in when subscribing, ie. {id: 1}
 */
export default class ContextStore {
    constructor () {
        this.needs = [];
    }

    /**
     * Hook up a callback to be called when an
     * update matching the given context is available.
     * @param {function} callback The callback to be registered.
     * @param {object} context The context of which to be notified.
     * @param {object} options Options that affect the behavior of the subscription.
     * @return {object} The context that was subscribed to. 
     */
    subscribe (callback, context, options) {
        /** 
         * Find existing need by context
         */
        var need = this.needOf(context);

        /**
         * Create new context if no matching context was found
         */
        if (!need) {
            need = new Need(context);
            this.needs.push(need);
        }

        /**
         * Add new consumer to context
         */
        need.consumers.push(new Consumer(callback, options));

        /**
         * Call _onContextInitialize if this is the first consumer
         * and the function was implemented
         */
        if (need.consumers.length === 1 && this._onContextInitialize) {
            this._onContextInitialize(need);
        }

        /**
         * Call _onSubscribe if the function was implemented
         */
        if (this._onSubscribe !== undefined) {
            this._onSubscribe(need);
        }

        return need;
    }

    /**
     * Unhook a callback from a given context.
     * @param {function} callback The callback to be unregistered.
     * @param {object} context The context to unregister from.
     * @return {object} The context that was unsubscribed from.
     */
    unsubscribe (callback, context) {
        // return if context not found
        var index = this.indexOf(context);
        if (index === -1) {
            return;
        }

        var need = this.needs[index];

        // detach consumer
        for (var i = 0; i < need.consumers.length; i++) {
            if (need.consumers[i].callback === callback) {
                need.consumers.splice(i, 1);
                break;
            }
        }

        // no more consumers of this need?
        if (need.consumers.length === 0) {
            if (this._onContextDispose !== undefined) {
                this._onContextDispose(need);
            }
            this.needs.splice(index, 1);
        }

        // after unsubscribe callback
        if (this._onUnsubscribe) {
            this._onUnsubscribe();
        }

        return need;
    }

    /**
     * Return need with matching context, or null if a match doesn't exist.
     * @param {object} context The context values we want to match
     * @returns
     */
    needOf (context) {
        var index = this.indexOf(context);
        if (index === -1) {
            return null;
        }
        return this.needs[index];
    }

    /**
     * Return index of need with matching context, or -1 if a match doesn't exist.
     */
    indexOf (context) {
        for (var i = 0; i < this.needs.length; i++) {
            if (areExact(context, this.needs[i].context)) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Update value and notify consumers in need
     */
    updateContext (value, context) {
        // TODO: instead of finding one specific context, find
        //       all needs that include this context
        //       ie. context {} INCLUDES context { id: 1 }
        var need = this.needOf(context);
        if (!need) {
            return;
        }

        need.value = value;
        need.consumers.map(function (consumer) {
            consumer.callback(value);
        });
    }
}
