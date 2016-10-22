// PACKAGES
import React from 'react';
// Pie.js - an svg component study
// Component works in Chrome, but Dasharray fill looks off in FF and perhaps others,
// so we should eventually rewrite this with Canvas to be cross-browser compatible

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
   var { bgColor, borderColor, borderDashIncrement, borderThickness, onClick, max, radius, series } = props;
   var circumference = getSliceDistance(max, max, radius);
   var distanceSpanned = 0;
   var border;
   // Create a border if props are defined
   if (borderColor && borderThickness) {
      border = (
            <circle
               key="border"
               r={radius / 2}
               cx={radius / 2}
               cy={radius / 2}
               style={{
                  ...styles.border(borderColor, borderDashIncrement, borderThickness, max, radius),
               }}
            />
      );
   }
   // Return rendered
   return (
      <svg width={radius} height={radius} style={styles.svg(bgColor || defaultBgColor)}>
         {series.map((item, i) => {
            var sliceDistance = getSliceDistance(item.x, max, radius);
            var circle = (
               <circle
                  key={'slice-' + i}
                  r={radius / 4}
                  cx={radius / 2}
                  cy={radius / 2}
                  onClick={onClick ? onClick.bind(null, item) : undefined}
                  style={{
                     ...styles.circle(item.color || defaultColors[i], radius, circumference),
                     ...styles.fillSlice(distanceSpanned, sliceDistance, circumference)
                  }}
               />
            );
            distanceSpanned += sliceDistance;
            return circle;
         })}
         {border}
      </svg>
   );
};

var styles = {
   border (borderColor, borderDashIncrement, borderThickness, max, radius) {
      var tickDistance = getSliceDistance(1, max, radius * 2);
      var incrementDistance = borderDashIncrement ? getSliceDistance(borderDashIncrement, max, radius * 2) : 0;
      return {
         fill: 'transparent',
         stroke: borderColor,
         strokeWidth: borderThickness,
         strokeDasharray: incrementDistance ? tickDistance + ' ' + (incrementDistance - tickDistance) : undefined,
         transition: 'stroke-dasharray 0.3s ease',
      };
   },
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
