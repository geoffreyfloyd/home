// PACKAGES
import React from 'react';
import Pie from 'components/Pie';

const HourDuration = function (props) {
   var { bgColor, fillColor, minutes, radius, onClick } = props;
   return (
      <Pie
         bgColor={bgColor}
         series={[{ x: minutes, color: fillColor }]}
         max={60}
         radius={radius}
         onClick={onClick}
      />
   );
};

export default HourDuration;
