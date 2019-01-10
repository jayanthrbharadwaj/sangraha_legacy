import React from 'react';
import BrowseArticles from './browse_articles.jsx';
import {hashHistory} from 'react-router';
import Loader from './loader.jsx';

class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = {topicId: '1', loading: true};
  }



  componentDidMount() {
    this.setState({loading: false});
  }


  render () {
    if(this.state.loading)
      return <Loader/>;
    else
    return(<div>
          <BrowseArticles topicId={this.state.topicId} />
    </div>);
  }
}

export default Home;
