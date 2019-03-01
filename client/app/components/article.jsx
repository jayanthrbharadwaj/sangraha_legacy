import React from 'react';
import {Link, hashHistory} from 'react-router';
import PropTypes from 'prop-types';
import Loader from './loader.jsx';
import {withStyles} from '@material-ui/core/styles';
import Alert from 'react-s-alert';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import GoogleLogin from 'react-google-login';
import cookie from "react-cookies";
import Disqus from 'disqus-react';

const styles = theme => ({
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    marginBottom: 4,
    fontSize: 24,
  },
  pos: {
    marginBottom: 12,
    fontSize: 24,
  },
  button: {
    margin: theme.spacing.unit,
  },
});

class ViewArticle extends React.Component {
  constructor(props) {
    super(props);
    this.deleteArticle = this.deleteArticle.bind(this);
    this.componentUnderDeeplink = this.componentUnderDeeplink.bind(this)

    this.state = {
      article: {},
      loading: true,
      approverWindow: false,
      approved: false,
      isUserLoggedOut: false,
      authorInfo: null
    };

  }

  componentDidUpdate() {
    if (this.props.location.query.new) {
      $('#myModal').modal('show');
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
    fetch('/api/articles/' + this.props.params.articleId, myInit)
      .then(function (response) {
        return response.json();
      })
      .then(function (response) {
        if (response.error.error)
          Alert.error(response.error.message);
        else {
          cookie.remove('isGoogleLoggedIn')
          if (cookie.load("google_email") === undefined) {
            that.setState({isUserLoggedOut: true, article: response.data})
          } else {
            that.setState({article: response.data})
            that.componentUnderDeeplink()
          }
        }
        that.setState({loading: false})
      });

    this.disqusShortname = 'https-sangraha-herokuapp-com';
    this.disqusConfig = {
      url: "http://example.com",
      identifier: this.props.params.articleId,
      title: this.state.article.title,
    };
  }

  componentUnderDeeplink() {
    var urlParams = new URLSearchParams(window.location.hash);
    console.log(urlParams.get('author'));
    var entries = urlParams.entries();
    var authorValue
    for (var pair of entries) {
      console.log("pair" + pair[0] + " ", "value" + pair[1]);
      if (pair[0].indexOf("author")) {
        authorValue = pair[1]
      }
    }
    if (authorValue != null && authorValue.trim().length > 0) {
      this.findApprovals(authorValue).bind(this)
    }
  }

  findApprovals(authorValue) {
    //TODO get approval status based on url param
    var urlParams = new URLSearchParams(window.location.search);
    var token = authorValue
    // token="raghu@gmail.com"
    var myHeaders = new Headers({
      "Content-Type": "application/x-www-form-urlencoded",
      "referrerToken": authorValue
    });
    var tokenInit = {
      method: 'GET',
      headers: myHeaders
    };

    var that = this;
    if (token != null) {
      fetch('/api/approvals?articleId=' + that.props.params.articleId, tokenInit)
        .then(function (response) {
          return response.json();
        })
        .then(function (response) {
          if (response.error.error)
            Alert.error(response.error.message);
          else {
            if (response.data != null) {
              if (response.data.approve_status == 1) {
                that.setState({loading: false, approverWindow: false});
                Alert.success("Article already approved");
              } else if (response.data.approver_email == cookie.load('google_email')) {
                that.setState({loading: false, approverWindow: true});
                that.setState({authorInfo: response.data})
              } else {
                that.setState({loading: false})
              }
            } else {
              Alert.error("This wiki should not be viewed. It has not been Approved and published");
            }
          }
        });
    }
  }

  handleApproveArticle() {
    this.setState({loading: false, approved: false});
    var that = this
    var myHeaders = new Headers({
      "Content-Type": "application/x-www-form-urlencoded",
    });
    var myInit = {
      method: 'PUT',
      //TODO update author_email, author_name, article_id from login
      headers: myHeaders,
      body: "article_id=" + this.props.params.articleId
    };
    fetch('/api/approvals/approved', myInit)
      .then(function (response) {
        return response.json();
      })
      .then(function (response) {
        if (response.error.error)
          Alert.error(response.error.message);
        else {
          that.setState({loading: false, approved: true, approverWindow: false});
          Alert.error("Article Approved. Sent an email for your reference");
        }
      });
  }

  deleteArticle(e) {
    e.preventDefault();
    var myHeaders = new Headers({
      "Content-Type": "application/x-www-form-urlencoded",
      "x-access-token": window.localStorage.getItem('userToken')
    });
    var myInit = {
      method: 'DELETE',
      headers: myHeaders,
      body: "id=" + this.state.article.id
    };
    var that = this;
    fetch('/api/articles/', myInit)
      .then(function (response) {
        return response.json();
      })
      .then(function (response) {
        if (response.error.error)
          Alert.error(response.error.message);
        else {
          Alert.success("Article has been deleted");
          hashHistory.push('home');
        }
      });
  }

  handleNewComment(comment) {
    console.log(comment.text);
  }

  onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    cookie.save('accessToken', googleUser.accessToken, {path: '/'})
    var user = {
      name: profile.getName(),
      email: profile.getEmail(),
      google_profileImageUrl: profile.getImageUrl(),
      google_id: profile.getId(),
      google_access_token: googleUser.accessToken
    };
    this.addUser(user)
  }

