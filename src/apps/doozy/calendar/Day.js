import React from 'react';
import Indicator from 'components/Indicator';

class Day extends React.Component {
   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      var { data } = this.props;
      var style = {
         flex: '1',
         borderRadius: '0',
         margin: '0',
         width: '13.6%',
         border: '1px solid hsl(0, 0%, 53%)',
         borderWidth: '1px 0 1px 1px',
         minHeight: '8rem',
      };

      var styleOutOfScope = {
         backgroundColor: '#CCC',
      };

      if (!data.isMonth) {
         style = Object.assign(style, styleOutOfScope);
      }

      // just show first one
      var targetInfo;
      if (data.targetsStats) {
         var stats = data.targetsStats[0];
         targetInfo = (
            <Indicator kind={'percent'} title={'Accuracy'}
               backgroundColor={Indicator.calcColor(stats.accuracy) }
               value={stats.accuracy}
               change={stats.change}
               style={{ maxWidth: '7rem', margin: 'auto' }}
            />
         );
         var styleIsMet = {
            backgroundColor: 'rgb(239, 255, 169)',
         };
         if (stats.change >= 0.0) {
            style = Object.assign(style, styleIsMet);
         }
      }

      return (
         <div style={style}>
            <div className="calendar-box-header" style={{ display: 'flex' }}>
               <span style={{ flexGrow: '1', fontSize: '1.6em', padding: '0.25rem' }} className="calendar-day">{data.dayName.slice(0, 3) }</span>
               <span style={{ fontSize: '1.6em', fontWeight: 'bold', padding: '0.25rem' }}>{data.date.getDate() }</span>
            </div>
            {targetInfo}
         </div>
      );
   }
}
export default Day;
