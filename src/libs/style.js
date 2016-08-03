import browser from 'libs/browser';
import CSS from 'libs/css-supports';

console.log(browser);
var abbr = browser.slice(0, 2).toLowerCase();

export const $baseImgUrl = 'https://www.alsoenergy.com/pub/images/';

// Company colors
export const $alsoBlue = 'rgba(46, 109, 164, 0.75)';
export const $alsoOrange = 'hsl(32, 90%, 53%)';

export const $click = {
   cursor: 'pointer',
};

export const $grab = (() => {
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
})();

export const $grabbing = (() => {
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
})();

export const $hide = {
   display: 'none',
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
   marginTop: '0.75rem',
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

export const $flex = (() => {
   var FLEX = ['flex', '-webkit-flex;', '-ms-flexbox', '-moz-box', '-webkit-box'];
   for (var i = 0; i < FLEX.length; i++) {
      if (CSS.supports('display', FLEX[i])) {
         return FLEX[i];
      }
   }
})();

export const $flexWrap = {
   display: $flex,
   flexWrap: 'wrap',
};

export const $centerFlex = (() => {
   var s = {
      textAlign: 'center',
      alignItems: 'center',
      justifyContent: 'center',
   };
   switch (abbr) {
      case ('fi'):
         break;
      case ('ie'):
         s.msFlexAlign = 'center';
         break;
      default:
         s.WebkitAlignItems = 'center';
         break;
   }
   return s;
})();

export const $leftFlex = (() => {
   var s = {
      textAlign: 'left',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
   };
   switch (abbr) {
      case ('fi'):
         break;
      case ('ie'):
         s.msFlexAlign = 'flex-start';
         break;
      default:
         s.WebkitAlignItems = 'flex-start';
         break;
   }
   return s;
})();

export const $rightFlex = (() => {
   var s = {
      textAlign: 'right',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
   };
   switch (abbr) {
      case ('fi'):
         break;
      case ('ie'):
         s.msFlexAlign = 'flex-end';
         break;
      default:
         s.WebkitAlignItems = 'flex-end';
         break;
   }
   return s;
})();

export function flex (direction, wrap, options) {
   // Declare with defaults
   var flexFlow = (direction || 'row') + ' ' + (wrap || 'wrap');
   var { alignContent, alignItems, justifyContent } = (options || {});

   var s = {
      display: $flex,
      flexFlow: flexFlow,
   };

   switch (abbr) {
      case ('fi'):
         s.MozFlexFlow = flexFlow;
         break;
      case ('ie'):
         s.msFlexFlow = flexFlow;
         break;
      default:
         s.WebkitFlexFlow = flexFlow;
         break;
   }

   if (alignContent) {
      s.alignContent = alignContent;
      switch (abbr) {
         case ('fi'):
            s.MozAlignContent = alignContent;
            break;
         case ('ie'):
            s.msAlignContent = alignContent;
            break;
         default:
            s.WebkitAlignContent = alignContent;
            break;
      }
   }

   if (alignItems) {
      s.alignItems = alignItems;
      switch (abbr) {
         case ('fi'):
            s.MozAlignItems = alignItems;
            break;
         case ('ie'):
            s.msAlignItems = alignItems;
            break;
         default:
            s.WebkitAlignItems = alignItems;
            break;
      }
   }

   if (justifyContent) {
      s.justifyContent = justifyContent;
      switch (abbr) {
         case ('fi'):
            s.MozJustifyContent = justifyContent;
            break;
         case ('ie'):
            s.msJustifyContent = justifyContent;
            break;
         default:
            s.WebkitJustifyContent = justifyContent;
            break;
      }
   }
   return s;
}

export function flexItem (style) {
   style.display = $flex; // Will not resize properly without this
   if (style.flex) {
      var args = style.flex.split(' ');
      switch (abbr) {
         case ('fi'):
            style.MozFlex = style.flex;
            style.MozFlexGrow = args[0];
            style.MozFlexShrink = args[1] || '1';
            style.MozFlexBasis = args[2] || '0%';
            break;
         case ('ie'):
            style.msFlex = style.flex;
            break;
         default:
            style.WebkitFlex = style.flex;
            style.WebkitFlexGrow = args[0];
            style.WebkitFlexShrink = args[1] || '1';
            style.WebkitFlexBasis = args[2] || '0%';
            break;
      }
   }
   if (style.height) {
      style.minHeight = style.height;
   }
   if (style.width) {
      style.minWidth = style.width;
   }
   return style;
}

// LAYOUT CONSTANTS
export const $relativeFlex = {
   ...flexItem({ flex: '1' }),
   position: 'relative',
};
export const $absoluteFill = {
   position: 'absolute',
   top: '0',
   right: '0',
   bottom: '0',
   left: '0',
   height: 'auto',
   width: 'auto',
};

export function $transform (value) {
   var s = {
      transform: value,
   };
   switch (abbr) {
      case ('ie'):
         s.msTransform = value;
         break;
      case ('fi'):
         break;
      default:
         s.WebkitTransform = value;
   }
   return s;
}
