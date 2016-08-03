import React from 'react';

function getReactPropType (propType) {
   if (propType.options) {
      return React.PropTypes.oneOf(propType.options);
   }
   else {
      var type = propType.type;
      var typeOf = getType(type);

      if (typeOf === 'array') {
         var types = type.map(t => getReactPropType({ type: t }));
         // Multiple types
         return React.PropTypes.oneOfType(
            types
         );
      }
      else if (typeOf === 'string') {
         switch (type) {
            case 'any':
            case 'array':
            case 'bool':
            case 'func':
            case 'number':
            case 'object':
            case 'string':
               return React.PropTypes[type];
            case 'boolean':
               return React.PropTypes.bool;
            case 'function':
               return React.PropTypes.func;
         }
      }
      else {
         throw new Error(type + ' is not a supported PropType declaration');
      }
   }
}

export function getReactPropTypes (propTypes) {
   var reactPropTypes = {};

   Object.keys(propTypes).forEach(propType => {
      reactPropTypes[propType] = getReactPropType(propTypes[propType]);

      if (propType.isRequired) {
         reactPropTypes[propType] = reactPropTypes[propType].isRequired;
      }
   });

   return reactPropTypes;
}

// get sane type names for string, number, date, and array
export function getType (arg) {
   return Object.prototype.toString.call(arg).slice(8, -1).toLowerCase();
}
