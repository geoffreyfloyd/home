import React from 'react';
import ReactDOM from 'react-dom';

class ContentEditable extends React.Component {
   constructor (props) {
      super(props);

      this.emitChange = this.emitChange.bind(this);
   }
   /***********************************
    * EVENT HANDLING
   ***********************************/
   emitChange () {
      var html = ReactDOM.findDOMNode(this).innerHTML;
      if (this.props.onChange && html !== this.lastHtml) {
         var brPattern = /<br\/>|<br>/g;
         var spPattern = /&nbsp;/g; // Non-breaking space
         this.props.onChange({
            target: {
               id: this.props.id || null,
               value: (html || '').replace(brPattern, '\n').replace(spPattern, ' '),
            }
         });
      }
      this.lastHtml = html;
   }

   /***********************************
    * RENDERING
   ***********************************/
   render () {
      var newlinePattern = /\n/g;
      var value = (this.props.html || '').replace(newlinePattern, '<br/>');
      return (
         <div
            style={Object.assign({display: 'inline'}, this.props.style)}
            onInput={this.emitChange}
            onBlur={this.emitChange}
            contentEditable
            dangerouslySetInnerHTML={{__html: value}}></div>
      );
   }
}

export default ContentEditable;
