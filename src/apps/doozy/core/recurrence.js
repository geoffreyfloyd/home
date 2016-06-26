import babble from 'babble';
import those from 'those';

export function calcNaturalDays (date) {
   if (!date) {
      return '';
   }
   var date1 = date;
   var date2 = new Date();

   date1.setHours(0, 0, 0, 0);
   date2.setHours(0, 0, 0, 0);

   var timeDiff = Math.abs(date2.getTime() - date1.getTime());
   var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); // milliseconds in a second * seconds in an hour * hours in a day

   if (date1 < date2) {
      if (diffDays === 0) {
         return 'Today';
      }
      else if (diffDays === 1) {
         return 'Yesterday';
      }
      else if (diffDays < 7) {
         return babble.moments.daysOfWeek[date1.getDay()];
      }
      return diffDays + ' day' + (diffDays > 1 ? 's' : '') + ' ago';
   }
   else if (diffDays === 0) {
      return 'Today';
   }
   else if (diffDays === 1) {
      return 'Tomorrow';
   }
   else if (diffDays < 7) {
      return babble.moments.daysOfWeek[date1.getDay()];
   }
   return 'in ' + diffDays + ' day' + (diffDays > 1 ? 's' : '');
}

export function getFrequencyName (freq) {
   return {
      w: 'Week',
      m: 'Month',
      y: 'Year',
      d: 'Day',
   }[freq.slice(0, 1).toLowerCase()];
}

export function getNextOccurrence (recurrenceRules, startFrom, latestOccurrence) {
   var nextDate = null;
   if (recurrenceRules.length) {
      var date = latestOccurrence || startFrom;
      date = new Date(date.getTime());
      date.setDate(date.getDate() + 1);

      while (nextDate === null) {
         var occursToday = false;
         for (var i = 0; i < recurrenceRules.length; i++) {
            var recur = parseRecurrenceRule(recurrenceRules[i]);
            var match = processRecurrence(date, startFrom, recur);
            if (match && (recur.kind === 'RRULE' || recur.kind === 'RDATE')) {
               // might occur unless an exception overrides it
               occursToday = true;
            }
            else if (match && (recur.kind === 'EXRULE' || recur.kind === 'EXDATE')) {
               // only takes on exception match to rule it out
               occursToday = false;
               break;
            }
         }

         if (occursToday) {
            nextDate = new Date(date.getTime());
         }

         // iterate another day
         date.setDate(date.getDate() + 1);
      }
   }
   return nextDate;
}

export function getRecurrenceSummary (recurrenceRules) {
   if (!recurrenceRules || recurrenceRules.length === 0) {
      return null;
   }

   var summary = '';
   recurrenceRules.forEach(item => {
      var recurrenceObj = parseRecurrenceRule(item);

      if (recurrenceObj.byday) {
         var days = {
            SU: false,
            MO: false,
            TU: false,
            WE: false,
            TH: false,
            FR: false,
            SA: false,
         };

         // build days object
         recurrenceObj.byday.forEach(byday => {
            days[byday.day] = true;
         });

         var twoCharDays = those(recurrenceObj.byday).pluck('day');
         var fullnameDays = babble.moments.daysOfWeek.filter(dayOfWeek => twoCharDays.indexOf(dayOfWeek.slice(0, 2).toUpperCase()) > -1);

         if (recurrenceObj.interval > 1) {
            if (days.SU && days.SA && !days.MO && !days.TU && !days.WE && !days.TH && !days.FR) {
               summary = 'Every ' + recurrenceObj.interval + ' ' + getFrequencyName(recurrenceObj.freq).toLowerCase() + ' on the weekend';
            }
            else if (!days.SU && !days.SA && days.MO && days.TU && days.WE && days.TH && days.FR) {
               summary = 'Every ' + recurrenceObj.interval + ' ' + getFrequencyName(recurrenceObj.freq).toLowerCase() + ' on the weekdays';
            }
            else {
               summary = 'Every ' + recurrenceObj.interval + ' ' + getFrequencyName(recurrenceObj.freq).toLowerCase() + ' on ' + fullnameDays.join(', ');
            }
         }
         else if (days.SU && days.SA && !days.MO && !days.TU && !days.WE && !days.TH && !days.FR) {
            summary = 'Weekends';
         }
         else if (!days.SU && !days.SA && days.MO && days.TU && days.WE && days.TH && days.FR) {
            summary = 'Weekdays';
         }
         else {
            summary = 'Every ' + fullnameDays.join(', ');
         }
      }
      else if (recurrenceObj.interval > 1) {
         summary = 'Every ' + recurrenceObj.interval + ' ' + getFrequencyName(recurrenceObj.freq).toLowerCase() + 's';
      }
      else {
         summary = 'Every ' + getFrequencyName(recurrenceObj.freq).toLowerCase();
      }
   });

   return summary;
}

/**
 * Parse an iCal RRULE, EXRULE, RDATE, or EXDATE string
 * and return a recurrence object
 */
