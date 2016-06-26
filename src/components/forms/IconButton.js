import React from 'react';
import popupInfo from './popup-info';
import hover from './hover';
import icons from './icons';
import { getReactPropTypes } from './type';

class IconButton extends React.Component {
    /*************************************************************
     * DEFINITIONS
     *************************************************************/
    static PropTypes = {
        // Required
        icon: { type: 'string', options: icons.options(), isRequired: true },
        // OPTIONAL
        focus: { type: 'bool' },
        info: { type: 'string' },
        style: { type: 'object' },
    };

    static defaultProps = {
        style: {}
    };

    /*************************************************************
     * COMPONENT LIFECYCLE
     *************************************************************/
    constructor (props) {
        super(props);

        this.handleHover = this.handleHover.bind(this);
        this.state = {
            onHover: false
        };
    }

    componentDidMount () {
        if (this.props.focus) {
            this.refs.input.focus();
        }
    }
    
    componentDidUpdate () {
        popupInfo('iconbutton-tooltip', this.props.info, (this.state.onHover || this.props.onHover), (this.props.x || 0), (this.props.y || 0) + 20);
    }

    /*************************************************************
     * EVENT HANDLING
     *************************************************************/
    handleHover (isHover) {
        if (this.props.onHover) {
            this.props.onHover(isHover);
        }
        else {
            this.setState({
                onHover: isHover
            });
        }
    }
    
    /*************************************************************
     * RENDERING
     *************************************************************/
    render () {
        var input;
        switch (icons.typeOf(this.props.icon)) {
            case ('glyph'):
                input = (
                    <div style={Object.assign({}, styles.glyphiconButton(this.state.onHover), this.props.style) }>
                        <span
                            className={'glyphicon glyphicon-' + this.props.icon} onClick={this.props.onClick }>
                        </span>
                    </div>
                );
                break;
            default:
                input = (<div>wtf</div>)
        }
        return input;
    }
}
IconButton.propTypes = getReactPropTypes(IconButton.PropTypes);

/*************************************************************
 * STYLES
 *************************************************************/
var styles = {
    glyphiconButton: function (onHover) {
        return {
            cursor: 'pointer',
            fontSize: '18px',
            lineHeight: '36px',
            color: (onHover ? '#55FF7F' : '#ddd')
        };
    },
    imageButton: {
        cursor: 'pointer'
    },
};

export default hover(IconButton);
