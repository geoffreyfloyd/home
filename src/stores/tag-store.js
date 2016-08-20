import GnodeStore from './gnode-store';
import those from 'those';

const TAG_KIND = {
   FOCUS: '!',
   PLACE: '@',
   GOAL: '>',
   NEED: '$',
   BOX: '#',
   TAG: '',
};

const TAG_PREFIXES = ['!', '@', '>', '$', '#'];

class TagStore extends GnodeStore {

   constructor () {
      super('Doozy', 'Tag', 1);
      this.TAG_KIND = TAG_KIND;
      this.TAG_PREFIXES = TAG_PREFIXES;
   }

   new (name) {
      return {
         isNew: true,
         id: GnodeStore.uuid(),
         created: (new Date()).toISOString(),
         kind: 'Tag',
         name: name || '',
         content: null,
         path: null,
         descendantOf: [],
      };
   }

   save (model) {
      if (model.isNew) {
         return this.create(model);
      }
      return this.update(model);
   }

   /**
   * Parses a tag value string to an object
   */
   parseTag (tagValue) {
      var kind = 'Tag';
      var name = tagValue;
      var className = 'fa-tag';

      /**
       * Compare first char of tag to
         * determine if it is a special tag
         */
      var firstChar = name.slice(0, 1);
      if (firstChar === TAG_KIND.FOCUS) {
         kind = 'Focus'; // part of
         className = 'fa-eye';
      }
      else if (firstChar === TAG_KIND.PLACE) {
         kind = 'Place'; // where
         className = 'fa-anchor';
      }
      else if (firstChar === TAG_KIND.GOAL) {
         kind = 'Goal'; // to what end
         className = 'fa-trophy';
      }
      else if (firstChar === TAG_KIND.NEED) {
         kind = 'Need'; // why
         className = 'fa-recycle';
      }
      else if (firstChar === TAG_KIND.BOX) {
         kind = 'Box'; // when
         className = 'fa-cube';
      }

      /**
       * Separate the name from the
       * prefix when it is a special tag
       */
      if (kind !== 'Tag') {
         name = name.slice(1);
      }

      /**
       * Return tag object
       */
      return {
         value: name,
         kind,
         name,
         className,
      };
   }

   classNameFromTagKind (kind) {
      switch (kind) {
         case ('Focus'): // part of (relevant to)
            return 'fa-eye';
         case ('Place'): // where
            return 'fa-anchor';
         case ('Goal'): // to what end
            return 'fa-trophy';
         case ('Need'): // why
            return 'fa-recycle';
         case ('Box'): // when
            return 'fa-cube';
         default:
            return 'fa-tag';
      }
   }

   distinctTags (actions) {
      var distinctTags = [];

      /**
       * Get all distinct tags of all this focus'
       * actions except for the special tags
       */
      actions.forEach(action => {
         action.tags.forEach(tag => {
            if (those(distinctTags).first({ name: tag.name }) === null) {
               distinctTags.push(tag);
            }
         });
      });

      /**
       * Return sorted tags
       */
      return those(distinctTags).order('name');
   }

   /**
    * Get raw tag value from a tag object
    */
   getTagValue (tag) {
      return TAG_KIND[tag.kind.toUpperCase()] + tag.name;
   }

   isTagRelated (matchTag, tag) {
      var matches = matchTag.name === tag.name;
      if (!matches && tag.descendantOf && tag.descendantOf.length && those(tag.descendantOf).first({ name: matchTag.name }) !== null) {
         matches = true;
      }
      return matches;
   }
}

// Export instance
var singleton = new TagStore();
export default singleton;
