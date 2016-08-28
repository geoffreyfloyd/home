// PACKAGES
import React from 'react';
import ReactDOM from 'react-dom';
// LIBS
import { getReactPropTypes } from 'libs/type';
// MIXINS
import hover from 'mixins/hover';

class Toast extends React.Component {
   /*************************************************************
    * DEFINITIONS
    *************************************************************/
   static PropTypes = {
      // REQUIRED
      close: { type: 'function', isRequired: true },
      content: { type: 'any', isRequired: true },
      timestamp: { type: 'number', isRequired: true },
      // OPTIONAL
      onHover: { type: 'bool' },
   };

   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   constructor (props) {
      super(props);

      // Bind event handlers
      this.handleClick = this.handleClick.bind(this);
   }

   componentDidMount () {
      // Start fade out timer
      this.fadeOut = setTimeout(() => {
         $(ReactDOM.findDOMNode(this)).fadeTo(1000, 0, () => {
            this.props.close(this.props.timestamp);
         });
      }, 5000);
   }

   componentWillReceiveProps (nextProps) {
      if (nextProps.onHover) {
         // Clear fade out timer
         clearTimeout(this.fadeOut);
         // Fade in
         $(ReactDOM.findDOMNode(this)).stop().show().fadeTo(200, 1);
         // Restart fade out timer
         this.fadeOut = setTimeout(() => {
            $(ReactDOM.findDOMNode(this)).fadeTo(1000, 0, () => {
               this.props.close(this.props.timestamp);
            });
         }, 5000);
      }
   }

   componentWillUnmount () {
      clearTimeout(this.fadeOut);
   }

   /*************************************************************
    * EVENT HANDLING
    *************************************************************/
   handleClick () {
      this.props.close(this.props.timestamp);
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      var { content } = this.props;

      return (
         <div style={styles.container} onClick={this.handleClick}>
            {content}
         </div>
      );
   }
}
Toast.propTypes = getReactPropTypes(Toast.PropTypes);

/*************************************************************
 * STYLES
 *************************************************************/
var styles = {
   container: {
      position: 'relative',
      margin: '0 0 0.5rem 0',
      padding: '0.5rem',
      maxWidth: '60rem',
      minWidth: '20rem',
      fontSize: '1.5rem',
      backgroundColor: '#2B90E8',
      color: '#FFF',
      cursor: 'pointer',
   },
};

export default hover(Toast);
