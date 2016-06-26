import React from 'react';
import ReactDOM from 'react-dom';
var promptCallback = null;

class Message extends React.Component {
   static show (msg) {
      var element = document.getElementById('msg-box');
      if (element) {
         document.body.removeChild(element);
      }

      var div = document.createElement('div');
      div.setAttribute('id', 'msg-box');
      document.body.appendChild(div);
      ReactDOM.render(React.createElement(Message, { msg: msg, kind: 'show' }), div);
   }

   static prompt (msg, callback) {
      var element = document.getElementById('msg-box');
      if (element) {
         document.body.removeChild(element);
      }
      promptCallback = callback;
      var div = document.createElement('div');
      div.setAttribute('id', 'msg-box');
      document.body.appendChild(div);
      ReactDOM.render(React.createElement(Message, { msg: msg, kind: 'prompt' }), div);
   }

   static notify (msg) {
      Message.show(msg);
      setTimeout(this.handleClick, 5000);
   }

   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   constructor (props) {
      super(props);
      this.handleClick = this.handleClick.bind(this);
      this.handleKeyPress = this.handleKeyPress.bind(this);
   }

   componentDidMount () {
      this.cmdPrompt.focus();
   }

   /*************************************************************
    * EVENT HANDLING
    *************************************************************/
   handleClick () {
      // If this is a prompt, do callback
      if (this.props.kind === 'prompt' && promptCallback) {
         var input = this.cmdPrompt.value;
         promptCallback(input);
      }

      // Unmount the component
      var element = document.getElementById('msg-box');
      if (element) {
         // Unmount react component to prevent leaking memory
         // and then remove the DOM element from the body
         ReactDOM.unmountComponentAtNode(element);
         document.body.removeChild(element);
      }
   }

   handleKeyPress (e) {
      if (e.which === 13) {
         this.handleClick();
      }
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      var msg = null;

      if (this.props.kind === 'prompt') {
         msg = (<div><div type="text" style={styles.commandPrompt}>{this.props.msg}</div><input ref={r => this.cmdPrompt = r} type="text" style={styles.commandPrompt} onKeyPress={this.handleKeyPress } /></div>);
      }
      else if (this.props.kind === 'show') {
         msg = (<div ref={r => this.cmdPrompt = r} type="text" style={styles.commandPrompt}>{this.props.msg}</div>);
      }

      return (
         <div style={styles.backdrop}>
            <div style={styles.container}>
               {msg}
               <button className="form-control btn btn-primary" onClick={this.handleClick}>OK</button>
            </div>
         </div>
      );
   }
}

var styles = {
   backdrop: {
      backgroundColor: 'rgba(0,0,0,0.2)',
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0'
   },
   commandPrompt: {
      color: 'black',
      display: 'block',
      borderRadius: '0.5rem',
      width: '100%',
      maxWidth: '100%',
      ':active': {
         outlineWidth: '0'
      },
      ':focus': {
         outlineWidth: '0'
      }
   },
   container: {
      fontSize: '2rem',
      borderRadius: '1rem',
      backgroundColor: '#fafafa',
      position: 'relative',
      margin: '2rem',
      padding: '0.5rem',
      maxWidth: '60rem'
   }
};

export default Message;
