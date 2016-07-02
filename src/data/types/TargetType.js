import {
   GraphQLList as List,
   GraphQLObjectType as ObjectType,
   GraphQLString as StringType,
   GraphQLInt as IntType,
   GraphQLNonNull as NonNull,
   GraphQLBoolean as BooleanType,
} from 'graphql';

import TagType from './TagType';

const TargetType = new ObjectType({
   name: 'Target',
   fields: {
      id: { type: new NonNull(StringType) },
      created: { type: new NonNull(StringType) },
      entityType: { type: new NonNull(StringType) },
      entityId: { type: new NonNull(StringType) },
      starts: { type: StringType },
      retire: { type: StringType },
      name: { type: new NonNull(StringType) },
      measure: { type: new NonNull(IntType) },
      number: { type: new NonNull(IntType) },
      period: { type: IntType },
      multiplier: { type: new NonNull(IntType) },
      tags: { type: new List(TagType) },
      retireWhenMet: { type: BooleanType },
   },
});

export default TargetType;
