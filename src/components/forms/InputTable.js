// PACKAGES
import React from 'react';
// LIBS
import { copy, extract, shallowEqual } from 'libs/object-utils';
import { getReactPropTypes } from 'libs/type';
// COMPONENTS
import Button from './Button';
import IconButton from './IconButton';
import FormDialog from './FormDialog';

class InputTable extends React.Component {
   /*************************************************************
    * DEFINITIONS
    *************************************************************/
   static PropTypes = {
      rowKey: { type: 'string', isRequired: true },
      getNewRow: { type: 'function', isRequired: true },
   };

   static defaultProps = {
      canAdd: true,
      canRemove: true,
   };

   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   constructor (props) {
      super(props);
      // Bind event handlers
      this.handleAddClick = this.handleAddClick.bind(this);
      this.handleRemoveClick = this.handleRemoveClick.bind(this);
   }

   shouldComponentUpdate (nextProps) {
      return !shallowEqual(nextProps, this.props);
   }

   /*************************************************************
    * EVENT HANDLING
    *************************************************************/
   handleAddClick () {
      var collection = copy(this.props.currentValue);
      if (typeof this.props.getNewRow === 'function') {
         this.props.getNewRow().then(newRow => {
            collection.push(newRow);
            var changeArgs = { value: collection, errors: [], hasChanged: true, transaction: 'add-row', rowKey: collection[collection.length - 1][this.props.rowKey] };
            this.props.handleUpdateRequest(this.props.path, changeArgs);
         });
      }
      else {
         collection.push({});
         var changeArgs = { value: collection, errors: [], hasChanged: true };
         this.props.handleUpdateRequest(this.props.path, changeArgs);
      }
   }

   handleRemoveClick (rowIndex) {
      var changeArgs = { errors: [], hasChanged: true, transaction: 'remove-row', rowKey: this.props.currentValue[rowIndex][this.props.rowKey] };
      changeArgs.value = copy(this.props.currentValue).filter((a, i) => i !== rowIndex);
      this.props.handleUpdateRequest(this.props.path, changeArgs);
   }

   /*************************************************************
    * METHODS
    *************************************************************/
   getRowKeyPath (rowKey) {
      var obj = {};
      obj[this.props.rowKey] = rowKey;
      return JSON.stringify(obj);
   }

   getRowInputProps (element, rowKey) {
      // Form props
      var { formState, errorMap, changeMap, model, handleInputRegister, handleInputUnregister, handleUpdateRequest } = this.props;

      // Input element props
      var { path, ...props } = element.props;

      // Get binding path to collection row
      var rowPath = this.props.path + this.getRowKeyPath(rowKey) + '.' + path;

      // Derive original and current values
      var currentValue = extract(formState, rowPath);
      var originalValue = extract(model, rowPath);

      // Cast dependsOn prop to an array to simplify logic
      var rowDependsOn = props.dependsOn || [];
      if (typeof rowDependsOn === 'string') {
         rowDependsOn = [rowDependsOn];
      }

      // Get row-modified dependency paths
      rowDependsOn = rowDependsOn.map(d => {
         if (d.slice(0, 1) === '^') {
            return d.slice(1);
         }
         else {
            return this.props.path + this.getRowKeyPath(rowKey) + '.' + d;
         }
      });

      return {
         ...props,
         currentValue: currentValue,
         originalValue: originalValue,
         hasChanged: changeMap[rowPath] || false,
         errors: errorMap[rowPath] || [],
         register: handleInputRegister.bind(null, rowPath),
         unregister: handleInputUnregister.bind(null, rowPath),
         requestUpdate: handleUpdateRequest.bind(null, rowPath),
         // Row Input overrides
         path: rowPath,
         dependsOn: rowDependsOn,
      };
   }

   getFormRowInnerRelayProps (element, rowKey) {
      // props
      var { formState, errorMap, changeMap, model, handleInputRegister, handleInputUnregister, handleUpdateRequest } = this.props;

      // Input Group element props
      var props = element ? element.props : {};

      // Get binding path to collection row
      var rowPath = this.props.path + this.getRowKeyPath(rowKey);

      return {
         ...props,
         basePath: rowPath,
         model: model,
         formState: formState,
         errorMap: errorMap,
         changeMap: changeMap,
         handleInputRegister: handleInputRegister,
         handleInputUnregister: handleInputUnregister,
         handleUpdateRequest: handleUpdateRequest,
      };
   }

   getInputStyle (fieldIndex) {
      var propName = 'styleInput' + String(fieldIndex + 1);
      var style = this.props[propName];
      if (style) {
         return style;
      }
      return undefined;
   }

