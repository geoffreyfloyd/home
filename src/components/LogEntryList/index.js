/* globals window document $ */
import React from 'react';
import those from 'those';

// Mixins and Subcomponents
import LogEntryListItem from './LogEntryListItem';
import focusTags from 'components/focusTags';

// LIBS
import { getLocalDateString } from 'libs/date-util';

// Stores
import logEntryStore from 'stores/logentry-store';

class LogEntryList extends React.Component {
   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   constructor (props) {
      super(props);
      var newModel = this.getNewModel(props);
      this.state = {
         maxReturn: 10,
         newModel,
      };
   }

   componentDidMount () {
      if (window && document) {
         $(window).scroll(() => {
            if (($(window).scrollTop() + $(window).height()) > $(document).height() - 50) {
               this.setState({ maxReturn: this.state.maxReturn + 10 });
            }
         });
      }
   }

   componentWillReceiveProps (nextProps) {
      if (nextProps.list !== this.props.list || nextProps.currentFocus !== this.props.currentFocus || nextProps.tagFilter !== this.props.tagFilter) {
         var newModel = this.getNewModel(nextProps);
         this.setState({
            maxReturn: 10,
            newModel,
         });
      }
   }

   getNewModel (props) {
      var newModel;
      var latestLog = those(props.list)
         .order(item => item.date.split('T')[0] + '-' + (['performed', 'skipped'].indexOf(item.kind) > -1 ? '1' : '0'))
         .flip()
         .first();
      if (!latestLog || latestLog.date !== getLocalDateString()) {
         newModel = logEntryStore.new();
         newModel.id = '';
         if (props.tagFilter && props.tagFilter.length) {
            newModel.tags = props.tags.filter(tag => props.tagFilter.indexOf(tag.name) > -1);
         }
         else if (props.currentFocus && props.currentFocus.name !== 'nofocus') {
            newModel.tags.push(props.currentFocus);
         }
      }
      return newModel;
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      var { maxReturn, newModel } = this.state;
      var { list } = this.props;
      var logentries = those(list)
         .order(item => item.date.split('T')[0] + '-' + (['performed', 'skipped'].indexOf(item.kind) > -1 ? '1' : '0'))
         .flip()
         .top(maxReturn);
      var today = newModel ? <LogEntryListItem key={newModel.id} data={newModel} /> : null;
      return (
         <div style={styles.container}>
            {today}
            {logentries.map(log => <LogEntryListItem key={log.id} data={log} />)}
         </div>
      );
   }
}

/*************************************************************
 * STYLING
 *************************************************************/
var styles = {
   container: {
      backgroundColor: '#222',
      paddingTop: '0.5rem',
   },
};

export default focusTags(LogEntryList);
