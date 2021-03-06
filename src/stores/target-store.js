import GnodeStore from './gnode-store';
import those from 'those';
import { parseISO8601String } from 'libs/date-util';

class TargetStore extends GnodeStore {

   constructor () {
      super('Doozy', 'Target', 1);
   }

   new (name) {
      var iso = (new Date()).toISOString();
      return {
         isNew: true,
         id: GnodeStore.uuid(),
         created: iso,
         name: name || '',
         entityType: 'Tag',
         entityId: null,
         measure: null, // BY_EXECUTION = 0, BY_PROGRESS = 1, BY_DURATION = 2
         target: null, /* Depends on measure: BY_EXECUTION - The target number of executions within a single period.
                                              BY_PROGRESS - The target percentage of progress within a single period.
                                              BY_DURATION - The target number of minutes spent within a single period. */
         starts: iso,
         period: null,
         multiplier: 1,
         number: 1,
         retireWhenMet: false,
      };
   }

   save (model) {
      if (model.isNew) {
         return this.create(model);
      }
      return this.update(model);
   }

   getMeasures () {
      return [
         { name: 'By Execution', value: 0 },
         { name: 'By Progress', value: 1 },
         { name: 'By Duration', value: 2 },
      ];
   }

   getPeriods () {
      return [
         { name: 'Years', value: 0 },
         { name: 'Months', value: 1 },
         { name: 'Weeks', value: 2 },
         { name: 'Days', value: 3 },
      ];
   }

   getPeriodDescription (period, multiplier) {
      if (multiplier === 1) {
         switch (period) {
            case (0):
               return 'Yearly';
            case (1):
               return 'Monthly';
            case (2):
               return 'Weekly';
            case (3):
               return 'Daily';
         }
      }
      switch (period) {
         case (0):
            return `Every ${multiplier} Years`;
         case (1):
            return `Every ${multiplier} Months`;
         case (2):
            return `Every ${multiplier} Weeks`;
         case (3):
            return `Every ${multiplier} Days`;
      }
      return '';
   }

   targetsStats (targets, logEntries, today) {
      var targetsStats = [];

      // today
      /* eslint-disable no-param-reassign */
      if (!today) {
         today = new Date();
      }
      today.setHours(0, 0, 0, 0);
      /* eslint-enable no-param-reassign */

      targets.forEach(target => {
         var accuracy,
            accuracyBeforeLatestPeriod,
            activePeriod,
            allButLatestPeriod,
            average,
            longestStreakPeriod,
            periodStarts,
            thisStreakIndex;

         // var actionIds = [];
         var change = 0;
         var periodsStats = [];

         // first period starts
         periodStarts = parseISO8601String(target.starts);

         if (today < periodStarts) {
            targetsStats.push({
               targetId: target.id,
               error: 'Today is before Period Starts',
            });
            return;
         }

         var realToday = new Date();
         realToday.setHours(0, 0, 0, 0);

         // steps through all periods for this target
         while (periodStarts <= today) {
            var periodEnds = targetPeriodEnds(target, periodStarts);

            if (periodEnds < realToday) {
               // add period tally
               periodsStats.push(
                  this.targetPeriodStats(target,
                     logEntries,
                     periodStarts,
                     periodEnds,
                     periodsStats,
                     false)
               );
            }
            else {
               activePeriod = this.targetPeriodStats(
                  target,
                  logEntries,
                  periodStarts,
                  periodEnds,
                  periodsStats,
                  true
               );
               if (activePeriod.met) {
                  periodsStats.push(activePeriod);
               }
            }

            // step to next target period
            nextTargetPeriod(target, periodStarts);
         }

         // Calculate previous best streak, Do not include the latest streak
         periodsStats.forEach((pstat, pindex) => {
            if (pstat.streak === 0) {
               thisStreakIndex = pindex;
            }
         });
         longestStreakPeriod = those(periodsStats.slice(0, thisStreakIndex)).max('streak');

         targetsStats.push({ 
            targetId: target.id,
            periodActive: activePeriod,
            periodLongestStreak: longestStreakPeriod,
            periods: periodsStats,
         });
      });

      return targetsStats;
   }

