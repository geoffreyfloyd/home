import GnodeStore from './gnode-store';

// var TARGET_MEASURE = {
//    EXECUTION: 0,
//    PROGRESS: 1,
//    DURATION: 2,
// };

// var TARGET_PERIOD = {
//    YEARS: 0,
//    MONTHS: 1,
//    WEEKS: 2,
//    DAYS: 3,
// };

class TargetStore extends GnodeStore {

   constructor () {
      super('Doozy', 'Target');
   }

   new (name) {
      var iso = (new Date()).toISOString();
      return {
         isNew: true,
         id: GnodeStore.uuid(),
         created: iso,
         name: name || '',
         entityType: 'Tag',
         entityId: null,
         measure: null, // BY_EXECUTION = 0, BY_PROGRESS = 1, BY_DURATION = 2
         target: null, /* Depends on measure: BY_EXECUTION - The target number of executions within a single period.
                                              BY_PROGRESS - The target percentage of progress within a single period.
                                              BY_DURATION - The target number of minutes spent within a single period. */
         starts: iso,
         period: null,
         multiplier: 1,
         number: 1,
         retireWhenMet: false,
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
var singleton = new TargetStore();
export default singleton;
