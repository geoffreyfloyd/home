import React from 'react';

export default class ComicAnimation extends React.Component {
    constructor (props) {
        super(props);
        this.handleTick = this.handleTick.bind(this);
        this.state = {
            slide: 1,
            count: React.Children.toArray(this.props.children).length,
        };
    }
    
    componentDidMount () {
        this.startAnimation(this.props);
    }

    startAnimation (props) {
        var { fps } = props;
        
        var interval;
        if (fps < 1.0) {
            interval = (1.0 / fps) * 1000;
        }
        else {
            interval = fps * 1000;
        }
        this.animation = setInterval(this.handleTick, interval);
    }
    
    stopAnimation () {
        clearInterval(this.animation);
    }
    
    handleTick () {
        var { count, slide } = this.state;
        slide++;
        if (slide > count) {
            slide = 1;
        }
        this.setState({
            slide: slide
        });
    }
    
    render() {
        var slide = React.Children.toArray(this.props.children)[this.state.slide - 1];
        return slide || <div />;
    }
}
