import React from 'react';
import Layout from 'components/Layout/Layout';
import { $clrLowContrast } from './style';

function Toolbar (props) {
   return (
      <Layout layoutContext={props.layoutContext}>
         {props.children}
         <ul style={styles.menu}>
            <li style={styles.menuItem}>
               <button style={styles.button} onClick={props.onClickNewSession}>
                  <i className="fa fa-2x fa-terminal" title="Start a new session"></i>
               </button>
            </li>
            <li style={styles.menuItem}>
               <button style={styles.button} style={props.showProcesses ? { color: '#d6d6d6' } : {}} onClick={props.onClickProcesses}>
                  <i className="fa fa-2x fa-gears" title="Processes"></i>
               </button>
            </li>
         </ul>
      </Layout>
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
      height: '55px',
   },
   menu: {
      listStyle: 'none',
      margin: '5px',
      padding: '0',
   },
   menuitem: {
      display: 'inline',
   },
   button: {
      background: 'none',
      border: '0',
      height: '32px',
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
