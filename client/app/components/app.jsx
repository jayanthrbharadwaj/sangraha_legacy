import React from 'react';
import BrowseTopics from './browse_topics.jsx';
import Loader from './loader.jsx';
import {hashHistory} from 'react-router';
import Alert from 'react-s-alert';
import cookie from "react-cookies";

class App extends React.Component {

  constructor(props) {
    super(props);
    this.handleTopicClick = this.handleTopicClick.bind(this);
    this.state = { topics: [],topicId:null, loading: true, isLogin: false};
  }

  componentWillMount() {
    // if(cookie.load('google_email')=== undefined) {
    //   this.setState({isLogin:true})
    //   hashHistory.push('login');
    // } else {
    //   this.setState({isLogin:false})
    // }
  }

  componentDidMount() {
    var myHeaders = new Headers({
      "Content-Type": "application/x-www-form-urlencoded",
      "x-access-token": window.localStorage.getItem('userToken')
    });
    var myInit = { method: 'GET',
      headers: myHeaders,
    };
    var that = this;
    fetch('/api/topics',myInit)
      .then(function(response) {
        return response.json();
      })
      .then(function(response) {
        if(response.error.error)
          Alert.error(response.error.message);
        else {
          that.setState({topics: response.data})
        }
        that.setState({loading: false});
      });
  }

  handleTopicClick(id) {
    this.setState({topicId: id});
  }

  render () {
    var that = this;
    if (this.state.loading)
      return <Loader/>;
    else {
      return (
        <div>
          {!this.state.isLogin && <BrowseTopics topicChange={this.handleTopicClick} />}
          <div className="content container">
            {that.props.children}
          </div>
          <div className="footer center-align">
            <p className="help-block">Powered by <a href="http://matterwiki.com">Matterwiki</a></p>
          </div>
          <Alert stack={{limit: 3}} position='bottom'/>
        </div>

      );
    }
  }
}

export default App;
