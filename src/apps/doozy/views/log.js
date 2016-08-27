// PACKAGES
import React from 'react';
import ReactDOM from 'react-dom';
// STORES
import logentryStore from 'stores/logentry-store';
import tagStore from 'stores/tag-store';
// COMPONENTS
import appStyle from 'apps/gnidbits/style';
import Form from 'components/forms/Form';
import FormSection from 'components/forms/FormSection';
import InputGroup from 'components/forms/InputGroup';
import TagInput from 'components/forms/TagInput';
import TextInput from 'components/forms/TextInput';
import MultiLineInput from 'components/forms/MultiLineInput';
import Message from 'components/Message';

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
         model: logentryStore.new(),
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
      this.setState({
         model: value,
      });
   }

   handleSaveChanges () {
      var form = this.refs.form.getValue();
      var newModel = Object.assign({}, this.state.model, form);

      Message.notify('Saving...');
      logentryStore.save(newModel).then(serverModel => {
         this.setState({ model: serverModel });
         Message.notify('Saved...');
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
      return (
         <div style={appStyle.background}>
            <div style={appStyle.content}>
               <Form ref="form" model={model} style={appStyle.form} labelSpan={2} labelStyle={appStyle.label}>
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
