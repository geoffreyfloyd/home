// PACKAGES
import React from 'react';
import ReactDOM from 'react-dom';
// STORES
import logentryStore from 'stores/logentry-store';
import tagStore from 'stores/tag-store';
// COMPONENTS
import appStyle from 'apps/gnidbits/style';
import LoadingIndicator from 'components/LoadingIndicator';
import LogEntryList from 'components/LogEntryList';

export default class LogEntries extends React.Component {
   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   constructor (props) {
      super(props);
      // Bind event handlers
      this.handleLogentryStoreUpdate = this.handleLogentryStoreUpdate.bind(this);
      this.handleTagStoreUpdate = this.handleTagStoreUpdate.bind(this);
      // Set initial state
      this.state = {
         list: [],
         tags: [],
      };
   }

   componentDidMount () {
      logentryStore.subscribe(this.handleLogentryStoreUpdate, { key: JSON.stringify({ key: '*' }) });
      tagStore.subscribe(this.handleTagStoreUpdate, { key: JSON.stringify({ key: '*' }) });
   }

   /*************************************************************
    * EVENT HANDLING
    *************************************************************/
   handleLogentryStoreUpdate (value) {
      this.setState({
         list: value.results || this.state.list,
      });
   }

   handleTagStoreUpdate (value) {
      this.setState({
         tags: value.results || this.state.tags,
      });
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      var { list, tags } = this.state;

      if (!list.length || !tags.length) {
         return (
            <div style={appStyle.background}>
               <div style={appStyle.loading}>
                  <LoadingIndicator />
               </div>
            </div>
         );
      }

      return (
         <div style={appStyle.background}>
            <div style={appStyle.content}>
               <LogEntryList list={list} tags={tags} />
            </div>
         </div>
      );
   }
}

/*************************************************************
 * BOOTSTRAP
 *************************************************************/
global.APP = LogEntries;
global.React = React;
global.ReactDOM = ReactDOM;
