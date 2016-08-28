// PACKAGES
import React from 'react';

class WindowStack extends React.Component {
   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   constructor (props) {
      super(props);

      // Bind methods to ensure it retains `this` instance
      this.closeWindow = this.closeWindow.bind(this);
      this.newWindow = this.newWindow.bind(this);

      // Set initial state
      this.state = {
         stack: [],
      };
   }

   /*************************************************************
    * API
    *************************************************************/
   closeWindow () {
      var { stack } = this.state;
      var newStack = stack.slice(0, -1);
      this.setState({
         stack: newStack,
      });
   }

   newWindow (component) {
      var { stack } = this.state;
      var newStack = stack.slice();
      newStack.push(component);
      this.setState({
         stack: newStack,
      });
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      var { stack } = this.state;
      var top = stack.length - 1;

      return (
         <div>
            {stack.map((component, index) => {
               var inactiveStyle;
               if (index !== top) {
                  inactiveStyle = { display: 'hidden' };
               }
               return <div key={index} style={{ ...component.props.style, ...inactiveStyle }}>{component}</div>;
            })}
         </div>
      );
   }
}

export default WindowStack;
