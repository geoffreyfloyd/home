import React from 'react';
import requestStore from 'stores/request-store';
import Request from './Request';
import { $clrLowContrast, $clrKeyword } from './style';
import { flexItem } from 'libs/style';

class Session extends React.Component {
   /*************************************************************
    * DEFINITIONS
    *************************************************************/
   constructor (props) {
      super(props);

      this.state = {
         title: null,
         ts: (new Date()).toISOString(),
         collapsed: false,
      };

      this.handleCloseClick = this.handleCloseClick.bind(this);
      this.handleCollapseClick = this.handleCollapseClick.bind(this);
      this.handleSelectClick = this.handleSelectClick.bind(this);
      this.handleStoreUpdate = this.handleStoreUpdate.bind(this);
   }

   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   componentDidMount () {
      requestStore.subscribe(this.handleStoreUpdate, null);
   }

   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   handleCloseClick () {
      requestStore.closeSession(this.props.sessionId);
   }

   handleCollapseClick () {
      this.setState({
         collapsed: !this.state.collapsed,
      });
   }

   handleSelectClick () {
      this.props.onSelect(this.props.sessionId);
   }

   handleStoreUpdate () {
      this.setState({
         ts: (new Date()).toISOString(),
      });
   }

   /*************************************************************
   * RENDERING
   *************************************************************/
   render () {
      var requests = requestStore.getRequests(this.props.sessionId);
      var titleByRequest, unselectedDom;
      if (requests.length > 0 && requests[0].cmd) {
         titleByRequest = requests[0].cmd;
      }
      else if (requests.length > 1) {
         titleByRequest = requests[1].cmd;
      }
      var title = this.state.title || titleByRequest || 'How can I help you?';

      if (!this.props.selected) {
         unselectedDom = ([
            <a onClick={this.handleSelectClick} style={styles.select}><i className={'fa fa-2x fa-circle-o'} style={styles.close}></i></a>,
         ]);

         if (this.state.collapsed) {
            unselectedDom.push(<a onClick={this.handleCollapseClick} style={styles.option}><i className={'fa fa-2x fa-plus'} style={styles.close}></i></a>);
         }
         else {
            unselectedDom.push(<a onClick={this.handleCollapseClick} style={styles.option}><i className={'fa fa-2x fa-minus'} style={styles.close}></i></a>);
         }
      }

      return (
         <div style={{ overflowY: 'auto' }} style={styles.appContainer}>
            <div style={{ width: '100%' }}>
               <a onClick={this.handleCloseClick} style={styles.closeLink}><i className={'fa fa-2x fa-close'} style={styles.close}></i></a>
               {unselectedDom}
               <h3 style={{ margin: '0', lineHeight: '40px' }}>{title}</h3>
               {this.state.collapsed ? [] : requests.map(request => <Request key={request.id} data={request} />)}
            </div>
         </div>
      );
   }
}
Session.propTypes = {
   layoutContext: React.PropTypes.object,
   style: React.PropTypes.object,
   onSelect: React.PropTypes.func,
   sessionId: React.PropTypes.string,
   selected: React.PropTypes.bool,
};

var styles = {
   appContainer: {
      ...flexItem({ flex: '1' }),
      // marginBottom: '10px',
      border: `2px ${$clrLowContrast} solid`,
      padding: '0 10px 5px 10px',
      background: '#222',
      color: '#ddd',
   },
   hover: {
      color: $clrKeyword,
   },
   close: {
      color: $clrLowContrast,
   },
   closeLink: {
      cursor: 'pointer',
      float: 'right',
      marginLeft: '0.2em'
   },
   option: {
      cursor: 'pointer',
      float: 'right',
      fontSize: '0.8em',
      marginTop: '0.42em'
   },
   select: {
      cursor: 'pointer',
      float: 'right',
      marginLeft: '0.4em',
      fontSize: '0.8em',
      marginTop: '0.42em'
   },
};

module.exports = Session;
