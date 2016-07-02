// import '../../global.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import http from 'libs/http';
import targetStore from 'stores/target-store';
import { $background, $click, $content } from 'components/styles';
import Indicator from 'components/Indicator';
import babble from 'babble';
import those from 'those';

export default class LogEntry extends React.Component {
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

   handleTargetClick () {
      // ui.goTo('Calendar', {targetId: target.id});
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      var { targets, logentries } = this.state;

      var targetsStats = targetStore.targetsStats(targets, logentries);

      var sortedList = those(targets).sort('name');

      return (
         <div style={$background}>
            <div style={$content}>
               {sortedList.map(item => {
                  // find statistics object for this target
                  var stats = those(targetsStats).first({ targetId: item.id });
                  var progress = Indicator.calcProgressProps(item, stats);

                  var streak = {
                     backgroundColor: stats.periodActive.streak >= stats.periodLongestStreak.streak ? 'hsl(120,90%,40%)' : (stats.periodActive.streak === 0 ? 'hsl(0,90%,40%)' : 'white'),
                     change: stats.periodActive.streak > stats.periodLongestStreak.streak ? stats.periodActive.streak - stats.periodLongestStreak.streak : 0,
                  };

                  var timeTo = new Date(stats.periodActive.ends);
                  timeTo.setHours(23, 59, 59, 999);
                  var timeLeft = new babble.Duration(timeTo - (new Date()).getTime()).toString().split(', ')[0] + ' left in this period';

                  // existing targets
                  return (
                    <div key={item.id} style={styles.targetStyle}>
                        <div style={styles.title}>{item.name}</div>
                        <div style={{ display: 'flex' }}>
                           <Indicator kind={progress.kind} title={'Progress'}
                              backgroundColor={progress.backgroundColor}
                              value={progress.value}
                              compareValue={progress.compare}
                              change={progress.change}
                              onClick={this.handleTargetClick.bind(null, item)}
                           />
                           <Indicator kind={'comparison'} title={'Streak'}
                              backgroundColor={streak.backgroundColor}
                              value={stats.periodActive.streak}
                              compareValue={stats.periodLongestStreak.streak || 0}
                              change={streak.change}
                              onClick={this.handleTargetClick.bind(null, item)}
                           />
                           <Indicator kind={'percent'} title={'Accuracy'}
                              backgroundColor={Indicator.calcColor(stats.accuracy) }
                              value={stats.accuracy}
                              change={stats.change}
                              onClick={this.handleTargetClick.bind(null, item)}
                           />
                           <div style={styles.timeLeft}>{timeLeft}</div>
                           <div style={styles.edit} onClick={this.handleEditClick.bind(null, item) }><i className="fa fa-pencil fa-2x"></i></div>
                        </div>
                    </div>
                  );
               }) }
            </div>
         </div>
      );
   }
}

/**
 * Inline Styles
   */
var styles = {
   targetStyle: {
      fontSize: 'large',
      padding: '5px',
      borderBottom: 'solid 1px #444',
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
      color: '#ddd',
   },
   edit: {
      ...$click,
      padding: '1rem',
   },
}

global.APP = LogEntry;
global.React = React;
global.ReactDOM = ReactDOM;
