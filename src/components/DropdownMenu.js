/**
 * DropdownMenu
 * ClassNames: dropdown, dropdown-[default,primary,success,info,warning,danger], dropdown-menu, open
 * Dependencies: jQuery, Bootstrap(CSS)
 */
import React from 'react';

var DropdownMenu = React.createClass({
   /***********************************
    * DEFINITIONS
    ***********************************/
   propTypes: {
      className: React.PropTypes.string,
      dropDownMenuStyle: React.PropTypes.object,
      buttonContent: React.PropTypes.object,
      menuItems: React.PropTypes.array,
      open: React.PropTypes.bool,
      style: React.PropTypes.object,
      useDiv: React.PropTypes.bool,
   },

   getDefaultProps () {
      return {
         className: '',
         dropDownMenuStyle: null,
         buttonContent: null,
         menuItems: [],
         open: false,
         style: null,
         useDiv: false,
      };
   },

   getInitialState () {
      return {
         showMenu: false,
      };
   },

   /***********************************
    * EVENT HANDLING
    ***********************************/
   handleToggle () {
      this.setState({
         showMenu: !this.state.showMenu,
      });
   },

   /***********************************
    * RENDERING
    ***********************************/
   render () {
      var className = this.props.className;
      var buttonContent = this.props.buttonContent;
      var style = this.props.style;
      var menuItems = this.props.menuItems;
      var { showMenu } = this.state;

      if (className.length > 0) {
         className = ' ' + className;
      }

      if (this.props.useDiv === true) {
         return (
            <div ref="dropdown" style={this.props.style} onClick={this.handleToggle}>
               {buttonContent}
               <ul style={Object.assign({}, dropdownMenuStyle, this.props.dropDownMenuStyle) }>
                  {menuItems}
               </ul>
            </div>
         );
      }
      else {
         return (
            <li ref="dropdown" style={this.props.style} onClick={this.handleToggle}>
               {buttonContent}
               <ul style={Object.assign({}, dropdownMenuStyle(showMenu), this.props.dropDownMenuStyle) }>
                  {menuItems}
               </ul>
            </li>
         );
      }
   },
});

var dropdownToggleStyle = {
   ':focus': {
      outline: 0,
   },
};

var dropdownMenuStyle = function (showMenu) {
   return {
      position: 'absolute',
      top: '100%',
      left: '0',
      zIndex: '1000',
      display: showMenu ? 'block' : 'none',
      float: 'left',
      minWidth: '160px',
      padding: '5px 0',
      margin: '2px 0 0',
      fontSize: '14px',
      textAlign: 'left',
      listStyle: 'none',
      backgroundColor: '#fff',
      WebkitBackgroundClip: 'padding-box',
      backgroundClip: 'padding-box',
      // border: 1px solid #ccc;
      border: '1px solid rgba(0, 0, 0, .15)',
      borderRadius: '4px',
      WebkitBoxShadow: '0 6px 12px rgba(0, 0, 0, .175)',
      boxShadow: '0 6px 12px rgba(0, 0, 0, .175)',
   };
};

export default DropdownMenu;
