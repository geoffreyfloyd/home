import React from 'react';
import host from 'stores/host';
import those from 'those';
import FocusBar from 'components/FocusBar';
import TagFilter from 'components/TagFilter';

export default function focusTags(Component) {
   class FocusTagsComponent extends React.Component {
      static GetContext = function (context) {
         context = context || {};
         var currentFocus = context.currentFocus || null;
         var tagFilter = context.tagFilter || context.tags || [];
         var tagFilterMode = context.tagFilterMode || 'any';
         return {
            currentFocus: currentFocus,
            tagFilter: tagFilter,
            tagFilterMode: tagFilterMode
         };
      };

      /*************************************************************
       * COMPONENT LIFECYCLE
       *************************************************************/
      constructor(props) {
         super(props);

         // Bind instance to event handlers
         this.handleContextUpdate = this.handleContextUpdate.bind(this);
      }

      componentWillMount() {
         host.context.subscribe(this.handleContextUpdate);
      }

      componetWillUnmount() {
         host.context.unsubscribe(this.handleContextUpdate);
      }

      /*************************************************************
       * EVENT HANDLING
      *************************************************************/
      handleContextUpdate (context) {
         this.setState({
            context: context,
         });
      }

      handleFocusClick (focus) {
         host.context.set({
            currentFocus: focus
         });
      }

      handleTagFilterClick(tag) {
         var {tagFilter} = FocusTagsComponent.GetContext();

         /**
          * Toggle tag selection
            */
         tagFilter = those(tagFilter).toggle(tag).slice();

         /**
          * Update context
          */
         host.context.set({
            tagFilter: tagFilter
         });
      }

      handleTagFilterModeClick(tagFilterMode) {
         /**
          * Update context
          */
         host.context.set({
            tagFilterMode: tagFilterMode
         });
      }

      /*************************************************************
       * RENDERING
       *************************************************************/
      render () {
         var { list, tags } = this.props;
         var { currentFocus, tagFilter, tagFilterMode } = FocusTagsComponent.GetContext(this.state.context);
         var focuses = those(tags).like({ kind: 'Focus' });

         // Filter Log Entries by Tag Filter Context
         if (currentFocus && currentFocus.kind && currentFocus.name !== 'nofocus') {
            list = those(list).like(function (q) {
               var focusTag = those(q.tags).first(tag => {
                  if (tag.id === currentFocus.id || those(tag.descendantOf).has(currentFocus.id)) {
                     return true;
                  }
               });
               return focusTag && focusTag.id && focusTag.id.length > 0;
            }).slice();

            tags = those(tags).like(tag => {
               if (those(tag.descendantOf || []).has(currentFocus.id)) {
                  return true;
               }
               else {
                  return false;
               }
            }).slice();

            tagFilter = those(tagFilter).like(tag => {
               if (those(tags).has({ id: tag })) {
                  return true;
               }
               else {
                  return false;
               }
            }).slice();

         }
         else {
            list = those(list).like(function (q) {
               if (!q.tags || !q.tags.length) {
                  return false;
               }

               // If no descendants, we assume 
               var hasFocus = those(q.tags).first(tag => {
                  return tag.kind === 'Focus' || (tag.descendantOf && tag.descendantOf.length);
               });

               return !hasFocus;
            }).slice();

            tags = those(tags).like(tag => {
               if (tag.kind !== 'Focus' && (!tag.descendantOf || !tag.descendantOf.length)) {
                  return true;
               }
               else {
                  return false;
               }
            }).slice();

            tagFilter = those(tagFilter).like(tag => {
               if (those(tags).has({ id: tag })) {
                  return true;
               }
               else {
                  return false;
               }
            }).slice();
         }

         if (tagFilter.length) {
            if (tagFilterMode === 'any' || !tagFilterMode) {
               list = those(list).like(function (q) {
                  return those(q.tags).pluck('id').hasAny(tagFilter);
               }).slice();
            }
            else if (tagFilterMode === 'all') {
               list = those(list).like(function (q) {
                  return those(q.tags).pluck('id').hasAll(tagFilter);
               }).slice();
            }
            else if (tagFilterMode === 'not') {
               list = those(list).notLike(function (q) {
                  return those(q.tags).pluck('id').hasAny(tagFilter);
               }).slice();
            }
         }

         return (
            <div>
               <FocusBar currentFocus={currentFocus} focuses={focuses} handleFocusClick={this.handleFocusClick}/>
               <TagFilter
                  tags={tags}
                  tagFilter={tagFilter}
                  tagFilterMode={tagFilterMode}
                  handleTagFilterClick={this.handleTagFilterClick}
                  handleTagFilterModeClick={this.handleTagFilterModeClick} />
               <Component list={list} />
            </div>
         );
      }
   }
   return FocusTagsComponent;
}
