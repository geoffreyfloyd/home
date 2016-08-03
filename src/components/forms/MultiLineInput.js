// PACKAGES
import React from 'react';
import ReactDOM from 'react-dom';
// LIBS
import { shallowEqual } from 'libs/object-utils';
import { $control, $focus, $hide } from 'libs/style';
// MIXINS
import input from './input';

export class MultiLineInput extends React.Component {
   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   constructor (props) {
      super(props);
      this.provideValue = this.provideValue.bind(this);
   }

   componentDidMount () {
      if (this.props.autoGrow) {
         autoGrow(ReactDOM.findDOMNode(this));
      }
      if (this.props.focus) {
         ReactDOM.findDOMNode(this).focus();
      }
   }

   shouldComponentUpdate (nextProps) {
      return !shallowEqual(nextProps, this.props);
   }

   componentDidUpdate () {
      if (this.props.autoGrow && this.doAutoGrow) {
         this.doAutoGrow = false;
         autoGrow(ReactDOM.findDOMNode(this));
      }
      if (this.props.focus) {
         ReactDOM.findDOMNode(this).focus();
      }
   }

   componentWillReceiveProps (nextProps) {
      if (this.props.currentValue !== nextProps.currentValue) {
         this.doAutoGrow = true;
      }
   }

   /*************************************************************
    * EVENT HANDLING
    *************************************************************/
   provideValue (e) {
      var value = null;

      // Convert value from dom event
      if (e.target.value === undefined || e.target.value === '' || e.target.value === null) {
         value = null;
      }
      else {
         value = e.target.value;
      }

      this.doAutoGrow = true;
      this.props.onChange(value);
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      var { path, currentValue, errors, focus, hasChanged, onFocus, onBlur, placeholder, readOnly, style, visible } = this.props;
      var hasErrors = errors && errors.length;
      // If the value was previously truthy, setting the value to
      // null will not clear out the last value in the DOM
      var displayValue = currentValue === null ? '' : currentValue;

      var inputStyle = { height: 'auto', ...style };
      if (hasChanged !== undefined && visible !== undefined) {
         inputStyle = {
            ...inputStyle,
            ...$control(hasChanged, hasErrors),
            ...(focus ? $focus(hasChanged, hasErrors) : {}),
            ...(visible ? {} : $hide),
         };
      }

      return (
            <textarea ref="input"
   readOnly={readOnly}
   style={inputStyle}
   autoComplete="off"
   id={path}
   value={displayValue}
   onChange={this.provideValue}
   onFocus={onFocus}
   onBlur={onBlur}
   placeholder={placeholder}
   />
        );
   }
}

/*************************************************************
 * PRIVATE API
 *************************************************************/
function autoGrow (textArea) {
   textArea.style.overflowY = 'hidden';
   textArea.style.height = 'auto';
   textArea.style.height = textArea.scrollHeight + 'px';
}

export default input(MultiLineInput);
