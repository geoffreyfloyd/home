import React from 'react';
import input from './input';
import InputTable from './InputTable';
import { asArray, extract } from './object-utils';

export default function formRelay (Component) {
    const displayName = Component.displayName || Component.name;
    const PropTypes = Component.PropTypes;
    const defaultProps = Component.defaultProps;
    
    class FormRelayComponent extends React.Component {
        static displayName = displayName;
        static PropTypes = PropTypes;
        static defaultProps = defaultProps;
        static derivesFrom = formRelay;
        
        getFormInnerRelayProps (element) {
            // props
            var { basePath, model, formState, errorMap, changeMap, handleInputRegister, handleInputUnregister, handleUpdateRequest, InputWrapper } = this.props;
                
            // Input Group element props
            var props = element ? element.props : {};

            return {
                ...props,
                basePath: basePath,
                model: model,
                formState: formState,
                errorMap: errorMap,
                changeMap: changeMap,
                handleInputRegister: handleInputRegister,
                handleInputUnregister: handleInputUnregister,
                handleUpdateRequest: handleUpdateRequest,
                InputWrapper: InputWrapper,
                labelClass: props.labelClass || this.props.labelClass,
                labelExplain: props.labelExplain || this.props.labelExplain,
                labelSpan: props.labelSpan || this.props.labelSpan,
                labelStyle: props.labelStyle || this.props.labelStyle,
            };
        }
        
        getFormInnerCollectionRelayProps (element) {
            // Form state and props
            var { model, formState, errorMap, changeMap, handleInputRegister, handleInputUnregister, handleUpdateRequest, InputWrapper } = this.props;

            // Input element props
            var { path, ...props } = element.props;
            
            // Derive original and current collection values
            var currentValue = extract(formState, path);
            var originalValue = extract(model, path);

            return {
                ...props,
                // Form Collection Input Props
                currentValue: currentValue,
                originalValue: originalValue,
                hasChanged: changeMap[path] || false,
                errors: errorMap[path] || [],
                // Form Relay Props
                model: model,
                formState: formState,
                errorMap: errorMap,
                changeMap: changeMap,
                handleInputRegister: handleInputRegister,
                handleInputUnregister: handleInputUnregister,
                handleUpdateRequest: handleUpdateRequest,
                InputWrapper: InputWrapper,
                labelClass: props.labelClass || this.props.labelClass,
                labelExplain: props.labelExplain || this.props.labelExplain,
                labelSpan: props.labelSpan || this.props.labelSpan,
                labelStyle: props.labelStyle || this.props.labelStyle,
            };
        }

        getInputDependsOn (element) {
            // No binding path to prepend to dependency path
            if (!this.props.basePath) {
                return element.props.dependsOn;
            }
            
            // Cast dependsOn prop to an array to simplify logic
            var dependsOn = asArray(element.props.dependsOn);
            
            // Get row-modified depends on values
            dependsOn = dependsOn.map(d => this.props.basePath + '.' + d);
            
            return dependsOn;
        }
        
        getInputProps (element) {
            // Form state and props
            var { formState, errorMap, changeMap, model, basePath, handleInputRegister, handleInputUnregister, handleUpdateRequest } = this.props;
            
            // Input element props
            var { path, ...props } = element.props;
            
            var fullPath = basePath ? basePath + '.' + path : path;
            
            // Derive original and current values
            var currentValue = extract(formState, fullPath);
            var originalValue = extract(model, fullPath);
            var dependsOn = this.getInputDependsOn(element);
            
            return {
                ...props,            
                path: fullPath,
                currentValue: currentValue,
                dependsOn: dependsOn,
                originalValue: originalValue,
                hasChanged: changeMap[fullPath] || false,
                errors: errorMap[fullPath] || [],
                register: handleInputRegister.bind(null, fullPath),
                unregister: handleInputUnregister.bind(null, fullPath),
                requestUpdate: handleUpdateRequest.bind(null, fullPath),
                labelClass: props.labelClass || this.props.labelClass,
                labelExplain: props.labelExplain || this.props.labelExplain,
                labelSpan: props.labelSpan || this.props.labelSpan,
                labelStyle: props.labelStyle || this.props.labelStyle,
            };
        }

        /*************************************************************
         * RENDERING
         *************************************************************/
        render () {
            var { InputWrapper } = this.props;
            
            return (
                <Component {...this.props} {...this.state}>
                    {React.Children.map(this.props.children, (child, index) => {
                        // Don't wrap input groups and any children that don't have a field
                        if (child.type && child.type.derivesFrom === input) {
                            if (InputWrapper && InputWrapper.displayName !== Component.name) {
                                return <InputWrapper key={index} {...this.getFormInnerRelayProps()}>{child}</InputWrapper>;    
                            }
                            else {
                                return React.cloneElement(child, { ...this.getInputProps(child) });
                            }
                        }
                        else if (child.type && child.type.derivesFrom === formRelay) {
                            return React.cloneElement(child, Object.assign({ key: index }, this.getFormInnerRelayProps(child)));
                        }
                        else if (child.type === InputTable) {
                            return React.cloneElement(child, Object.assign({ key: index }, this.getFormInnerCollectionRelayProps(child)));
                        }
                        else {
                            return React.cloneElement(child, { key: index, ...child.props });
                        }
                    })}
                </Component>
            );
        }
    }
    
    return FormRelayComponent;
}
