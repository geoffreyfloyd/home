// PACKAGES
import babble from 'libs/babble';
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import those from 'those';
// STORES
import logentryStore from 'stores/logentry-store';
import tagStore from 'stores/tag-store';
import targetStore from 'stores/target-store';
// COMPONENTS
import appStyle from 'apps/doozy/style';
import Indicator from 'components/Indicator';

export default class Targets extends React.Component {
   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   constructor (props) {
      super(props);

      this.handleTargetClick = this.handleTargetClick.bind(this);
      this.handleEditClick = this.handleEditClick.bind(this);
      this.handleLogentryStoreUpdate = this.handleLogentryStoreUpdate.bind(this);
      this.handleTagStoreUpdate = this.handleTagStoreUpdate.bind(this);
      this.handleTargetStoreUpdate = this.handleTargetStoreUpdate.bind(this);

      this.state = {
         logentries: [],
         targets: [],
         tags: [],
      };
   }

   componentDidMount () {
      logentryStore.subscribe(this.handleLogentryStoreUpdate, { key: JSON.stringify({ key: '*' }) });
      tagStore.subscribe(this.handleTagStoreUpdate, { key: JSON.stringify({ key: '*' }) });
      targetStore.subscribe(this.handleTargetStoreUpdate, { key: JSON.stringify({ key: '*' }) });
   }

   handleEditClick (target) {
      window.location.href = `/target/${target.id}`;
      // host.go('/doozy/target/' + target.id);
   }

   handleTargetClick (target) {
      window.location.href = `/calendar?targetId=${target.id}`;
   }

   handleLogentryStoreUpdate (value) {
      this.setState({
         logentries: value.results || this.state.logentries,
      });
   }

   handleTagStoreUpdate (value) {
      this.setState({
         tags: value.results || this.state.tags,
      });
   }

   handleTargetStoreUpdate (value) {
      this.setState({
         targets: value.results || this.state.targets,
      });
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      var { targets, logentries } = this.state;
      var elMetTargets;

      var targetsStats = targetStore.targetsStats(targets, logentries);

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
         var timeLeft = `${new babble.Duration(timeTo - (new Date()).getTime()).toString().split(', ')[0]} left in this period`;

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

      var unmet = _.chain(targetList)
         .filter(i => i.progress.value !== 'MET')
         .sortBy('timeLeftNumber')
         .groupBy('timeLeft')
         .value();

      var met = _.chain(targetList)
         .filter(i => i.progress.value === 'MET')
         .sortBy('name')
         .value();

      if (met.length) {
         elMetTargets = [
            <h2 style={styles.heading}>Met Targets</h2>,
            met.map((t, i) => this.renderTargetRow(t, (i === met.length - 1))),
         ];
      }

      return (
         <div style={appStyle.background}>
            <div style={appStyle.content}>
               {Object.keys(unmet).map(group => (
                  <div>
                     <h2 style={styles.heading}>Unmet targets with {group}</h2>
                     {unmet[group].map((t, i) => this.renderTargetRow(t, (i === unmet[group].length - 1)))}
                  </div>
               ))}
               {elMetTargets}
            </div>
         </div>
      );
   }

   renderTargetRow (item, isLast) {
      var periodDescription = targetStore.getPeriodDescription(item.target.period, item.target.multiplier);
      return (
         <div key={item.target.id} style={styles.targetStyle(isLast)}>
            <div style={styles.title}>{item.target.name}</div>
            <div style={{ display: 'flex' }}>
               <Indicator kind={item.progress.kind} title={'Progress'}
                  description={'The progress of logged effort versus targeted effort for the active period.'}
                  backgroundColor={item.progress.backgroundColor}
                  value={item.progress.value}
                  compareValue={item.progress.compare}
                  change={item.progress.change}
                  onClick={this.handleTargetClick.bind(null, item.target)}
               />
               <Indicator kind={'comparison'} title={'Streak'}
                  description={'The current number of consecutively met periods versus the longest historical number of consecutively met periods.'}
                  backgroundColor={item.streak.backgroundColor}
                  value={item.stats.periodActive.streak}
                  compareValue={item.longestStreak}
                  change={item.streak.change}
                  onClick={this.handleTargetClick.bind(null, item.target)}
               />
               <Indicator kind={'percent'} title={'Flow'}
                  description={'The average amount of effort in contrast to the targeted amount of effort.'}
                  backgroundColor={Indicator.calcColor(item.stats.periodActive.average) }
                  value={item.stats.periodActive.average}
                  change={0}
                  onClick={this.handleTargetClick.bind(null, item.target)}
               />
               <Indicator kind={'percent'} title={'Consistency'}
                  description={'The average of targeted periods where the targeted amount of effort was met.'}
                  backgroundColor={Indicator.calcColor(item.stats.periodActive.accuracy) }
                  value={item.stats.periodActive.accuracy}
                  change={item.stats.periodActive.change}
                  onClick={this.handleTargetClick.bind(null, item.target)}
               />
               <div style={styles.textInfo}>
                  <div>{periodDescription}</div>
                  <div>{`Since ${(new Date(item.target.starts)).toLocaleDateString()}`}</div>
                  <div>{item.timeLeft}</div>
               </div>
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
   textInfo: {
      flexGrow: '1',
      textAlign: 'left',
      color: '#999',
      padding: '0.7rem',
   },
   title: {
      width: '100%',
      fontSize: 'x-large',
      color: '#DDD', //#00AF27
   },
   edit: {
      ...appStyle.click,
      padding: '1rem',
   },
};

/*************************************************************
 * BOOTSTRAP
 *************************************************************/
global.APP = Targets;
global.React = React;
global.ReactDOM = ReactDOM;
