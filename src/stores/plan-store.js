import GnodeStore from './gnode-store';

class PlanStore extends GnodeStore {

   constructor () {
      super('Doozy', 'Plan');
   }

   new (name) {
      return {
         isNew: true,
         id: GnodeStore.uuid(),
         created: (new Date()).toISOString(),
         kind: 'Goal',
         name: name || '',
         duration: 0,
         tagName: null,
         content: null,
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
var singleton = new PlanStore();
export default singleton;
