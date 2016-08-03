// PACKAGES
import React from 'react';
// MIXINS
import formRelay from './formRelay';
// COMPONENTS
import Icon from './Icon';
import IconButton from './IconButton';

function FormSection (props) {
   // Props
   var { icon, info, title } = props;

   var domIcon, domInfo, domTitle;

   // Render icon
   if (icon) {
      domIcon = <Icon icon={icon} style={styles.icon} />;
   }

   // Render title header
   if (title) {
      domTitle = <h4>{title}</h4>;
   }

   // Render info tooltip
   if (info) {
      domInfo = (<IconButton icon="info-sign" info={info} style={styles.info} />);
   }

   return (
      <div style={props.style} className={props.className || 'form-horizontal'}>
         {domInfo}
         {domIcon}
         {domTitle}
         {props.children}
      </div>
   );
}

var styles = {
   icon: {
      height: '2rem',
      marginTop: '-0.5rem',
      float: 'left',
      marginRight: '1rem',
   },
   info: {
      float: 'right',
      fontSize: '1.2rem',
   },
};

export default formRelay(FormSection);
