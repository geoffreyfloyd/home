class Store {
   constructor () {
      this.updates = { value: null };
      this.subscribers = [];
   }

   subscribe (callback) {
      if (this.subscribers.length === 0 && typeof this.onFirstIn !== 'undefined') {
         this.onFirstIn();
      }
      this.subscribers.push(callback);
   }
   
   unsubscribe (callback) {
      for (var i = 0; i < this.subscribers.length; i++) {
         if (callback === this.subscribers[i]) {
            this.subscribers.splice(i, 1);
         }
      }
      // if our callback is
      if (Rx && Rx.Observer && callback instanceof Rx.Observer) {
         callback.dispose();
      }
      if (this.subscribers.length === 0 && typeof this.onLastOut !== 'undefined') {
         this.onLastOut();
      }
   }
   
   notify () {
      for (var i = 0; i < this.subscribers.length; i++) {
         this.subscribers[i](this.updates.value);
      }
   }
      
};

module.exports = {
   Store: Store
};
