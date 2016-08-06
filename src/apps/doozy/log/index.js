// PACKAGES
import React from 'react';
import ReactDOM from 'react-dom';
// LIBS
import http from 'libs/http';
import logEntryStore from 'stores/logentry-store';
import { $background, $content, $form, $formSection, $label, $buttons, $button } from 'components/styles';
// COMPONENTS
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
      this.handleSaveChanges = this.handleSaveChanges.bind(this);
      this.state = {
         model: logEntryStore.new(),
         tags: [],
      };
   }

   componentDidMount () {
      // Get Data
      http(`/graphql?query={
         logentries(id:"${this.props.id}"){
            id,
            kind,
            date,
            details,
            duration,
            actions{id,name},
            tags{id,name,kind,descendantOf}
         },
         tags{
            id,
            name,
            kind,
            descendantOf
         }
      }`.replace(/ /g, '')).requestJson().then(json => {
         // Set data
         this.setState({
            model: json.data.logentries[0] || this.state.model,
            tags: json.data.tags,
         });
      });
   }

   /*************************************************************
    * EVENT HANDLING
    *************************************************************/
   handleSaveChanges () {
      var form = this.refs.form.getValue();
      var newModel = Object.assign({}, this.state.model, form);

      Message.notify('Saving...');
      logEntryStore.save(newModel).then(serverModel => {
         this.setState({ model: serverModel });
         Message.notify('Saved...');
      });
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      var { model, tags } = this.state;
      return (
         <div style={$background}>
            <div style={$content}>
               <Form ref="form" model={model} style={$form} labelSpan={2} labelStyle={$label}>
                  <FormSection title="General" style={$formSection}>
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
               <div style={$buttons}>
                  <button style={$button} onClick={this.handleSaveChanges}>Save Changes</button>
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
