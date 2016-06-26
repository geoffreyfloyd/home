import {
   GraphQLList as List,
   GraphQLObjectType as ObjectType,
   GraphQLString as StringType,
   GraphQLBoolean as BooleanType,
   GraphQLNonNull as NonNull,
} from 'graphql';

const TagType = new ObjectType({
   name: 'Tag',
   fields: {
      id: { type: new NonNull(StringType) },
      name: { type: new NonNull(StringType) },
      kind: { type: new NonNull(StringType) },
      path: { type: new NonNull(StringType) },
      content: { type: StringType },
      isFocus: { type: BooleanType },
      descendantOf: { type: new List(StringType) },
   },
});

export default TagType;
