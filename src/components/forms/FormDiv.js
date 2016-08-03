// PACKAGES
import React from 'react';
// MIXINS
import formRelay from './formRelay';

function FormDiv (props) {
   return (
      <div style={props.style}>
         {props.children}
      </div>
   );
}

export default formRelay(FormDiv);
