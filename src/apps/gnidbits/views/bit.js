// PACKAGES
import React from 'react';
import ReactDOM from 'react-dom';
import Promise from 'bluebird';
// STORES
import bitStore from 'stores/bit-store';
import tagStore from 'stores/tag-store';
// COMPONENTS
import { $background, $content, $formSection, $inputRow, $inlineLabel, $buttons, $button } from 'components/styles';
import Message from 'components/Message';
import Form from 'components/forms/Form';
import FormSection from 'components/forms/FormSection';
import InputGroup from 'components/forms/InputGroup';
import InputTable from 'components/forms/InputTable';
import TagInput from 'components/forms/TagInput';
import TextInput from 'components/forms/TextInput';
import MultiLineInput from 'components/forms/MultiLineInput';
import LoadingIndicator from 'components/LoadingIndicator';

export default class Bit extends React.Component {
   constructor (props) {
      super(props);
      // Bind event handlers
      this.handleSaveChanges = this.handleSaveChanges.bind(this);
      this.handleBitStoreUpdate = this.handleBitStoreUpdate.bind(this);
      this.handleTagStoreUpdate = this.handleTagStoreUpdate.bind(this);
      // Set initial state
      this.state = {
         model: null,
         tags: [],
      };
   }

   componentDidMount () {
      bitStore.subscribe(this.handleBitStoreUpdate, { key: this.props.id });
      tagStore.subscribe(this.handleTagStoreUpdate, { key: JSON.stringify({ key: '*' }) });
   }

   /*************************************************************
    * EVENT HANDLING
    *************************************************************/
   handleSaveChanges () {
      var form = this.refs.form.getValue();
      var newModel = Object.assign({}, this.state.model, form);

      Message.notify('Saving...');
      bitStore.save(newModel).then(() => {
         // this.setState({ model: serverModel });
         Message.notify('Saved...');
      });
   }

   handleBitStoreUpdate (value) {
      if (this.refs.form) {
         this.refs.form.reset();
      }
      this.setState({
         model: value
      });
   }

   handleTagStoreUpdate (value) {
      this.setState({
         tags: value.results
      });
   }

   /*************************************************************
   * RENDERING
   *************************************************************/
   render () {
      var { model, tags } = this.state;

      if (!model) {
         return (
            <div style={$background}>
               <LoadingIndicator />
            </div>
         );
      }

      return (
         <div style={$background}>
            <div style={$content}>
               <Form ref="form" model={model} style={{ color: '#2B90E8' }}>
                  <FormSection title="General" style={$formSection} labelSpan={2} labelStyle={{ color: '#00AF27' }}>
                     <InputGroup label="Caption"><TextInput path="caption" /></InputGroup>
                     <InputGroup label="Tags"><TagInput path="tags" items={tags} /></InputGroup>
                  </FormSection>
                  <FormSection title="Images" style={$formSection}>
                     <InputTable path="images" getNewRow={newImage}>
                        <TextInput path="src" />
                     </InputTable>
                  </FormSection>
                  <FormSection title="Videos" style={$formSection}>
                     <InputTable path="videos" getNewRow={newVideo} style={$inputRow}>
                        <label className="control-label" style={$inlineLabel}>Source</label>
                        <TextInput path="src" cellStyle={{ flex: '1' }} />
                        <label className="control-label" style={$inlineLabel}>Start At</label>
                        <TextInput type="number" path="start" cellStyle={{ maxWidth: '5rem' }} />
                        <label className="control-label" style={$inlineLabel}>End At</label>
                        <TextInput type="number" path="end" cellStyle={{ maxWidth: '5rem' }} />
                     </InputTable>
                  </FormSection>
                  <FormSection title="Texts" style={$formSection}>
                     <InputTable path="texts" getNewRow={newText}>
                        <MultiLineInput path="text" />
                     </InputTable>
                  </FormSection>
                  <FormSection title="Notes" style={$formSection}>
                     <InputTable path="notes" getNewRow={newNote}>
                        <MultiLineInput path="note" />
                     </InputTable>
                  </FormSection>
                  <FormSection title="Links" style={$formSection}>
                     <InputTable path="links" getNewRow={newLink}>
                        <TextInput path="src" />
                        <TextInput path="description" />
                     </InputTable>
                  </FormSection>
               </Form>
               <div style={$buttons}>
                  <button style={$button} onClick={this.handleSaveChanges}>Save Changes</button>
               </div>
            </div>
         </div>
      );
   }
}

// function newTag () {
//    return new Promise(resolve => {
//       resolve({
//          id: '',
//       });
//    });
// }

function newImage () {
   return new Promise(resolve => {
      resolve({
         src: '',
      });
   });
}

function newVideo () {
   return new Promise(resolve => {
      resolve({
         src: '',
         start: null,
         end: null,
      });
   });
}


function newNote () {
   return new Promise(resolve => {
      resolve({
         src: '',
         note: '',
      });
   });
}

function newText () {
   return new Promise(resolve => {
      resolve({
         src: '',
         text: '',
      });
   });
}

function newLink () {
   return new Promise(resolve => {
      resolve({
         src: '',
         description: '',
      });
   });
}

global.APP = Bit;
global.React = React;
global.ReactDOM = ReactDOM;
