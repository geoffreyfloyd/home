// PACKAGES
import React from 'react';
import ReactDOM from 'react-dom';
// STORES
import host from 'stores/host';
import logentryStore from 'stores/logentry-store';
import tagStore from 'stores/tag-store';
// COMPONENTS
import appStyle from 'apps/gnidbits/style';
import Form from 'components/forms/Form';
import FormSection from 'components/forms/FormSection';
import HostContainer from 'components/HostContainer';
import InputGroup from 'components/forms/InputGroup';
import TagInput from 'components/forms/TagInput';
import TextInput from 'components/forms/TextInput';
import MultiLineInput from 'components/forms/MultiLineInput';
import LoadingIndicator from 'components/LoadingIndicator';
import SavingBackdrop from 'components/SavingBackdrop';

export default class LogEntry extends React.Component {
   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   constructor (props) {
      super(props);
      // Bind event handlers
      this.handleLogentryStoreUpdate = this.handleLogentryStoreUpdate.bind(this);
      this.handleSaveChanges = this.handleSaveChanges.bind(this);
      this.handleTagStoreUpdate = this.handleTagStoreUpdate.bind(this);
      // Set initial state
      this.state = {
         model: null,
         tags: [],
      };
   }

   componentDidMount () {
      logentryStore.subscribe(this.handleLogentryStoreUpdate, { key: this.props.id });
      tagStore.subscribe(this.handleTagStoreUpdate, { key: JSON.stringify({ key: '*' }) });
   }

   /*************************************************************
    * EVENT HANDLING
    *************************************************************/
   handleLogentryStoreUpdate (value) {
      if (this.refs.form) {
         this.refs.form.reset();
      }
      this.setState({
         model: value,
      });
   }

   handleSaveChanges () {
      var form = this.refs.form.getValue();
      var model = Object.assign({}, this.state.model, form);

      host.newWindow(<SavingBackdrop />);
      logentryStore.save(model).then(newModel => {
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

   handleTagStoreUpdate (value) {
      this.setState({
         tags: value.results || this.state.tags,
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
                  <Form ref="form" model={model} style={appStyle.form} labelStyle={appStyle.label}>
                     <FormSection title="General" style={appStyle.formSection}>
                        <InputGroup label="Date">
                           <TextInput path="date" type="date" />
                        </InputGroup>
                        <InputGroup label="Details">
                           <MultiLineInput path="details" autoGrow focus />
                        </InputGroup>
                        <InputGroup label="Duration">
                           <TextInput path="duration" type="text" />
                        </InputGroup>
                        <InputGroup label="Tags">
                           <TagInput path="tags" items={tags} />
                        </InputGroup>
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
//    return new Promise((resolve) => {
//       resolve({
//          id: '',
//       });
//    });
// }

/*************************************************************
 * BOOTSTRAP
 *************************************************************/
global.APP = LogEntry;
global.React = React;
global.ReactDOM = ReactDOM;
