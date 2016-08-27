// PACKAGES
import React from 'react';
// COMPONENTS
import Indicator from 'components/Indicator';

function Day (props) {
   var { data } = props;

   // just show first one
   var stats, style, targetInfo;
   if (data.targetsStats) {
      stats = data.targetsStats;
      targetInfo = (
         <Indicator kind={'percent'} title={'Accuracy'}
            backgroundColor={Indicator.calcColor(stats.accuracy) }
            value={stats.accuracy}
            change={stats.change}
            style={styles.indicator}
         />
      );
   }

   // Calculate style
   style = stats && stats.change >= 0.0 ? { ...styles.root, ...styles.met } : data.isMonth ? styles.root : { ...styles.root, ...styles.outOfScope };

   return (
      <div style={style}>
         <div className="calendar-box-header" style={styles.header}>
            <span style={styles.dayOfWeek} className="calendar-day">{data.dayName.slice(0, 3) }</span>
            <span style={styles.date}>{data.date.getDate() }</span>
         </div>
         {targetInfo}
      </div>
   );
}

var styles = {
   root: {
      flex: '1',
      borderRadius: '0',
      margin: '0',
      width: '13.6%',
      border: '1px solid hsl(0, 0%, 53%)',
      borderWidth: '1px 0 1px 1px',
      minHeight: '8rem',
   },
   header: {
      display: 'flex',
   },
   indicator: {
      maxWidth: '7rem',
      margin: 'auto',
   },
   dayOfWeek: {
      flexGrow: '1',
      fontSize: '1.6em',
      padding: '0.25rem',
   },
   date: {
      fontSize: '1.6em',
      fontWeight: 'bold',
      padding: '0.25rem',
   },
   outOfScope: {
      backgroundColor: '#CCC',
   },
   met: {
      backgroundColor: 'rgb(239, 255, 169)',
   },
};

export default Day;
