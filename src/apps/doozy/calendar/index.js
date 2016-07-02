import React from 'react';
import ReactDOM from 'react-dom';
import http from 'libs/http';
import Day from './Day';
import { parseISO8601String, today } from 'libs/date-util';
import { getJsonFromUrl } from 'libs/url-util';
import targetStore from 'stores/target-store';

class Calendar extends React.Component {
   /*************************************************************
   * COMPONENT LIFECYCLE
   *************************************************************/
   constructor (props) {
      super(props);
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
      date.setMonth(date.getMonth() - 1);
      this.setState({
         date,
      });
   }

   handleRightClick () {
      var date = this.state.date;
      date.setMonth(date.getMonth() + 1);
      this.setState({
         date,
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
      var nextDate = days[days.length - 1].date;
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
            date: new Date(date.toISOString()),
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

      days.forEach(day => {
         var targetsStats;
         if (targetId && today > day.date) {
            var nextDay = day.date;
            nextDay.setDate(nextDay.getDate() + 1);
            targetsStats = targetStore.targetsStats(targets, logentries, nextDay);
            if (targetsStats[0].error) {
               targetsStats = undefined;
            }
         }
         day.isMonth = this.calcIsMonth(date, day.date);
         day.isWeek = day.isMonth && beginningOfWeek <= day.date && day.date <= endOfWeek;
         day.isDay = day.isMonth && date.getDate() === day.date.getDate();
         day.targetsStats = targetsStats;
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

      // html
      return (
            <div>
               <div style={headerStyle}>
                  <div style={{paddingRight: '5px'}} onClick={this.handleLeftClick}><i className="clickable fa fa-chevron-left fa-2x"></i></div>
                  <div style={{flexGrow: '1'}}>Month of {Calendar.months[dateObj.getMonth()] + appendTargetName}</div>
                  <div style={{paddingRight: '5px'}} onClick={this.handleRightClick}><i className="clickable fa fa-chevron-right fa-2x"></i></div>
                  <div style={{paddingRight: '5px'}}><button type="button" className="close" onClick={this.handleCloseClick}><span aria-hidden="true">&times;</span></button></div>
               </div>
               <div>
                  {days.map((item, index) => {
                     return (<Day key={index} data={item} />);
                  })}
               </div>
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

var headerStyle = {
   display: 'flex',
   flexDirection: 'row',
   color: '#e2ff63',
   backgroundColor: '#444',
   padding: '2px 2px 0 8px',
   fontWeight: 'bold',
   fontSize: '1.5em',
};


global.APP = Calendar;
global.React = React;
global.ReactDOM = ReactDOM;
