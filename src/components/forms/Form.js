// PACKAGES
import React from 'react';
import those from 'those';
// LIBS
import { getThrottledHandler } from 'libs/event-handler';
import { asArray, copy, extract, merge } from 'libs/object-utils';
// MIXINS
import input from './input';
import formRelay from './formRelay';
// COMPONENTS
import InputTable from './InputTable';

class Form extends React.Component {
   /*************************************************************
    * DEFINITIONS
    *************************************************************/
   static defaultProps = {
      showChanges: true,
   };

   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   constructor (props) {
      super(props);

      // Initialize non-state props
      this.changeMap = {};
      this.errorMap = {};
      this.inputMap = {};

      // Set initial state
      this.state = {
         formState: copy(this.props.model) || {},
      };

      // Bind event handlers
      this.handleInputRegister = this.handleInputRegister.bind(this);
      this.handleInputUnregister = this.handleInputUnregister.bind(this);
      this.handleUpdateRequest = this.handleUpdateRequest.bind(this);

      // Throttle updates to unmanaged state
      this.requestUnmanagedStateUpdate = getThrottledHandler(this.requestUnmanagedStateUpdate.bind(this), 500);
   }

   componentDidMount () {
      // Initialize inputs
      this._isMounted = true;
      this.initializeNewRegistrations();
   }

   componentWillReceiveProps (nextProps) {
      if (nextProps.model !== this.props.model && nextProps.showChanges) {
         this.setState({
            formState: copy(nextProps.model) || {},
         });

         this.changeMap = {};
         this.errorMap = {};

         this.didReset = true;
      }
   }

   componentDidUpdate () {
      if (this.didReset) {
         this.didReset = false;
         this.notifyOnChange(this.state.formState);
         this.notifyInputs({ pathFilter: undefined, changeArgs: undefined, formState: this.state.formState });
      }
      else {
         this.initializeNewRegistrations();
      }
   }

   componentWillUnmount () {
      this._isMounted = false;
   }

   /*************************************************************
    * EVENT HANDLING
    *************************************************************/
   handleInputRegister (path, notify, dependsOn, changeArgs) {
      // Register input in map
      this.inputMap[path] = {
         notify,
         dependsOn,
         initialized: false,
      };
      // Update change and error maps
      this.changeMap[path] = changeArgs.hasChanged;
      this.errorMap[path] = changeArgs.errors;
      this.requestUnmanagedStateUpdate();
   }

   handleInputUnregister (path) {
      delete this.inputMap[path];
      delete this.changeMap[path];
      delete this.errorMap[path];
      this.requestUnmanagedStateUpdate();
   }

   handleUpdateRequest (path, changeArgs) { // value, error, hasChanged
      var { value, errors, hasChanged } = changeArgs;
      var { formState } = this.state;
      var { showChanges } = this.props;

      var currentValue = extract(formState, path);
      var newFormState = merge(formState, path, value);

      if (value !== currentValue) {
         var formError;
         var formErrors = [];
         asArray(this.props.validate).forEach((validation) => {
            formError = validation(newFormState, this.props.label);
            if (formError) {
               formErrors.push(formError);
            }
         });
         if (formErrors.length) {
            this.errorMap.__form__ = formErrors;
         }
         else if (this.errorMap.__form__) {
            delete this.errorMap.__form__;
         }
      }

      var updatedUnmanagedState = false;
      if (showChanges && this.changeMap[path] !== hasChanged) {
         this.changeMap[path] = hasChanged;
         updatedUnmanagedState = true;
      }

      if (this.errorMap[path] !== errors) {
         this.errorMap[path] = errors;
         updatedUnmanagedState = true;
      }

      // Update state immediately upon request ONLY if value changed
      // otherwise, we will request an unmanaged state update (250ms throttle)
      if (value !== currentValue) {
         this.setState({
            formState: newFormState,
         });

         // Notify dependencies of the update
         this.notifyInputs({ pathFilter: path, changeArgs, formState: newFormState });

         // Notify callback of changeArgs
         this.notifyOnChange(newFormState);
      }
      else if (updatedUnmanagedState) {
         this.requestUnmanagedStateUpdate();
      }
   }

   /*************************************************************
    * METHODS
    *************************************************************/
   initializeNewRegistrations () {
      Object.keys(this.inputMap).forEach(key => {
         var inputRef = this.inputMap[key];
         if (!inputRef.initialized) {
            inputRef.initialized = true;
            inputRef.notify(undefined, undefined, this.state.formState);
         }
      });
   }

   notifyInputs ({ pathFilter, changeArgs, formState }) {
      // Iterate through all registered inputs
      Object.keys(this.inputMap).forEach((key) => {
         // Get input ref
         var inputRef = this.inputMap[key];

         // Cast dependsOn prop to an array to simplify logic
         var dependsOn = asArray(inputRef.dependsOn);

         // Notify registered input when no binding path filter is passed (global notify)
         // or if the binding path of the updated value is one that this input is dependant on
         if (!pathFilter || dependsOn.indexOf(pathFilter) > -1 || dependsOn.indexOf('*') > -1) {
            inputRef.notify(pathFilter, changeArgs, formState);
         }
      });
   }

   notifyOnChange (formState) {
      if (typeof this.props.onChange === 'function') {
         // Check change status
         var hasFormChanged = those(this.changeMap).first(i => {
            return i === true;
         }) || false;

         // Check validity
         var isFormValid = true;
         var anyFormErrors = those(this.errorMap).first(i => {
            return i && i.length;
         });
         if (anyFormErrors && anyFormErrors.length) {
            isFormValid = false;
         }

         this.props.onChange({ hasChanged: hasFormChanged, isValid: isFormValid, form: formState });
      }
   }

   getValue () {
      // Return the current value
      return this.state.formState;
   }

