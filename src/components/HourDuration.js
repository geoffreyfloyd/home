// PACKAGES
import React from 'react';
import Pie from 'components/Pie';

const HourDuration = function (props) {
   var { bgColor, fillColor, minutes, radius, tickColor, onClick } = props;
   return (
      <div onClick={onClick}>
         <Pie
            bgColor={bgColor}
            borderColor={tickColor}
            borderThickness={radius / 8}
            borderDashIncrement={5}
            series={[{ x: minutes, color: fillColor }]}
            max={60}
            radius={radius}
         />
      </div>
   );
};

export default HourDuration;
