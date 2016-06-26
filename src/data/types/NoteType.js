import {
   GraphQLObjectType as ObjectType,
   GraphQLString as StringType,
} from 'graphql';

const NoteType = new ObjectType({
   name: 'NoteType',
   fields: {
      src: { type: StringType },
      note: { type: StringType },
   },
});

export default NoteType;
