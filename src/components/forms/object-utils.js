import { getType } from './type';
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
