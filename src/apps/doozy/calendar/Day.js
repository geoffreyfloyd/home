import React from 'react';
import Indicator from 'components/Indicator';
// import { today } from 'libs/date-util';

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
         border: '1px solid #81981d',
         borderWidth: '1px 0 1px 1px',
         minHeight: '8rem',
      };

      var styleOutOfScope = {
         border: '1px solid hsl(0, 0%, 53%)',
      };

      if (!data.isMonth) {
         style = Object.assign(style, styleOutOfScope);
      }

      var styleIsDay = {
         boxShadow: '#e263ff 0 0 100px inset',
      };
      if (data.isDay) {
         style = Object.assign(style, styleIsDay);
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
            />
         );
         var styleIsMet = {
            boxShadow: '#e2ff63 0 0 100px inset',
         };
         if (stats.change > 0.0) {
            style = Object.assign(style, styleIsMet);
         }
      }

      return (
         <div style={style}>
            <div className="calendar-box-header" style={{ display: 'flex' }}>
               <span style={{ flexGrow: '1', fontSize: '1.6em' }} className="calendar-day">{data.dayName.slice(0, 3) }</span>
               <span style={{ fontSize: '1.6em', fontWeight: 'bold' }}>{data.date.getDate() }</span>
            </div>
            {targetInfo}
         </div>
      );
   }
}
export default Day;
