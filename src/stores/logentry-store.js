import GnodeStore from './gnode-store';

class LogEntryStore extends GnodeStore {

   constructor () {
      super('Doozy', 'LogEntry');
   }

   new () {
      return {
         isNew: true,
         id: GnodeStore.uuid(),
         actionId: null,
         rootActionId: null,
         actionName: '',
         duration: 0,
         date: (new Date()).toISOString(),
         details: '',
         entry: 'performed',
         tags: [],
      };
   }

   save (model) {
      // var existingAction, newAction;
      // if (logEntry.actionName && logEntry.actionName.length) {
      //    existingAction = actionStore.get(logEntry.actionName);
      //    if (existingAction) {
      //       logEntry.actionId = existingAction.id;
      //    }
      //    else {
      //       newAction = doozy.action(logEntry.actionName);
      //       newAction.created = this.state.date;
      //    }
      // }

      // update log entry
      // if (!newAction) {
      if (model.isNew) {
         return this.create(model);
      }
      return this.update(model);
      // }

      // Create action first
      // return new Promise(resolve => {
      //    actionStore.create(newAction).then(serverAction => {
      //       logEntry.actionId = serverAction.id;
      //       // Then Create logentry that references action
      //       if (logEntry.isNew) {
      //          this.create(logEntry).then(newLogEntry => {
      //             resolve(newLogEntry);
      //          });
      //       }
      //       this.update(logEntry).then(newLogEntry => {
      //          resolve(newLogEntry);
      //       });
      //    });
      // });
   }
}

// Export instance
var singleton = new LogEntryStore();
export default singleton;
