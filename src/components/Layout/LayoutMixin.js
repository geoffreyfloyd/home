import React from 'react';
import ReactDOM from 'react-dom';
import reactUtil from 'libs/react-util';
import { flex } from 'libs/style';
import core from './core';

// many thanks to https://github.com/jsdf/react-layout for base of layout logic

var LayoutMixin = {
   /*************************************************************
    * DEFINITIONS
    *************************************************************/
   propTypes: {
      layoutContext: React.PropTypes.object,
   },
   statics: {
      isReactDomLayout: true,
   },

   getDefaultProps () {
      return {
         component: React.DOM.div,
         layoutHeight: null,
         layoutWidth: null,
      };
   },

   componentDidMount () {
      this.checkScrollbar();
   },

   componentDidUpdate () {
      this.checkScrollbar();
   },

   checkScrollbar () {
      var rerender = false;
      var thisElement = ReactDOM.findDOMNode(this);
      var overflow = (this.props.layoutOptions && this.props.layoutOptions.overflow) || 'hidden';
      var scrollHeight = ['*', 'x'].indexOf(overflow) > -1 ? (thisElement.offsetHeight - thisElement.clientHeight) : 0;
      var scrollWidth = ['*', 'y'].indexOf(overflow) > -1 ? (thisElement.offsetWidth - thisElement.clientWidth) : 0;
      var prevHeight = this.scrollHeight || 0;
      var prevWidth = this.scrollWidth || 0;
      if (prevHeight !== scrollHeight || prevWidth !== scrollWidth) {
         rerender = true;
      }
      this.scrollHeight = scrollHeight;
      this.scrollWidth = scrollWidth;

      if (rerender) {
         this.setState({
            ts: (new Date()).toISOString(),
         });
      }
   },

   /*************************************************************
    * RENDERING HELPERS
    *************************************************************/
   getLayoutContext () {
      var layoutContext = {};

      if (this.getRootLayoutContext) {
         layoutContext = this.getRootLayoutContext();
         layoutContext = Object.assign({ fontSize: core.getFontSizeBase(), visible: true }, layoutContext);
         // register root
         core.setRootLayoutContext(this.getRootLayoutContext);
      }
      else {
         var inherited;
         inherited = this.props.layoutContext;
         if (inherited) {
            layoutContext = Object.assign({}, inherited);
         }
         else {
            layoutContext = {
               width: core.isNumber(this.props.layoutWidth) ? this.props.layoutWidth : undefined,
               height: core.isNumber(this.props.layoutHeight) ? this.props.layoutHeight : undefined,
               fontSize: core.isNumber(this.props.layoutFontSize) ? this.props.layoutFontSize : undefined,
               visible: this.props.layoutVisible || true,
            };
         }
      }

      if (this.props.style) {
         var sizeModifiers = core.getSizeModifiers(reactUtil.reduceStyle(this.props.style), core.OUTER_MODIFIERS, layoutContext);
         core.DIMENSIONS.forEach(function (dim) {
            if (layoutContext[dim]) {
               layoutContext[dim] -= sizeModifiers[dim];
            }
         });
      }

      return layoutContext;
   },

   getParentLayout (subtract) {
      var layoutContext = Object.assign({}, this.getLayoutContext());

      if (subtract) {
         core.DIMENSIONS.forEach(function (dim) {
            if (layoutContext[dim] && subtract[dim]) {
               layoutContext[dim] -= subtract[dim];
            }
         });
      }

      var overflow = (this.props.layoutOptions && this.props.layoutOptions.overflow) || 'hidden';
      if (['*', 'y'].indexOf(overflow) > -1) {
         if (layoutContext.width && this.scrollWidth) {
            layoutContext.width -= this.scrollWidth;
         }
      }

      if (['*', 'x'].indexOf(overflow) > -1) {
         if (layoutContext.height && this.scrollHeight) {
            layoutContext.height -= this.scrollHeight;
         }
      }

      if (this.props.style) {
         var sizeModifiers = core.getSizeModifiers(reactUtil.reduceStyle(this.props.style), core.INNER_MODIFIERS, layoutContext);
         core.DIMENSIONS.forEach(function (dim) {
            if (layoutContext[dim]) {
               layoutContext[dim] -= sizeModifiers[dim];
            }
         });
      }

      return layoutContext;
   },

   /**
    * Return calculated style for component
    */
   getLocalLayout (subtract) {
      var layoutContext, local;

      local = {};
      layoutContext = this.getLayoutContext();

      if (layoutContext) {
         local.visible = layoutContext.visible;
         local.fontSize = layoutContext.fontSize;
         core.DIMENSIONS.forEach(function (dim) {
            if (layoutContext[dim]) {
               local[dim] = layoutContext[dim];
            }
         });
      }

      if (subtract) {
         core.DIMENSIONS.forEach(function (dim) {
            if (subtract[dim] && local[dim]) {
               local[dim] -= subtract[dim];
            }
         });
      }

      var breakpointLayout = core.getBreakpointLayout(this, { self: local });

      if (breakpointLayout.style) {
         Object.assign(local, breakpointLayout.style);
      }

      if (local.visible === false) {
         return {
            display: 'none',
         };
      }

      return local;
   },

   measureLayoutForChildren (children, subtract) {
      var parentLayout, layout;
      parentLayout = this.getParentLayout(subtract);

      // Build the container style that determines how the children are arranged
      var containerStyle = {};
      var options = core.getLayoutOptions(this, parentLayout);

      // If flex is enabled, get the style props for flex
      if (options.flex) {
         containerStyle = flex(options.flexDirection, options.flexWrap, { alignContent: options.flexAlignContent, alignItem: options.flexAlignItem, justifyContent: options.flexJustifyContent });
      }

      // Set the overflow behavior
      if (options.overflow === 'y') {
         containerStyle.overflowX = 'hidden';
         containerStyle.overflowY = 'auto';
      }
      else if (options.overflow === 'x') {
         containerStyle.overflowX = 'auto';
         containerStyle.overflowY = 'hidden';
      }
      else if (options.overflow === '*') {
         containerStyle.overflowX = 'auto';
         containerStyle.overflowY = 'auto';
      }
      else {
         containerStyle.overflowX = 'hidden';
         containerStyle.overflowY = 'hidden';
      }

      // wrap
      var newWrap = function (available) {
         return {
            available: available,
            elements: [],
         };
      };

      layout = core.DIMENSIONS.reduce(function (lay, dim) {
         lay[dim] = {
            wraps: [newWrap(parentLayout[dim])],
         };
         return lay;
      }, {});

      // additional styles from breakpoint
      layout.styles = [];

      // Measure
      reactUtil.reactForEach(children, function (child) {
         var childLayout;

         if (child) {
            childLayout = getChildLayout(child, parentLayout);

            if (childLayout) {
               // Exclude child from layout
               if (childLayout.visible !== undefined && childLayout.visible === false) {
                  layout.styles.push({ visible: false });
                  return;
               }

               // add style that may have been applied from breakpoint
               layout.styles.push(childLayout.style || {});
            }
            else {
               // add an empty style
               layout.styles.push({});
            }
         }

         core.DIMENSIONS.forEach(function (dim) {
            // get currect wrap
            var wrap = layout[dim].wraps[layout[dim].wraps.length - 1];

            var arg;
            var calculate = true;
            var fontSize = childLayout && childLayout.fontSize ? core.convertToPixels(childLayout.fontSize, parentLayout, dim) : parentLayout.fontSize;
            var min = 1;

            if (!child || !childLayout || childLayout[dim] === undefined || childLayout[dim] === 'omit') {
               arg = childLayout ? childLayout[dim] : undefined;
               min = 0;
               calculate = false;
            }
            else if (core.layoutIsFixed(childLayout[dim], parentLayout, dim)) {
               // fixed is min
               arg = childLayout[dim];
               min = core.convertToPixels(childLayout[dim], parentLayout, dim);
               calculate = false;
            }
            else if (core.layoutIsFlex(childLayout[dim])) {
               // check for flex min
               arg = childLayout[dim];
               var flexParams = childLayout[dim].split(':');
               if (flexParams.length > 1 && flexParams[1] !== '') {
                  min = core.convertToPixels(flexParams[1], parentLayout, dim);
               }
            }
            else {
               // inherit and all else  if (childLayout[dim] === 'inherit')
               arg = childLayout[dim];
               min = parentLayout[dim] || 0;
               calculate = false;
            }

            // if we don't have enough space and at least one
            // element has been layed out in this wrap, then
            // it's time for a new wrap
            if (wrap.elements.length > 0 && wrap.available < min) {
               wrap = newWrap(parentLayout[dim]);
               layout[dim].wraps.push(wrap);
            }

            // add element to the wrap
            wrap.available -= min;
            wrap.elements.push({
               arg: arg,
               calculate: calculate,
               fontSize: fontSize,
               measure: min,
            });
         });
      });

      var uncalculated = function (item) {
         return item.calculate;
      };

      // second pass
      core.DIMENSIONS.forEach(function (dim) {
         layout[dim].wraps.forEach(function (wrap) {
            var uncalculatedElements = wrap.elements.filter(uncalculated);
            var countOfUncalculatedElements = uncalculatedElements.length;
            if (countOfUncalculatedElements > 0) {
               // distribute (first pass)
               var evenDistrib = wrap.available / countOfUncalculatedElements;
               uncalculatedElements.forEach(function (element) {
                  var flexArgs = element.arg.split(':');
                  if (flexArgs.length > 2 && flexArgs[2] !== '') {
                     var max = core.convertToPixels(flexArgs[2], parentLayout, dim);
                     if (max < evenDistrib + element.measure) {
                        var maxAvail = max - element.measure;
                        element.measure += maxAvail;
                        wrap.available -= maxAvail;
                        element.calculate = false;
                     }
                     else {
                        element.measure += evenDistrib;
                        wrap.available -= evenDistrib;
                     }
                  }
                  else if (evenDistrib <= 0) {
                     wrap.available -= evenDistrib;
                     element.calculate = false;
                  }
                  else {
                     element.measure += evenDistrib;
                     wrap.available -= evenDistrib;
                  }
               });

               // assign the rest of available space to items that can still flex
               uncalculatedElements = wrap.elements.filter(uncalculated);
               countOfUncalculatedElements = uncalculatedElements.length;

               if (countOfUncalculatedElements > 0 && wrap.available > 0.0) {
                  evenDistrib = wrap.available / countOfUncalculatedElements;
                  uncalculatedElements.forEach(function (element) {
                     element.measure += evenDistrib;
                     wrap.available -= evenDistrib;
                     element.calculate = false;
                  });
               }
            }
         });
      });

      return {
         parentLayout: parentLayout,
         layout: layout,
         containerStyle: containerStyle,
      };
   },

   applyLayoutToChildren (children, measure) {
      var childIndex = 0;
      var processChild = function (child) {
         var layout, prop;

         // to detect a child should not be laid out, we are currently
         // setting style.visible: false. Sort of a hacky approach
         if (measure.layout.styles[childIndex] !== undefined &&
            measure.layout.styles[childIndex].visible !== undefined &&
            measure.layout.styles[childIndex].visible === false) {
            childIndex++;
            if (core.isLayout(child)) {
               return React.cloneElement(child, {
                  key: child.props.key || childIndex,
                  layoutContext: Object.assign(child.props.layoutContext || {}, {
                     visible: false,
                  }),
               });
            }
            else {
               return React.cloneElement(child, {
                  key: child.props.key || childIndex,
                  style: Object.assign(((child.props ? child.props.style : undefined) || {}), { display: 'none' }),
               });
            }
         }

         // child is simply a string (which will later be converted to a span)
         if (!(child !== undefined && child !== null ? child.props : undefined)) {
            childIndex++;
            return child;
         }

         layout = Object.assign({}, measure.parentLayout);

         var hasLayout = false;
         core.DIMENSIONS.forEach(function (dim) {
            var wrap = getWrap(childIndex, measure.layout[dim].wraps);
            if (wrap) {
               if (wrap.elements[wrap.currentIndex].arg !== undefined) {
                  hasLayout = true;
                  // Apply dimension
                  if (core.layoutIsOmitted(wrap.elements[wrap.currentIndex].arg)) {
                     delete layout[dim];
                  }
                  else {
                     layout[dim] = wrap.elements[wrap.currentIndex].measure;
                  }
               }

               // Apply fontSizeBase
               if (wrap.elements[wrap.currentIndex].fontSize) {
                  layout.fontSize = wrap.elements[wrap.currentIndex].fontSize;
               }
            }
         });

         if (core.isLayout(child)) {
            // if it is a react layout then
            // pass a layout context and
            // allow it to set its own style props
            childIndex++;
            return React.cloneElement(child, {
               key: child.props.key || childIndex,
               layoutContext: layout,
            });
         }
         else {
            // if it didn't have a layout at all
            // then only pass the context so that
            // it can be passed on, however, do
            // not set any styles
            if (!hasLayout) {
               childIndex++;

               // strip off unused props
               for (prop in layout) {
                  if (layout.hasOwnProperty(prop) && !layout[prop]) {
                     delete layout[prop];
                  }
               }

               return React.cloneElement(child, {
                  key: child.props.key || childIndex,
                  layoutContext: layout,
               });
            }

            var layoutStyle = Object.assign({}, layout);
            var breakpointStyle = measure.layout.styles[childIndex];

            // resolve style
            // we don't want min and max dims in our style
            var style = Object.assign({}, reactUtil.reduceStyle(child.props.style), layoutStyle, breakpointStyle);
            var removeProps = ['minWidth', 'maxWidth', 'minHeight', 'maxHeight'];
            removeProps.forEach(function (p) {
               if (style[p]) {
                  delete style[p];
               }
            });

            // non-layout components need to account for margin
            // because it won't get it's own render pass to call
            // getLayoutContext, which accounts for margin
            var sizeModifiers = core.getSizeModifiers(style, core.OUTER_MODIFIERS, measure.parentLayout);
            core.DIMENSIONS.forEach(function (dim) {
               if (style[dim]) {
                  style[dim] -= sizeModifiers[dim];
               }
            });

            // if it only has layoutWidth or layoutHeight props
            // but is not a true layout component, then set the
            // style
            childIndex++;
            return React.cloneElement(child, {
               key: child.props.key || childIndex,
               layoutContext: layout,
               style: style,
            });
         }
      };

      /**
       * Do not call React.Children.map if it is an array:
       * It seems that every time an array changed to their
       * special type of children object the keys get doubled
       * up. Besides this, it is faster to iterate the array.
       */
      return reactUtil.reactMap(children, processChild);
   },

   /*************************************************************
    * RENDERING
    *************************************************************/
   renderLayout (component) {
      /* eslint-disable no-param-reassign */
      if (component === undefined || component === null) {
         component = this.props.component;
      }
      /* eslint-enable no-param-reassign */

      var style = Object.assign({}, reactUtil.reduceStyle(this.props.style));
      var extraProps = {};
      var children;

      var localStyle = this.getLocalLayout();

      if (localStyle.display === undefined || localStyle.display !== 'none') {
         var measure = this.measureLayoutForChildren(this.props.children);
         // if (measure.needsScrollbar) {
         //     measure = this.measureLayoutForChildren(this.props.children, { width: core.SCROLLBAR_WIDTH });
         // }

         extraProps.style = Object.assign(style, measure.containerStyle, localStyle);
         children = this.applyLayoutToChildren(this.props.children, measure);
      }
      else {
         extraProps.style = Object.assign({}, (this.props.style || {}), localStyle);
      }

      return component(Object.assign({}, this.props, extraProps), children);
   },
};

