import GnodeStore from './gnode-store';
import those from 'those';

class PlanStepStore extends GnodeStore {

   constructor () {
      super('Doozy', 'PlanStep');
   }

   new (planId, parentId, name, ordinal) {
      // return object literal
      return {
         isNew: true,
         id: GnodeStore.uuid(),
         kind: 'Step',
         name: name || '',
         status: 'Todo',
         created: new Date().toISOString(),
         duration: null,
         content: null,
         tagName: null,
         planId,
         parentId,
         ordinal: ordinal || 1,
      };
   }

   save (model) {
      if (model.isNew) {
         return this.create(model);
      }
      return this.update(model);
   }

   filterChildren (nodes, parentId) {
      return those(nodes).like({ parentId });
   }

   calculateNewPlanStep (parentId, planId, planSteps) {
      var steps = this.filterChildren(planSteps || [], parentId);
      var nextOrdinal = 1;
      if (steps.length > 0) {
         steps = those(steps).sort('ordinal');
         steps.reverse();
         nextOrdinal = steps[0].ordinal + 1;
      }

      return this.new(planId, parentId, '+', nextOrdinal);
   }
}

// Export instance
var singleton = new PlanStepStore();
export default singleton;
