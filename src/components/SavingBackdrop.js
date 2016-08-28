import React from 'react';
import LoadingIndicator from 'components/LoadingIndicator';

const SavingBackdrop = function (props) {
   return (
      <div style={styles.root}>
         <LoadingIndicator message={props.message || '[l10n: Saving…]'} style={styles.message} />
      </div>
   );
};

var styles = {
   root: {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      height: '100%',
      width: '100%',
      background: 'rgba(0,0,0,0.1)',
      zIndex: '601'
   },
   message: {
      background: 'white',
      padding: '1rem',
      borderRadius: '1rem'
   }
};

export default SavingBackdrop;
