import GnodeStore from './gnode-store';

class FocusStore extends GnodeStore {

   constructor () {
      super('Doozy', 'Focus');
   }

   new (name) {
      return {
         isNew: true,
         id: GnodeStore.uuid(),
         created: (new Date()).toISOString(),
         kind: 'Role',
         name: name || '',
         tagName: '',
         iconUri: null,
      };
   }

   save (model) {
      if (model.isNew) {
         return this.create(model);
      }
      return this.update(model);
   }
}

// Export instance
var singleton = new FocusStore();
export default singleton;
