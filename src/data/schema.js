import {
   GraphQLSchema as Schema,
   GraphQLObjectType as ObjectType,
} from 'graphql';

import me from './queries/me';

export default function (operator) {
   const tags = require('./queries/tags')(operator);
   const bits = require('./queries/bits')(operator);
   const actions = require('./queries/actions')(operator);
   const logentries = require('./queries/logentries')(operator);
   return new Schema({
      query: new ObjectType({
         name: 'Query',
         fields: {
            me,
            tags,
            actions,
            bits,
            logentries,
            ...operator.dataSchema,
         },
      }),
   });
}
