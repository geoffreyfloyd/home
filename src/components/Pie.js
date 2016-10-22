// PACKAGES
import React from 'react';

const defaultBgColor = '#444';
const defaultColors = [
   '#0074d9',
   'rgb(24, 255, 95)'
];

const getSliceDistance = function (x, max, radius) {
   var circumference = (radius * 3.14) * 0.5;
   var hourRatio = ((x / max) * 100.0) / 100;
   var sliceDistance = circumference * hourRatio;
   return sliceDistance;
};

const Pie = function (props) {
   var { bgColor, onClick, max, radius, series } = props;
   var circumference = getSliceDistance(max, max, radius);
   var distanceSpanned = 0;
   return (
      <svg width={radius} height={radius} style={styles.svg(bgColor || defaultBgColor)}>
         {series.map((item, i) => {
            var sliceDistance = getSliceDistance(item.x, max, radius);
            var circle = (
               <circle
                  r={radius / 4}
                  cx={radius / 2}
                  cy={radius / 2}
                  onClick={onClick.bind(null, item)}
                  style={{
                     ...styles.circle(item.color || defaultColors[i], radius, circumference),
                     ...styles.fillSlice(distanceSpanned, sliceDistance, circumference)
                  }}
               />
            );
            distanceSpanned += sliceDistance;
            return circle;
         })}
      </svg>
   );
};

var styles = {
   circle (stroke, radius, circumference) {
      return {
         fill: 'transparent',
         stroke: stroke,
         strokeWidth: radius / 2,
         strokeDasharray: '0 ' + circumference,
         transition: 'stroke-dasharray 0.3s ease',
      };
   },
   fillSlice (skipDistance, fillDistance, circumference) {
      var trailingDistance = (circumference - (skipDistance + fillDistance));
      if (skipDistance) {
         return {
            strokeDasharray: '0 ' + skipDistance + ' ' + fillDistance + ' ' + trailingDistance
         };
      }
      return {
         strokeDasharray: fillDistance + ' ' + trailingDistance
      };
   },
   svg (bgColor) {
      return {
         transform: 'rotate(-90deg)',
         background: bgColor,
         borderRadius: '50%',
      };
   },
};

export default Pie;
