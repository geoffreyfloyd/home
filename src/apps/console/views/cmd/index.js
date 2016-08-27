/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import Prompt from './Prompt';
import Session from './Session';
import Toolbar from './Toolbar';
import requestStore from 'stores/request-store';
import WindowSizeLayout from 'components/Layout/WindowSizeLayout';
import Layout from 'components/Layout/Layout';

class Cmd extends React.Component {
   constructor (props) {
      super(props);
      this.state = {
         selectedSessionId: requestStore.new(),
         sessionIds: [],
         showProcesses: true,
         sidePanelWidth: 400,
      };
      this.handleClickProcesses = this.handleClickProcesses.bind(this);
      this.handleClickNewSession = this.handleClickNewSession.bind(this);
      this.handleSelectSession = this.handleSelectSession.bind(this);
      this.handleStoreUpdate = this.handleStoreUpdate.bind(this);
   }

   componentDidMount () {
      requestStore.subscribe(this.handleStoreUpdate.bind(this), null);
   }

   componentWillUnmount () {
      requestStore.unsubscribe(this.handleStoreUpdate.bind(this), null);
   }

   /*************************************************************
    * EVENT HANDLING
    *************************************************************/
   handleStoreUpdate () {
      var selectedSessionId = this.state.selectedSessionId;
      if (requestStore.getRequests(selectedSessionId).length === 0) {
         var sessionIds = requestStore.getSessionIds();
         if (sessionIds.length > 0) {
            this.setState({
               ts: (new Date()).toISOString(),
               selectedSessionId: sessionIds[0],
            });
            return;
         }
      }

      this.setState({
         ts: (new Date()).toISOString(),
      });
   }

   handleClickProcesses () {
      var state = Object.assign({
         showProcesses: !this.state.showProcesses,
      }, this.calculateSize(!this.state.showProcesses));
      this.setState(state);
   }

   handleClickNewSession () {
      requestStore.new();
   }

   handleSelectSession (sessionId) {
      this.setState({
         selectedSessionId: sessionId,
      });
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   renderMultiSession (sessionIds) {
      var selectedSessionId = this.state.selectedSessionId;

      if (selectedSessionId === null) {
         selectedSessionId = sessionIds[0];
      }

      var otherSessionIds = [];

      sessionIds.map(sessionId => {
         if (sessionId !== selectedSessionId) {
            otherSessionIds.push(sessionId);
         }
      });

      var currentSession, sideSessions;
      currentSession = (
         <Layout layoutWidth="flex" key="mainworkspace">
            <Session sessionId={selectedSessionId} selected />
         </Layout>
      );
      if (this.state.showProcesses) {
         sideSessions = (
            <Layout layoutWidth="20rem" key="sideSessions">
               {otherSessionIds.map(sessionId => {
                  return (<Session key={sessionId} sessionId={sessionId} style={{ maxHeight: '600px', overflowY: 'auto' }} onSelect={this.handleSelectSession.bind(this) } />);
               }) }
            </Layout>
         );
      }

      return (
         <WindowSizeLayout layoutOptions={{ overflow: '*', flex: false }}>
            <Layout layoutHeight="flex:900" layoutWidth="flex:1500" layoutOptions={{ flex: false }}>
               <Layout layoutHeight="3rem">
                  <Toolbar key="toolbar" showProcesses={this.state.showProcesses} onClickProcesses={this.handleClickProcesses} onClickNewSession={this.handleClickNewSession}>
                     <Prompt sessionId={selectedSessionId} />
                  </Toolbar>
               </Layout>
               <Layout layoutHeight="flex">
                  {currentSession}
                  {sideSessions}
               </Layout>
            </Layout>
         </WindowSizeLayout>
      );
   }

   renderSingleSession (sessionId) {
      var session;
      session = (
         <Layout key="mainworkspace">
            <Session sessionId={sessionId} selected />
         </Layout>
      );

      return (
         <WindowSizeLayout layoutOptions={{ overflow: '*', flex: false }}>
            <Layout layoutHeight="flex:900" layoutWidth="flex:1500" layoutOptions={{ flex: false }}>
               <Layout layoutHeight="3rem">
                  <Toolbar key="toolbar"
                    showProcesses={false}
                    onClickProcesses={this.handleClickProcesses}
                    onClickNewSession={this.handleClickNewSession}
                  >
                     <Prompt sessionId={sessionId} />
                  </Toolbar>
               </Layout>
               <Layout layoutHeight="flex">
                  {session}
               </Layout>
            </Layout>
         </WindowSizeLayout>
      );
   }

   render () {
      var sessionIds = requestStore.getSessionIds();

      if (sessionIds.length === 0) {
         return null;
      }
      else if (sessionIds.length === 1) {
         return this.renderSingleSession(sessionIds[0]);
      }
      return this.renderMultiSession(sessionIds);
   }
}

// Cmd.propTypes = { title: PropTypes.string.isRequired };

global.APP = Cmd;
global.React = React;
global.ReactDOM = ReactDOM;

export default Cmd;
