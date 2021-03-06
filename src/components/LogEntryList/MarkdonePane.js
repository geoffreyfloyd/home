import React from 'react';
import ReactDOM from 'react-dom';
import Lexer from 'apps/doozy/core/markdone';

class MarkdonePane extends React.Component {
   constructor (props) {
      super(props);

      this.handleBlur = this.handleBlur.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.handleClick = this.handleClick.bind(this);
      this.handleFocus = this.handleFocus.bind(this);

      this.state = {
         hasFocus: false,
      };
   }

   componentDidMount () {
      if (this.doAutoGrow) {
         this.doAutoGrow = false;
         autoGrow(ReactDOM.findDOMNode(this));
      }
   }

   componentWillReceiveProps (nextProps) {
      if (nextProps.value !== this.props.value) {
         this.doAutoGrow = true;
      }
   }

   componentDidUpdate () {
      if (this.doAutoGrow) {
         this.doAutoGrow = false;
         autoGrow(ReactDOM.findDOMNode(this));
      }
      if (this.doFocus) {
         this.doFocus = false;
         ReactDOM.findDOMNode(this).focus();
      }
   }

   /***********************************
    * EVENT HANDLING
   ***********************************/
   handleBlur () {
      this.setState({ hasFocus: false });
   }

   handleChange (e) {
      this.props.onChange(e);
   }

   handleClick () {
      this.doAutoGrow = true;
      this.doFocus = true;
      this.setState({ hasFocus: true });
   }

   handleFocus () {
      this.setState({ hasFocus: true });
   }

   /***********************************
    * RENDERING
   ***********************************/
   render () {
      var { hasFocus } = this.state;
      var { onChange, value } = this.props;

      if (hasFocus) {
         return (
            <textarea
               style={Object.assign({ display: 'inline', width: '100%' }, this.props.style)}
               onChange={this.handleChange}
               onFocus={this.handleFocus}
               onBlur={this.handleBlur}
               value={value}
            />
         );
      }
      else {
         var lexer = new Lexer(value);
         var markdone = lexer.parse();
         
         return (
            <div
               style={Object.assign({ minHeight: '1rem' }, this.props.style)}
               onBlur={this.handleBlur}
               onFocus={this.handleFocus}
               onClick={this.handleClick}
            >
               {markdone.todo.map(todo => <div key={`todo-${todo}`} style={{ fontSize: '1rem' }}><input type="checkbox" checked={false} readOnly />{todo}</div>)}
               {markdone.done.map(done => <div key={`done-${done}`} style={{ fontSize: '1rem' }}><input type="checkbox" checked readOnly />{done}</div>)}
               {markdone.notes.map(note => <div key={`note-${note}`} dangerouslySetInnerHTML={{ __html: note }} />)}
            </div>
         );
      }
   }
}

function autoGrow (textArea) {
   textArea.style.overflowY = 'hidden';
   textArea.style.height = 'auto';
   textArea.style.height = textArea.scrollHeight + 'px';
}

export default MarkdonePane;
