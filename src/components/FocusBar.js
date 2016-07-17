
/* globals window */
import React from 'react';
import those from 'those';
import FocusListItem from 'components/FocusListItem';
import DropdownMenu from 'components/DropdownMenu';
// import Microphone from '../components/Microphone';
// import NotificationDropdown from '../components/NotificationDropdown';
// import Timer from '../components/Timer';

var FocusBar = React.createClass({

   propTypes: {
      currentFocus: React.PropTypes.object,
      focuses: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
      handleFocusClick: React.PropTypes.func.isRequired,
   },

   /*************************************************************
    * EVENT HANDLING
    *************************************************************/
   handleFocusClick (item) {
      this.props.handleFocusClick(item);
   },

   handleFocusMenuClick () {

   },

   /*************************************************************
    * RENDERING
    *************************************************************/
   renderFocusesDropDownMenu () {
      var { currentFocus, focuses } = this.props;

      /**
       * Add a tag list item for each item in the list
       */
      var menuItems = focuses.map(item => (
         <FocusListItem
            key={item.id}
            data={item}
            handleFocusClick={this.handleFocusClick}
         />
      ));

      /**
       * Add additional menu item when in Focus Management
       */
      var f = {};
      f.name = 'nofocus';
      menuItems.push((
         <li key="nofocus" >
            <a onClick={this.handleFocusClick.bind(null, f) } style={styles.menuItem}>
               <div>
                  <div style={{ display: 'inline', verticalAlign: 'inherit' }}>
                     <img style={styles.buttonImage} src={'/my/tag/icon.png'} />
                  </div>
                  <div style={{ display: 'inline-block' }}>Clear Focus</div>
               </div>
            </a>
         </li>
      ));

      var button = null;
      if (currentFocus && currentFocus.name !== 'nofocus') {
         button = (
            <div onClick={this.handleFocusMenuClick}><img style={styles.buttonImage} src={'/my/tag/' + currentFocus.id + '/icon.png'} title={currentFocus.kind + ': ' + currentFocus.name} /></div>
         );
      }
      else {
         button = (
            <div onClick={this.handleFocusMenuClick}><img style={styles.buttonImage} src={'/my/tag/icon.png'} /></div>
         );
      }

      return (
         <DropdownMenu id={'focuses'} style={{ float: 'left', padding: '2px', width: '50px' }} buttonContent={button} menuItems={menuItems} />
      );
   },

   renderIntentsDropDownMenu () {
      var intents = [
         { name: 'View Actions', url: '/actions', classNames: 'fa fa-eye fa-2x' },
         { name: 'New Action', url: '/action/new', classNames: 'fa fa-eye fa-2x' },
         { name: 'View Logs', url: '/logs', classNames: 'fa fa-eye fa-2x' },
         { name: 'New Log', url: '/log/new', classNames: 'fa fa-eye fa-2x' },
         { name: 'View Targets', url: '/targets', classNames: 'fa fa-eye fa-2x' },
      ];

      /**
       * Add a tag list item for each item in the list
       */
      var menuItems = intents.map(item => (
         <li key={item.url.slice(1) } >
            <a href={item.url} style={styles.menuItem}>
               <div>
                  <div style={{ display: 'inline-block' }}>{item.name}</div>
               </div>
            </a>
         </li>
      ));

      // TODO: Find active intent
      var button = null;
      var activeIntent;
      if (global.window) {
         activeIntent = those(intents).first({ url: global.window.location.pathname });
      }

      button = (
         <div style={{ marginLeft: '1rem', color: '#2B90E8', fontSize: '2rem' }}>
            <div style={{ display: 'inline-block' }}>{activeIntent ? activeIntent.name : 'Unknown'}</div>
         </div>
      );

      return (
         <DropdownMenu id={'intent'} style={{ cursor: 'pointer', float: 'left', padding: '2px', width: '20rem' }} buttonContent={button} menuItems={menuItems} />
      );
   },

   render () {
      var focusesDropDownMenu = this.renderFocusesDropDownMenu();
      var intentsDropDownMenu = this.renderIntentsDropDownMenu();
      // <Microphone focusTag={this.props.currentFocus ? this.props.currentFocus.name : ''} />
      return (
         <div style={styles.navbar}>
            <ul style={styles.navbarItems}>
               {focusesDropDownMenu}
               {intentsDropDownMenu}
            </ul>
         </div>
      );
   },
});

var styles = {
   buttonImage: {
      width: '50px',
      display: 'inline-block',
      paddingRight: '5px',
      cursor: 'pointer',
   },
   buttonNoImage: {
      width: '50px',
      cursor: 'pointer',
   },
   navbar: {
      position: 'relative',
      minHeight: '50px',
      border: '1px solid transparent',
      backgroundColor: '#222',
   },
   navbarItems: {
      padding: '0',
      margin: '0',
      listStyle: 'none',
   },
   menuItem: {
      display: 'block',
      padding: '3px 5px',
      borderBottom: '1px solid #e0e0e0',
      clear: 'both',
      fontWeight: '400',
      lineHeight: '1.42857143',
      color: '#333',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
   },
};

export default FocusBar;
