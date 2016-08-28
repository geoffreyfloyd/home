import React from 'react';
import { flex, flexItem } from 'libs/style';
import { $clrLowContrast } from './style';

function Toolbar (props) {
   return (
      <div style={styles.container}>
         {props.children}
         <button style={styles.button} onClick={props.onClickNewSession}>
            <i className="fa fa-2x fa-terminal" title="Start a new session"></i>
         </button>
         <button style={{ ...styles.button, ...(props.showProcesses ? { color: '#d6d6d6' } : {}) }} onClick={props.onClickProcesses}>
            <i className="fa fa-2x fa-gears" title="Processes"></i>
         </button>
      </div>
   );
}

Toolbar.propTypes = {
   children: React.PropTypes.object,
   layoutContext: React.PropTypes.object,
   onClickNewSession: React.PropTypes.func,
   onClickProcesses: React.PropTypes.func,
   showProcesses: React.PropTypes.bool,
};

var styles = {
   container: {
      ...flex('row', 'nowrap'),
      width: '100%',
   },
   button: {
      margin: '0.25rem',
      background: 'none',
      border: '0',
      height: '32px',
      //width: '3rem',
      color: $clrLowContrast,
   },
};

// .button:hover {
//     color: $clrDefault;
//     cursor: pointer;
// }

// .button:focus {
//     border: 0;
//     outline: 0;
// }

export default Toolbar;
