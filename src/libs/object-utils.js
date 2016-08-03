import { getType } from 'libs/type';
import those from 'those';

/**
 * Wrap any non null or undefined object in an array if the object
 * is not already an array. Null or undefined returns an empty array.
 */
export function asArray (obj) {
   if (getType(obj) === 'array') {
      return obj;
   }
   else if (obj !== undefined && obj !== null) {
      return [obj];
   }
   else {
      return [];
   }
}

/**
 * Create a deep copy of an object that has no shared references
 * to the object nor any of its nested arrays and objects
 */
export function copy (obj) {
   var type = getType(obj);
   if (type === 'array') {
      return obj.map(function (item) {
         return copy(item);
      });
   }
   else if (type === 'object') {
      var newObj = {};
      Object.keys(obj).forEach(function (key) {
         newObj[key] = copy(obj[key]);
      });
      return newObj;
   }
   else {
      return obj;
   }
}

/**
 * Return value from the object that matches the path string
 */
export function extract (obj, path) {
   if (!path) {
      return obj || null;
   }

   var parts = path.split('.');

   return parts.reduce((prevVal, curVal) => {
      if (!prevVal || !curVal) {
         return prevVal;
      }
      // Array path syntax matching
      var arrayPath = curVal.match(/^(\S+)\[(\S+)\]$/);
      var arrayObjMatchPath = curVal.match(/^(\S+)\{(\S+)\}$/);
      if (arrayPath && arrayPath.length === 3) {
         return prevVal[arrayPath[1]][arrayPath[2]];
      }
      else if (arrayObjMatchPath && arrayObjMatchPath.length === 3) {
         var array = prevVal[arrayObjMatchPath[1]];
         return those(array).first(JSON.parse('{' + arrayObjMatchPath[2] + '}'));
      }
      else {
         return prevVal[curVal];
      }
   }, obj);
}

/**
 * Generates a GUID that is reasonably guaranteed to be unique
 * This should only be used within the scope of an app, and never
 * as a value to be used in backend persisted data.
 */
export function guid () {
   function s4 () {
      return Math.floor((1 + Math.random()) * 0x10000)
         .toString(16)
         .substring(1);
   }
   return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
}

/**
 * Update a value in a copy of the object that matches the path string
 */
export function merge (obj, path, val) {
   if (!path) {
      return obj || null;
   }
   var newObj = copy(obj);
   var parts = path.split('.');
   var beforeVal = extract(newObj, parts.slice(0, -1).join('.'));
   if (beforeVal) {
      beforeVal[parts.slice(-1)[0]] = val;
   }
   return newObj;
}

/**
 * Shallow compares two objects to see if they have the same keys and values
 */
export function shallowEqual (objA, objB, compare, compareContext) {
   // Use compare and context if available
   var funcCompare = compare ? compare.call(compareContext, objA, objB) : undefined;
   if (compare !== undefined) {
      return !!funcCompare;
   }

   // Return true if it is literally the same object in memory
   if (objA === objB) {
      return true;
   }

   // Return false if either is not an object
   if (typeof objA !== 'object' || objA === null ||
      typeof objB !== 'object' || objB === null) {
      return false;
   }

   // Return false if the number of keys differ
   const keysA = Object.keys(objA);
   const keysB = Object.keys(objB);
   const len = keysA.length;
   if (len !== keysB.length) {
      return false;
   }

   // Set compare context (or null)
   compareContext = compareContext || null; // eslint-disable-line no-param-reassign

   // Test for A's keys different from B.
   const bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);
   for (let i = 0; i < len; i++) {
      const key = keysA[i];
      if (!bHasOwnProperty(key)) {
         return false;
      }
      const valueA = objA[key];
      const valueB = objB[key];

      var keyCompare = compare ? compare.call(compareContext, valueA, valueB, key) : undefined;
      if (keyCompare === false || keyCompare === undefined && valueA !== valueB) {
         return false;
      }
   }

   return true;
}
