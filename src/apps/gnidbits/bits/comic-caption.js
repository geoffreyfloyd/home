import React from 'react';

export default class ComicCaption extends React.Component {
   render() {
         return (
            <div style={styles.container}>
               <div style={styles.pane} onClick={this.props.onClick}>
                  {this.props.children}
               </div>
            </div>
         );
   }
}

const styles = {
   container: {
      display: 'block',
      width: '100%',
      height: '2rem',
   },
   pane: {
      cursor: 'pointer',
      textAlign: 'center',
      margin: '0.25rem',
      background: 'rgba(255,255,255,0.9)',
      padding: '0.2rem',
      borderRadius: '0.25rem',
   },
};
