import {
   GraphQLInt as IntType,
   GraphQLObjectType as ObjectType,
   GraphQLString as StringType,
   GraphQLNonNull as NonNull,
} from 'graphql';

const VideoType = new ObjectType({
   name: 'VideoType',
   fields: {
      src: { type: new NonNull(StringType) },
      start: { type: IntType },
      end: { type: IntType },
   },
});

export default VideoType;
