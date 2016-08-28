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
import { flex, flexItem } from 'libs/style';

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
      this.setState({
         showProcesses: !this.state.showProcesses,
      });
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
         <div key="currentSession" style={styles.currentSession}>
            <Session key={selectedSessionId} sessionId={selectedSessionId} selected />
         </div>
      );
      if (this.state.showProcesses) {
         sideSessions = (
            <div style={styles.sideSessions}>
               <div style={styles.blockFill}>
                  {otherSessionIds.map(sessionId => {
                     return (
                        <div style={styles.blockFill}>
                           <Session key={sessionId}
                              sessionId={sessionId}
                              style={{ maxHeight: '600px', overflowY: 'auto' }}
                              onSelect={this.handleSelectSession.bind(this) }
                           />
                        </div>
                     );
                  })}
               </div>
            </div>
         );
      }

      return (
         <WindowSizeLayout layoutOptions={{ overflow: '*', flex: false }}>
            <div style={styles.container}>
               <div style={styles.toolbar}>
                  <Toolbar
                    showProcesses={this.state.showProcesses}
                    onClickProcesses={this.handleClickProcesses}
                    onClickNewSession={this.handleClickNewSession}
                  >
                     <Prompt sessionId={selectedSessionId} />
                  </Toolbar>
               </div>
               <div style={styles.sessions}>
                  {currentSession}
                  {sideSessions}
               </div>
            </div>
         </WindowSizeLayout>
      );
   }

   renderSingleSession (sessionId) {
      return (
         <WindowSizeLayout layoutOptions={{ overflow: '*', flex: false }}>
            <div style={styles.container}>
               <div style={styles.toolbar}>
                  <Toolbar key="toolbar"
                    showProcesses={false}
                    onClickProcesses={this.handleClickProcesses}
                    onClickNewSession={this.handleClickNewSession}
                  >
                     <Prompt sessionId={sessionId} />
                  </Toolbar>
               </div>
               <div style={styles.sessions}>
                  <Session sessionId={sessionId} selected />
               </div>
            </div>
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

const styles = {
   blockFill: {
      display: 'block',
      width: '100%'
   },
   container: {
      ...flex('column', 'nowrap'),
      width: '100%',
      background: '#111'
   },
   currentSession: {
      ...flexItem({ flex: '1' }),
   },
   sessions: {
      ...flexItem({ flex: '1' }),
      width: '100%'
   },
   sideSessions: {
      ...flexItem({ width: '40rem' }),
      overflowY: 'auto',
   },
   toolbar: {
      height: '2.7rem',
      color: '#ddd'
   },
};

// Cmd.propTypes = { title: PropTypes.string.isRequired };

global.APP = Cmd;
global.React = React;
global.ReactDOM = ReactDOM;

export default Cmd;
