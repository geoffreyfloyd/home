/*********************************
 * FIRING
 ********************************/
export default class Firing {
   constructor (gnapse, reaction) {
      this.origin = gnapse.origin;
      this.originVersion = gnapse.origin.version;
      this.target = gnapse.target;
      this.targetVersion = gnapse.target.version;
      this.relation = gnapse.relation;
      this.reaction = reaction;
      this.when = new Date();
   }
}
