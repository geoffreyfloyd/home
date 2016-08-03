// Browser RegEx detection
/* globals navigator */
export default (function () {
    var tem;
    var userAgent = navigator.userAgent;
    var match = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(match[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(userAgent) || [];
        return 'IE ' + (tem[1] || '');
    }
    if (match[1] === 'Chrome') {
        tem = userAgent.match(/\b(Edge|OPR)\/(\d+)/);
        if (tem !== null) {
            return ((tem[1] === 'OPR' ? 'Opera ' : (tem[1] + ' ')) + tem[2]);
        }
    }
    match = match[2] ? [match[1], match[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = userAgent.match(/version\/(\d+)/i)) !== null) {
        match.splice(1, 1, tem[1]);
    }
    return match.join(' ');
}());
