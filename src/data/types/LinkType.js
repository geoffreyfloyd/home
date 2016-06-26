import {
   GraphQLObjectType as ObjectType,
   GraphQLString as StringType,
   GraphQLNonNull as NonNull,
} from 'graphql';

const LinkType = new ObjectType({
   name: 'LinkType',
   fields: {
      src: { type: new NonNull(StringType) },
      description: { type: StringType },
   },
});

export default LinkType;
