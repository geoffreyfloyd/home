import {
   GraphQLList as List,
   GraphQLInt as IntType,
   GraphQLObjectType as ObjectType,
   GraphQLString as StringType,
   GraphQLNonNull as NonNull,
} from 'graphql';

import ImageType from './ImageType';
import LinkType from './LinkType';
import NoteType from './NoteType';
import TagType from './TagType';
import TextType from './TextType';
import VideoType from './VideoType';

const BitType = new ObjectType({
   name: 'BitType',
   fields: {
      id: { type: new NonNull(StringType) },
      caption: { type: StringType },
      images: { type: new List(ImageType) },
      links: { type: new List(LinkType) },
      notes: { type: new List(NoteType) },
      tags: { type: new List(TagType) },
      texts: { type: new List(TextType) },
      videos: { type: new List(VideoType) },
   },
});

export default BitType;
