// PACKAGES
import React from 'react';
// LIBS
import { getThrottledHandler } from 'libs/event-handler';
import { asArray, extract, shallowEqual } from 'libs/object-utils';

export default function input (Component) {
   const displayName = Component.displayName || Component.name;
   const PropTypes = Component.PropTypes;
   const defaultProps = Component.defaultProps;

   class InputComponent extends React.Component {
      /*************************************************************
       * DEFINITIONS
       *************************************************************/
      static displayName = displayName;
      static PropTypes = PropTypes;
      static defaultProps = defaultProps;
      static derivesFrom = input;

      /*************************************************************
       * COMPONENT LIFECYCLE
       *************************************************************/
      constructor (props) {
         super(props);
         // Set initial state
         this.state = {
            readOnly: props.readOnly === undefined || typeof props.readOnly === 'function' ? false : props.readOnly,
            visible: props.visible === undefined || typeof props.visible === 'function' ? true : props.visible,
            items: props.items === undefined || typeof props.items === 'function' ? [] : props.items,
            // Keep state close to input so it is more responsive
            // and sync (throttled) with props from Forms API
            currentValue: props.currentValue,
            hasChanged: false,
         };
         // Bind event handlers
         this.hasChanged = this.hasChanged.bind(this);
         this.handleChange = this.handleChange.bind(this);
         this.handleDependencyChange = this.handleDependencyChange.bind(this);
         this.handleFocus = this.handleFocus.bind(this);
         this.handleBlur = this.handleBlur.bind(this);
         // Throttle notification to parent form
         this.notifyForm = getThrottledHandler(this.notifyForm.bind(this), 250);
      }

      componentDidMount () {
         var changeArgs = this.getChangeArgs(this.props.currentValue);
         this.props.register(this.handleDependencyChange, this.props.dependsOn, changeArgs);
      }

      shouldComponentUpdate (nextProps, nextState) {
         return !shallowEqual(nextProps, this.props) || !shallowEqual(nextState, this.state);
      }

      componentWillReceiveProps (nextProps) {
         var newState = {};
         var update = false;
         if (this.props.currentValue !== nextProps.currentValue && this.state.currentValue !== nextProps.currentValue) {
            newState.currentValue = nextProps.currentValue;
            newState.hasChanged = nextProps.hasChanged;
            update = true;
         }
         if (this.props.items !== nextProps.items) {
            newState.items = nextProps.items;
            update = true;
         }
         if (update) {
            this.setState(newState);
         }
      }

      componentWillUnmount () {
         this.props.unregister();
      }

      /*************************************************************
       * EVENT HANDLING
       *************************************************************/
      handleBlur () {
         this.setState({
            focus: false,
         });
      }

      handleChange (value) {
         this.notifyForm(value);
         this.setState({ currentValue: value, hasChanged: this.hasChanged(value) });
      }

      handleDependencyChange (path, changeArgs, formState) {
         var bundleArgs;

         // Initial validation and non-value state
         if (!path && !changeArgs) {
            // Calc errors
            var errors = this.validate(this.props.currentValue);
            if (errors.length) {
               var newChangeArgs = { errors: errors, hasChanged: false, value: this.props.currentValue };
               this.props.requestUpdate(newChangeArgs);
            }

            bundleArgs = {
               path: null,
               formState,
            };
         }
         else {
            // Bundle the args for consumers
            bundleArgs = {
               path,
               formState,
               ...changeArgs,
            };
         }

         // Extract dependent values
         bundleArgs.values = asArray(this.props.dependsOn).map(depPath => extract(formState, depPath));

         // Recalculate Items input current
         if (typeof this.props.items === 'function') {
            if (typeof this.currentItemsRequest === 'function') {
               // Abort the request
               this.currentItemsRequest();
            }
            // Invoke items function
            this.currentItemsRequest = this.props.items(bundleArgs, (newItems) => {
               this.currentItemsRequest = null;

               // Set the items state
               this.setState({
                  items: newItems,
               });
            });
         }
         // Recalculate Read Only input state
         if (typeof this.props.readOnly === 'function') {
            // Invoke readOnly function
            this.props.readOnly(bundleArgs, (newReadonly) => {
               // Set the readOnly state
               this.setState({
                  readOnly: newReadonly,
               });
            });
         }
         // Recalculate Visible input state
         if (typeof this.props.visible === 'function') {
            // Invoke visible function
            this.props.visible(bundleArgs, (newVisible) => {
               // Set the visible state on the input container
               if (typeof this.props.handleVisible === 'function') {
                  this.props.handleVisible(newVisible);
               }
               // Set the visible state on the input (no container handling visibility)
               else {
                  this.setState({
                     visible: newVisible,
                  });
               }
            });
         }
      }

      handleFocus () {
         this.setState({
            focus: true,
         });
      }

      /*************************************************************
       * METHODS
       *************************************************************/
      getChangeArgs (value) {
         // Calc changed
         var hasChanged = this.hasChanged(value);

         // Calc errors
         var errors = this.validate(value);

         // Create change args object
         var changeArgs = { errors: errors, hasChanged: hasChanged, value: value };
         return changeArgs;
      }

      hasChanged (value) {
         return this.props.originalValue !== value;
      }

      notifyForm (value) {
         var changeArgs = this.getChangeArgs(value);
         this.props.requestUpdate(changeArgs);
      }

      validate (value) {
         var error;
         var errors = [];
         asArray(this.props.validate).forEach((validation) => {
            error = validation(value, this.props.label);
            if (error) {
               errors.push(error);
            }
         });
         return errors;
      }

      /*************************************************************
       * RENDERING
       *************************************************************/
      render () {
         var props = {
            ...this.props,
            ...this.state,
         };
         return <Component {...props } onBlur = { this.handleBlur } onChange= { this.handleChange } onFocus= { this.handleFocus } />;
      }
}

   return InputComponent;
}
