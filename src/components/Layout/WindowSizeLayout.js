import React from 'react';
import windowSizeStore from 'stores/window-size-store';
import { getThrottledHandler } from 'libs/event-handler';
import LayoutMixin from './LayoutMixin';

var WindowSizeLayout = React.createClass({
   /*************************************************************
    * DEFINITIONS
    *************************************************************/
   mixins: [LayoutMixin],
   statics: {
      refreshRoot () {
         windowSizeStore.refresh();
      },
   },

   getInitialState () {
      return {
         size: windowSizeStore.getSize(),
      };
   },

   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   componentWillMount () {
      // Clear margin on body
      try {
         var margin = window.getComputedStyle(document.body).getPropertyValue('margin');
         if (margin) {
            document.body.style.margin = '0px';
            document.body.style.fontSize = '100%';
         }
      }
      catch (e) {
         console.error(e);
      }

      // Create a throttled (100ms) event handler
      this.handlers = {
         windowSizeChange: getThrottledHandler(this.handleStoreUpdate, 100)
      };

      // Subscribe to window size store with throttled event handler
      windowSizeStore.subscribe(this.handlers.windowSizeChange);
   },

   componentWillUnmount () {
      windowSizeStore.unsubscribe(this.handlers.windowSizeChange);
   },

   /*************************************************************
    * METHODS
    *************************************************************/
   getRootLayoutContext () {
      var { size } = this.state;

      var dimensions = {
         height: size.height,
         width: size.width,
      };

      if (this.props.minHeight) {
         dimensions.height = Math.max(dimensions.height, this.props.minHeight);
      }
      if (this.props.minWidth) {
         dimensions.width = Math.max(dimensions.width, this.props.minWidth);
      }
      return dimensions;
   },

   /*************************************************************
    * EVENT HANDLING
    *************************************************************/
   handleStoreUpdate (size) {
      this.setState({
         size,
      });
   },

   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      return this.renderLayout();
   }
});

export default WindowSizeLayout;
