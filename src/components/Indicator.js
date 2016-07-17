import React from 'react';
import { $click } from 'components/styles';

class Indicator extends React.Component {
   /*************************************************************
   * RENDERING
   *************************************************************/
   render () {
      var { backgroundColor, change, compareValue, description, kind, style, title, value, width } = this.props;
      var content;

      var changeColor = 'rgb(68, 68, 68)';
      var changePrefix = '';
      var suffix = '';

      if (change > 0) {
            changeColor = 'hsl(120,90%,40%)';
      }
      else if (change < 0) {
            changeColor = 'hsl(0,90%,40%)';
      }

      if (kind === 'percent') {
            suffix = '%';
      }
      if (change > 0) {
            changePrefix = '+';
      }

      /**
       * Render content based on kind of indicator
         */
      if (kind === 'percent' || kind === 'simple') {
            content = (
               <div title={description} style={{textAlign: 'center', backgroundColor: backgroundColor, color: (backgroundColor === 'white' ? 'black' : 'white'), fontSize: 'x-large'}}>
                  {String(value) === 'NaN' ? '-' : value + suffix}
               </div>
            );
      }
      else if (kind === 'comparison') {
            content = (
               <div title={description} style={{textAlign: 'center', backgroundColor: backgroundColor, color: (backgroundColor === 'white' ? 'black' : 'white')}}>
                  <div style={{display: 'inline', fontSize: 'x-large'}}>{value + suffix}</div>
                  <div style={{display: 'inline'}}>/{compareValue + suffix}</div>
               </div>
            );
      }

      return (
            <div {...this.props} style={{ ...$click, minWidth: width, margin: '5px', ...style }}>
               <div style={{textAlign: 'center', borderRadius: '8px 8px 0 0', backgroundColor: 'rgb(68, 68, 68)', color: 'white', marginBottom: '2px'}}>{title}</div>
               {content}
               <div style={{textAlign: 'center', borderRadius: '0 0 8px 8px', backgroundColor: 'rgb(68, 68, 68)', color: changeColor, marginTop: '2px'}}>{changePrefix + change + suffix}</div>
            </div>
      );
   }
}

Indicator.propTypes = {
   value: React.PropTypes.string.isRequired,
   change: React.PropTypes.any.isRequired,
};

Indicator.defaultProps = {
   width: '7rem',
   backgroundColor: 'white',
   isPercent: false,
};

Indicator.calcColor = function (percent) {
   if (typeof percent === 'undefined' || percent === '') {
      return null;
   }

   var multiplier = 120 / 100;
   var offBy = 100 - percent;

   var color = 'hsl(' + (120 - Math.round(offBy * multiplier)) + ',90%,40%)';

   return color;
};

Indicator.calcProgressProps = function (target, stats) {
   var progress = {
      kind: 'comparison',
      value: stats.periodActive.number,
      backgroundColor: 'white',
      compare: target.number,
      change: stats.periodActive.number > target.number ? stats.periodActive.number - target.number : 0
   };

   var diff = target.number - stats.periodActive.number;
   var expectedRate = target.number / stats.periodActive.daysInPeriod;
   if (diff <= 0) {
      Object.assign(progress, {
         kind: 'simple',
         backgroundColor: Indicator.calcColor(100),
         value: 'MET',
         compare: null,
      });
   }
   else if (Math.ceil(stats.periodActive.daysLeft * expectedRate) >= diff) {
      // do nothing
   }
   else {
      Object.assign(progress, {
         backgroundColor: Indicator.calcColor(Math.round((Math.ceil(stats.periodActive.daysLeft * expectedRate) / diff) * 100) - 50)
      });
   }

   return progress;
};

export default Indicator;
