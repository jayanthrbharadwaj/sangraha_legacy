import React from 'react';
import Loader from './loader.jsx';
import {hashHistory, Link} from 'react-router';
import Alert from 'react-s-alert';
import cookie from "react-cookies";
import {withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

const styles = theme => ({
  root: {
    width: '100%',
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  tabsRoot: {
    borderBottom: '1px solid #e8e8e8',
  },
  tabsIndicator: {
    backgroundColor: '#ff0066',
  },
  tabRoot: {
    textTransform: 'initial',
    minWidth: 72,
    fontSize:15,
    marginRight:10,
    fontWeight: theme.typography.fontWeightRegular,
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:hover': {
      color: '#ff0066',
      opacity: 1,
    },
    '&$tabSelected': {
      color: '#ff0066',
      fontWeight: theme.typography.fontWeightMedium,
    },
    '&:focus': {
      color: '#ff0066',
    },
  },

  tabSelected: {},
  typography: {
    padding: theme.spacing.unit * 3,
  },
});


class BrowseTopics extends React.Component {
  constructor(props) {
    super(props);
    this.handleLogout = this.handleLogout.bind(this);
    this.state = {loading: false, value:0, selectedTopic:{}};
  }

  handleChange(event, value) {
    this.setState({selectedTopic:this.props.topics[value], value:value})
    hashHistory.push("/topic/"+ value)
  }

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
    const { classes, topics } = this.props;
    const { value } = this.state;
    if (this.state.loading)
      return <Loader/>;
    if (topics.length < 1) {
      return <p className="help-block center-align">There are no topics created yet</p>;
    }
    else {
      return (
        <div>

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
              {cookie.load('google_email') === 'rj12info@gmail.com' &&
              <li><Link to="admin" className="">Admin
              </Link>
              </li>
              }
              <li className="lead"><Link to="article/new" className="">New Article
              </Link>
              </li>
              <li>
                <a href="" onClick={this.handleLogout}>Logout</a>
              </li>
            </ul>
          </div>
          <AppBar position="static" color="default">
            <Tabs
              value={this.state.value}
              onChange={this.handleChange.bind(this)}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="on"
              classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}>
              {topics.map(topic => (
                <Tab label={topic.name} classes={{ root: classes.tabRoot, selected: classes.tabSelected }}/>

              ))}
            </Tabs>
          </AppBar>
        </div>

      );
    }
  }
}

export default withStyles(styles)(BrowseTopics);
