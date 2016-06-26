import React from 'react';
import ReactDOM from 'react-dom';
import http from 'libs/http';
import Form from 'components/forms/Form';
import TagInput from 'components/forms/TagInput';
import SelectionInput from 'components/forms/SelectionInput';
import ComicStrip from './comic-strip';

const mediaTypes = [
   {
      id: '*',
      name: 'All',
   },
   {
      id: 'videos',
      name: 'Videos',
   },
   {
      id: 'images',
      name: 'Images',
   },
   {
      id: 'texts',
      name: 'Texts',
   },
   {
      id: 'audios',
      name: 'Audios',
   },
];


function getDefaultFilter () {
   return {
      mediaType: 'images',
      selectedTags: [],
   };
}

class Presenter extends React.Component {
   constructor (props) {
      super(props);
      this.state = getDefaultFilter();
      this.model = getDefaultFilter();
      this.handleFormChange = this.handleFormChange.bind(this);
   }

   componentDidMount () {
      // Get Data
      var response = http(`/graphql?query={
         bits{
            id,
            caption,
            images{src},
            links{src,description},
            notes{note},
            texts{text},
            videos{src,start,end},
            tags{id,name,kind,descendantOf}
         },
         tags{
            id,
            name,
            kind,
            descendantOf
         }
      }`).requestJson().then(json => {
         // Set data
         return this.setState({
            content: json.data.bits || this.state.content,
            tags: json.data.tags
         });      
      });
   }

   handleFormChange (e) {
      this.setState(e.form);
   }

   render () {
      var { content, mediaType, selectedTags, tags, index } = this.state;

      if (!content && !index) {
         return <div>Loading...</div>;
      }

      if (index) {
         return (
            <div style={styles.body}>
               {Object.keys(index).map(key => <ComicStrip mode="wrap" strip={index[key]} />)}
            </div>
         );
      }

      if (mediaType && mediaType !== '*') {
         content = content.filter(bit => bit[mediaType].length);
      }

      if (selectedTags.length) {
         content = content.filter(bit => selectedTags.filter(tag =>
               bit.tags.filter(bittag =>
                  bittag.id === tag.id
               ).length
            ).length
         );
      }

      return (
         <div style={styles.body}>
            <Form
              model={this.model}
              style={{ color: '#2B90E8', padding: '0.5rem', maxWidth: '20rem' }}
              onChange={this.handleFormChange}
              labelSpan={2}
              labelStyle={{ color: '#00AF27' }}
            >
               <SelectionInput label="Media" path="mediaType" items={mediaTypes} displayPath="name" valuePath="id" />
               <TagInput label="Tags" path="selectedTags" items={tags} />
            </Form>
            <ComicStrip mode="wrap" strip={content} />
         </div>
      );
   }
}

const styles = {
   body: {
      backgroundColor: '#444',
   },
   wrap: {
      display: 'flex',
      alignContent: 'flex-start',
      justifyContent: 'space-around',
      flexDirection: 'row',
      flexWrap: 'wrap',
      minHeight: '100vh',
   },
   feed: {
      width: '31rem',
      marginLeft: 'auto',
      marginRight: 'auto',
      
   },
   pan: {
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      maxHeight: '20rem',
   },
};

var testMediaStrip = [
   {
      uri: '2',
      prev: '1',
      next: '3',
      videos: [
         {
            src: 'http://www.w3schools.com/html/mov_bbb.mp4',
         }
      ],
      captions: [
         'Bunny!'
      ],
      images: [

      ]
   },

];

global.APP = Presenter;
global.React = React;
global.ReactDOM = ReactDOM;
