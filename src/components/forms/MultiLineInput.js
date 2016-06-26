import React from 'react';
import ReactDOM from 'react-dom';
import input from './input';
import { $control, $focus, $hide } from './style';

class MultiLineInput extends React.Component {
    /*************************************************************
     * COMPONENT LIFECYCLE
     *************************************************************/
    constructor (props) {
        super(props);
        this.provideValue = this.provideValue.bind(this);
    }
    
    componentDidMount () {
        if (this.props.autoGrow && this.doAutoGrow) {
            this.doAutoGrow = false;
            autoGrow(ReactDOM.findDOMNode(this));
        }
        if (this.props.focus) {
            ReactDOM.findDOMNode(this).focus();
        }
    }

    componentWillReceiveProps (nextProps) {
        if (nextProps.currentValue !== this.props.currentValue) {
            this.doAutoGrow = true;
        }
    }
    
    componentDidUpdate () {
        if (this.props.autoGrow && this.doAutoGrow) {
            this.doAutoGrow = false;
            autoGrow(ReactDOM.findDOMNode(this));
        }
        if (this.props.focus) {
            ReactDOM.findDOMNode(this).focus();
        }
    }

    provideValue (e) {
        var value = null;
        
        // Convert value from dom event
        if (e.target.value === undefined || e.target.value === '' || e.target.value === null) {
            value = null;
        }
        else if (this.props.type === 'number' && typeof e.target.value === 'string') {
            value = parseInt(e.target.value, 10);
        }
        else {
            value = e.target.value;
        }
        
        this.doAutoGrow = true;
        this.props.onChange(value);
    }
    
    render () {
        var { path, currentValue, errors, focus, hasChanged, onFocus, onBlur, placeholder, readOnly, style, type, visible } = this.props;
        var hasErrors = errors && errors.length;
        
        return (
            <textarea ref="input" 
                readOnly={readOnly} 
                style={Object.assign({}, $control(hasChanged, hasErrors), focus ? $focus(hasChanged, hasErrors) : {}, style, visible ? {} : $hide)} 
                autoComplete="off"
                id={path} 
                value={currentValue} 
                onChange={this.provideValue}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder={placeholder} />
        );
    }
}
        
function autoGrow (textArea) {
    textArea.style.overflowY = 'hidden';
    textArea.style.height = 'auto';
    textArea.style.height = textArea.scrollHeight + 'px';
}

export default input(MultiLineInput);
