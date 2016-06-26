import React from 'react';
import hover from './hover';

class Button extends React.Component {
    /*************************************************************
     * DEFINITIONS
     *************************************************************/
    static propTypes = {
        // REQUIRED
        // Browsers have inconsistent default button 'type', set explicitly
        type: React.PropTypes.oneOf(['button', 'submit', 'reset']).isRequired
    };
    
    /*************************************************************
     * RENDERING
     *************************************************************/
    render () {
        /**
         * Get theme from store
         */
        var { onHover, onClick, style, type } = this.props;
        var theme = {};

        /**
         * Render
         */
        return (
            <button type={type} style={Object.assign(styles.main(theme, onHover), style)} onClick={onClick}>{this.props.children}</button>
        );
    }
}

/*************************************************************
 * STYLES
 *************************************************************/
var styles = {
    main: function (theme, onHover) {
        var relativeSize = 1.0;
        var relativeLineHeight = 0.85;
        if (theme.fontSizeModifier) {
            relativeSize += relativeSize * theme.fontSizeModifier;
            relativeLineHeight += (1.0 - relativeSize) * 2;
        }
        
        return Object.assign({
            flexGrow: '1',
            fontSize: String(relativeSize) + 'em',
            lineHeight: String(relativeLineHeight),
            height: '30px',
            textAlign: 'center',
            border: '0.0625rem solid rgb(186, 186, 186)',
            color: '#666',
            background: themeBackground('#bababa', '#e0e0e0'),
            cursor: 'pointer',
            outline: 'none'
        }, onHover ? {
            color: '#000',
            background: themeBackground(theme.mainColor || '#8ab774', theme.secondaryColor || '#b2d0a4'),
        } : undefined);
    }
};

export default hover(Button);
