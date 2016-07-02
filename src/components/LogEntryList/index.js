/* globals window document $ */
import React from 'react';
import those from 'those';
import LogEntryListItem from './LogEntryListItem';

export default class LogEntryList extends React.Component {
   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   constructor (props) {
      super(props);
      this.state = {
         maxReturn: 10,
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
      if (nextProps.logentries !== this.props.logentries) {
         this.setState({
            maxReturn: 10,
         });
      }
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      var { maxReturn } = this.state;
      var logentries = those(this.props.logentries)
         .order(item => item.date.split('T')[0] + '-' + (['performed', 'skipped'].indexOf(item.kind) > -1 ? '1' : '0'))
         .flip()
         .top(maxReturn);

      return (
         <div style={styles.container}>
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
