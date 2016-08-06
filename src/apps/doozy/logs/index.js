import React from 'react';
import ReactDOM from 'react-dom';
import http from 'libs/http';
import { $background, $content } from 'components/styles';
import LogEntryList from 'components/LogEntryList';

export default class LogEntries extends React.Component {
   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   constructor (props) {
      super(props);

      // Set initial state
      this.state = {
         list: [],
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
            list: json.data.logentries,
            tags: json.data.tags,
         });
      });
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      var { list, tags } = this.state;

      if (!list.length || !tags.length) {
         return <div>Loading...</div>;
      }

      return (
         <div style={$background}>
            <div style={$content}>
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
