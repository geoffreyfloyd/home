import React from 'react';
import requestStore from 'stores/request-store';
// import GooeyHost from '../gooeys/GooeyHost';
import { $clrComment, $clrDefault, $clrError } from './style';

class Request extends React.Component {
   /*************************************************************
    * DEFINITIONS
    *************************************************************/
   constructor (props) {
      super(props);
      this.state = this.props.data;
      this.handleRequestClick = this.handleRequestClick.bind(this);
      this.handleResponseClick = this.handleResponseClick.bind(this);
      this.handleRequestHoverChange = this.handleRequestHoverChange.bind(this);
      this.handleStoreUpdate = this.handleStoreUpdate.bind(this);
   }

   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   componentDidMount () {
      requestStore.subscribe(this.handleStoreUpdate, this.props.data.id);
   }
   componentWillUpdate () {
      if (this.refs.responseContainer) {
         var node = this.refs.responseContainer;
         this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
      }
   }
   componentDidUpdate () {
      if (this.shouldScrollBottom) {
         var node = this.refs.responseContainer;
         node.scrollTop = node.scrollHeight;
      }
   }

   /*************************************************************
    * EVENT HANDLING
    *************************************************************/
   handleRequestClick () {
      var data = this.props.data;
      requestStore.repeat(data.id);
   }

   handleResponseClick () {
      var data = this.props.data;
      if (data.response) {
         console.log(data.response.result);
      }
   }

   handleRequestHoverChange (hovering) {
      this.setState({
         requestHovering: hovering,
      });
   }

   handleStoreUpdate () {
      this.setState({
         ts: (new Date()).toISOString(),
      });
   }

   /*************************************************************
   * RENDERING
   *************************************************************/
   renderTextResponse () {
      var data = this.props.data;
      if (!data.response.result) {
         return null;
      }
      var response = data.response.result.split('\r\n').map((line, index) => <div key={index}><span>{line}</span></div>);
      return response;
   }

   renderHtmlResponse () {
      var data = this.props.data;
      if (!data.response.result) {
         return null;
      }
      var html = data.response.result;

      return (<span dangerouslySetInnerHTML={{ __html: html }}></span>);
   }

   renderJsonResponse () {
      var data = this.props.data;
      if (!data.response.result) {
         return null;
      }
      var obj = typeof data.response.result === 'string' ? JSON.parse(data.response.result) : data.response.result;
      // var display = obj.mobileview.sections[0].text;
      // for (var prop in obj.query.pages) {
      //     if (obj.query.pages.hasOwnProperty(prop)) {
      //         display = obj.query.pages[prop].revisions[0]['*'];
      //         break;
      //     }
      // }
      return <span dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}></span>;
   }
   //  renderGooeyResponse () {
   //      var data = this.props.data;
   //      if (!data.response.result) {
   //          return null;
   //      }
   //      return (<GooeyHost gooey={data.response.result} />);
   //  },
   render () {
      var cmd, response;
      var data = this.props.data;

      /**
       * Text style based on status of request
       */
      var statusStyle = styles.waiting;
      var onClick;
      if (data.response && data.response.status === 'OK') {
         // if (data.context && data.context.processId) {
         //    // in a process - still expecting more responses
         //    statusStyle = styles.inprocess;
         // }
         // else {
         statusStyle = styles.ok;
         // }
         onClick = this.handleRequestClick;
      }
      else if (data.response && data.response.status === 'ERR') {
         statusStyle = styles.err;
         onClick = this.handleRequestClick;
      }

      /**
       * Response media
       */
      if (data.response) {
         if (data.response.type === 'text') {
            response = this.renderTextResponse();
         }
         else if (data.response.type === 'json') {
            response = this.renderJsonResponse();
         }
         else if (data.response.type === 'html') {
            response = this.renderHtmlResponse();
         }
         // else if (data.response.type === 'gooey') {
         //     response = this.renderGooeyResponse();
         // }
      }
      response = <div ref="responseContainer" style={styles.response}>{response}</div>;

      cmd = [];
      if (data.cmd) {
         cmd.push(<span ref="cmd" style={statusStyle} onClick={onClick}>{this.state.cmd}</span>);
         cmd.push(<br />);
      }

      return (
         <div title={this.state.date} style={styles.container}>
            {cmd}
            {response}
         </div>
      );
   }
}
Request.propTypes = {
   data: React.PropTypes.object,
};

var styles = {
   container: {
      margin: '5px',
      borderBottom: '3px solid #2e2e2e',
   },
   response: {
      marginLeft: '30px',
      maxHeight: '40rem',
      overflowY: 'auto',
      overflowX: 'hidden',
   },
   inprocess: {
      color: $clrComment,
   },
   waiting: {
      color: $clrComment,
   },
   ok: {
      cursor: 'pointer',
      color: $clrDefault,
   },
   err: {
      cursor: 'pointer',
      color: $clrError,
      textDecoration: 'line-through',
   },
};

export default Request;
