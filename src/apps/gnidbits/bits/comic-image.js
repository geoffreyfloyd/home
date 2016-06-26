import React from 'react';

export default class ComicImage extends React.Component {
    render() {
        return (
            <div style={styles.container}>
                <img style={styles.image} src={this.props.src} onClick={this.props.onClick} />
            </div>
        );
    }
}

const styles = {
    container: {
        position: 'relative',
        background: 'white',
        height: '100%',
        width: '100%',
        textAlign: 'center',
    },
    image: {
        margin: 'auto',
        position: 'absolute',
        top: '0',
        bottom: '0',
        left: '0',
        right: '0',
        maxHeight: '100%',
        maxWidth: '100%',
    },
};
