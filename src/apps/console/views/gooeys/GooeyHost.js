import React from 'react';

const gooeyMap = {
   Calc: require('./Calc.js').default,
};

class GooeyHost extends React.Component {
   /*************************************************************
    * DEFINITIONS
    *************************************************************/
   static propTypes = {
      gooey: React.PropTypes.string,
   };

   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   constructor (props) {
      super(props);
      this.state = {
         gooey: gooeyMap[props.gooey],
      };
   }

   // componentDidMount () {
   //    if (!this.state.gooey && this.props.gooey) {
   //       // Dynamically require a gooey component
   //       // This syntax is weird but it works
   //       require.ensure([], () => {
   //          // Build require string
   //          var req = './' + this.props.gooey;

   //          // when this function is called
   //          // the module is guaranteed to be synchronously available.
   //          this.Gooey = require(req);

   //          // Set state to notify GooeyHost component
   //          // that we have the requested Gooey component
   //          this.setState({
   //             isReady: true
   //          });
   //       });
   //    }
   // }

   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      return (
         <div>
            <this.state.gooey />
         </div>
      );
   }
}

export default GooeyHost;
