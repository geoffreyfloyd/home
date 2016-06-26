import {
   GraphQLList as List,
   GraphQLInt as IntType,
   GraphQLObjectType as ObjectType,
   GraphQLString as StringType,
   GraphQLNonNull as NonNull,
} from 'graphql';

import BitType from './BitType';
import TagType from './TagType';

const StripType = new ObjectType({
   name: 'StripType',
   fields: {
      id: { type: new NonNull(StringType) },
      caption: { type: StringType },
      bits: { type: new List(BitType) },
      tags: { type: new List(TagType) },
   },
});

export default StripType;
