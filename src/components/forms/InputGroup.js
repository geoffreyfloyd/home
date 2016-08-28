// PACKAGES
import React from 'react';
// LIBS
import { flex, flexItem } from 'libs/style';
// MIXINS
import formRelay from './formRelay';

class InputGroup extends React.Component {
   /*************************************************************
    * DEFINITIONS
    *************************************************************/
   static defaultProps = {
      labelSpan: 4,
   };

   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   constructor (props) {
      super(props);
      // Set initial state
      this.state = {
         visible: true,
      };
      // Bind method
      this.setVisible = this.setVisible.bind(this);
   }

   /*************************************************************
    * API
    *************************************************************/
   setVisible (value) {
      this.setState({
         visible: value,
      });
   }

   /*************************************************************
    * METHODS
    *************************************************************/
   getInputStyle (index) {
      var propName = 'styleInput' + String(index + 1);
      var style = this.props[propName];
      if (style) {
         return style;
      }
      return undefined;
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      // Single input wrap
      if (React.Children.count(this.props.children) === 1) {
         return (
            <div style={this.state.visible ? styles.root : styles.hide}>
               {React.Children.map(this.props.children, child => {
                  return this.renderLabel(React.cloneElement(child, { ...child.props, handleVisible: this.setVisible }), child);
               }) }
            </div>
         );
      }
      // Wrap multiple inputs
      return (
         <div style={this.state.visible ? styles.root : styles.hide}>
            {this.renderLabel(
               <div style={this.props.style}>
                  {React.Children.map(this.props.children, (child, index) => {
                     return (
                        <div style={{ ...styles.noPad, ...this.props.styleInput, ...child.props.groupStyle, ...this.getInputStyle(index) }}>
                           {React.cloneElement(child, { ...child.props, handleVisible: this.setVisible }) }
                        </div>
                     );
                  }) }
               </div>
            ) }
         </div>
      );
   }

   renderLabel (rendered, child) {
      var { label, labelExplain, labelBoxStyle, labelStyle, inputStyle } = this.props;

      if (label) {
         var path = child ? child.props.path : this.props.label;
         return (
            <div style={{ ...styles.labelBox, ...labelBoxStyle }}>
               <label style={{ ...styles.label, ...labelStyle }} title={labelExplain} htmlFor={path}>{label}</label>
               <div style={{ ...styles.input, ...inputStyle }}>
                  {rendered}
               </div>
            </div>
         );
      }
      return rendered;
   }
}

/*************************************************************
 * STYLES
 *************************************************************/
var styles = {
   labelBox: {
      ...flex('row', 'nowrap', { alignContent: 'flex-start' })
   },
   label: {
      width: '10rem',
      minWidth: '10rem',
      textAlign: 'right',
      padding: '0.35rem 1rem',
      fontSize: '1rem',
      fontWeight: '700',
      marginBottom: '0',
   },
   input: {
      ...flexItem({ flex: '1', maxWidth: '30rem' }),
   },
   root: {
      paddingBottom: '1rem'
   },
   hide: {
      display: 'none',
   },
   noPad: {
      padding: 0,
   },
};

export default formRelay(InputGroup);
