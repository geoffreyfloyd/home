// import '../../global.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import http from 'libs/http';
import targetStore from 'stores/target-store';
import { $background, $content, $form, $formSection, $label, $buttons, $button } from 'components/styles';
import Form from 'components/forms/Form';
import FormSection from 'components/forms/FormSection';
import TagInput from 'components/forms/TagInput';
import TextInput from 'components/forms/TextInput';
import SelectionInput from 'components/forms/SelectionInput';
import Message from 'components/Message';

export default class LogEntry extends React.Component {
   constructor (props) {
      super(props);
      this.handleSaveChanges = this.handleSaveChanges.bind(this);
      this.state = {
         model: targetStore.new(),
         tags: [],
      };
   }

   componentDidMount () {
      // Get Data
      http(`/graphql?query={
         targets(id:"${this.props.id}"){
            id,
            created,
            starts,
            retire,
            name,
            entityType,
            entityId,
            measure,
            period,
            multiplier,
            number,
            retireWhenMet
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
            model: json.data.targets[0] || this.state.model,
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
      targetStore.save(newModel).then(serverModel => {
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
                     <TextInput label="Name" path="name" />
                     <TextInput label="Entity Type" path="entityType" />
                     <TextInput label="Entity ID" path="entityId" />
                     <TagInput label="Tags" path="tags" items={tags} />
                     <SelectionInput label="Measure" path="measure" type="number" items={targetStore.getMeasures()} displayPath="name" valuePath="value" />
                     <SelectionInput label="Period" path="period" type="number" items={targetStore.getPeriods()} displayPath="name" valuePath="value" />
                     <TextInput label="Periods" path="multiplier" type="number" />
                     <TextInput label="Number" path="number" type="number" />
                     <TextInput label="Starts" path="starts" />
                     <TextInput label="Retire" path="retire" />
                     <TextInput label="Created" path="created" readonly />
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

global.APP = LogEntry;
global.React = React;
global.ReactDOM = ReactDOM;
