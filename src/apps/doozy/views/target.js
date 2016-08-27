// PACKAGES
import React from 'react';
import ReactDOM from 'react-dom';
// STORES
import tagStore from 'stores/tag-store';
import targetStore from 'stores/target-store';
// COMPONENTS
import { $background, $content, $form, $formSection, $label, $buttons, $button } from 'components/styles';
import Form from 'components/forms/Form';
import FormSection from 'components/forms/FormSection';
import InputGroup from 'components/forms/InputGroup';
import TagInput from 'components/forms/TagInput';
import TextInput from 'components/forms/TextInput';
import SelectionInput from 'components/forms/SelectionInput';
import Message from 'components/Message';

export default class LogEntry extends React.Component {
  /*************************************************************
   * COMPONENT LIFECYCLE
   *************************************************************/
   constructor (props) {
      super(props);
      // Bind event handlers
      this.handleSaveChanges = this.handleSaveChanges.bind(this);
      this.handleTagStoreUpdate = this.handleTagStoreUpdate.bind(this);
      this.handleTargetStoreUpdate = this.handleTargetStoreUpdate.bind(this);
      // Set initial state
      this.state = {
         model: targetStore.new(),
         tags: [],
      };
   }

   componentDidMount () {
      targetStore.subscribe(this.handleTargetStoreUpdate, { key: this.props.id });
      tagStore.subscribe(this.handleTagStoreUpdate, { key: JSON.stringify({ key: '*' }) });
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

   handleTagStoreUpdate (value) {
      this.setState({
         tags: value.results || this.state.tags,
      });
   }

   handleTargetStoreUpdate (value) {
      this.setState({
         model: value,
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
              <InputGroup label="Name">
                <TextInput path="name" />
              </InputGroup>
              <InputGroup label="Entity Type">
                <TextInput path="entityType" />
              </InputGroup>
              <InputGroup label="Entity ID">
                <TextInput path="entityId" />
              </InputGroup>
              <InputGroup label="Tags">
                <TagInput path="tags" items={tags} />
              </InputGroup>
              <InputGroup label="Measure">
                <SelectionInput path="measure" type="number" items={targetStore.getMeasures()} displayPath="name" valuePath="value" />
              </InputGroup>
              <InputGroup label="Period">
                <SelectionInput path="period" type="number" items={targetStore.getPeriods()} displayPath="name" valuePath="value" />
              </InputGroup>
              <InputGroup label="Periods">
                <TextInput path="multiplier" type="number" />
              </InputGroup>
              <InputGroup label="Number">
                <TextInput path="number" type="number" />
              </InputGroup>
              <InputGroup label="Starts">
                <TextInput path="starts" />
              </InputGroup>
              <InputGroup label="Retire">
                <TextInput path="retire" />
              </InputGroup>
              <InputGroup label="Created">
                <TextInput path="created" readonly />
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

/*************************************************************
 * BOOTSTRAP
 *************************************************************/
global.APP = LogEntry;
global.React = React;
global.ReactDOM = ReactDOM;
