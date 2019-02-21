import React from 'react';
import BrowseTopics from './browse_topics.jsx';
import Loader from './loader.jsx';
import Alert from 'react-s-alert';
import cookie from "react-cookies";
import {hashHistory} from 'react-router';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {topics: [], loading: true, isLoggedin: false};
  }

  componentWillMount() {
    if (cookie.load('google_email') === undefined) {
      this.setState({isLoggedin: false})
      hashHistory.push('login');
    } else {
      this.setState({isLoggedin: true})

    }
  }

  componentDidMount() {
    var myHeaders = new Headers({
      "Content-Type": "application/x-www-form-urlencoded",
      "x-access-token": window.localStorage.getItem('userToken')
    });
    var myInit = {
      method: 'GET',
      headers: myHeaders,
    };
    var that = this;
    fetch('/api/topics', myInit)
      .then(function (response) {
        return response.json();
      })
      .then(function (response) {
        if (response.error.error)
          Alert.error(response.error.message);
        else {
          that.setState({loading: false, topics: response.data})
          if (window.location.href.indexOf("article") > 0) {
            this.setState({loading: false});
          } else {
            hashHistory.push("/topic/0")
          }
        }
        that.setState({loading: false});
      });
  }

  render() {
    var that = this;
    if (this.state.loading)
      return <Loader/>;
    else {
      return (
        <div>
          {<BrowseTopics topics={this.state.topics}/>}
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
