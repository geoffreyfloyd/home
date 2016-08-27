// Be able to link to a specific span of time within a video clip
// 

import React from 'react';
import ReactDOM from 'react-dom';

const parseYouTube = /(https?:\/\/(www.)?youtube.com(\/embed\/)?(\/watch\?v=)?)?([a-zA-Z0-9_\-]+)/;

export default class ComicVideo extends React.Component {

   constructor(props) {
      super(props);
      this.onPlayerStateChange = this.onPlayerStateChange.bind(this);
   }

   componentDidMount() {
      this.hookYouTubePlayer();
   }
   
   componentDidUpdate() {
      this.hookYouTubePlayer();
   }
   
   hookYouTubePlayer() {
      var window = global.window;
      if (this.props.active && window && window.isYouTubeApiLoaded && ('youtube-video-' + this.props.uri) === window.ytTarget.id) {
         window.activeVideoPlayer = new window.YT.Player(window.ytTarget.id, {
            events: {
               'onReady': this.onPlayerReady,
               'onStateChange': this.onPlayerStateChange
            }
         });
      }      
   }

   onPlayerReady() {
      //do whatever you want here. Like, player.playVideo();
      // window.activeVideoPlayer.playVideo();
   }

   onPlayerStateChange(state) {
      console.log(state.data);
      if (state.data === 0) {
         // video stopped
         this.props.onDone();
      }
   }

   renderIframe(src, active) {
      var window = global.window;
      var playerId = 'youtube-video-' + this.props.uri;
      if (this.props.active && window) {
         // if (window.ytTarget && window.ytTarget.id !== playerId && window.activeVideoPlayer) {
         //    window.activeVideoPlayer = window.activeVideoPlayer.destroy();
         // }
         window.ytTarget = {
            id: playerId,
            onPlayerReady: this.onPlayerReady,
            onPlayerStateChange: this.onPlayerStateChange
         };   
      }
      return (
         <iframe
            id={playerId}
            style={styles.video}
            height="100%"
            width="100%"
            src={src} frameborder="0" allowFullScreen>
         </iframe>
      );
   }

   renderHtml5(src, active) {
      if (active) {
         return (
            <video
               style={styles.video}
               height="100%"
               width="100%"
               src={src} controls autoStart autoPlay>
            </video>
         );
      }
      else {
         return (
            <video
               style={styles.video}
               height="100%"
               width="100%"
               src={src}>
            </video>
         );
      }
   }

   render() {
      var options = '';
      var src;
      var videoDom;

      // Check if it's a youtube src
      var matches = this.props.src.match(parseYouTube);
      var hasYouTube = matches.join().indexOf('youtube.com') > -1;
      var videoIdOnly = matches.slice(0, -1).join() === '';

      if (matches && matches.length === 6 && matches[5].length > 0 && (hasYouTube || videoIdOnly)) {
         if (this.props.start) {
            options += '&start=' + this.props.start;
         }
         if (this.props.end) {
            options += '&end=' + this.props.end;
         }
         src = 'https://www.youtube.com/embed/' +
            matches[5] +
            '?enablejsapi=1&autoplay=' + (this.props.active ? '1' : '0') +
            options;
         videoDom = this.renderIframe(src);
      }
      else {
         // Just set the explicit src
         src = this.props.src;
         videoDom = this.renderHtml5(src, this.props.active);
      }
      // var loop = '&loop=1&playlist=' + this.props.youtubeVideoId;
      return (
         <div style={styles.container} onClick={this.props.onClick}>
            {videoDom}
         </div>
      );
   }
}

const styles = {
   container: {
      background: 'white',
      height: '100%',
      width: '100%',
      textAlign: 'center',
   },
   video: {
      display: 'block',
      verticalAlign: 'middle',
      marginLeft: 'auto',
      marginRight: 'auto',
      maxHeight: '100%',
      maxWidth: '100%',

   },
};

  // https://github.com/pedronauck/react-video/blob/master/lib/react-video.jsx
//   getIframeUrl() {
//     if (this.isYoutube()) {
//       return `//youtube.com/embed/${this.props.videoId}?autoplay=1`
//     }
//     else if (this.isVimeo()) {
//       return `//player.vimeo.com/video/${this.props.videoId}?autoplay=1`
//     }
//   }

//   fetchYoutubeData() {
//     var id = this.props.videoId;
//     var that = this;

//     ajax.get({
//       url: `//gdata.youtube.com/feeds/api/videos/${id}?v=2&alt=json`,
//       onSuccess(err, res) {
//         var gallery = res.entry['media$group']['media$thumbnail'];
//         var thumb = gallery.sort((a, b) => b.width - a.width)[0].url;

//         that.setState({
//           thumb: thumb,
//           imageLoaded: true
//         })
//       },
//       onError: that.props.onError
//     });
//   }

//   fetchVimeoData() {
//     var id = this.props.videoId;
//     var that = this;

//     ajax.get({
//       url: `//vimeo.com/api/v2/video/${id}.json`,
//       onSuccess(err, res) {
//         that.setState({
//           thumb: res[0].thumbnail_large,
//           imageLoaded: true
//         });
//       },
//       onError: that.props.onError
//     });
//   }