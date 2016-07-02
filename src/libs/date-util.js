/**
 * Handle inconsistent browser parsing of the following string format from newtonsoft.jsonFormatter of non-UTC dates '2015-11-20T20:05:57'
 * A bug in Chrome OS treats '2015-11-20T20:05:57' as 1PM local, while Chrome on Windows treats '2015-11-20T20:05:57' as 8PM local.
 * This is a bug in the implementation of support for ISO 8601 (https://en.wikipedia.org/wiki/ISO_8601). The standard states that the
 * formatting should be treated as a local date when there is no 'Z' or '+00:00' after the time.
 * Pulling the integer based format (year, month, day, hour, minute, second) from the string, it consistently creates a local time.
 * Testing in other browsers, IE (11.0) and FireFox (42.0) and Chrome (46.0) parses dates as expected.
 */
export function parseISO8601String (val) {

    // Return null if it isn't a String
    if (typeof val !== 'string' || val === '') {
        return null;
    }

    var tzPattern = /([+-]\d\d):(\d\d)/g;
    if (val.slice(val.length - 1) === 'Z' || tzPattern.test(val.slice(val.length - 6))) {
        return new Date(Date.parse(val));
    }
    else {
        var date = [0, 0, 0, 0, 0, 0];
        var isoBasePattern = /(\d+)[^\d]/gi;

        var match, i;
        i = 0;

        while ((match = isoBasePattern.exec(val)) !== null && i < 6) {
            date[i] = parseInt(match[1], 10);
            i++;
        }
        if (date[0] > 1900 && date[1] > 0 && date[2] > 0) {
            date = new Date(date[0], (date[1] - 1), date[2], date[3], date[4], date[5]);

            /**
             * new Date(ISO8601) works for all browsers tested so far when it has a Z or +00:00 format
             * however, if we find browsers that do not parse it consistently, then the following
             * commented code can start as an unfinished base for properly getting the correct date
             * from all possible variations of an ISO8601 string
             *
             * if (val.slice(val.length - 1) === 'Z') {
             *    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
             * }
             * else if (tzPattern.test(val.slice(val.length - 6))) {
             *    var match = tzPattern.exec(val.slice(val.length - 6));
             *    var symbol = match[1].slice(0, 1);
             *    if (match[1].slice(0,1))
             *    var minutes = (parseInt(match[1], 10) * 60) + parseInt(symbol + match[2], 10);
             *    if (date.getTimezoneOffset() > minutes) {
             *        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
             *    }
             *    date.setHours(date.getHours() + parseInt(match[1], 10));
             *    if (match[2] !== '' && parseInt(match[2], 10) > 0) {
             *        date.setMinutes(date.getHours() + parseInt(match[1], 10));
             *    }
             * }
             */

            return date;
        }
        else {
            return new Date(val);
        }
    }
}

export function getLocalDateString (date) {
    var dt = date || new Date();

    return dt.getFullYear() 
        + '-' + pad(dt.getMonth() + 1)
        + '-' + pad(dt.getDate());
}

export function getLocalISOString (date) {
    var dt = date || new Date();
    var tzo = -dt.getTimezoneOffset();
    var dif = tzo >= 0 ? '+' : '-';
    
    return dt.getFullYear() 
        + '-' + pad(dt.getMonth() + 1)
        + '-' + pad(dt.getDate())
        + 'T' + pad(dt.getHours())
        + ':' + pad(dt.getMinutes()) 
        + ':' + pad(dt.getSeconds()) 
        + dif + pad(tzo / 60) 
        + ':' + pad(tzo % 60);
}

export function today () {
    var dt = new Date();
    dt.setHours(0, 0, 0, 0);
    return dt;
}

export function isSameDay (d1, d2) {
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getYear() === d2.getYear();
}

export function isThisMonth (d) {
    var now = new Date();
    if (d.getMonth() !== now.getMonth() || d.getYear() !== now.getYear()) {
        return false;
    }
    else {
        return true;
    }
}

export function isToday (d) {
    var now = new Date();
    if (d.getDate() !== now.getDate() || d.getMonth() !== now.getMonth() || d.getYear() !== now.getYear()) {
        return false;
    }
    else {
        return true;
    }
}

function pad (num) {
    var norm = Math.abs(Math.floor(num));
    return (norm < 10 ? '0' : '') + norm;
}
