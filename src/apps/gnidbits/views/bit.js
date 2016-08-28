// PACKAGES
import React from 'react';
import ReactDOM from 'react-dom';
import Promise from 'bluebird';
// STORES
import host from 'stores/host';
import bitStore from 'stores/bit-store';
import tagStore from 'stores/tag-store';
// COMPONENTS
import appStyle from 'apps/gnidbits/style';
import Form from 'components/forms/Form';
import FormSection from 'components/forms/FormSection';
import InputGroup from 'components/forms/InputGroup';
import InputTable from 'components/forms/InputTable';
import TagInput from 'components/forms/TagInput';
import TextInput from 'components/forms/TextInput';
import MultiLineInput from 'components/forms/MultiLineInput';
import HostContainer from 'components/HostContainer';
import LoadingIndicator from 'components/LoadingIndicator';
import SavingBackdrop from 'components/SavingBackdrop';

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

      host.newWindow(<SavingBackdrop />);
      bitStore.save(newModel).then(() => {
         if (newModel) {
            host.notify('[l10n: Save successful.]');
         }
         else {
            host.notify('[l10n: Save failed.]');
         }
         host.closeWindow();
      })
      .catch(err => {
         host.notify('[l10n: Save failed.] ' + err.message);
         host.closeWindow();
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
            <div style={appStyle.background}>
               <div style={appStyle.loading}>
                  <LoadingIndicator />
               </div>
            </div>
         );
      }

      return (
         <HostContainer>
            <div style={appStyle.background}>
               <div style={appStyle.content}>
                  <Form ref="form" model={model} style={{ color: '#2B90E8' }}>
                     <FormSection title="General" style={appStyle.formSection} labelSpan={2} labelStyle={{ color: '#00AF27' }}>
                        <InputGroup label="Caption"><TextInput path="caption" /></InputGroup>
                        <InputGroup label="Tags"><TagInput path="tags" items={tags} /></InputGroup>
                     </FormSection>
                     <FormSection title="Images" style={appStyle.formSection}>
                        <InputTable path="images" getNewRow={newImage}>
                           <TextInput path="src" />
                        </InputTable>
                     </FormSection>
                     <FormSection title="Videos" style={appStyle.formSection}>
                        <InputTable path="videos" getNewRow={newVideo} style={appStyle.inputRow}>
                           <label className="control-label" style={appStyle.inlineLabel}>Source</label>
                           <TextInput path="src" cellStyle={{ flex: '1' }} />
                           <label className="control-label" style={appStyle.inlineLabel}>Start At</label>
                           <TextInput type="number" path="start" cellStyle={{ maxWidth: '5rem' }} />
                           <label className="control-label" style={appStyle.inlineLabel}>End At</label>
                           <TextInput type="number" path="end" cellStyle={{ maxWidth: '5rem' }} />
                        </InputTable>
                     </FormSection>
                     <FormSection title="Texts" style={appStyle.formSection}>
                        <InputTable path="texts" getNewRow={newText}>
                           <MultiLineInput path="text" />
                        </InputTable>
                     </FormSection>
                     <FormSection title="Notes" style={appStyle.formSection}>
                        <InputTable path="notes" getNewRow={newNote}>
                           <MultiLineInput path="note" />
                        </InputTable>
                     </FormSection>
                     <FormSection title="Links" style={appStyle.formSection}>
                        <InputTable path="links" getNewRow={newLink}>
                           <TextInput path="src" />
                           <TextInput path="description" />
                        </InputTable>
                     </FormSection>
                  </Form>
                  <div style={appStyle.buttons}>
                     <button style={appStyle.button} onClick={this.handleSaveChanges}>Save Changes</button>
                  </div>
               </div>
            </div>
         </HostContainer>
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
