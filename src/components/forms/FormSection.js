import React from 'react';
import formRelay from './formRelay';
import Icon from './Icon';
import IconButton from './IconButton';

class FormSection extends React.Component {
    constructor (props) {
        super(props);
    }
    
    /*************************************************************
     * RENDERING
     *************************************************************/
    render () {
        // Props
        var { icon, info, title } = this.props;
        
        var domIcon, domInfo, domTitle;
        
        // Render icon
        if (icon) {
            domIcon = <Icon icon={icon} style={styles.icon} />;
        }

        // Render title header
        if (title) {
            domTitle = <h4>{title}</h4>;
        }

        // Render info tooltip
        if (info) {
            domInfo = (<IconButton icon="info-sign" info={info} style={styles.info} />);
        }

        return (
            <div style={this.props.style} className={this.props.className || 'form-horizontal'}>
                {domInfo}
                {domIcon}
                {domTitle}
                {this.props.children}
            </div>
        );
    }
}

var styles = {
    icon: {
        height: '2rem', 
        marginTop: '-0.5rem', 
        float: 'left', 
        marginRight: '1rem'
    },
    info: {
        float: 'right', 
        fontSize: '1.2rem'
    },
    hidden: {
        display: 'none'
    }
};

export default formRelay(FormSection);