/*************************************************************
 * INTERNAL METHODS
 *************************************************************/
function getWrap (index, wraps) {
   var wrap;
   var wrapsIndex = 0;
   while (!wrap && wrapsIndex < wraps.length) {
      if (wraps[wrapsIndex].elements.length < index + 1) {
         /* eslint-disable no-param-reassign */
         index -= wraps[wrapsIndex].elements.length;
         /* eslint-enable no-param-reassign */

         // move on to the next wrap
         wrapsIndex++;
      }
      else {
         // add true childindex to wrap object
         wrap = wraps[wrapsIndex];
         wrap.currentIndex = index;
      }
   }
   return wrap;
}

function getChildLayout (component, context) {
   var defaultSetting, definition, prop;

   // React Element is just a string
   if (!component.props) {
      return;
   }

   if (core.isLayout(component)) {
      defaultSetting = 'inherit';
      definition = {
         height: component.props.layoutHeight,
         width: component.props.layoutWidth,
         fontSize: component.props.layoutFontSize,
         visible: component.props.layoutVisible,
      };
   }
   else {
      defaultSetting = 'omit';
      definition = {
         height: component.props.layoutHeight,
         width: component.props.layoutWidth,
         fontSize: component.props.layoutFontSize,
         visible: component.props.layoutVisible,
      };

      // strip off unused props
      for (prop in definition) {
         if (definition.hasOwnProperty(prop) && definition[prop] === null) {
            definition[prop] = defaultSetting;
         }
         else if (definition.hasOwnProperty(prop) && definition[prop] === undefined) {
            delete definition[prop];
         }
      }

      if (definition.fontSize && definition.fontSize === 'omit') {
         definition.fontSize = core.getFontSizeBase();
      }

      if (definition.width || definition.height) {
         if (!definition.width) {
            definition.width = 'omit';
         }
         else if (!definition.height) {
            definition.height = 'omit';
         }
         definition = Object.assign({}, getChildLayoutFromStyle(component), definition);
      }
      else {
         return getChildLayoutFromStyle(component);
      }
   }

   if (definition.height === null) {
      definition.height = defaultSetting;
   }
   if (definition.width === null) {
      definition.width = defaultSetting;
   }

   /**
    * Apply breakpoint to definition
    */
   Object.assign(definition, core.getBreakpointLayout(component, { parent: context }));

   return definition;
}

function getChildLayoutFromStyle (component) {
   if (component.props && component.props.style) {
      var style = reactUtil.reduceStyle(component.props.style);
      var definition = {};
      if (style.width) {
         definition.width = style.width;
      }
      else if (style.minWidth || style.maxWidth) {
         definition.width = 'flex:' + (style.minWidth || '') + ':' + (style.maxWidth || '');
      }
      if (style.height) {
         definition.height = style.height;
      }
      else if (style.minHeight || style.maxHeight) {
         definition.height = 'flex:' + (style.minHeight || '') + ':' + (style.maxHeight || '');
      }

      if (style.fontSize) {
         definition.fontSize = style.fontSize;
      }

      if (definition.height || definition.width) {
         return definition;
      }
   }
}

export default LayoutMixin;
