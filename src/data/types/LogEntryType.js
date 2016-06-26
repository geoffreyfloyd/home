import {
   GraphQLList as List,
   GraphQLInt as IntType,
   GraphQLObjectType as ObjectType,
   GraphQLString as StringType,
   GraphQLNonNull as NonNull,
} from 'graphql';

import ActionType from './ActionType';
import TagType from './TagType';

const LogEntryType = new ObjectType({
   name: 'LogEntry',
   fields: {
      id: { type: new NonNull(StringType) },
      duration: { type: IntType },
      date: { type: StringType },
      actions: { type: new List(ActionType) },
      tags: { type: new List(TagType) },
      kind: { type: StringType },
      details: { type: StringType },
   },
});

export default LogEntryType;
