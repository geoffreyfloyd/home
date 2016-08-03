// PACKAGES
import React from 'react';
import ReactDOM from 'react-dom';
// LIBS
import { shallowEqual } from 'libs/object-utils';
import { $control, $focus, $hide } from 'libs/style';
import those from 'those';
// MIXINS
import input from './input';

export class SelectionInput extends React.Component {
   /*************************************************************
    * DEFINITIONS
    *************************************************************/
   static propTypes = {
      // items, displayPath, and valuePath are required
      // if this.props.children is null
      items: React.PropTypes.oneOfType([
         React.PropTypes.array,
         React.PropTypes.func, // callback signature: input::ReactElement, frmChg::object{FormChangeEventArgs}, update::func{array}
      ]),
      displayPath: React.PropTypes.string,
      valuePath: React.PropTypes.string,

      // OPTIONAL
      focus: React.PropTypes.bool,
      style: React.PropTypes.object,
      size: React.PropTypes.number,
      type: React.PropTypes.oneOf(['string', 'number']),
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

   componentWillReceiveProps (nextProps) {
      if (nextProps.items !== this.props.items) {
         // Check if the new list contains the current value
         // If not, then set the value to the first item in
         // the list (or null if no list items)
         var matchObj = {};
         matchObj[nextProps.valuePath] = nextProps.currentValue;
         if (!those(nextProps.items).first(matchObj)) {
            if (nextProps.items.length > 0) {
               nextProps.onChange(nextProps.items[0][this.props.valuePath]);
            }
            else {
               nextProps.onChange(null);
            }
         }
      }
   }

   shouldComponentUpdate (nextProps) {
      return !shallowEqual(nextProps, this.props);
   }

   /*************************************************************
    * EVENT HANDLING
    *************************************************************/
   provideValue (e) {
      if (e.target.value === undefined || e.target.value === '' || e.target.value === null) {
         this.props.onChange(null);
      }
      else if (this.props.type === 'number' && typeof e.target.value === 'string') {
         this.props.onChange(parseInt(e.target.value, 10));
      }
      else {
         this.props.onChange(e.target.value);
      }
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   renderOptions () {
      var { items, displayPath, valuePath } = this.props;

      return items.map((item, index) => {
         // Get value and display
         var value = item;
         var display = item;
         if (valuePath) {
            value = item[valuePath];
         }
         if (displayPath) {
            display = item[displayPath];
         }

         return (
            <option key={index} value={value}>{display}</option>
         );
      });
   }

   render () {
      var { path, currentValue, errors, focus, hasChanged, onFocus, onBlur, readOnly, size, style, visible } = this.props;
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

        // Use given children or render children from items prop
      var options = this.props.children || this.renderOptions();
      return (
   <select
      id={path}
      onBlur={onBlur}
      onChange={this.provideValue}
      onFocus={onFocus}
      readOnly={readOnly}
      style={inputStyle}
      size={size}
      value={currentValue}
   >
      {options}
   </select>
);
   }
}

export default input(SelectionInput);
