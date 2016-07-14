/* globals window document $ */
import React from 'react';
import those from 'those';

// Mixins and Subcomponents
import LogEntryListItem from './LogEntryListItem';
import focusTags from 'components/focusTags';

// Stores
import logEntryStore from 'stores/logentry-store';

class LogEntryList extends React.Component {
   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   constructor (props) {
      super(props);
      var newModel = logEntryStore.new();
      if (props.currentFocus) {
         newModel.tags.push(props.currentFocus);
      }      
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
      if (nextProps.logentries !== this.props.logentries || nextProps.currentFocus !== this.props.currentFocus) {
         var newModel = logEntryStore.new();
         if (nextProps.currentFocus) {
            newModel.tags.push(nextProps.currentFocus);   
         }
         
         this.setState({
            maxReturn: 10,
            newModel,
         });
      }
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

      return (
         <div style={styles.container}>
            <LogEntryListItem key={newModel.id} data={newModel} />
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
