// PACKAGES
import React from 'react';
import ReactDOM from 'react-dom';
// LIBS
import { shallowEqual } from 'libs/object-utils';
import { $control, $focus, $hide } from 'libs/style';
// MIXINS
import input from './input';

export class TextInput extends React.Component {
   /*************************************************************
    * DEFINITIONS
    *************************************************************/
   static defaultProps = {
      type: 'text',
   };

   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   constructor (props) {
      super(props);
      this.provideValue = this.provideValue.bind(this);
   }

   componentDidMount () {
      if (this.props.focus) {
         ReactDOM.findDOMNode(this).focus();
      }
   }

   shouldComponentUpdate (nextProps) {
      return !shallowEqual(nextProps, this.props);
   }

   provideValue (e) {
      var value = null;

      // Convert value from dom event
      if (e.target.value === undefined || e.target.value === '' || e.target.value === null) {
         value = null;
      }
      else if (['number', 'range'].indexOf(this.props.type) > -1 && typeof e.target.value === 'string') {
         if (this.props.step && this.props.step.indexOf('.') > -1) {
            value = parseFloat(e.target.value);
         }
         else {
            value = parseInt(e.target.value, 10);
         }
      }
      else {
         value = e.target.value;
      }

      this.props.onChange(value);
   }

   render () {
      var { path, currentValue, errors, focus, hasChanged, onFocus, onBlur, min, max, placeholder, readOnly, step, style, type, visible } = this.props;
      var hasErrors = errors && errors.length;

      var inputStyle = { ...style };
      if (hasChanged !== undefined && visible !== undefined) {
         inputStyle = {
            ...inputStyle,
            ...$control(hasChanged, hasErrors),
            ...(focus ? $focus(hasChanged, hasErrors) : {}),
            ...(visible ? {} : $hide),
         };
      }

      return (
            <input ref="input"
               readOnly={readOnly}
               style={inputStyle}
               autoComplete="off"
               id={path}
               type={type}
               value={currentValue}
               onChange={this.provideValue}
               onFocus={onFocus}
               onBlur={onBlur}
               placeholder={placeholder}
               min={min}
               max={max}
               step={step}
            />
        );
   }
}

export default input(TextInput);
