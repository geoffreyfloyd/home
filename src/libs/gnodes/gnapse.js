/*********************************
 * GNAPSE
 ********************************/
import { REACTION, RELATION, RELEVANCE } from './core';
import Firing from './firing';

export default class Gnapse {
   constructor (origin, target, relation) {
      this.db = origin.db;
      this.born = new Date();
      this.origin = origin;
      this.target = target;
      this.originVersion = origin.version;
      this.targetVersion = target.version;
      this.relation = relation;
      this.relevance = 1.0;
      this.firings = [];

      this.isParent = this.isParent.bind(this);
      this.isChild = this.isChild.bind(this);
      this.isSibling = this.isSibling.bind(this);
      this.isUncommon = this.isUncommon.bind(this);
      this.isRare = this.isRare.bind(this);
   }

   fire (kind, test) {
      if (typeof kind === 'undefined' || (this.getTarget() && this.getTarget().kind.indexOf(kind) > -1)) {
         var testResult = test();
         this.firings.push(new Firing(this, kind, testResult ? REACTION.ACCEPT : REACTION.REJECT));
         return testResult;
      }
      return false; // don't weaken relevance unless it's of the right kind or didn't specify kind
   }

   getTarget () {
      // No target exists

      if (!this.target) {
         return null;
      }

      if (typeof this.target === 'string') {
         var gnode = this.db.get(this.target);
         if (!gnode) {
            // TODO: Take care of orphaned gnodes
            // console.log('Couldn\'t find gnode: ' + this.target);
            return null;
         }
         this.target = gnode;
      }

      //
      return this.target;
   }

   /*********************************
    * GNAPSE ANALYZATION METHODS
    ********************************/
   isParent (kind) {
      return this.fire(kind, () => this.relation === RELATION.CHILD_PARENT && this.relevance > RELEVANCE.RARE);
   }

   isChild (kind) {
      return this.fire(kind, () => this.relation === RELATION.PARENT_CHILD && this.relevance > RELEVANCE.RARE);
   }

   isSibling (kind) {
      return this.fire(kind, () => this.relation === RELATION.ASSOCIATE && this.relevance > RELEVANCE.RARE);
   }

   isUncommon (kind) {
      return this.fire(kind, () => this.relevance > RELEVANCE.RARE && this.relevance <= RELEVANCE.UNCOMMON);
   }

   isRare (kind) {
      return this.fire(kind, () => this.relevance <= RELEVANCE.RARE);
   }
}
