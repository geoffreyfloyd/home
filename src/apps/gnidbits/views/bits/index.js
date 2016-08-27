// PACKAGES
import React from 'react';
import ReactDOM from 'react-dom';
// STORES
import bitStore from 'stores/bit-store';
import tagStore from 'stores/tag-store';
// components
import appStyle from 'apps/gnidbits/style';
import Form from 'components/forms/Form';
import TagInput from 'components/forms/TagInput';
import SelectionInput from 'components/forms/SelectionInput';
import LoadingIndicator from 'components/LoadingIndicator';
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
      // Bind event handlers
      this.handleFormChange = this.handleFormChange.bind(this);
      this.handleBitStoreUpdate = this.handleBitStoreUpdate.bind(this);
      this.handleTagStoreUpdate = this.handleTagStoreUpdate.bind(this);
   }

   componentDidMount () {
      bitStore.subscribe(this.handleBitStoreUpdate, { key: JSON.stringify({ key: '*' }) });
      tagStore.subscribe(this.handleTagStoreUpdate, { key: JSON.stringify({ key: '*' }) });
   }

   handleBitStoreUpdate (value) {
      this.setState({
         content: value.results || this.state.content
      });
   }

   handleTagStoreUpdate (value) {
      this.setState({
         tags: value.results
      });
   }

   handleFormChange (e) {
      this.setState(e.form);
   }

   render () {
      var { content, mediaType, selectedTags, tags, index } = this.state;

      if (!content && !index) {
         return (
            <div style={appStyle.background}>
               <div style={appStyle.loading}>
                  <LoadingIndicator />
               </div>
            </div>
         );
      }

      if (index) {
         return (
            <div style={appStyle.background}>
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
         <div style={appStyle.background}>
            <Form
              model={this.model}
              style={{ color: '#2B90E8', padding: '0.5rem', maxWidth: '30rem' }}
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

global.APP = Presenter;
global.React = React;
global.ReactDOM = ReactDOM;
