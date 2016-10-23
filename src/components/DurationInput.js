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
      // Still down
      if (this.state.anchor) {
         return;
      }
      // Place anchor for relative position to value mapping adjustment
      this.setState({
         anchor: e.pageX,
         feedbackValue: this.state.value,
      });

      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
   }

   handleMouseMove (e) {
      var { max } = this.props;
      var { anchor, value } = this.state;

      if (this.state.anchor) {
         var feedbackValue = value + (e.pageX - anchor);
         if (feedbackValue < 0) {
            feedbackValue = 0;
         }
         else if (feedbackValue > max) {
            feedbackValue = max;
         }
         this.setState({
            feedbackValue: feedbackValue
         });
      }
   }

   handleMouseUp () {
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('mouseup', this.handleMouseUp);
      this.setState({
         anchor: undefined,
         feedbackValue: undefined,
         value: this.state.feedbackValue,
      });
   }

   render () {
      var { bgColor, fillColor, radius, tickColor, onClick } = this.props;
      var { feedbackValue, value } = this.state;
      var displayValue = feedbackValue === undefined ? value : feedbackValue;
      var hourDisplaysCount = Math.ceil(displayValue / 60) || 1;
      var lastHour = displayValue % 60;
      var hourDisplays = [];
      for (let i = 0; i < hourDisplaysCount; i++) {
         var isLastHour = i + 1 >= hourDisplaysCount;
         var key = i; // isLastHour ? 'last' : i;
         hourDisplays.push(
            <HourDuration
               key={key}
               minutes={isLastHour ? lastHour || (displayValue ? 60 : 0) : 60}
               max={180}
               radius={140}
               fillColor={fillColor}
               bgColor={bgColor}
               tickColor={tickColor}
               radius={radius}
            />
         );
      }
      return (
         <div onClick={onClick} onMouseDown={this.handleMouseDown}>
            {hourDisplays}
         </div>
      );
   }
}

export default DurationInput;
