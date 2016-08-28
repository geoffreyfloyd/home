// PACKAGES
import React from 'react';
// STORES
import host from 'stores/host';
// COMPONENTS
import Toaster from 'components/Toaster';
import WindowStack from 'components/WindowStack';

export default class AppBase extends React.Component {
   constructor (props) {
      super(props);

      host.providers.closeWindow = this.provideHostCloseWindow.bind(this);
      host.providers.newWindow = this.provideHostNewWindow.bind(this);
      host.providers.notify = this.provideHostNotify.bind(this);
   }

   provideHostCloseWindow () {
      this.refs.windowStack.closeWindow();
   }

   provideHostNewWindow (content) {
      this.refs.windowStack.newWindow(content);
   }

   provideHostNotify (content) {
      // Display message to the user
      this.refs.toaster.notify(content);
   }

   render () {
      return (
         <div>
            {this.props.children}
            <WindowStack ref="windowStack" />
            <Toaster ref="toaster" />
         </div>
      );
   }
}
