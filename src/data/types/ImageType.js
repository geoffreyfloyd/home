import {
   GraphQLObjectType as ObjectType,
   GraphQLString as StringType,
   GraphQLNonNull as NonNull,
} from 'graphql';

const ImageType = new ObjectType({
   name: 'ImageType',
   fields: {
      src: { type: new NonNull(StringType) },
   },
});

export default ImageType;
