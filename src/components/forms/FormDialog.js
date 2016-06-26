import React from 'react';
import formRelay from './formRelay';
import Button from './Button';
import Icon from './Icon';
        
class FormDialog extends React.Component {
    /*************************************************************
     * DEFINITIONS
     *************************************************************/
    constructor (props) {
        super(props);
        this.state = {
            show: false
        };
        this.handleDialogClick = this.handleDialogClick.bind(this);
    }

    /*************************************************************
     * PUBLIC METHODS
     *************************************************************/
    toggle () {
        this.setState({
            show: !this.state.show
        });
    }

    /*************************************************************
     * EVENT HANDLING
     *************************************************************/
    handleDialogClick (e) {
        // Toggle it closed
        this.toggle();

        // Prevent form submit
        e.preventDefault();
    }

    /*************************************************************
     * RENDERING
     *************************************************************/
    render () {
        var toggleButton, icon, info, title;
        var unique = this.props.basePath || 'dlg-grp';
        
        // Render toggle button
        if (this.props.toggleButton) {
            toggleButton = React.cloneElement(this.props.toggleButton, { key: unique + '_toggle', onClick: this.handleDialogClick });
        }

        // Render icon
        if (this.props.icon) {
            icon = <Icon key={unique + '_icon'} icon={this.props.icon} style={styles.icon} />;
        }

        // Render title header
        if (this.props.title) {
            title = <h4 key={unique + '_title'}>{this.props.title}</h4>;
        }

        // Render info tooltip
        if (this.props.info) {
            info = (<span key={unique + '_info'}className="glyphicon glyphicon-info-sign" data-toggle={this.props.info ? 'tooltip' : undefined} title={this.props.info} data-original-title={this.props.info} style={styles.info}></span>);
        }

        return (
            <div>
                {toggleButton}
                <div style={Object.assign({}, (this.state.show ? {} : styles.hidden), styles.backdrop)}>
                    <div style={styles.container}>
                        {info}{icon}{title}
                        {this.props.children}
                        <Button key={unique + '_addbtn'} type="button" style={styles.button} onClick={this.handleDialogClick}>OK</Button>
                    </div>
                </div>
            </div>
        );
    }
}

/*************************************************************
 * STYLES
 *************************************************************/
var styles = {
    backdrop: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        zIndex: '101'
    },
    button: {
        width: '40%', 
        fontSize: '1.2rem'
    },
    container: {
        fontSize: '2rem',
        borderRadius: '1rem',
        backgroundColor: '#fafafa',
        position: 'relative',
        margin: '2rem auto',
        padding: '2rem',
        maxWidth: '50rem',
        maxHeight: '90vh',
        overflowY: 'auto',
    },
    hidden: { display: 'none' },
    icon: {
        height: '2rem', 
        marginTop: '-0.5rem', 
        float: 'left', 
        marginRight: '1rem'
    },
    info: {
        float: 'right', 
        fontSize: '1.2rem'
    }
};

export default formRelay(FormDialog);
