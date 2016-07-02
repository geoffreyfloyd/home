import React from 'react';
import ReactDOM from 'react-dom';
import http from 'libs/http';
import logEntryStore from 'stores/logentry-store';
import { $background, $content } from 'components/styles';
import LogEntryList from 'components/LogEntryList';

export default class LogEntries extends React.Component {
   constructor (props) {
      super(props);

      // Set initial state
      this.state = {
         logentries: [],
         tags: [],
      };
   }

   componentDidMount () {
      // Get Data
      http(`/graphql?query={
         logentries{
            id,
            kind,
            date,
            details,
            duration,
            actions{id,name},
            tags{id,name,kind,descendantOf}
         },
         tags{
            id,
            name,
            kind,
            descendantOf
         }
      }`.replace(/ /g, '')).requestJson().then(json => {
         // Set data
         this.setState({
            logentries: json.data.logentries,
            tags: json.data.tags,
         });
      });
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      var { logentries, tags } = this.state;
      return (
         <div style={$background}>
            <div style={$content}>
               <LogEntryList logentries={logentries} />
            </div>
         </div>
      );
   }
}

global.APP = LogEntries;
global.React = React;
global.ReactDOM = ReactDOM;