   targetPeriodStats (target, logEntries, periodStarts, periodEnds, periodsStats, isActive) {
      var daysLeft, daysInPeriod, number, performed, today;
      var streak = 0;

      performed = logEntries.filter(item => {
         var logDate = parseISO8601String(item.date);

         if (item.entry !== 'performed' || logDate < periodStarts || logDate > periodEnds) {
            return false;
         }

         if (target.entityType === 'Action') {
            return those(item.actions).first({ id: target.entityId }) !== null;
         }
         else if (target.entityType === 'Tag') {
            return those(item.tags).first({ id: target.entityId }) !== null;
         }
         return false;
      });

      // calculate number based on log history
      if (target.measure === TARGET_MEASURE.EXECUTION) {
         number = performed.length;
      }
      else if (target.measure === TARGET_MEASURE.DURATION) {
         performed.forEach(item => {
            number += item.duration;
         });
      }

      // calculate period streak
      var isMet = target.number <= number ? 1 : 0; // is target met?
      var isAccounted = (isMet || !isActive) ? 1 : 0;
      var prevStreak = periodsStats.length ? periodsStats.slice(-1)[0].streak : 0;
      var prevAccuracy = periodsStats.length ? periodsStats.slice(-1)[0].accuracy : 100;
      if (isActive && !isMet) {
         streak = prevStreak;
      }
      else if (!isActive && !isMet) {
         streak = 0;
      }
      else if (periodsStats.length) {
         streak = prevStreak + isMet;
      }
      else {
         streak += isMet;
      }

      var filterMet = item => item.met;

      // calculate accuracy and average number
      var totalPeriods = periodsStats.length + isAccounted;
      var metPeriods = periodsStats.filter(filterMet).length + isMet;
      var accuracy = Math.round((metPeriods / totalPeriods) * 10000) / 100;
      var average = (periodsStats.reduce((prev, next) => prev + next.number, 0) + (isAccounted ? number : 0)) / (totalPeriods * target.number);
      average = Math.round(average * 10000) / 100;

      var change = Math.round((accuracy - prevAccuracy) * 100) / 100;
      // if (periodsStats.length > 1) {
      //    allButLatestPeriod = periodsStats.slice(0, -1);
      //    accuracyBeforeLatestPeriod = Math.round((allButLatestPeriod.filter(filterMet).length / allButLatestPeriod.length) * 10000) / 100;
      //    change = Math.round((accuracy - accuracyBeforeLatestPeriod) * 100) / 100;
      // }

      // for current period, a few more indicators
      if (isActive) {
         today = new Date();
         daysInPeriod = (periodEnds.getTime() - periodStarts.getTime()) / 86400000;
         today.setHours(0, 0, 0, 0);
         daysLeft = (periodEnds.getTime() - (new Date()).getTime()) / 86400000;
      //    if (periodEnds.getTime() === today.getTime()) {
      //       daysLeft = ((new Date()).getTime() - periodEnds.getTime()) / (86400000 * 0.7);
      //    }
      //    else {
      //       daysLeft = (periodEnds.getTime() - today.getTime()) / 86400000;
      //    }
      }

      // return period stats
      return {
         starts: periodStarts.toISOString(),
         ends: periodEnds.toISOString(),
         number,
         met: target.number <= number,
         streak,
         distance: number - target.number,
         logEntries: performed,
         daysLeft,
         daysInPeriod,
         accuracy,
         average,
         change,
      };
   }
}

const TARGET_MEASURE = {
   EXECUTION: 0,
   PROGRESS: 1,
   DURATION: 2,
};

const TARGET_PERIOD = {
   YEARS: 0,
   MONTHS: 1,
   WEEKS: 2,
   DAYS: 3,
};

function nextTargetPeriod (target, starts) {
   if (target.period === TARGET_PERIOD.YEARS) {
      starts.setFullYear(starts.getFullYear() + target.multiplier);
   }
   else if (target.period === TARGET_PERIOD.MONTHS) {
      starts.setMonth(starts.getMonth() + target.multiplier);
   }
   else if (target.period === TARGET_PERIOD.WEEKS) {
      starts.setDate(starts.getDate() + (target.multiplier * 7));
   }
   else if (target.period === TARGET_PERIOD.DAYS) {
      starts.setDate(starts.getDate() + target.multiplier);
   }
}

function targetPeriodEnds (target, starts) {
   var d = new Date(starts.toISOString());
   if (target.period === TARGET_PERIOD.YEARS) {
      d.setFullYear(d.getFullYear() + target.multiplier);
   }
   else if (target.period === TARGET_PERIOD.MONTHS) {
      d.setMonth(d.getMonth() + target.multiplier);
   }
   else if (target.period === TARGET_PERIOD.WEEKS) {
      d.setDate(d.getDate() + (target.multiplier * 7));
   }
   else if (target.period === TARGET_PERIOD.DAYS) {
      d.setDate(d.getDate() + target.multiplier);
   }
   d.setDate(d.getDate() - 1);
   d.setHours(23, 59, 59, 999);
   return d;
}

// Export instance
var singleton = new TargetStore();
export default singleton;
