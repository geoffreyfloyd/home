import React from 'react';
import input from './input';
import icons from './icons';
import { $control, $focus, $hide } from './style';

class SwitchInput extends React.Component {
    /*************************************************************
     * COMPONENT LIFECYCLE
     *************************************************************/
    constructor (props) {
        super(props);
        this.provideValue = this.provideValue.bind(this);
        this.handleToggleClick = this.handleToggleClick.bind(this);
    }
    
    componentDidMount () {
        if (this.props.focus) {
            this.getDOMNode().focus();
        }
    }

    /*************************************************************
     * EVENT HANDLING
     *************************************************************/
    handleToggleClick () {
        // Ignore click (img element does not have a readOnly property)
        if (this.props.readOnly) {
            return;
        }

        this.props.onChange(!this.props.currentValue);
    }

    provideValue (e) {
        var value = e.target.checked;
        this.props.onChange(value);
    }
    
    /*************************************************************
     * RENDERING
     *************************************************************/
    render () {
        var { path, currentValue, errors, focus, hasChanged, info, onFocus, onBlur, readOnly, style, visible } = this.props;
        var hasErrors = errors && errors.length;
        
        if (this.props.icon) {
            return (
                <img style={Object.assign(styles.image(currentValue), focus ? $focus(hasChanged, hasErrors) : {}, visible ? {} : $hide, style)} 
                    src={icons.png(this.props.icon)} 
                    id={path} 
                    className="form-control"
                    title={info} 
                    onBlur={onBlur}
                    onClick={this.handleToggleClick}
                    onFocus={onFocus} />
            );
        }
        else {
            return (
                <input readOnly={readOnly} 
                    style={Object.assign({}, $control(hasChanged, hasErrors), focus ? $focus(hasChanged, hasErrors) : {}, visible ? {} : $hide, style)} 
                    id={path} 
                    checked={currentValue}
                    onBlur={onBlur}
                    onChange={this.provideValue}
                    onFocus={onFocus}
                    title={info}
                    type="checkbox" />
            );
        }
    }
}

/*************************************************************
 * STYLES
 *************************************************************/
var styles = {
    image: function (isChecked) {
        return {
            cursor: 'pointer',
            padding: '0.25rem',
            height: '2.5rem',
            width: '2.5rem',
            opacity: isChecked ? '1' : '0.5',
            backgroundColor: isChecked ? 'white' : '#b9b9b9'
        };
    },
};

export default input(SwitchInput);
