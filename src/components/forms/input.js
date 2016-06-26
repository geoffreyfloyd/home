import React from 'react';
import { asArray, extract } from './object-utils';

export default function input(Component) {
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

      constructor(props) {
         super(props);
         this.state = {
            readOnly: props.readOnly === undefined || typeof props.readOnly === 'function' ? false : this.props.readOnly,
            visible: props.visible === undefined || typeof props.visible === 'function' ? true : this.props.visible,
            items: props.items === undefined || typeof props.items === 'function' ? [] : props.items,
         };
         this.hasChanged = this.hasChanged.bind(this);
         this.handleChange = this.handleChange.bind(this);
         this.handleDependencyChange = this.handleDependencyChange.bind(this);
         this.handleFocus = this.handleFocus.bind(this);
         this.handleBlur = this.handleBlur.bind(this);
      }

      /*************************************************************
       * COMPONENT LIFECYCLE
       *************************************************************/
      componentDidMount() {
         var changeArgs = this.getChangeArgs(this.props.currentValue);
         this.props.register(this.handleDependencyChange, this.props.dependsOn, changeArgs);
      }

      componentWillUnmount() {
         this.props.unregister();
      }

      componentWillReceiveProps(nextProps) {
         if (nextProps.items && this.props.items !== nextProps.items) {
            this.setState({
               items: nextProps.items
            });
         }
      }

      handleBlur() {
         this.setState({
            focus: false
         });
      }

      getChangeArgs(value) {
         // Calc changed
         var hasChanged = this.hasChanged(value);

         // Calc errors
         var errors = this.validate(value);

         // Create change args object
         var changeArgs = { errors: errors, hasChanged: hasChanged, value: value };
         return changeArgs;
      }

      handleChange(value) {
         var changeArgs = this.getChangeArgs(value);
         this.props.requestUpdate(changeArgs);
      }

      handleDependencyChange(path, changeArgs, formState) {

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
               formState
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
                  items: newItems
               });
            });
         }
         // Recalculate Read Only input state
         if (typeof this.props.readOnly === 'function') {
            // Invoke readOnly function
            this.props.readOnly(bundleArgs, (newReadonly) => {
               // Set the readOnly state
               this.setState({
                  readOnly: newReadonly
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
                     visible: newVisible
                  });
               }
            });
         }
      }

      handleFocus() {
         this.setState({
            focus: true
         });
      }

      hasChanged(value) {
         return this.props.originalValue !== value;
      }

      validate(value) {
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
      render() {
         var props = {
                ...this.props,
                ...this.state
      };
      return<Component {...props } onBlur = { this.handleBlur } onChange= { this.handleChange } onFocus= { this.handleFocus } />;
   }
}

return InputComponent;
}
