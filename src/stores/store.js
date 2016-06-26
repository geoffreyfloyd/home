/**
 * Barebones pub/sub store intended to be extended for extremely simple-model use-cases
 */
export default class Store {
   constructor () {
      this.updates = { value: null };
      this.subscribers = [];
   }

   /**
    * Notify subscribers that the value has been updated
    */
   notify () {
      for (var i = 0; i < this.subscribers.length; i++) {
         this.subscribers[i](this.updates.value);
      }
   }

   /**
    * Subscribe to the store to receive a callback each time the store value is updated
    */
   subscribe (callback) {
      if (this.subscribers.length === 0 && typeof this.onFirstIn !== 'undefined') {
         this.onFirstIn();
      }
      this.subscribers.push(callback);
   }

   /**
    * Unsubscribe from the store to stop receiving callbacks each time the store value is updated
    */
   unsubscribe (callback) {
      // remove the subscriber
      for (var i = 0; i < this.subscribers.length; i++) {
         if (callback === this.subscribers[i]) {
            this.subscribers.splice(i, 1);
         }
      }

      // duck-type dispose check (Rx.Observer)
      if (callback.hasOwnProperty('dispose') && typeof callback.dispose === 'function') {
         callback.dispose();
      }

      // cleanup on last out
      if (this.subscribers.length === 0 && typeof this.onLastOut !== 'undefined') {
         this.onLastOut();
      }
   }

   /**
    * Update the store value with the new value and notify subscribers
    */
   update (value) {
      this.updates.value = value;
      this.notify();
   }
}
