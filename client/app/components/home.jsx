import React from 'react';
import {hashHistory} from 'react-router';
import Loader from './loader.jsx';

class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = {topicId: '0', loading: true};
  }



  componentDidMount() {
    this.setState({loading: false});
  }


  render () {
    if(this.state.loading)
      return <Loader/>;
  }
}

export default Home;
