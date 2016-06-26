import {
   GraphQLList as List,
   GraphQLObjectType as ObjectType,
   GraphQLString as StringType,
   GraphQLInt as IntType,
   GraphQLNonNull as NonNull,
} from 'graphql';

import TagType from './TagType';

const ActionType = new ObjectType({
   name: 'Action',
   fields: {
      id: { type: new NonNull(StringType) },
      name: { type: new NonNull(StringType) },
      content: { type: StringType },
      duration: { type: IntType },
      tags: { type: new List(TagType) },
      lastPerformed: { type: StringType },
      kind: { type: new NonNull(StringType) },
   },
});

export default ActionType;
