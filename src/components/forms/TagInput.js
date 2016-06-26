import React from 'react';
import ReactDOM from 'react-dom';
import input from './input';
import { $control, $focus, $hide } from './style';

class TagInput extends React.Component {
   /*************************************************************
    * DEFINITIONS
    *************************************************************/
   static defaultProps = {
      type: 'text'
   };

   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   constructor(props) {
      super(props);
      this.handleInputBlur = this.handleInputBlur.bind(this);
      this.handleInputChange = this.handleInputChange.bind(this);
      this.state = {
         input: null,
         selectedTag: null,
         suggestions: [],
      };
   }

   componentDidMount() {
      if (this.props.focus) {
         ReactDOM.findDOMNode(this.input).focus();
      }
   }

   componentDidUpdate() {
      if (this.giveNextTagFocus) {
         ReactDOM.findDOMNode(this.input).focus();
         this.giveNextTagFocus = false;
      }
   }

   handleInputChange(e) {
      var { items } = this.props;
      var newValue = e.target.value;
      var suggestions = items.filter(a => {
         return a.name.indexOf(newValue) === 0 || a.id.indexOf(newValue) === 0;
      });
      this.setState({
         input: e.target.value,
         suggestions: suggestions
      });
   }

   handleInputBlur() {
      var input = (this.state.input || '').slice();
      if (input && this.state.suggestions.length) {
         input += this.state.suggestions[0].name.slice(input.length);
      }
      this.setState({
         input: null,
         selectedTag: null,
      });
      this.addTag(input);
   }

   handleTagClick(tagId) {
      var { currentValue, onChange } = this.props;
      var newValue = (currentValue || []).slice();

      for (var i = 0; i < newValue.length; i++) {
         if (newValue[i].id === tagId) {
            newValue.splice(i, 1);
            break;
         }
      }

      onChange(newValue);
      this.giveNextTagFocus = true;
   }

   addTag(tag) {
      if (!tag) {
         return;
      }

      var { currentValue, items } = this.props;

      var newValue = (currentValue || []).slice();

      var exists;
      for (var i = 0; i < items; i++) {
         if (items[i].name === tag || items[i].id === tag) {
            newValue.push(items[i]);
            exists = true;
            break;
         }
      }

      if (!exists) {
         newValue.push({
            id: tag,
            name: tag,
            kind: 'Tag',
         });
      }

      this.props.onChange(newValue);
      this.giveNextTagFocus = true;
   }

   render() {
      var { input, suggestions } = this.state;
      var { path, currentValue, errors, focus, hasChanged, onFocus, onBlur, placeholder, readOnly, style, type, visible } = this.props;
      var hasErrors = errors && errors.length;

      var tags = (currentValue || []);
      var suggestion;
      if (suggestions.length) {
         suggestion = <span>{suggestions[0].name.slice((input || '').length) }</span>;
      }
      return (
         <div style={styles.container}>
            <ul style={styles.tagList}>
               {tags.map((item, index) => {
                  return (
                     <li key={index} style={styles.tag(true) } onClick={this.handleTagClick.bind(this, item.id) }>{item.name}</li>
                  );
               }) }
            </ul>
            <input style={styles.inputContainer} ref={r => this.input = r} value={this.state.input} onBlur={this.handleInputBlur} onChange={this.handleInputChange} />
            {suggestion}
         </div>
      );
   }
}

const styles = {
   container: {
      padding: '2px 0 0 2px',
      border: '1px solid rgb(204, 204, 204)',
      borderRadius: '4px',
      boxShadow: 'rgba(0, 0, 0, 0.0745098) 0px 1px 1px inset',
      transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
      backgroundImage: 'none',
      backgroundColor: 'rgb(255, 255, 255)',
   },
   inputContainer: {
      borderRadius: '4px',
      display: 'inline-block',
      padding: '2px 5px',
      margin: '0 0 2px 2px',
      border: '1px solid #1b9dec',
      width: '5rem',
   },
   input: {
      display: 'inline-block',
      border: '0px'
   },
   tagList: {
      display: 'inline',
      margin: '0',
      padding: '2px',
      listStyle: 'none',
      border: 'none',
      overflow: 'hidden',
   },
   tag: function (exists) {
      var s = {
         cursor: 'pointer',
         borderRadius: '4px',
         display: 'inline-block',
         padding: '2px 5px',
         margin: '0 0 2px 2px',
         border: '1px solid $clrBsDefault2'
      };
      if (exists) {
         s.backgroundColor = '#1b9dec';
         s.color = '#eee';
      }
      return s;
   },
};

export default input(TagInput);
