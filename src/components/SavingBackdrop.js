import React from 'react';
import { $absoluteFill } from 'libs/style';
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
      ...$absoluteFill,
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
