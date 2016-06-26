import React from 'react';
import icons from './icons';
import { getReactPropTypes } from './type';

class Icon extends React.Component {
    /*************************************************************
     * DEFINITIONS
     *************************************************************/
    static PropTypes = {
        // Required
        icon: { type: 'string', options: icons.options() },

        // Optional
        color: { type: 'string' },
        style: { type: 'object' },
    };

    /*************************************************************
     * RENDERING
     *************************************************************/
    render () {
        /**
         * Set Style and Layout variables
         */
        var theme = {};

        var icon;
        switch (icons.typeOf(this.props.icon)) {
            case 'png':
                icon = <img style={this.props.style} src={icons.png(this.props.icon)} />;
                break;
            case 'svg':
                icon = icons.svg(this.props.icon, this.props.color || theme.mainColor || '#8ab774');
                break;
        }

        return icon;
    }
}
Icon.propTypes = getReactPropTypes(Icon.PropTypes);

export default Icon;
