import React from 'react';
import LayoutMixin from './LayoutMixin';

var Layout = React.createClass({
   /*************************************************************
    * DEFINITIONS
    *************************************************************/
   mixins: [LayoutMixin],

   /*************************************************************
    * RENDER
    *************************************************************/
   render () {
      return this.renderLayout();
   },
});

export default Layout;
