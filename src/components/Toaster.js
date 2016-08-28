// PACKAGES
import React from 'react';
// LIBS
import { getReactPropTypes } from 'libs/type';
import { flex } from 'libs/style';
// COMPONENTS
import Toast from 'components/Toast';

class Toaster extends React.Component {
   /*************************************************************
    * DEFINITIONS
    *************************************************************/
   static PropTypes = {
      // OPTIONAL
      anchor: {
         type: 'string',
         options: ['top left', 'top right', 'bottom left', 'bottom right'],
      }, // the corner of the window that toasts should appear
      style: { type: 'object' },
   };

   static defaultProps = {
      anchor: 'bottom right',
   };

   /*************************************************************
    * API
    *************************************************************/
   notify (content) {
      var { stack } = this.state;
      var newStack = stack.slice();
      var timestamp = (new Date()).getTime();
      newStack.push({ content, timestamp });
      this.setState({
         stack: newStack,
      });
   }

   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   constructor (props) {
      super(props);

      // Bind methods to ensure it retains `this` instance
      this.handleClose = this.handleClose.bind(this);
      this.notify = this.notify.bind(this);


      // Set initial state
      this.state = {
         anchorStyle: this.calcAnchorStyle(props),
         stack: [],
      };
   }

   componentWillReceiveProps (nextProps) {
      if (nextProps.anchor !== this.props.anchor || nextProps.style !== this.props.style) {
         this.setState({
            anchorStyle: this.calcAnchorStyle(nextProps),
         });
      }
   }

   /*************************************************************
    * EVENT HANDLERS
    *************************************************************/
   handleClose (timestamp) {
      var { stack } = this.state;
      var newStack = stack.filter(toast => toast.timestamp !== timestamp);
      this.setState({
         stack: newStack,
      });
   }

   /*************************************************************
    * METHODS
    *************************************************************/
   calcAnchorStyle (props) {
      var anchorStyle = {
         ...props.style
      };
      props.anchor.split(' ').forEach(side => { anchorStyle[side] = anchorMap[side]; });
      return anchorStyle;
   }

/*************************************************************
 * RENDERING
 *************************************************************/
   render () {
      var { anchorStyle, stack } = this.state;

      // Build toasts
      var toasts = stack.map(toast => {
         return <Toast key={toast.timestamp} close={this.handleClose} content={toast.content} timestamp={toast.timestamp} />;
      });
      toasts.reverse();

      return (
         <div style={{ ...styles.anchor, ...anchorStyle }}>
            {toasts}
         </div>
      );
   }
}
Toaster.propTypes = getReactPropTypes(Toaster.PropTypes);

const styles = {
   anchor: {
      // Position
      position: 'absolute',
      zIndex: '501',

        // Layout
      ...flex('column', 'nowrap')
   }
};

const anchorMap = {
   bottom: '0.5rem',
   top: '0.5rem',
   left: '1rem',
   right: '1rem',
};

export default Toaster;
