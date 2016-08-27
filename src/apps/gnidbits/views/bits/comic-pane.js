import React from 'react';
import ComicAnimation from './comic-animation';
import ComicImage from './comic-image';
import ComicCaption from './comic-caption';
import ComicVideo from './comic-video';
import ComicText from './comic-text';
import those from 'those';
import ReactDOM from 'react-dom';

function isElementInViewport (el) {
   var rect = el.getBoundingClientRect();
   return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (global.window.innerHeight || global.document.documentElement.clientHeight) && /* or $(window).height() */
      rect.right <= (global.window.innerWidth || global.document.documentElement.clientWidth) /* or $(window).width() */
   );
}

export default class ComicPane extends React.Component {
   constructor (props) {
      super(props);
      this.handleMediaClick = this.handleMediaClick.bind(this);
      this.handleMediaDone = this.handleMediaDone.bind(this);
      this.handleClearFocusClick = this.handleClearFocusClick.bind(this);
      this.state = {
         focusOn: null,
         mediaIndex: 0,
      };

      this.state = {
         ...this.state,
         ...this.calcMedia(props),
      };
   }

   componentWillReceiveProps (nextProps) {
      if (this.props.children !== nextProps.children) {
         this.setState({
            ...this.calcMedia(nextProps),
            focusOn: null,
            mediaIndex: 0,
         });
      }
   }

   componentDidUpdate () {
      if (this.props.active) {
         // Scroll into view
         var el = ReactDOM.findDOMNode(this);
         if (!isElementInViewport(el)) {
            el.scrollIntoView(true);
         }
      }
   }

   handleMediaClick (kind) {
      // Give attention to this media item, and get others out of the way
      this.setState({
         focusOn: kind,
      });
   }

   handleClearFocusClick () {
      this.setState({
         focusOn: null,
      });
   }

   handleMediaDone () {
      if (this.state.mediaIndex <= this.state.videos.length - 1) {
         this.setState({
            mediaIndex: this.state.mediaIndex + 1,
         });
      }
      else {
         this.setState({
            mediaIndex: 0,
         });
         this.props.onDone();
      }
   }

   calcMedia (props) {
      var images = [];
      var texts = [];
      var videos = [];

      // Inject click handler to manage media focus
      var clones = React.Children.map(props.children, (child, index) => {
         var childProps = {
            key: index,
            uri: props.uri,
            active: props.active,
            onDone: this.handleMediaDone,
         };

         var kind;
         if (child.type === ComicImage) {
            kind = 'image';
         }
         else if (child.type === ComicVideo) {
            kind = 'video';
         }
         else if (child.type === ComicText) {
            kind = 'text';
         }
         childProps.onClick = this.handleMediaClick.bind(null, kind);

         return React.cloneElement(child, childProps);
      });

      // Organize the kinds of media into categories
      React.Children.forEach(clones, child => {
         if (child.type === ComicImage) {
            images.push(child);
         }
         else if (child.type === ComicVideo) {
            videos.push(child);
         }
         else if (child.type === ComicText) {
            texts.push(child);
         }
      });

      if (images.length > 1) {
         images = [<ComicAnimation fps={0.5}>{images}</ComicAnimation>];
      }

      return {
         images,
         videos,
         texts,
      };
   }

   renderPane () {
      var inactiveOverlay;
      if (!this.props.active) {
         inactiveOverlay = <div style={styles.inactive} onClick={this.props.onClick} />;
      }

      return (
         <div style={styles[this.props.mode]}>
            <div style={styles.pane} onClick={this.handlePaneClick}>
               {this.state.images}
               {this.state.videos[this.state.mediaIndex]}
               {this.state.texts}
            </div>
            <ComicCaption>{this.props.caption}</ComicCaption>
            {inactiveOverlay}
         </div>
      );
   }

   render () {
      return this.renderPane();
   }
}

const styles = {
   pane: {
      height: '20rem',
      width: '30rem',
      margin: '0.25rem',
      background: '#ddd',
   },
   pan: {
      position: 'relative',
      display: 'inline',
   },
   feed: {
      position: 'relative',
      display: 'block',
   },
   wrap: {
      position: 'relative',
   },
   inactive: {
      cursor: 'pointer',
      position: 'absolute',
      backgroundColor: 'rgba(0,0,0,0.3)',
      zIndex: 100,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
   },
};
