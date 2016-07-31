import React from 'react';
import ReactDOM from 'react-dom';
import Promise from 'bluebird';
import http from 'libs/http';
import { $background, $content } from 'components/styles';
import { TextInput } from 'components/forms/TextInput';
import { getThrottledHandler } from 'libs/event-handler';

const giphyUrl = 'api.giphy.com/v1/gifs/search?q='
const apiKey = '&api_key=dc6zaTOxFJmzC';

export default class Lif extends React.Component {
   constructor (props) {
      super(props);
      this.state = {};
      this.handleInputChange = getThrottledHandler(this.handleInputChange.bind(this), 500);
      this.incrementIndex = this.incrementIndex.bind(this);
   }

   /*************************************************************
    * EVENT HANDLING
    *************************************************************/
   handleInputChange (val) {
      console.log(val);
      http(`http://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(val) + apiKey}`).requestJson().then(res => {
         if (this.nextIndex) {
            clearTimeout(this.nextIndex);
         }
         // SET TIMER
         var index = 0;
         // Set data
         this.setState({
            ...res,
            index,
         });
         this.nextIndex = setTimeout(this.incrementIndex, 5000);
      });
   }

   incrementIndex () {
      this.setState((prevState) => {
         return { index: (prevState.index + 1 === prevState.data.length ? 0 : prevState.index + 1) };
      });
      this.nextIndex = setTimeout(this.incrementIndex, 5000);
   }

   /*************************************************************
    * RENDERING
    *************************************************************/
   render () {
      var { data, index, meta } = this.state;
      var gif;
      //embed_
      if (data && data.length) {
         gif = <div style={{ display: 'flex', flex: '1', height: '100%', width: '100vw' }}><iframe src={data[index].embed_url} style={{ width: '100%' }} /></div>;
      } 
      
      return (
         <div style={{ display: 'flex', 'flexDirection': 'column', 'flexWrap': 'nowrap', height: '100vh', width: '100vw' }}>
            <TextInput path="caption" onChange={this.handleInputChange} style={{ width: '100%', height: '1.5rem' }} />
            {gif}
         </div>
      );
   }
}

global.APP = Lif;
global.React = React;
global.ReactDOM = ReactDOM;
