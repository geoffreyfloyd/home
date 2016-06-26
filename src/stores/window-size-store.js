import {Store} from './store';
var window = global.window || { innerWidth: 800, innerHeight: 600 };

class WindowSizeStore extends Store {
   constructor () {
      super();
      
      // Bind instance to handler
      this._onWindowResize = this._onWindowResize.bind(this);
      this._onWindowResize();
   }
   
   _onWindowResize () {
      this.updates.value = {
         width: window.innerWidth,
         height: window.innerHeight
      };
      this.notify();
   }

   onFirstIn () {
      window.addEventListener('resize', _onWindowResize);
      onWindowResize();
   }

   onLastOut () {
      window.removeEventListener('resize', onWindowResize);
   }
};

export default new WindowSizeStore();
