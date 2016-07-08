// import '../../global.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import http from 'libs/http';
import targetStore from 'stores/target-store';
import { $background, $click, $content } from 'components/styles';
import Indicator from 'components/Indicator';
import babble from 'babble';
import those from 'those';
import _ from 'lodash';

export default class Targets extends React.Component {
   constructor (props) {
      super(props);

      this.handleTargetClick = this.handleTargetClick.bind(this);
      this.handleEditClick = this.handleEditClick.bind(this);

      this.state = {
         logentries: [],
         targets: [],
         tags: [],
      };
   }

   componentDidMount () {
      // Get Data
      http(`/graphql?query={
         targets{
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
            targets: json.data.targets,
            tags: json.data.tags,
         });
      });
   }

   handleEditClick (target) {
      window.location.href = `/target/${target.id}`;
      // host.go('/doozy/target/' + target.id);
   }

   handleTargetClick (target) {
      window.location.href = `/calendar?targetId=${target.id}`;
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      var { targets, logentries } = this.state;

      var targetsStats = targetStore.targetsStats(targets, logentries);

      //var sortedList = those(targets).sort('name');

      var targetList = targets.map(item => {
         // find statistics object for this target
         var stats = those(targetsStats).first({ targetId: item.id });
         var progress = Indicator.calcProgressProps(item, stats);
         var longestStreak = stats.periodLongestStreak || 0;
         var streak = {
            backgroundColor: stats.periodActive.streak >= longestStreak && stats.periodActive.streak > 0 ? 'hsl(120,90%,40%)' : (stats.periodActive.streak === 0 && longestStreak > 0 ? 'hsl(0,90%,40%)' : 'white'),
            change: stats.periodActive.streak > longestStreak ? stats.periodActive.streak - longestStreak : 0,
         };
         var timeTo = new Date(stats.periodActive.ends);
         timeTo.setHours(23, 59, 59, 999);
         var timeLeft = new babble.Duration(timeTo - (new Date()).getTime()).toString().split(', ')[0] + ' left in this period';

         return {
            target: item,
            stats,
            progress,
            longestStreak,
            streak,
            timeTo,
            timeLeft,
            met: progress.value === 'MET' ? 1 : 0,
            timeLeftNumber: timeTo.getTime() - (new Date()).getTime(),
         };
      });

      //var sortedList = those(targetList).order('timeLeftNumber').order('name').order('met');
      var unmet = _.chain(targetList)
         .filter(i => i.progress.value !== 'MET')
         .sortBy('timeLeftNumber')
         .groupBy('timeLeft')
         .value();

      var met = _.chain(targetList)
         .filter(i => i.progress.value === 'MET')
         .sortBy('name')
         .value();

      return (
         <div style={$background}>
            <div style={$content}>
               {Object.keys(unmet).map(group => (
                  <div>
                     <h2 style={styles.heading}>Unmet targets with {group}</h2>
                     {unmet[group].map((t, i) => this.renderTargetRow(t, (i === unmet[group].length - 1)))}
                  </div>
               ))}
               <h2 style={styles.heading}>Met Targets</h2>
               {met.map((t, i) => this.renderTargetRow(t, (i === met.length - 1)))}
            </div>
         </div>
      );
   }

   renderTargetRow (item, isLast) {
      var totalPeriods = item.stats.periods.length + (item.progress.value === 'MET' ? 0 : 1); 
      var periodDescription = targetStore.getPeriodDescription(item.target.period, item.target.multiplier);
      return (
         <div key={item.target.id} style={styles.targetStyle(isLast)}>
            <div style={styles.title}>{item.target.name}</div>
            <div style={{ display: 'flex' }}>
               <Indicator kind={item.progress.kind} title={'Progress'}
                  backgroundColor={item.progress.backgroundColor}
                  value={item.progress.value}
                  compareValue={item.progress.compare}
                  change={item.progress.change}
                  onClick={this.handleTargetClick.bind(null, item.target)}
               />
               <Indicator kind={'comparison'} title={'Streak'}
                  backgroundColor={item.streak.backgroundColor}
                  value={item.stats.periodActive.streak}
                  compareValue={item.longestStreak}
                  change={item.streak.change}
                  onClick={this.handleTargetClick.bind(null, item.target)}
               />
               <Indicator kind={'percent'} title={'Accuracy'}
                  backgroundColor={Indicator.calcColor(item.stats.periodActive.accuracy) }
                  value={item.stats.periodActive.accuracy}
                  change={item.stats.periodActive.change}
                  onClick={this.handleTargetClick.bind(null, item.target)}
               />
               <div style={styles.timeLeft}>{item.timeLeft}</div>
               <div style={styles.timeLeft}>{periodDescription}</div>
               <div style={styles.timeLeft}>{`Since ${(new Date(item.target.starts)).toLocaleDateString()}`}</div>
               <div style={styles.edit} onClick={this.handleEditClick.bind(null, item.target)}><i className="fa fa-pencil fa-2x"></i></div>
            </div>
         </div>
      );
   }
}

/**
 * Inline Styles
   */
var styles = {
   heading: {
      color: '#2B90E8',
   },
   targetStyle (isLast) {
      return {
         fontSize: 'large',
         padding: '5px',
         borderBottom: isLast ? undefined : 'solid 1px #444',
      };
   },
   timeLeft: {
      flexGrow: '1',
      textAlign: 'left',
      color: '#999',
      padding: '2rem',
   },
   title: {
      width: '100%',
      fontSize: 'x-large',
      color: '#DDD', //#00AF27
   },
   edit: {
      ...$click,
      padding: '1rem',
   },
}

global.APP = Targets;
global.React = React;
global.ReactDOM = ReactDOM;
