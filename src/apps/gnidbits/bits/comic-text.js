import React from 'react';

export default class ComicText extends React.Component {

   constructor(props) {
      super(props);
   }
   
   renderParagraphs() {
      
      var paragraphs = [];
      
      var { text } = this.props;
      
      return text.split('\n').map(line => {
         var l = line.slice();
         var s = [{}, styles.line];
         
         // MD Headers
         if (l.slice(0, 1) === '#') {
            s.push(styles.h1);
            l = l.slice(1);
            if (l.slice(0, 1) === '#') {
               s.push(styles.h2);
               l = l.slice(1);
               if (l.slice(0, 1) === '#') {
                  s.push(styles.h3);
                  l = l.slice(1);
               }
            }
         }
         
         return <p style={Object.assign(...s)}>{l}</p>;
      });
   }

   render() {
      return (
         <div style={styles.container} onClick={this.props.onClick}>
            {this.renderParagraphs()}
         </div>
      );
   }
}

const styles = {
   container: {
      background: 'white',
      height: '100%',
      width: '100%',
      padding: '1rem',
      textAlign: 'left',
      overflowY: 'auto',
   },
   line: {
      lineHeight: '1.4',
      margin: '0',
      padding: '0',
      minHeight: '0.5rem',
   },
   h1: {
      fontWeight: 'bold',
      fontSize: '1.6rem',
   },
   h2: {
      fontSize: '1.4rem',
   },
   h3: {
      fontSize: '1.2rem',
   }
};
