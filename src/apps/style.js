import { $absoluteFill } from 'libs/style';

export default {
   background: {
      backgroundColor: '#222',
      minHeight: '100vh',
      padding: '0.5rem',
   },
   button: {
      color: '#fff',
      backgroundColor: '#2B90E8',
      width: '100%',
      display: 'inline-block',
      fontSize: '1.1rem',
      lineHeight: '1.42857143',
      textAlign: 'center',
      whiteSpace: 'nowrap',
      verticalAlign: 'middle',
      msTouchAction: 'manipulation',
      touchAction: 'manipulation',
      cursor: 'pointer',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      MsUserSelect: 'none',
      userSelect: 'none',
      backgroundImage: 'none',
      border: '1px solid transparent',
      borderRadius: '0.25rem',
   },
   buttons: {
      margin: '1rem 0',
   },
   click: {
      cursor: 'pointer',
   },
   content: {
      maxWidth: '60rem',
      margin: 'auto',
   },
   form: {
      color: '#2B90E8',
   },
   formSection: {
      padding: '0.5rem 1rem',
      borderRadius: '0.25rem',
      backgroundColor: '#333',
      marginBottom: '0.5rem',
   },
   inlineLabel: {
      padding: '0 0.5rem',
      lineHeight: '2.3',
   },
   inputRow: {
      display: 'flex',
   },
   label: {
      color: '#00AF27',
   },
   loading: {
      ...$absoluteFill,
      color: '#ddd'
   },
};