   reset () {
      this.setState({
         formState: copy(this.props.model) || {},
      });

      this.changeMap = {};
      this.errorMap = {};

      // Set flag for ComponentDidUpdate to notify the components
      // that we need them to reinitialize
      this.didReset = true;
   }

   getFormRelayProps (element) {
      // Form state and props
      var { changeMap, errorMap } = this;
      var { formState } = this.state;
      var { InputWrapper, model } = this.props;

      // Input Group element props
      var props = element ? element.props : {};

      return {
         ...props,
         model: model,
         formState: formState,
         errorMap: errorMap,
         changeMap: changeMap,
         handleInputRegister: this.handleInputRegister,
         handleInputUnregister: this.handleInputUnregister,
         handleUpdateRequest: this.handleUpdateRequest,
         InputWrapper: InputWrapper,
         labelExplain: props.labelExplain || this.props.labelExplain,
         labelStyle: props.labelStyle || this.props.labelStyle,
      };
   }

   getFormCollectionRelayProps (element) {
      // Form state and props
      var { changeMap, errorMap } = this;
      var { formState } = this.state;
      var { InputWrapper, model } = this.props;

      // Input element props
      var { path, ...props } = element.props;

      // Derive original and current collection values
      var currentValue = extract(formState, path);
      var originalValue = extract(model, path);

      return {
         ...props,
         // Form Collection Input Props
         currentValue: currentValue,
         originalValue: originalValue,
         hasChanged: changeMap[path] || false,
         errors: errorMap[path] || [],
         // Form Relay Props
         model: model,
         formState: formState,
         errorMap: errorMap,
         changeMap: changeMap,
         handleInputRegister: this.handleInputRegister,
         handleInputUnregister: this.handleInputUnregister,
         handleUpdateRequest: this.handleUpdateRequest,
         InputWrapper: InputWrapper,
         labelExplain: props.labelExplain || this.props.labelExplain,
         labelStyle: props.labelStyle || this.props.labelStyle,
      };
   }

   getInputDependsOn (element) {
      // No binding path to prepend to dependency path
      if (!this.props.basePath) {
         return element.props.dependsOn;
      }

      // Cast dependsOn prop to an array to simplify logic
      var dependsOn = asArray(element.props.dependsOn);

      // Get row-modified depends on values
      dependsOn = dependsOn.map(d => this.props.basePath + '.' + d);

      return dependsOn;
   }

   getInputProps (element) {
      // Form state and props
      var { changeMap, errorMap } = this;
      var { formState } = this.state;
      var { model } = this.props;

      // Input element props
      var { path, ...props } = element.props;

      // Derive original and current values
      var currentValue = extract(formState, path);
      var originalValue = extract(model, path);
      var dependsOn = this.getInputDependsOn(element);

      return {
         ...props,
         currentValue: currentValue,
         dependsOn: dependsOn,
         originalValue: originalValue,
         hasChanged: changeMap[path] || false,
         errors: errorMap[path] || [],
         register: this.handleInputRegister.bind(null, path),
         unregister: this.handleInputUnregister.bind(null, path),
         requestUpdate: this.handleUpdateRequest.bind(null, path),
         labelExplain: props.labelExplain || this.props.labelExplain,
         labelSpan: props.labelSpan || this.props.labelSpan,
         labelStyle: props.labelStyle || this.props.labelStyle,
      };
   }

   requestUnmanagedStateUpdate () {
      // We're not ready
      if (!this._isMounted) {
         this.requestUnmanagedStateUpdate();
         return;
      }

      this.updateUnmanagedTimeout = null;
      this.setState({
         lastUpdate: new Date().toISOString(),
      });
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   renderErrors () {
      var domErrors;

      var { errorMap } = this;

      // Concatenate all input errors
      var errors = [];
      Object.keys(errorMap).forEach(key => {
         var inputErrors = errorMap[key];
         if (inputErrors && inputErrors.length) {
            errors = errors.concat(inputErrors);
         }
      });

      // Render errors
      if (errors.length > 0) {
         domErrors = (
            <div key="errors" className="validation-summary-errors text-danger" dataValmsgSummary="true">
               <ul>
                  {errors.map((error, index) => <li key={index}>{error}</li>)}
               </ul>
            </div>
         );
      }

      return domErrors;
   }

   render () {
      // State and props
      var errors = this.renderErrors();

      return (
         <form action={this.props.action || ''} className={this.props.className || 'form-horizontal'} method={this.props.method} role="form">
            {errors}
            <div style={this.props.style}>
               {React.Children.map(this.props.children, (child, index) => {
                  // Don't wrap input groups and any children that don't have a field
                  if (!child) {
                     return child;
                  }
                  else if (child.type && child.type.derivesFrom === input) {
                     return React.cloneElement(child, { ...this.getInputProps(child) });
                  }
               else if (child.type && child.type.derivesFrom === formRelay) {
                  return React.cloneElement(child, Object.assign({ key: index }, this.getFormRelayProps(child)));
               }
               else if (child.type === InputTable) {
                  return React.cloneElement(child, Object.assign({ key: index }, this.getFormCollectionRelayProps(child)));
               }
               else {
                  return React.cloneElement(child, { key: index, ...child.props });
               }
               }) }
               {/* hidden input included to ensure that the enter key submit quirk
                    that occurs when there is only one <input> in the form is avoided */}
               <input key="hidden" type="text" style={styles.hidden} />
            </div>
         </form>
      );
   }
}

var styles = {
   icon: {
      height: '2rem',
      marginTop: '-0.5rem',
      float: 'left',
      marginRight: '1rem',
   },
   info: {
      float: 'right',
      fontSize: '1.2rem',
   },
   hidden: {
      display: 'none',
   },
};

export default Form;
