import React from 'react';
import { copy, extract } from './object-utils';
import Button from './Button';
import IconButton from './IconButton';
import FormDialog from './FormDialog';
import { getReactPropTypes } from './type';

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
    
    constructor (props) {
        super(props);
        this.handleAddClick = this.handleAddClick.bind(this);
        this.handleRemoveClick = this.handleRemoveClick.bind(this);
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
     * RENDERING
     *************************************************************/
    getRowKeyPath (rowKey, rowIndex) {
        if (rowKey) {
            var obj = {};
            obj[this.props.rowKey] = rowKey;
            return JSON.stringify(obj);    
        }
        else {
            return '[' + rowIndex + ']';
        }
    }
    
    getRowInputProps (element, rowKey, rowIndex) {
        // Form state and props
        var { formState, errorMap, changeMap, model, handleInputRegister, handleInputUnregister, handleUpdateRequest } = this.props;
         
        // Input element props
        var { path, ...props } = element.props;
        
        // Get binding path to collection row
        var rowPath = this.props.path + this.getRowKeyPath(rowKey, rowIndex) + '.' + path;
        
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
                return this.props.path + this.getRowKeyPath(rowKey, rowIndex) + '.' + d;    
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

    getFormRowInnerRelayProps (element, rowKey, rowIndex) {
        // props
        var { formState, errorMap, changeMap, model, handleInputRegister, handleInputUnregister, handleUpdateRequest, InputWrapper } = this.props;
            
        // Input Group element props
        var props = element ? element.props : {};
        
        // Get binding path to collection row
        var rowPath = this.props.path + this.getRowKeyPath(rowKey, rowIndex);
        
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
            InputWrapper: InputWrapper,
        };
    }
    
    getInputStyle (fieldIndex) {
        var propName = 'styleInput' + String(fieldIndex + 1);
        var style = this.props[propName];
        if (style) {
            return style;
        }
        else {
            return;
        }
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
    
    renderDialogButtonCell (dialogElement, rowKey, rowIndex) {
        var dialog, dialogButton, dialogButtonCell;

        if (dialogElement) {
            
            dialogButton = (<Button type="button" style={styles.dialogButton}><span className="glyphicon glyphicon-menu-hamburger"></span></Button>);

            dialog = React.cloneElement(dialogElement, { toggleButton: dialogButton, ...this.getFormRowInnerRelayProps(dialogElement, rowKey, rowIndex) });

            dialogButtonCell = (
                <div key={'dialog'} className={this.props.style ? '' : 'input-group-addon'} style={Object.assign({}, styles.clearWidth, this.props.styleInput)}>
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
                <div className={this.props.style ? '' : 'input-group-addon'} style={Object.assign({}, (this.props.style ? {} : styles.clearWidth), this.props.styleInput)}>
                    <IconButton icon="remove" style={styles.button} onClick={this.handleRemoveClick.bind(null, rowIndex)} />
                </div>
            );
        }
        return removeRowButtonCell;
    }
    
    render () {
        var addRowButton, footer, header, labels;
        var cells = this.getCells();
        var dialogElement = this.getDialog();

        // Build labels
        labels = cells.map(function (child, index) {
            var labelClass = child.props.labelStyle ? '' : 'col-md-' + (child.props.labelSpan || 2);
            if (!child.props.label) {
                return false;
            }
            return (
                <label key={'label_' + index} className={labelClass} style={Object.assign({}, styles.inputHeaderLabel, child.props.labelStyle) }>{child.props.label}</label>
            );
        }).filter(a => a);
        
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
            addRowButton = <IconButton icon="plus" style={Object.assign({}, styles.button, styles.padLeft)} onClick={this.handleAddClick} />;            
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
                    
                    var rowKey = row[this.props.rowKey];
                    var componentKey = rowKey || rowIndex;
                    // Setup Dialog for this row (if dialog inputs were given)
                    var removeRowButtonCell = this.renderRemoveRowButtonCell(rowIndex);
                    var dialogButtonCell = this.renderDialogButtonCell(dialogElement, rowKey, rowIndex);
                    
                    return (
                        <div key={'row_' + componentKey} className={this.props.style ? '' : 'input-group'} style={this.props.style}>
                            {removeRowButtonCell}
                            {cells.map((child, fieldIndex) => {
                                return (
                                    <div key={'cell_' + componentKey + '_' + fieldIndex} className={this.props.style ? '' : 'input-group-addon'} style={Object.assign({}, styles.noPad, this.props.styleInput, child.props.cellStyle)}>
                                        {React.cloneElement(child, this.getRowInputProps(child, rowKey, rowIndex))}
                                    </div>
                                );
                            })}
                            {dialogButtonCell}
                        </div>
                    );
                })}
                {footer}
            </div>
        );
    }
}
InputTable.propTypes = getReactPropTypes(InputTable.PropTypes);

var styles = {
    clearWidth: {
        padding: 0, 
        width: '0.001%'
    },
    dialogButton: {
        height: '2rem',
        width: '2rem',
        marginRight: '1px'
    },
    button: {
        margin: '0.2375rem',
        height: '1.6rem',
        width: '1.6rem',
        lineHeight: '1.6',
    },
    container: {
        padding: '15px'
    },
    inputHeaderLabel: {
        textAlign: 'left',
        borderBottom: '2px solid #ddd',
        paddingBottom: '0.25rem'
    },
    noPad: {
        padding: 0
    },
    padLeft: {
        paddingLeft: '1px'
    },
    right: {
        textAlign: 'right'
    },
    nudge: {
        paddingLeft: '2rem'
    },
};

export default InputTable;
