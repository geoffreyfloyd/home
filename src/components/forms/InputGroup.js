// PACKAGES
import React from 'react';
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
      // Detect if any children of the input group have the noBootstrap prop
      // and not set bootstrap classes when any have it set
      var noBootStrap;
      React.Children.forEach(this.props.children, child => {
         noBootStrap = child.props.noBootStrap || noBootStrap;
      });
      // Wrap inputs
      if (React.Children.count(this.props.children) === 1) {
         return (
            <div className={noBootStrap ? '' : 'form-group'} style={this.state.visible ? {} : styles.hide}>
               {React.Children.map(this.props.children, child => {
                  return this.renderLabel(React.cloneElement(child, { ...child.props, handleVisible: this.setVisible }), child);
               }) }
            </div>
         );
      }
      else {
         return (
            <div className={noBootStrap ? '' : 'form-group'} style={this.state.visible ? {} : styles.hide}>
               {this.renderLabel(
                  <div className={noBootStrap ? '' : 'input-group'} style={this.props.style}>
                     {React.Children.map(this.props.children, (child, index) => {
                        return (
                           <div className={noBootStrap ? '' : 'input-group-addon'} style={Object.assign({}, styles.noPad, this.props.styleInput, child.props.groupStyle, this.getInputStyle(index)) }>
                              {React.cloneElement(child, { ...child.props, handleVisible: this.setVisible }) }
                           </div>
                        );
                     }) }
                  </div>
               ) }
            </div>
         );
      }
   }

   renderLabel (rendered, child) {
      var { label, labelExplain, labelSpan, labelStyle } = this.props;

      if (label) {
         var path = child ? child.props.path : this.props.label;
         var inputSpan = 12 - labelSpan;
         var labelClass = labelStyle ? '' : 'col-md-' + labelSpan;
         var inputClass = labelStyle ? '' : 'col-md-' + inputSpan;
         return (
            <div>
               <label className={[labelClass, 'control-label'].join(' ') } style={labelStyle} title={labelExplain} htmlFor={path}>{label}</label>
               <div className={inputClass}>
                  {rendered}
               </div>
            </div>
         );
      }
      else {
         return rendered;
      }
   }
}

/*************************************************************
 * STYLES
 *************************************************************/
var styles = {
   hide: {
      display: 'none',
   },
   noPad: {
      padding: 0,
   },
};

export default formRelay(InputGroup);
