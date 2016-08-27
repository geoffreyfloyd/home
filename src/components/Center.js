import React from 'react';

const Center = function (props) {
   return (
        <div style={styles.root}>
            <div style={{ ...styles.centered, ...props.style }}>{props.children}</div>
        </div>
    );
};

var styles = {
   root: {
      display: 'table',
      height: '100%',
      width: '100%'
   },
   centered: {
      display: 'table-cell',
      textAlign: 'center',
      verticalAlign: 'middle',
      margin: 'auto'
   }
};

export default Center;
