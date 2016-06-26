import {
   GraphQLObjectType as ObjectType,
   GraphQLString as StringType,
   GraphQLNonNull as NonNull,
} from 'graphql';

const PathType = new ObjectType({
   name: 'Path',
   fields: {
      id: { type: new NonNull(StringType) },
      source: { type: StringType },
      sourceKind: { type: StringType },
   },
});

export default PathType;
