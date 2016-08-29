import React from 'react';

class Calc extends React.Component {
   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   constructor (props) {
      super(props);
      this.state = {
         result: '',
         operations: []
      };
      this.handleClick = this.handleClick.bind(this);
   }

   /*************************************************************
    * EVENT HANDLING
    *************************************************************/
   handleClick (input) {
      var result = this.state.result;
      if (input === 'C') {
         result = '';
      }
      else if (input === '=') {
         /* eslint-disable no-eval */
         result = String(eval(result));
         /* eslint-enable no-eval */
      }
      else {
         if (result === '0') {
            result = '';
         }
         result += input;
      }
      this.setState({
         result: result
      });
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      return (
         <div style={styles.container}>
            <div style={styles.rowcontainer}>
               <div style={styles.row}>
                  <div style={styles.button} onClick={this.handleClick.bind(null, '7') }>7</div>
                  <div style={styles.button} onClick={this.handleClick.bind(null, '8') }>8</div>
                  <div style={styles.button} onClick={this.handleClick.bind(null, '9') }>9</div>
               </div>
               <div style={styles.row}>
                  <div style={styles.button} onClick={this.handleClick.bind(null, '4') }>4</div>
                  <div style={styles.button} onClick={this.handleClick.bind(null, '5') }>5</div>
                  <div style={styles.button} onClick={this.handleClick.bind(null, '6') }>6</div>
               </div>
               <div style={styles.row}>
                  <div style={styles.button} onClick={this.handleClick.bind(null, '1') }>1</div>
                  <div style={styles.button} onClick={this.handleClick.bind(null, '2') }>2</div>
                  <div style={styles.button} onClick={this.handleClick.bind(null, '3') }>3</div>
               </div>
               <div style={styles.row}>
                  <div style={styles.button} onClick={this.handleClick.bind(null, '0') }>0</div>
                  <div style={styles.button} onClick={this.handleClick.bind(null, '+') }>+</div>
                  <div style={styles.button} onClick={this.handleClick.bind(null, '-') }>-</div>
               </div>
               <div style={styles.row}>
                  <div style={styles.button} onClick={this.handleClick.bind(null, '*') }>*</div>
                  <div style={styles.button} onClick={this.handleClick.bind(null, '/') }>/</div>
                  <div style={styles.button} onClick={this.handleClick.bind(null, 'C') }>C</div>
               </div>
               <div style={styles.row}>
                  <div style={styles.button} onClick={this.handleClick.bind(null, '=') }>=</div>
               </div>
            </div>
            <div style={styles.result}>{this.state.result}</div>
         </div>
      );
   }
}

/*************************************************************
 * STYLES
 *************************************************************/
const styles = {
   rowcontainer: {
      display: 'flex',
      flexDirection: 'column'
   },
   container: {
      display: 'flex'
   },
   row: {
      display: 'flex'
   },
   button: {
      height: '32px',
      width: '32px',
      cursor: 'pointer'
   },
   result: {
      flexGrow: '1',
      textAlign: 'right'
   }
};

export default Calc;
