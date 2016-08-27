/*********************************
 * GNODE
 ********************************/
import { first, slugify, RELATION } from './core';
import Gnapse from './gnapse';

export default class Gnode {
   constructor (db, tag, kind, state, blob) {
      // Node meta
      this.db = db;
      this.tag = slugify(tag); // slug-style node-resource-identifier
      this.kind = kind.toLowerCase();
      this.version = 1; // TODO: Git tree/object hash, or maybe we need to keep an ordinal version along with it
      this.born = new Date();
      this.gnapses = [];

      // The object itself
      this.state = state || {};

      // Uri pointing to a blob of data that represents this object
      // through a different means than JSON. It is up to the application
      // to decide what this blob is and how to interface with it, most likely
      // determined by the kind (ie. img.jpg)
      this.blob = blob || null;
   }

   path () {
      return this.kind + '.' + this.tag;
   }

   connect (target, sourceToTargetRelation) {
      var gnapseChanges, gnapseFromOrigin, gnapseToOrigin, prop;

      gnapseFromOrigin = new Gnapse(this, target, sourceToTargetRelation);
      switch (sourceToTargetRelation) {
         case RELATION.CHILD_PARENT:
            gnapseToOrigin = new Gnapse(target, this, RELATION.PARENT_CHILD);
            break;
         case RELATION.PARENT_CHILD:
            gnapseToOrigin = new Gnapse(target, this, RELATION.CHILD_PARENT);
            break;
         case RELATION.ASSOCIATE:
            gnapseToOrigin = new Gnapse(target, this, RELATION.ASSOCIATE);
            break;
      }

      this.gnapses.push(gnapseFromOrigin);
      target.gnapses.push(gnapseToOrigin);

      // Generate changeset object with a change for gnapse on each side
      // that should be passed to
      prop = gnapseFromOrigin.origin.path() + '_' + gnapseFromOrigin.getTarget().path();
      this.db.gnapseChanges[prop] = {
         gnapse: gnapseFromOrigin,
         transaction: 'add',
      };
      prop = gnapseToOrigin.origin.path() + '_' + gnapseToOrigin.getTarget().path();
      this.db.gnapseChanges[prop] = {
         gnapse: gnapseToOrigin,
         transaction: 'add',
      };
      return gnapseChanges;
   }

   disconnectAll () {
      // Slice each gnapse out of collection
      // and disconnect it
      var gnapse = this.gnapses.slice(0, 1)[0];
      while (gnapse) {
         this.disconnect(gnapse);

         // pull next gnapse
         gnapse = this.gnapses.slice(0, 1)[0];
      }
   }

   disconnect (gnapse) {
      var prop = this.path() + '_' + gnapse.getTarget().path();
      this.db.gnapseChanges[prop] = {
         gnapse: gnapse,
         transaction: 'remove',
      };

      // Find the reciprocal gnapse
      var target = gnapse.getTarget();
      if (target && target.gnapses && target.gnapses.length) {
         for (var gnapseIndex = 0; gnapseIndex < target.gnapses.length; gnapseIndex++) {
            var targetGnapse = target.gnapses[gnapseIndex];
            // For
            if (!targetGnapse.getTarget()) {
               console.log('disconnect could not access gnapse target: ' + targetGnapse.target);
               continue;
            }
            // Here's looking at you, kid
            if (targetGnapse.getTarget().path() === this.path()) {
               prop = target.path() + '_' + targetGnapse.getTarget().path();
               this.db.gnapseChanges[prop] = {
                  gnapse: targetGnapse,
                  transaction: 'remove',
               };
               /**
               * Slice the gnapse out of the collection and
               * offset the loop++ because the stack collapse
               * brought the next object to the current index
               */
               target.gnapses.splice(gnapseIndex, 1);
               break;
            }
         }
      }

      for (var i = 0; i < this.gnapses.length; i++) {
         if (this.gnapses[i] === gnapse) {
            this.gnapses.splice(i, 1);
         }
      }
   }

   setState (state, blob) {
      var oldState = Object.assign({}, this.state);
      var newState = Object.assign({}, this.state, state);

      this.state = newState;
      var prop = this.path();

      // Keep original state of unmodified
      if (this.db.gnodeChanges[prop] !== undefined) {
         oldState = this.db.gnodeChanges[prop].originalCopy;
      }
      else {
         // Only up the version once per commit
         ++this.version;
      }

      // Set the new change object
      this.db.gnodeChanges[prop] = {
         gnode: this,
         originalCopy: oldState,
         modifiedCopy: newState,
         transaction: 'update',
      };

      if (typeof blob !== 'undefined') {
         // Write new blob to position of old blob
      }
   }

   /*********************************
    * GNODE GNAPSES COLLECTION METHODS
    ********************************/
   parents (kind) {
      var result = [];
      this.gnapses.forEach(gnapse => {
         if (gnapse.isParent(kind)) {
            result.push(gnapse);
         }
      });
      result.first = first;
      return result;
   }

   children (kind) {
      var result = [];
      this.gnapses.forEach(gnapse => {
         if (gnapse.isChild(kind)) {
            result.push(gnapse);
         }
      });
      result.first = first;
      return result;
   }

   siblings (kind) {
      var result = [];
      this.gnapses.forEach(gnapse => {
         if (gnapse.isSibling(kind)) {
            result.push(gnapse);
         }
      });
      result.first = first;
      return result;
   }

   related (kind) {
      var result = [];
      this.gnapses.forEach(gnapse => {
         if (gnapse.getTarget().kind === kind) {
            result.push(gnapse);
         }
      });
      result.first = first;
      return result;
   }

   isRelated (path) {
      for (var i = 0; i < this.gnapses.length; i++) {
         var relatedGnode = this.gnapses[i].getTarget();
         if (!relatedGnode) {
            console.log('WARNING: ' + this.tag + ' has an orphaned gnapse');
            return false;
         }
         if (this.gnapses[i].getTarget().path() === path) {
            return true;
         }
      }
      return false;
   }

   uncommon (kind) {
      var result = [];
      this.gnapses.forEach(gnapse => {
         if (gnapse.isUncommon(kind)) {
            result.push(gnapse);
         }
      });
      result.first = first;
      return result;
   }

   rare (kind) {
      var result = [];
      this.gnapses.forEach(gnapse => {
         if (gnapse.isRare(kind)) {
            result.push(gnapse);
         }
      });
      result.first = first;
      return result;
   }
}
