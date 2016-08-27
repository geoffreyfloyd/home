// PACKAGES
import React from 'react';
// COMPONENTS
import Center from 'components/Center';

const LoadingIndicator = function (props) {
   return (
        <Center style={styles.content}><span className="glyphicon glyphicon-refresh spin"></span> {props.message || '[l10n: Loading…]'}</Center>
    );
};

var styles = {
   content: {
      fontSize: '2rem',
   },
};

export default LoadingIndicator;
