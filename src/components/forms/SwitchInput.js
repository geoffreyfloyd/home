// PACKAGES
import React from 'react';
// LIBS
import { shallowEqual } from 'libs/object-utils';
import { $control, $focus, $hide } from 'libs/style';
// MIXINS
import input from './input';

export class SwitchInput extends React.Component {
   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   constructor (props) {
      super(props);
      this.provideValue = this.provideValue.bind(this);
      this.handleToggleClick = this.handleToggleClick.bind(this);
   }

   componentDidMount () {
      if (this.props.focus) {
         this.getDOMNode().focus();
      }
   }

   shouldComponentUpdate (nextProps) {
      return !shallowEqual(nextProps, this.props);
   }

   /*************************************************************
    * EVENT HANDLING
    *************************************************************/
   handleToggleClick () {
      // Ignore click (img element does not have a readOnly property)
      if (this.props.readOnly) {
         return;
      }

      this.props.onChange(!this.props.currentValue);
   }

   provideValue (e) {
      var value = e.target.checked;
      this.props.onChange(value);
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      var { path, currentValue, errors, focus, hasChanged, info, onFocus, onBlur, readOnly, src, style, visible } = this.props;
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

      if (this.props.src) {
         return (
            <img style={{ ...styles.image(currentValue), ...inputStyle }}
               src={src}
               id={path}
               className="form-control"
               title={info}
               onBlur={onBlur}
               onClick={this.handleToggleClick}
               onFocus={onFocus}
            />
         );
      }
      return (
         <input readOnly={readOnly}
            style={inputStyle}
            id={path}
            checked={currentValue}
            onBlur={onBlur}
            onChange={this.provideValue}
            onFocus={onFocus}
            title={info}
            type="checkbox"
         />
      );
   }
}

/*************************************************************
 * STYLES
 *************************************************************/
var styles = {
   image: function (isChecked) {
      return {
         cursor: 'pointer',
         padding: '0.25rem',
         height: '2.5rem',
         width: '2.5rem',
         opacity: isChecked ? '1' : '0.5',
         backgroundColor: isChecked ? 'white' : '#b9b9b9',
      };
   },
};

export default input(SwitchInput);
