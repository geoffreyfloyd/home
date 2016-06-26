import {
   GraphQLObjectType as ObjectType,
   GraphQLString as StringType,
} from 'graphql';

const TextType = new ObjectType({
   name: 'TextType',
   fields: {
      src: { type: StringType },
      text: { type: StringType },
   },
});

export default TextType;