export function parseRecurrenceRule (icalRule) {
   var kind = icalRule.split(':');

   // date lists: RDATE, EXDATE
   if (kind[0] === 'RDATE' || kind[0] === 'EXDATE') {
      var dateStrings = kind[1].split(',');
      // convert to array of datetime integers for easy comparison with underscore
      var dates = dateStrings.map(item => {
         if (item.length === 10) {
            // not standard but easier for me
            return babble.moments.getLocalDate(item).getTime();
         }
         // standard based
         return new Date(item).getTime();
      });
      return {
         kind: kind[0],
         dates,
      };
   }

   // rules: RRULE, EXRULE
   var rule = {
      kind: kind[0],
      freq: null,
      count: 365000, // covers daily for 1000 years to avoid null check
      interval: 1,
      byday: null,
   };

   var props = kind[1].split(';');

   for (var i = 0; i < props.length; i++) {
      // split key from value
      var keyval = props[i].split('=');

      if (keyval[0] === 'BYDAY') {
         rule.byday = [];
         var byday = keyval[1].split(',');
         for (var j = 0; j < byday.length; j++) {
            if (byday[j].length === 2) {
               rule.byday.push({ day: byday[j], digit: 0 });
            }
            else {
               // handle digit
               var day = byday[j].slice(-2);
               var digit = parseInt(byday[j].slice(0, byday[j].length - 2), 10);
               rule.byday.push({ day, digit });
            }
         }
      }
      else if (keyval[0] === 'INTERVAL') {
         rule[keyval[0].toLowerCase()] = parseInt(keyval[1], 10);
      }
      else {
         // freq and the rest of the props
         rule[keyval[0].toLowerCase()] = keyval[1];
      }
   }

   return rule;
}

export function processRecurrence (today, enlist, rule) {
   if (['RDATE', 'EXDATE'].indexOf(rule.kind) > -1) {
      return rule.dates.indexOf(today.getTime()) > -1;
   }

   if (rule.interval === 1 && rule.byday === null && rule.count === 365000) {
      // simple comparison, daily is always true
      switch (rule.freq) {
         case ('DAILY'):
            // DO NOTHING - RETURN TRUE BELOW
            break;
         case ('WEEKLY'):
            if (today.getDay() !== enlist.getDay()) {
               return false;
            }
            break;
         case ('MONTHLY'):
            if (today.getDate() !== enlist.getDate()) {
               return false;
            }
            break;
         case ('YEARLY'):
            if (today.getMonth() !== enlist.getMonth() || today.getDate() !== enlist.getDate()) {
               return false;
            }
            break;
         default:
            throw new Error('Unrecognized frequency');
      }
   }
   else if ((rule.interval > 1 || rule.count < 365000) && rule.byday === null) {
      // we have an interval or a count, so we need to step through each date the rule falls on
      var counter = 1;
      var matched = false;
      switch (rule.freq) {
         case ('DAILY'):
            // daily
            while (enlist.toISOString().split('T')[0] <= today.toISOString().split('T')[0] && counter <= rule.count) {
               // check for match
               if (enlist.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
                  matched = true;
                  break;
               }

               // continue with interval
               enlist.setDate(enlist.getDate() + rule.interval);
               counter++;
            }
            break;
         case ('WEEKLY'):
            // weekly
            while (enlist.toISOString().split('T')[0] <= today.toISOString().split('T')[0] && counter <= rule.count) {
               // check for match
               if (enlist.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
                  matched = true;
                  break;
               }

               // continue with interval
               enlist.setDate(enlist.getDate() + (7 * rule.interval));
               counter++;
            }
            break;
         case ('MONTHLY'):
            // monthly
            while (enlist.toISOString().split('T')[0] <= today.toISOString().split('T')[0] && counter <= rule.count) {
               // check for match
               if (enlist.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
                  matched = true;
                  break;
               }

               // continue with interval
               enlist.setMonth(enlist.getMonth() + rule.interval);
               counter++;
            }
            break;
         case ('YEARLY'):
            // yearly
            while (enlist.toISOString().split('T')[0] <= today.toISOString().split('T')[0] && counter <= rule.count) {
               // check for match
               if (enlist.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
                  matched = true;
                  break;
               }

               // continue with interval
               enlist.setYear(enlist.getYear() + rule.interval);
               counter++;
            }
            break;
         default:
            throw new Error('Unrecognized frequency');
      }

      // we didn"t match the date
      if (matched === false) {
         return false;
      }
   }
   else {
      debugger;
      // complex stepping
      // var thisday = today.ToString("ddd").Substring(0, 2).ToUpper();
      // if (rule.ByDay.Count() == rule.ByDay.Where(a => a.Digit == 0).Count())
      // {
      //     // simple byday
      //     var days = rule.ByDay.Select(a => a.Day);
      //     if (days.Contains(thisday) == false) {
      //         return false;
      //     }
      // } else {
      //     // oh shit, we have some thinking to do
      //     // if yearly, then it would be the nth day of the week of the year
      //     return false;
      // }
   }

   return true;
}
