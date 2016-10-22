// PACKAGES
import React from 'react';
import ReactDOM from 'react-dom';
// STORES
import tagStore from 'stores/tag-store';
// COMPONENTS
import HourDuration from 'components/HourDuration';
import appStyle from 'apps/doozy/style';

export default class Meals extends React.Component {
   /*************************************************************
    * COMPONENT LIFECYCLE
    *************************************************************/
   constructor (props) {
      super(props);

      // Bind event handlers
      this.handleMinutesClick = this.handleMinutesClick.bind(this);
      this.handleTagStoreUpdate = this.handleTagStoreUpdate.bind(this);

      // Set initial state
      this.state = {
         meals: [
            {
               id: 'pb-j-sammy',
               name: 'PB&J Sammy',
               minutes: 3,
               history: ['2016-10-17', '2016-10-18', '2016-10-21']
            },
            {
               id: 'vegetable-noodle-soup',
               name: 'Vegetable Noodle Soup',
               minutes: 15,
            },
            {
               id: 'smoothie',
               name: 'Smoothie',
               minutes: 5,
            },
            {
               id: 'salwich',
               name: 'Salwich',
               minutes: 8,
            }
         ],
         tags: [],
      };
   }

   componentDidMount () {
      tagStore.subscribe(this.handleTagStoreUpdate, { key: JSON.stringify({ key: '*' }) });
   }

   handleTagStoreUpdate (value) {
      this.setState({
         tags: value.results || this.state.tags,
      });
   }

   handleMinutesClick () {
      this.setState({
         meals: this.state.meals.map(meal => {
            return {
               ...meal,
               minutes: Math.floor(Math.random() * (61))
            };
         })
      });
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      var { meals } = this.state;
      return (
         <div style={appStyle.background}>
            <div style={appStyle.content}>
               {meals.map(meal => this.renderRow(meal))}
            </div>
         </div>
      );
   }

   renderRow (row) {
      return (
         <div key={row.id} style={styles.row}>
            <div style={styles.cell}>
               <div style={styles.title}>{row.name}</div>
            </div>
            <div style={styles.cell}>
               <HourDuration minutes={row.minutes} radius={40} fillColor="#0074d9" bgColor="#444" onClick={this.handleMinutesClick} />
            </div>
         </div>
      );
   }
}

/**
 * Inline Styles
   */
var styles = {
   heading: {
      color: '#2B90E8',
   },
   row: {

      fontSize: '2rem',
      padding: '5px',
      borderBottom: 'solid 1px #444',
   },
   cell: {
      // Layout
      display: 'inline-block',
      verticalAlign: 'top',
      // Border & Padding
      padding: '0.25rem 0.5rem',
      // Sizing
      width: '50%',
   },
   title: {
      width: '100%',
      color: '#ddd',
   },
};

/*************************************************************
 * BOOTSTRAP
 *************************************************************/
global.APP = Meals;
global.React = React;
global.ReactDOM = ReactDOM;