  addUser(user) {
    var myHeaders = new Headers({
      "Content-Type": "application/x-www-form-urlencoded",
      "x-access-token": window.localStorage.getItem('userToken')
    });
    var myInit = {
      method: 'POST',
      headers: myHeaders,
      body: "name=" + user.name + "&email=" + user.email + "&google_access_token=" + user.google_access_token + "&google_id=" + user.google_id + "&google_profileImageUrl" + user.google_profileImageUrl
    };
    var that = this;
    fetch('/api/users/oauth', myInit)
      .then(function (response) {
        return response.json();
      })
      .then(function (response) {
        if (response.error.error)
          Alert.error(response.error.message);
        else {
          that.setState({isUserLoggedOut: false})
          Alert.success(response.data.name + '!! Welcome back to Madhwa Sangraha');
          cookie.save("google_email", response.data.email)
          cookie.save("isGoogleLoggedIn", true)
          that.componentUnderDeeplink()
        }
      });
  }

  onSignFailure(error) {
    Alert.success('User has been updated');
  }

  getRawMarkupBody() {
    return {__html: this.state.article.body};
  }


  render() {
    const {classes} = this.props;
    if (this.state.loading)
      return <Loader/>;
    else if (this.state.article && this.state.article.topic && this.state.article.user) {
      return (<div className="article-list">
          <div className="row">
            <div className="col-md-9">
              <Card className={classes.card}>
                <CardContent>
                  <u><Typography variant="headline" className={classes.title} color="textSecondary">
                    {this.state.article.title}
                  </Typography></u>
                  <Typography className={classes.pos} color="textSecondary"
                              dangerouslySetInnerHTML={this.getRawMarkupBody()}>
                  </Typography>
                  <Typography variant="h6" component="p" color="textSecondary">
                    Last updated on {new Date(this.state.article.updated_at.replace(' ','T')).toDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Learn More</Button>
                </CardActions>
              </Card>

              {this.state.approverWindow && <button className="btn btn-default btn-block btn-lg" onClick={this.handleApproveArticle.bind(this)}>Approve Article</button>}
              {this.state.isUserLoggedOut && <GoogleLogin
                clientId="707850557465-1bgam53d1v1cer3ebrvj0gfv38dh61ms.apps.googleusercontent.com"
                buttonText="Login"
                onSuccess={this.onSignIn.bind(this)}
                onFailure={this.onSignFailure.bind(this)}
              />}
            </div>
            <div className="col-md-3 article-sidebar">
              <div className="sidebar-block">
                <div className="sidebar-title">Filed under</div>
                <h2 className="color-text"><b>{this.state.article.topic.name}</b></h2>
              </div>
              <div className="sidebar-block">
                <div className="sidebar-title">Last Updated By</div>
                <h3><b>{this.state.article.user.name}</b></h3>
                <p>{this.state.article.user.about}</p>
              </div>
              <div className="sidebar-block">
                <div className="sidebar-title">What Changed in last edit</div>
                {(this.state.article.what_changed) ? <h4>{this.state.article.what_changed}</h4> :
                  <h4>No information available</h4>}
              </div>
              <Link to={'/article/edit/' + this.state.article.id}
                    className="btn btn-default btn-block btn-lg">Edit</Link>
              <Link to={'/article/history/' + this.state.article.id}
                    className="btn btn-default btn-block btn-lg">History</Link>
              {cookie.load('google_email') === 'rj12info@gmail.com' &&
              <button className="btn btn-default btn-block btn-lg" onClick={this.deleteArticle}>Delete</button>}
            </div>
          </div>
          <div className="addthis_inline_share_toolbox"></div>
          <Disqus.DiscussionEmbed shortname={this.disqusShortname} config={this.disqusConfig}>
            Comments
          </Disqus.DiscussionEmbed>
        </div>
      );
    }
  }
}

ViewArticle.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ViewArticle);
