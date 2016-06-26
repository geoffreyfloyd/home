import Store from './store';

class WindowSizeStore extends Store {
   constructor () {
      super();
      this._onWindowResize = this._onWindowResize.bind(this);
   }

   getSize () {
      return {
         width: window.innerWidth,
         height: window.innerHeight,
         clientWidth: document.body.clientWidth,
         clientHeight: document.body.clientHeight,
      };
   }

   refresh () {
      this.notify(this.getSize());
   }

   onFirstIn () {
      window.addEventListener('resize', this._onWindowResize);
      this._onWindowResize();
   }

   onLastOut () {
      window.removeEventListener('resize', this._onWindowResize);
   }

   _onWindowResize () {
      this.update(this.getSize());
   }
}

var singleton = new WindowSizeStore();
export default singleton;
