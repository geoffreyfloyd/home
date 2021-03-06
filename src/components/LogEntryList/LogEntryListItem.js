/* globals window $ */
import React from 'react';
import babble from 'libs/babble';
import those from 'those';
import EventHandler, { getThrottledHandler } from 'libs/event-handler';

// Mixins and Subcomponents
import LayeredComponentMixin from 'mixins/LayeredComponentMixin';
import ContentEditable from 'components/ContentEditable';
import RelativeTime from 'components/RelativeTime';
import TagList from 'components/TagList';
import MarkdonePane from './MarkdonePane';

// Stores
import logEntryStore from 'stores/logentry-store';

var LogEntryListItem = React.createClass({
   /*************************************************************
    * DEFINITIONS
    *************************************************************/
   mixins: [LayeredComponentMixin],

   getInitialState () {
      return {
         isDropDownOpen: false,
         data: Object.assign({}, this.props.data),
      };
   },

   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   componentWillMount () {
      var saveChanges = getThrottledHandler(this.handleSaveChanges, 1000);

      var durationChange = EventHandler.create();
      durationChange
         .distinctUntilChanged()
         .map(event => {
            var duration = 0;
            var durationParseResult = babble.get('durations').translate(event.target.value);
            if (durationParseResult.tokens.length > 0) {
               duration = durationParseResult.tokens[0].value.toMinutes();
            }

            return duration;
         })
         .filter(duration => duration !== this.state.data.duration)
         .subscribe(this.handleDurationChange);

      this.handlers = {
         durationChange,
         saveChanges,
      };
   },

   componentWillUnmount () {
      this.handlers.durationChange.dispose();
      this.handlers.saveChanges.dispose();
   },

   componentWillReceiveProps (nextProps) {
      if (nextProps.data !== this.props.data) {
         this.setState({
            data: { ...nextProps.data }
         });
      }
   },

   componentDidUpdate () {
      if (this.state.isDropDownOpen) {
         $(window).on('click.Bst', this.handleOutsideClick);
      }
   },

   /*************************************************************
    * EVENT HANDLING
    *************************************************************/
   handleOutsideClick (event) {
      var $win = $(window);
      var $box = $('#dropdown-' + this.props.data.id);

      if (typeof this.refs.dropDown === 'undefined') {
         $win.off('click.Bst', this.handleOutsideClick);
         return;
      }

      // handle click outside of the dropdown
      var $toggle = $(this.refs.dropDown);
      if ($box.has(event.target).length === 0 && !$toggle.is(event.target) && !$box.is(event.target)) {
         this.setState({
            isDropDownOpen: false
         });
         $win.off('click.Bst', this.handleOutsideClick);
      }
   },
   handleDeleteClick () {
      host.prompt('Are you sure you want to delete this log entry?\n\nIf so, type DELETE and hit enter', function (response) {
         if ((response || '').toLowerCase() === 'delete') {
            logEntryStore.destroy(this.props.data.id).then(() => {
               window.location.href = '/logs';
            });
         }
      }.bind(this));
   },
   handleEditDetailsClick () {
      this.refs.logdetails.focus();
      this.setState({
         isDropDownOpen: false
      });
   },
   handleEditDurationClick () {
      this.refs.logduration.focus();
      this.setState({
         isDropDownOpen: false
      });
   },
   handleDetailsChange (e) {
      var data = Object.assign({}, this.state.data);
      data.details = e.target.value;
      this.setState({ data });
      this.handlers.saveChanges();
   },

   handleDurationChange (duration) {
      var data = Object.assign({}, this.state.data);
      data.duration = duration;
      this.setState({ data });
      this.handlers.saveChanges();
   },

   handleSaveChanges () {
      logEntryStore.save(this.state.data).then(() => {
         if (!this.props.data.id) {
            window.location.href = '/logs';
         }
      });
   },

   handleDropDownClick () {
      this.setState({
         isDropDownOpen: !this.state.isDropDownOpen,
      });
   },

   /*************************************************************
    * RENDERING
    *************************************************************/
   renderLayer () {
      if (!this.state.isDropDownOpen) {
         return null;
      }

      var data = this.state.data;
      var options = [];

      options.push((
         <li key="1">
            <a className="clickable hoverable" style={styles.userOptionsItem} onClick={this.handleDeleteClick}>
               <i className="fa fa-trash"></i> Delete Log Entry
            </a>
         </li>
      ));
      options.push((
         <li key="2">
            <a className="clickable hoverable" href={'/log/' + data.id} style={styles.userOptionsItem}>
               <i className="fa fa-pencil"></i> Edit Entry
            </a>
         </li>
      ));
      if (data.actions && data.actions.length) {
         options.push((
            <li key="3">
               <a className="clickable hoverable" href={'/action/' + data.actions[0].id} style={styles.userOptionsItem}>
                  <i className="fa fa-pencil"></i> Edit Action
               </a>
            </li>
         ));
      }
      options.push((
         <li key="4">
            <a className="clickable hoverable" style={styles.userOptionsItem} onClick={this.handleEditDetailsClick}>
               <i className="fa fa-pencil"></i> Edit Details
            </a>
         </li>
      ));
      options.push((
         <li key="5">
            <a className="clickable hoverable" style={styles.userOptionsItem} onClick={this.handleEditDurationClick}>
               <i className="fa fa-pencil"></i> Edit Duration
            </a>
         </li>
      ));

      return (
         <div id={'dropdown-' + data.id} style={styles.userOptionsDropdown(this) }>
            <ul style={styles.userOptionsList}>
               {options}
            </ul>
         </div>
      );
   },
   render () {
      var duration, typeOfLogEntry;
      var data = this.state.data;
      var knownAs = 'You';

      if (data.duration) {
         duration = new babble.Duration(data.duration * 60000).toString();
      }

      if (data.actions.length) {
         typeOfLogEntry = ([
            <span style={{ fontWeight: 'bold' }}>
               {knownAs}
            </span>,
            <span>
               {' ' + data.kind + ' '}
            </span>,
            <span style={{ fontWeight: 'bold' }}>
               {those(data.actions).first().name}
            </span>
         ]);
      }
      else {
         typeOfLogEntry = ([
            <span style={{ fontWeight: 'bold' }}>{knownAs}</span>,
            <span>{' logged an entry'}</span>
         ]);
      }

      return (
         <div key={data.id} style={styles.logEntryBox}>
            <div>
               <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div style={{ flexGrow: '1' }}>
                     <div>
                        {typeOfLogEntry}
                     </div>
                     <small>
                        <RelativeTime accuracy="d" isoTime={data.date} />
                        <span>{(data.duration ? ' for ' : '') }</span>
                        <ContentEditable ref="logduration" html={duration} onChange={this.handlers.durationChange} />
                     </small>
                  </div>
                  <TagList tags={data.tags}
                     selectedTags={those(data.tags).pluck('id') }
                  />
                  <i
                     ref="dropDown"
                     style={{ color: '#b2b2b2', cursor: 'pointer' }}
                     className="fa fa-chevron-down"
                     onClick={this.handleDropDownClick}
                  />
               </div>
               <div>
                  <div style={{ padding: '5px', fontSize: '1.8em' }}>
                     <MarkdonePane ref="logdetails" value={data.details} onChange={this.handleDetailsChange} />
                  </div>
               </div>
            </div>
         </div>
      );
   },
});


/*************************************************************
 * STYLES
 *************************************************************/
var styles = {
   logEntryBox: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#fff',
      padding: '5px',
      borderRadius: '4px',
      marginBottom: '5px',
   },
   userOptionsDropdown (component) {
      return {
         cursor: 'pointer',
         position: 'absolute',
         top: $(component.refs.dropDown).offset().top + 22 + 'px',
         left: $(component.refs.dropDown).offset().left - (16 * 15) + 'px',
         padding: '5px',
         backgroundColor: '#fff',
         minWidth: '16rem',
         borderRadius: '4px',
         border: '2px solid #e0e0e0',
         boxShadow: '0 0 10px #000000',
      };
   },
   userOptionsList: {
      listStyle: 'none',
      margin: '0',
      padding: '0',
   },
   userOptionsItem: {
      fontSize: '20px',
      display: 'block',
      padding: '3px 20px',
      clear: 'both',
      fontWeight: '400',
      lineHeight: '1.42857143',
      color: '#333',
      whiteSpace: 'nowrap',
   }
};

module.exports = LogEntryListItem;
