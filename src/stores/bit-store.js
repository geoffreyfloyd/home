import GnodeStore from './gnode-store';

class BitStore extends GnodeStore {
   constructor () {
      super('Gnidbits', 'Bit');
   }

   new () {
      return {
         isNew: true,
         id: GnodeStore.uuid(),
         caption: '',
         videos: [],
         images: [],
         links: [],
         notes: [],
         texts: [],
         tags: [],
      };
   }

   save (model) {
      // Create new bit
      if (model.isNew) {
         model.slug = global.window.location.href.split('/').slice(-1)[0];
         return this.create(model);
      }
      // Update existing bit
      return this.update(model);
   }
}

// Export instance
var singleton = new BitStore();
export default singleton;
