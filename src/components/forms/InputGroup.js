import React from 'react';
import formRelay from './formRelay';

class InputGroup extends React.Component {
    /*************************************************************
     * DEFINITIONS
     *************************************************************/
    constructor (props) {
        super(props);
        this.state = {
            visible: true
        };
        this.setVisible = this.setVisible.bind(this);
    }

    /*************************************************************
     * API
     *************************************************************/
    setVisible (value) {
        this.setState({
            visible: value
        });
    }

    /*************************************************************
     * RENDERING
     *************************************************************/
    getInputStyle (index) {
        var propName = 'styleInput' + String(index + 1);
        var style = this.props[propName];
        if (style) {
            return style;
        }
        else {
            return;
        }
    }
    
    renderLabel (rendered, child) {
        var label = child ? child.props.label || this.props.label : this.props.label;

        if (label) {
            var labelExplain = child ? child.props.labelExplain || this.props.labelExplain : this.props.labelExplain;
            var labelSpan = child ? child.props.labelSpan || this.props.labelSpan || 4 : this.props.labelSpan || 4;
            var labelStyle = child ? child.props.labelStyle || this.props.labelStyle : this.props.labelStyle;
            var path = child ? child.props.path : this.props.label;
            var inputSpan = 12 - labelSpan;
            var labelClass = child ? child.props.labelClass || this.props.labelClass || 'col-md-' + labelSpan : this.props.labelClass || 'col-md-' + labelSpan;
            //var labelClass = labelStyle ? '' : 'col-md-' + labelSpan;
            return (
                <div>
                    <label className={[labelClass, 'control-label'].join(' ')} style={labelStyle} title={labelExplain} htmlFor={path}>{label}</label>
                    <div className={'col-md-' + inputSpan }>
                        {rendered}
                    </div>
                </div>
            );
        }
        else {
            return rendered;
        }
    }
    
    render () {
        if (React.Children.count(this.props.children) === 1) {
            return (
                <div className="form-group" style={this.state.visible ? {} : styles.hide}>
                    {React.Children.map(this.props.children, child => {
                        return this.renderLabel(React.cloneElement(child, { ...child.props, handleVisible: this.setVisible }), child);
                    })}
                </div>
            );
        }
        else {
            return (
                <div className="form-group" style={this.state.visible ? {} : styles.hide}>
                    {this.renderLabel(
                        <div className="input-group" style={this.props.style}>
                            {React.Children.map(this.props.children, (child, index) => {
                                return (
                                    <div className="input-group-addon" style={Object.assign({}, styles.noPad, this.props.styleInput, this.getInputStyle(index))}>
                                        {React.cloneElement(child, { ...child.props, handleVisible: this.setVisible })}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }
    }
}

/*************************************************************
 * STYLES
 *************************************************************/
var styles = {
    hide: {
        display: 'none'
    },
    noPad: {
        padding: 0
    }
};

export default formRelay(InputGroup);
