import React from 'react';
import RelativeTime from './RelativeTime';

class FocusListItem extends React.Component {
   constructor (props) {
      super(props);

      // Bind event handlers
      this.handleFocusClick = this.handleFocusClick.bind(this);
   }

   /*************************************************************
    * EVENT HANDLING
    *************************************************************/
   handleFocusClick (item) {
      if (this.props.handleFocusClick) {
         this.props.handleFocusClick(item);
      }
   }

   /*************************************************************
    * RENDERING HELPERS
    *************************************************************/
   calcFocusTitle (tag) {
      return tag.name;
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      var data = this.props.data;
      var latestDate = data.latestEntry !== undefined && data.latestEntry !== null ? data.latestEntry.date : null;

      return (
         <li key={data.id}>
            <a onClick={this.handleFocusClick.bind(null, data)} style={menuItemStyle}>
               <div>
                  <img style={imageStyle} src={'/my/tag/' + data.name + '/icon.png'} />
                  <div style={{ display: 'inline-block', verticalAlign: 'top' }}>
                     <div>{this.calcFocusTitle(data) }</div>
                     <div style={{ fontSize: '14px' }}>{'last acted '}<RelativeTime accuracy="d" isoTime={latestDate} /></div>
                  </div>
               </div>
            </a>
         </li>
      );
   }
}

/*************************************************************
 * STYLING
 *************************************************************/
var menuItemStyle = {
   display: 'block',
   padding: '3px 5px',
   borderBottom: '1px solid #e0e0e0',
   clear: 'both',
   fontWeight: '400',
   lineHeight: '1.42857143',
   color: '#333',
   whiteSpace: 'nowrap',
   cursor: 'pointer',
};

var imageStyle = {
   maxHeight: '50px',
   width: '50px',
   paddingRight: '5px',
   display: 'inline',
   verticalAlign: 'inherit',
};

export default FocusListItem;
