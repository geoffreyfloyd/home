export function first () {
   if (this.length > 0) {
      return this[0];
   }
   return null;
}

export function slugify (value) {
   var slugFilter = /[^a-z0-9-]/g;
   var toDashes = value.toLowerCase().replace(slugFilter, '-');
   var noDblDash = toDashes.replace(/--|---|-----/g, '-');
   noDblDash = noDblDash.replace(/--/g, '-');
   var noStartDash = noDblDash.replace(/^-/g, '');
   var maxLength32 = noStartDash.slice(0, 32);
   var noEndDash = maxLength32.replace(/-$/g, '');
   return noEndDash;
}

/*********************************
 * ENUMS
 ********************************/
export const RELEVANCE = {
   RARE: 0.1,
   UNCOMMON: 0.3,
   COMMON: 0.5,
   ONLY: 1.0,
};

export const RELATION = {
   CHILD_PARENT: -1,
   ASSOCIATE: 0,
   PARENT_CHILD: 1,
};

export const REACTION = {
   REJECT: -1,
   ACCEPT: 0,
   PREFER: 1,
};
