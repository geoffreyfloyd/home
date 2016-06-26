import React from 'react';
import ReactDOM from 'react-dom';

export default function hover (Component) {
    const displayName = Component.displayName || Component.name;
    const PropTypes = Component.PropTypes;
    const defaultProps = Component.defaultProps;
    
    class HoverableComponent extends React.Component {
        static displayName = displayName;
        static PropTypes = PropTypes;
        static defaultProps = defaultProps;
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        constructor (props) {
            super(props);
            
            this.state = {
                onHover: false,
                ...this.state
            };
            
            this.onOver = this.onOver.bind(this);
            this.onOut = this.onOut.bind(this);
        }

        componentDidMount () {
            ReactDOM.findDOMNode(this).addEventListener('mouseover', this.onOver);
            ReactDOM.findDOMNode(this).addEventListener('mouseout', this.onOut);
        }

        componentWillUnmount () {
            ReactDOM.findDOMNode(this).removeEventListener('mouseover', this.onOver);
            ReactDOM.findDOMNode(this).removeEventListener('mouseout', this.onOut);
        }
        
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        onOver (e) {
            if (this.handleHover) {
                this.handleHover(true);
            }
            else {
                this.setState({ onHover: true, x: e.pageX || 0, y: e.pageY || 0 });
            }
        }

        onOut () {
            if (this.handleHover) {
                this.handleHover(false);
            }
            else {
                this.setState({ onHover: false });
            }
        }
                
        render () {
            return <Component {...this.props} {...this.state} />;
        }
    }
        
    return HoverableComponent;
}
