// PACKAGES
import React from 'react';
import HourDuration from 'components/HourDuration';

class DurationInput extends React.Component {
   constructor (props) {
      super(props);

      // Bind event handlers
      this.handleMouseDown = this.handleMouseDown.bind(this);
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleMouseUp = this.handleMouseUp.bind(this);

      // Set initial state
      this.state = {
         value: this.props.minutes,
      };
   }

   handleMouseDown (e) {
      var { anchor, value } = this.state;

      // If anchor is still set then ignore subsequent mouse down
      if (anchor) {
         return;
      }

      // Bind mouse events to document
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);

      // Place anchor for relative position to value mapping adjustment
      this.setState({
         anchor: e.pageX,
         feedbackValue: value,
      });
   }

   handleMouseMove (e) {
      var { max } = this.props;
      var { anchor, value } = this.state;

      // If an anchor isn't set then there is nothing to relate to
      if (!this.state.anchor) {
         return;
      }

      // Ensure feedback value remains within range
      var feedbackValue = value + (e.pageX - anchor);
      if (feedbackValue < 0) {
         feedbackValue = 0;
      }
      else if (feedbackValue > max) {
         feedbackValue = max;
      }

      // Set feedback value
      this.setState({
         feedbackValue: feedbackValue
      });
   }

   handleMouseUp () {
      var { feedbackValue } = this.state;

      // Unbind mouse events from document
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('mouseup', this.handleMouseUp);

      // Set value and clear mouse drag interaction states
      this.setState({
         anchor: undefined,
         feedbackValue: undefined,
         value: feedbackValue,
      });
   }

   render () {
      var { bgColor, fillColor, radius, tickColor, onClick } = this.props;
      var { feedbackValue, value } = this.state;
      var displayValue = feedbackValue === undefined ? value : feedbackValue;
      var hourPieCount = Math.ceil(displayValue / 60) || 1; // Get count of hour pies to be rendered
      var lastHour = (displayValue % 60) || (displayValue ? 60 : 0); // Get minutes for the last hour
      var hourPies = []; // Array of rendered hour pies

      // Build Hour Pies
      for (let i = 0; i < hourPieCount; i++) {
         var isLastHour = i + 1 >= hourPieCount;
         hourPies.push(
            <HourDuration
               key={i}
               minutes={isLastHour ? lastHour : 60}
               max={180}
               radius={140}
               fillColor={fillColor}
               bgColor={bgColor}
               tickColor={tickColor}
               radius={radius}
            />
         );
      }
      
      // Return rendered
      return (
         <div onClick={onClick} onMouseDown={this.handleMouseDown}>
            {hourPies}
         </div>
      );
   }
}

export default DurationInput;
