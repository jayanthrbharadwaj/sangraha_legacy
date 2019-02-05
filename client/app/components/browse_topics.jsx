import React from 'react';
import Loader from './loader.jsx';
import {Link, hashHistory} from 'react-router';
import Alert from 'react-s-alert';
import cookie from "react-cookies";

class BrowseTopics extends React.Component {
  constructor(props) {
    super(props);
    this.handleLogout = this.handleLogout.bind(this);
    this.state = {topics: [], loading: true};
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
          console.log("topics " + JSON.stringify(response.data))
          that.setState({topics: response.data})
        }
        that.setState({loading: false});
      });
  }

//t = current time
//b = start value
//c = change in value
//d = duration

  handleLogout() {
    cookie.remove('google_email')
    cookie.remove('google_name')
    cookie.remove('user_id')
    hashHistory.push("/home")
    const auth2 = gapi.auth2.getAuthInstance()
    if (auth2 != null) {
      auth2.signOut().then(this.handleGoogleLogout)
    }

  }

  handleGoogleLogout() {
    window.localStorage.setItem('userToken', '');
    hashHistory.push("/login")
    Alert.success("You've been successfully logged out");
  }

  render() {
    if (this.state.loading)
      return <Loader/>;
    if (this.state.topics.length < 1) {
      return <p className="help-block center-align">There are no topics created yet</p>;
    }
    else {
      return (
        <nav className="navbar container-fluid navbar-default">

          <div className="navbar-header">

            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse"
                    data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <Link to="/" className="navbar-brand">
              <img src="../assets/logo.png"></img>
            </Link>
          </div>

          <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul className="nav navbar-nav navbar-right">
              {cookie.load('google_email') === 'rj12info@gmail.com'&&
              <li><Link to="admin" className="">Admin
              </Link>
              </li>
              }
              <li className="lead"><Link to="article/new" className="">New Article
              </Link>
              </li>
            </ul>
            <ul className="nav navbar-nav navbar-left">
              {this.state.topics.map(topic => (
                <li data-toggle="tooltip" data-placement="bottom" title={topic.description}><Link
                  to={"topic/" + topic.id} className=""><a href="#" className="list-group-item dropdown-toggle">
                  <h4 className="list-group-item-heading">{topic.name}</h4></a></Link>
                </li>
              ))}
              <li>
                <a href="" onClick={this.handleLogout}>Logout</a>
              </li>
            </ul>
            <hr className="article-separator"></hr>
          </div>

        </nav>);
    }
  }
}

export default BrowseTopics;
