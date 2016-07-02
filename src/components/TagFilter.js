import React from 'react';
import TagList from 'components/TagList';

export default function TagFilter (props) {
   const { tags, tagFilter, tagFilterMode, handleTagFilterModeClick, handleTagFilterClick } = props;

   if (!tags || !tags.length) {
      return <div style={{ height: 0, padding: 0, margin: 0 }}></div>;
   }

   // Exclude Box Tags which are special tags assigned to actions, not log entries
   var filterableTags = tags.filter(tag => tag.kind !== 'Box');

   return (
      <div style={styles.filter}>
         <ul style={styles.toggleSwitch}>
            <li style={styles.getToggleSwitchItemStyle(tagFilterMode === 'any') } onClick={handleTagFilterModeClick.bind(null, 'any') }>Any</li>
            <li style={styles.getToggleSwitchItemStyle(tagFilterMode === 'all') } onClick={handleTagFilterModeClick.bind(null, 'all') }>All</li>
            <li style={styles.getToggleSwitchItemStyle(tagFilterMode === 'not') } onClick={handleTagFilterModeClick.bind(null, 'not') }>Not</li>
         </ul>
         <TagList
            tags={filterableTags}
            selectedTags={tagFilter}
            selectionChanged={handleTagFilterClick}
         />
      </div>
   );
}

/*************************************************************
 * STYLING
 *************************************************************/
var styles = {
   filter: {
      marginTop: '0.5rem',
      backgroundColor: '#fff',
      padding: '0.25rem',
      borderRadius: '0.25rem',
   },
   toggleSwitch: {
      display: 'inline',
      margin: '0',
      marginLeft: '2px',
      padding: '0',
      listStyle: 'none',
      border: 'none',
   },
   getToggleSwitchItemStyle: function (isSelected) {
      var s = {
         cursor: 'pointer',
         borderRadius: '4px',
         display: 'inline-block',
         padding: '2px 5px',
         margin: '0 0 2px 2px',
         border: '1px solid #e0e0e0',
      };
      if (isSelected) {
         s.backgroundColor = '#1b9dec';
         s.color = '#eee';
      }
      return s;
   },
};