   getDialog () {
      var dialog;
      React.Children.forEach(this.props.children, child => {
         if (child.type === FormDialog) {
            dialog = child;
         }
      });
      return dialog;
   }

   getCells () {
      var cells = [];
      React.Children.forEach(this.props.children, child => {
         if (child.type !== FormDialog) {
            cells.push(child);
         }
      });
      return cells;
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      var addRowButton, footer, header, labels;
      var cells = this.getCells();
      var dialogElement = this.getDialog();

      // Build labels
      labels = cells.map(function (child, index) {
         var labelClass = child.props.labelStyle ? '' : 'col-md-' + (child.props.labelSpan || 2);
         return (
            <label key={'label_' + index} className={labelClass} style={Object.assign({}, styles.inputHeaderLabel, child.props.labelStyle) }>{child.props.label}</label>
         );
      });

      // Build header
      if (labels && labels.length) {
         header = (
            <div key="header" className="hidden-xs hidden-sm" style={{ height: '2.5rem', paddingLeft: this.props.canRemove ? '2.5rem' : '0', paddingRight: this.props.dialog ? '2.5rem' : '0' }}>
               {labels}
            </div>
         );
      }

      // Build add row button
      if (this.props.canAdd) {
         addRowButton = <IconButton icon="add" color="#555555" style={Object.assign({}, styles.button, styles.padLeft) } onClick={this.handleAddClick} />;
      }

      // Build footer
      if (addRowButton) {
         footer = (
            <div key="footer">
               {addRowButton}
            </div>
         );
      }

      return (
         <div style={styles.container}>
            {header}
            {this.props.currentValue.map((row, rowIndex) => {
               // Get unique identifier from the row
               var rowKey = row[this.props.rowKey];

               // Setup Dialog for this row (if FormDialog child exists)
               var dialogButtonCell = this.renderDialogButtonCell(dialogElement, rowKey);

               // Render remove button cell (if props.canRemove)
               var removeRowButtonCell = this.renderRemoveRowButtonCell(rowIndex);

               return (
                  <div key={'row_' + rowKey} className="input-group" style={this.props.style}>
                     {removeRowButtonCell}
                     {cells.map((child, fieldIndex) => {
                        return (
                           <div key={'cell_' + rowKey + '_' + fieldIndex} className="input-group-addon" style={Object.assign({}, styles.noPad, this.props.styleInput, this.getInputStyle(fieldIndex)) }>
                              {React.cloneElement(child, this.getRowInputProps(child, rowKey)) }
                           </div>
                        );
                     }) }
                     {dialogButtonCell}
                  </div>
               );
            }) }
            {footer}
         </div>
      );
   }

   renderDialogButtonCell (dialogElement, rowKey) {
      var dialog, dialogButton, dialogButtonCell;

      if (dialogElement) {
         dialogButton = (<Button type="button" showGradients={false} highlightBackground={false} style={styles.dialogButton}>● ● ●</Button>);

         dialog = React.cloneElement(dialogElement, { toggleButton: dialogButton, ...this.getFormRowInnerRelayProps(dialogElement, rowKey) });

         dialogButtonCell = (
         <div key={'dialog_' + rowKey} className="input-group-addon" style={Object.assign({}, styles.clearWidth, this.props.styleInput) }>
            {dialog}
         </div>
      );
      }

      return dialogButtonCell;
   }

   renderRemoveRowButtonCell (rowIndex) {
   var removeRowButtonCell;
   if (this.props.canRemove) {
      removeRowButtonCell = (
         <div className="input-group-addon" style={Object.assign({}, styles.clearWidth, this.props.styleInput) }>
            <IconButton color="#555555" icon="remove" style={styles.button} onClick={this.handleRemoveClick.bind(null, rowIndex) } />
         </div>
      );
   }
   return removeRowButtonCell;
}
}
InputTable.propTypes = getReactPropTypes(InputTable.PropTypes);

/*************************************************************
 * STYLES
 *************************************************************/
var styles = {
   clearWidth: {
      padding: 0,
      width: '0.001%',
      background: '#ddd',
   },
   dialogButton: {
      padding: 0,
      height: '1.9rem',
      width: '1.9rem',
      fontSize: '.52rem',
   },
   button: {
      margin: '0.2375rem',
      height: '1.6rem',
      width: '1.6rem',
   },
   container: {
      padding: '15px',
   },
   inputHeaderLabel: {
      textAlign: 'left',
      borderBottom: '2px solid #ddd',
      paddingBottom: '0.25rem',
   },
   noPad: {
      padding: 0,
      background: '#ddd',
   },
   padLeft: {
      paddingLeft: '1px',
   },
   right: {
      textAlign: 'right',
   },
   nudge: {
      paddingLeft: '2rem',
   },
};

export default InputTable;
