import GnodeStore from './gnode-store';

class ActionStore extends GnodeStore {

   constructor () {
      super('Doozy', 'Action', 1);
   }

   new () {
      return {
         isNew: true,
         id: GnodeStore.uuid(),
         kind: 'Action',
         name: '',
         created: (new Date()).toISOString(),
         duration: 0,
         content: null,
         beginDate: null,
         nextDate: null,
         isPublic: false,
         lastPerformed: null,
         tags: [],
         recurrenceRules: [],
         items: [],
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
var singleton = new ActionStore();
export default singleton;
