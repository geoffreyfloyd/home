import React from 'react';
import ReactDOM from 'react-dom';
import http from 'libs/http';
import Day from './Day';
import { parseISO8601String, today } from 'libs/date-util';
import { getJsonFromUrl } from 'libs/url-util';
import targetStore from 'stores/target-store';
import { $getFlex } from 'libs/style';

class Calendar extends React.Component {
   /*************************************************************
   * COMPONENT LIFECYCLE
   *************************************************************/
   constructor (props) {
      super(props);

      // Bind event handlers
      this.handleLeftClick = this.handleLeftClick.bind(this);
      this.handleRightClick = this.handleRightClick.bind(this);

      // Set initial state
      this.state = {
         date: (new Date()).toISOString(),
      };
   }

   componentDidMount () {
      // Get Data
      http(`/graphql?query={
         targets(id:"${this.props.targetId}"){
            id,
            created,
            starts,
            retire,
            name,
            entityType,
            entityId,
            measure,
            period,
            multiplier,
            number,
            retireWhenMet
         },
         logentries{
            id,
            kind,
            date,
            details,
            duration,
            entry,
            actions{id,name},
            tags{id,name,kind,descendantOf}
         },
         tags{
            id,
            name,
            kind,
            descendantOf
         }
      }`.replace(/ /g, '')).requestJson().then(json => {
         // Set data
         this.setState({
            logentries: json.data.logentries,
            target: json.data.targets[0],
            tags: json.data.tags,
         });
      });
   }

   /*************************************************************
   * EVENT HANDLING
   *************************************************************/
   handleLeftClick () {
      var date = this.state.date;
      var dateObj = parseISO8601String(date);
      dateObj.setMonth(dateObj.getMonth() - 1);
      this.setState({
         date: dateObj.toISOString(),
      });
   }

   handleRightClick () {
      var date = this.state.date;
      var dateObj = parseISO8601String(date);
      dateObj.setMonth(dateObj.getMonth() + 1);
      this.setState({
         date: dateObj.toISOString(),
      });
   }

   /*************************************************************
   * METHODS
   *************************************************************/
   calcIsMonth (date1, date2) {
      return date1.getMonth() === date2.getMonth()
            && date1.getFullYear() === date2.getFullYear();
   }

   getMonthDays (beginMonthViewDate) {
      var date = parseISO8601String(this.state.date);
      var days = this.getDaysOfWeek(beginMonthViewDate, 35);
      var nextDate = new Date(days[days.length - 1].date.getTime());
      nextDate.setDate(nextDate.getDate() + 1);
      if (this.calcIsMonth(date, nextDate)) {
         days = days.concat(this.getDaysOfWeek(nextDate, 7));
      }
      return days;
   }

   getDaysOfWeek (date, count) {
      var days = [];
      for (var i = 0; i < count; i++) {
         days.push({
            date: new Date(date.getTime()),
            day: date.getDay(),
            dayName: Calendar.days[date.getDay()]
         });
         date.setDate(date.getDate() + 1);
      }
      return days;
   }

   getBeginningOfWeek (date, weekStarts) {
      if (typeof weekStarts === 'undefined') {
         weekStarts = 0;
      }

      date.setHours(0, 0, 0, 0);
      var diff = weekStarts - date.getDay();
      if (weekStarts > date.getDay()) {
         date.setDate(date.getDate() + (diff - 7));
      }
      else {
         date.setDate(date.getDate() + diff);
      }

      return date;
   }

   getFirstOfMonth (date) {
      return new Date(date.getFullYear() + '-' + (date.getMonth() + 1) + '-01' + ' ' + date.toString().split(' ')[5]);
   }

   styleDaysOfMonth (days) {
      var { target, logentries } = this.state;
      var { targetId, weekStarts } = this.props;
      var beginningOfWeek = this.getBeginningOfWeek(parseISO8601String(this.state.date), weekStarts);
      var endOfWeek = new Date(beginningOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      var targets = [target];
      // just process the first one
      var today = new Date();
      var date = parseISO8601String(this.state.date);

      var targetsStats = targetStore.targetsStats(targets, logentries)[0];

      days.forEach(day => {
         day.isMonth = this.calcIsMonth(date, day.date);
         day.isWeek = day.isMonth && beginningOfWeek <= day.date && day.date <= endOfWeek;
         day.isDay = day.isMonth && date.getDate() === day.date.getDate();
         day.targetsStats = targetsStats.periods.filter(period => {
            var starts = new Date(period.starts);
            var ends = new Date(period.ends);
            return day.date >= starts && day.date <= ends;
         })[0];
      });
   }

   /*************************************************************
   * RENDERING
   *************************************************************/
   render () {
      // props
      var { targetId, weekStarts } = this.props;
      var { date, target } = this.state;

      if (!target) {
         return <div>Loading...</div>;
      }

      var appendTargetName = ': ' + target.name;

      // state
      var dateObj = parseISO8601String(date);

      // calcs
      var beginMonthViewDate = this.getBeginningOfWeek(this.getFirstOfMonth(dateObj), weekStarts);
      var days = this.getMonthDays(beginMonthViewDate);
      this.styleDaysOfMonth(days);

      var weeks = [days.slice(0, 7), days.slice(7, 14), days.slice(14, 21), days.slice(21, 28), days.slice(28, 35), days.slice(35, 42)];

      // html
      return (
            <div style={{ ...$getFlex('column', false), minHeight: '100vh', minWidth: '50rem' }}>
               <div style={headerStyle}>
                  <div style={styles.navButton} onClick={this.handleLeftClick}><i className="clickable fa fa-chevron-left"></i></div>
                  <div style={styles.title}>{`${Calendar.months[dateObj.getMonth()]} ${dateObj.getFullYear()}${appendTargetName}`}</div>
                  <div style={styles.navButton} onClick={this.handleRightClick}><i className="clickable fa fa-chevron-right"></i></div>
               </div>
               {weeks.map(week => {
                  return (
                     <div style={{ ...$getFlex('row', false), width: '100%', flex: '1' }}>
                        {week.map((day, index) => <Day key={index} data={day} />)}
                     </div>
                  );
               })}
            </div>
      );
   }
}
Calendar.defaultProps = {
   targetId: null,
   weekStarts: 0,
   ...getJsonFromUrl(),
};
Calendar.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
Calendar.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

var styles = {
   navButton: {
      cursor: 'pointer',
   },
   title: {
      flexGrow: '1',
      textAlign: 'center',
   }
}

var headerStyle = {
   ...$getFlex(),
   color: '#e2ff63',
   backgroundColor: '#444',
   padding: '0.5rem',
   fontWeight: 'bold',
   fontSize: '1.5em',
   width: '100%',
};


global.APP = Calendar;
global.React = React;
global.ReactDOM = ReactDOM;
