// Browser RegEx detection
export default (function () {
    if (global.navigator) {
        var tem;
        var userAgent = global.navigator.userAgent;
        var match = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(match[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(userAgent) || [];
            return 'IE ' + (tem[1] || '');
        }
        if (match[1] === 'Chrome') {
            tem = userAgent.match(/\bOPR\/(\d+)/);
            if (tem !== null) {
                return 'Opera ' + tem[1];
            }
        }
        match = match[2] ? [match[1], match[2]] : [navigator.appName, global.navigator.appVersion, '-?'];
        if ((tem = userAgent.match(/version\/(\d+)/i)) !== null) {
            match.splice(1, 1, tem[1]);
        }
        return match.join(' ');   
    }
    else {
        return 'Server Renderer';
    }
}());
