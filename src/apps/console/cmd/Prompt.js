import React from 'react';
import { Editor, ContentState, EditorState, RichUtils, CompositeDecorator } from 'draft-js';
import requestStore from 'stores/request-store';
import those from 'those';

const HASHTAG_REGEX = /\#[\w\u0590-\u05ff]+/g;

function hashtagStrategy (contentBlock, callback) {
   findWithRegex(HASHTAG_REGEX, contentBlock, callback);
}

function findWithRegex (regex, contentBlock, callback) {
   const text = contentBlock.getText();
   let matchArr, start;
   while ((matchArr = regex.exec(text)) !== null) {
      start = matchArr.index;
      callback(start, start + matchArr[0].length);
   }
}

const HashtagSpan = (props) => {
   return <span {...props} style={styles.hashtag}>{props.children}</span>;
};

const compositeDecorator = new CompositeDecorator([
   {
      strategy: hashtagStrategy,
      component: HashtagSpan,
   },
]);

// EditorChangeType = (
//   'undo' |
//   'redo' |
//   'change-selection' |
//   'insert-characters' |
//   'backspace-character' |
//   'delete-character' |
//   'remove-range' |
//   'split-block' |
//   'insert-fragment' |
//   'change-inline-style' |
//   'change-block-type' |
//   'apply-entity' |
//   'reset-block' |
//   'adjust-depth' |
//   'spellcheck-change'
//);

const createNewEditorState = (text) => {
   var editorState;
   if (text) {
      // editorState = EditorState.createWithContent(ContentState.createFromText(text),
      //    new CompositeDecorator([
      //       {
      //          strategy: hashtagStrategy,
      //          component: HashtagSpan,
      //       }
      //    ])
      // );
      editorState = EditorState.push(EditorState.createEmpty(compositeDecorator), ContentState.createFromText(text), 'insert-characters');
   }
   else {
      editorState = EditorState.createEmpty(compositeDecorator);
   }

   return EditorState.moveFocusToEnd(editorState);
}

export default class Prompt extends React.Component {
   constructor (props) {
      super(props);
      this.state = {
         historyIndex: -1,
         commitHistory: [],
         editorState: createNewEditorState()
      };
      this.onChange = (editorState) => {
         this.setState({ editorState });
      };
      this._onKeyCommand = this._onKeyCommand.bind(this);
      this._onReturn = this._onReturn.bind(this);
      this._onUpArrow = this._onUpArrow.bind(this);
      this._onDownArrow = this._onDownArrow.bind(this);
   }

   _updateHistory () {
      var { commitHistory } = this.state;
      var cmd = this.state.editorState.getCurrentContent().getPlainText().trim();
      commitHistory = those(commitHistory).flick(cmd).flip();
      commitHistory.push(cmd);
      commitHistory.reverse();
      return commitHistory;
   }

   _onReturn () {
      var commitHistory = this._updateHistory();

      //
      var text = this.state.editorState.getCurrentContent().getPlainText('\n');
      this._handleSendRequest(text);

      this.setState({
         commitHistory,
         editorState: EditorState.moveFocusToEnd(createNewEditorState())
      });
      return true;
   }

   _onKeyCommand (command) {
      const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
      if (newState) {
         this.onChange(newState);
         return true;
      }
      return false;
   }

   _onUpArrow () {
      var historyIndex = this.state.historyIndex + 1
      if (historyIndex > this.state.commitHistory.length - 1) {
         historyIndex = this.state.commitHistory.length - 1;
      }
      this.setState({
         historyIndex,
         editorState: createNewEditorState(this.state.commitHistory[historyIndex])
      });
   }

   _onDownArrow () {
      var historyIndex = this.state.historyIndex - 1;
      if (historyIndex < -1) {
         historyIndex = -1;
      }
      this.setState({
         historyIndex,
         editorState: createNewEditorState(this.state.commitHistory[historyIndex])
      });
   }

   _handleSendRequest (hoomanInput) {
      // send request
      requestStore.send(hoomanInput, this.props.sessionId, this._handleResponseReady);
   }

   _handleResponseReady (req) {
      console.log(req);
   }

   render () {
      const { editorState } = this.state;
      return (
         <div style={styles.inputContainer}>
            <Editor editorState={editorState} onChange={this.onChange}
              handleKeyCommand={this._onKeyCommand}
              handleReturn={this._onReturn}
              onUpArrow={this._onUpArrow}
              onDownArrow={this._onDownArrow}
            />
         </div>
      );
   }
}

var styles = {
   hashtag: {
      borderRadius: '0.3rem',
      padding: '0.1rem 0.3rem 0',
      backgroundColor: '#fff',
      color: '#d00',
      fontWeight: 'bold',
   },
   inputContainer: {
      width: '88%',
      margin: '10px 0 0 10px',
      border: '0',
      color: '#ddd',
      backgroundColor: '#222',
      display: 'inline-block',
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '1.4em',
      borderRadius: '10px',
      paddingLeft: '10px',
   },
};
