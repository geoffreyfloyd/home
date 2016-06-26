import React from 'react';
import formRelay from './formRelay';

class FormDiv extends React.Component {
    constructor (props) {
        super(props);
    }
    /*************************************************************
     * RENDERING
     *************************************************************/
    render () {
        return (
            <div style={this.props.style}>
                {this.props.children}
            </div>
        );
    }
}

export default formRelay(FormDiv);
