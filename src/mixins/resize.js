/* globals window */
// PACKAGES
import React from 'react';
import ReactDOM from 'react-dom';
// LIBS
import { getThrottledHandler } from 'libs/event-handler';
import { shallowEqual } from 'libs/object-utils';
// STORES
import windowSizeStore from 'stores/window-size-store';

export default function resize (Component, domPropsArg) {
   class ResizeComponent extends React.Component {
      /*************************************************************
       * DEFINITIONS
       *************************************************************/
      static defaultProps = {
         domProps: domPropsArg || ['calc.height', 'calc.width'],
      };

      constructor (props) {
         super(props);
         this.state = {};
         this.mounted = false;
         this.handleWindowResize = this.handleWindowResize.bind(this);
      }

      /*************************************************************
       * COMPONENT LIFECYCLE
       *************************************************************/
      componentDidMount () {
         this.mounted = true;

         // We're mounted and can do our initial measure
         this.handleWindowResize();

         // Create a throttled (100ms) event handler
         this.handlers = {
            windowSizeChange: getThrottledHandler(this.handleWindowResize, 5),
         };

         // Subscribe to window size store with throttled event handler
         windowSizeStore.subscribe(this.handlers.windowSizeChange);
      }

      componentDidUpdate () {
         var nextState = this.calcDomState();
         if (!shallowEqual(this.state, nextState)) {
            this.setState(nextState);
         }
      }

      componentWillReceiveProps (nextProps) {
         if (!shallowEqual(this.props.domProps, nextProps.domProps)) {
            this.handleWindowResize();
         }
      }

      componentWillUnmount () {
         windowSizeStore.unsubscribe(this.handlers.windowSizeChange);
         this.mounted = false;
      }

      /*************************************************************
       * EVENT HANDLING
       *************************************************************/
      handleWindowResize () {
         var nextState = this.calcDomState();
         if (!shallowEqual(this.state, nextState)) {
            this.setState(nextState);
         }
      }

      /*************************************************************
       * METHODS
       *************************************************************/
      calcDomState () {
         var { domProps } = this.props;
         var calcStyle;
         var nextState = {};
         var root = ReactDOM.findDOMNode(this.root);

         if (this.mounted && root) {
            domProps.forEach(prop => {
               var parts = prop.split('.');
               if (parts.length === 2 && parts[0] === 'calc') {
                  if (!calcStyle) {
                     calcStyle = window.getComputedStyle(root);
                  }
                  nextState[parts[1]] = parseInt(calcStyle[parts[1]], 10);
               }
               else {
                  nextState[prop] = root[prop];
               }
            });
         }

         return nextState;
      }

      /*************************************************************
       * RENDERING
       *************************************************************/
      render () {
         return (
            <div style={styles.container}>
               <div ref={c => { this.root = c; } } style={styles.grow}>
                  <Component {...this.props} {...this.state} />
               </div>
            </div>
         );
      }
   }

   return ResizeComponent;
}

/*************************************************************
 * STYLES
 *************************************************************/
var styles = {
   container: {
      flex: '1',
      position: 'relative',
      zoom: '1',
      overflow: 'hidden',
      height: '100%',
      width: '100%',
   },
   grow: {
      position: 'absolute',
      top: '0',
      right: '0',
      left: '0',
      bottom: '0',
      height: 'auto',
      width: 'auto',
   },
};
