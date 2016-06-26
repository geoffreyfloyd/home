import browser from './browser';

console.log(browser);
var abbr = browser.slice(0, 2).toLowerCase();

export const $grab = (function () {
    var s = {};
    switch (abbr) {
        case ('ch'):
            s.cursor = '-webkit-grab';
            break;
        case ('fi'):
            s.cursor = '-moz-grab';
            break;    
        case ('ie'):
            s.cursor = 'url(/content/images/openhand.cur), move';
            break;
        default:
            s.cursor = 'move';
            break;
    }
    return s;
}());

export const $grabbing = (function () {
    var s = {};
    switch (abbr) {
        case ('ch'):
            s.cursor = '-webkit-grabbing';
            break;
        case ('fi'):
            s.cursor = '-moz-grabbing';
            break;  
        case ('ie'):
            s.cursor = 'url(/content/images/closedhand.cur), move';
            break;
        default:
            s.cursor = 'move';
            break;
    }
    return s;
}());

export const $hide = {
    display: 'none'
};

export function $control (hasChanged, hasErrors) {
    var borderColor = hasErrors ? '#c00' : (hasChanged ? '#cc0' : '#ccc');
    return {
        display: 'block',
        width: '100%',
        height: '34px',
        padding: '6px 12px',
        fontSize: '14px',
        lineHeight: '1.42857143',
        color: '#555',
        backgroundColor: '#fff',
        backgroundImage: 'none',
        border: '1px solid',
        borderColor: borderColor,
        borderRadius: '4px',
        WebkitBoxShadow: 'inset 0 1px 1px rgba(0,0,0,.075)',
        boxShadow: 'inset 0 1px 1px rgba(0,0,0,.075)',
        WebkitTransition: 'border-color ease-in-out .15s, -webkit-box-shadow ease-in-out .15s',
        OTransition: 'border-color ease-in-out .15s, box-shadow ease-in-out .15s',
        transition: 'border-color ease-in-out .15s, box-shadow ease-in-out .15s',
    };
}

export function $focus (hasChanged, hasErrors) {
    var borderColor = hasErrors ? '#c00' : (hasChanged ? '#cc0' : '#66afe9');
    var shadowColor = hasErrors ? '175,0,0' : (hasChanged ? '175,175,0' : '102,175,233');
    return {
        borderColor: borderColor,
        outline: '0',
        WebkitBoxShadow: `inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(${shadowColor}, .6)`,
        boxShadow: `inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(${shadowColor}, .6)`,
    };
}

export const $layoutMargin = {
    marginLeft: '0.75rem',
    marginTop: '0.75rem'
};

export function $section (width) {
    return {
        padding: '0.75rem',
        borderRadius: '0.5rem',
        border: '2px solid #eee',
        marginBottom: '1rem',
        marginRight: '1rem',
        width: width || '40rem',
    };
}

export const $flexWrap = {
    display: 'flex',
    flexWrap: 'wrap',
};
