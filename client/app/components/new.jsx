import React from 'react';
import {hashHistory} from 'react-router';
import PropTypes from 'prop-types';
import Loader from './loader.jsx';
import Alert from 'react-s-alert';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/core/styles';
import cookie from "react-cookies";
import ReactQuill from 'react-quill'; // ES6

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    fontSize: 30,
    lineHeight: 2.4
  },
  cardTitle: {
    marginTop: 16,
    fontSize: 24,
  },
  card: {
    marginTop: 16,
  },
  textLabelField: {
    fontSize: 20,
    lineHeight: 2.4
  },
  dense: {
    marginTop: 19,
  },
  menu: {
    width: 200,
  },
  button: {
    margin: theme.spacing.unit,
    marginTop: 19,
  },
});

class NewArticle extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {body: "", topics: [], error: "", loading: true, getApprovalUI: true, requestForApprovalSent: false};
  }

  handleChange(html) {
    this.setState({body: html});
  }

  componentDidMount() {
    var urlParams = new URLSearchParams(window.location.hash);
    console.log(urlParams.get('author'));
    var entries = urlParams.entries();
    var authorValue
    for(var pair of entries) {
      console.log("pair"+pair[0]+" ", "value"+pair[1]);
      if(pair[0].indexOf("author")) {
        authorValue = pair[1]
      }
    }
    if (authorValue != null && authorValue.trim().length > 0) {
      this.setState({approverWindow:true, getApprovalUI:false, requestForApprovalSent:false})
    }
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
          that.setState({topics: response.data})
        }
        that.setState({loading: false});
      });
  }

  handleChange(event) {
  };

  handleGetApproval(e) {
      var myHeaders = new Headers({
        "Content-Type": "application/x-www-form-urlencoded",
        "x-access-token": window.localStorage.getItem('userToken')
      });
      var myInit = {
        method: 'PUT',
        headers: myHeaders,
        body: "id=admin@admin.com"
      };
      var that = this;
      fetch('/api/approvals/', myInit)
        .then(function (response) {
          return response.json();
        })
        .then(function (response) {
          if (response.error.error)
            Alert.error(response.error.message);
          else {
            Alert.success("Hash successfull created")
          }
        });
  }

  handleFinalSave(e) {
    var body = this.body;
    var title = this.refs.title.value;
    var topicId = this.refs.topic.value;
    if (body && title && topicId)
    {
      var myHeaders = new Headers({
        "Content-Type": "application/x-www-form-urlencoded",
        "x-access-token": window.localStorage.getItem('userToken')
      });
      var myInit = {
        method: 'POST',
        headers: myHeaders,
        body: "approved=false&title=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(body) + "&topic_id=" + topicId + "&user_id=" + cookie.load("user_id")
      };
      fetch('/api/articles/', myInit)
        .then(function (response) {
          return response.json();
        })
        .then(function (response) {
          if (response.error.error)
            Alert.error(response.error.message);
          else {
            var myInit = {
              method: 'PUT',
              headers: myHeaders,
              //TODO update author_email, author_name, article_id from login
              body: "&user_id=" + cookie.load("user_id")+"&article_id="+response.data.id+"&author_name=admin&author_email=admin@admin.com&approver_email=&approver_name=&"
            };
            fetch('/api/approvals/save', myInit)
              .then(function (response) {
                return response.json();
              })
              .then(function (response) {
                if (response.error.error)
                  Alert.error(response.error.message);
                else {
                  Alert.error("Article saved. Sent an email for your reference");
                }
              });
          }
        });
    }
    else {
      Alert.error("Article Body, Title and Topic Information is required.");
    }

    this.setState({loading: false, getApprovalUI: false, requestForApprovalSent: true});
  }

  handleSubmit(e) {
    e.preventDefault();
    var body = this.body;
    var title = this.refs.title.value;
    var topicId = this.refs.topic.value;
    if (body && title && topicId) {
      var myHeaders = new Headers({
        "Content-Type": "application/x-www-form-urlencoded",
        "x-access-token": window.localStorage.getItem('userToken')
      });
      var myInit = {
        method: 'POST',
        headers: myHeaders,
        body: "title=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(body) + "&topic_id=" + topicId + "&user_id=" + cookie.load("user_id")
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
            Alert.success("Article has been successfully saved")
            hashHistory.push('article/' + response.data.id + '?new=true');
          }
        });
    }
    else {
      Alert.error("Article Body, Title and Topic Information is required.");
    }
    this.setState({getApprovalUI: true})
  }

  render() {
    const {classes} = this.props;
    if (this.state.loading)
      return <Loader/>;
    else
      return (
        <div className="new-article">
          <div className="row">
            <div className="col-md-12">
              <input
                ref="title"
                className="form-control input-title"
                placeholder="Enter article title..."
              />
            </div>
          </div>
          <br/>
          <div className="row">
            <div className="col-md-12 new-article-form">
              <ReactQuill value={this.state.body}
                          theme="snow"
                          modules={NewArticle.modules}
                          onChange={this.handleChange}/>
              <input id="my_input" type="hidden" value="" ref="body" onChange={this.handleChange}/>
              <br/>
              <label>Choose topic</label>
              <select className="form-control topic-select" ref="topic">
                {this.state.topics.map(topic => (
                  <option value={topic.id} key={topic.id}>{topic.name}</option>
                ))}
              </select>

              {this.state.getApprovalUI && <div><TextField
                id="standard-name"
                placeholder="ನಿಮ್ಮ ಆಧ್ಯಾತ್ಮ ಗುರುಗಳಿಂದ ಸಹಿ ಪಡೆಯಿರಿ"
                helperText="Please don't misuse this feature!"
                label="Name of your approver in English"
                fullWidth
                value={this.state.name}
                onChange={this.handleChange('name')}
                margin="normal"
                InputLabelProps={{
                  className: classes.textLabelField,
                }}
                InputProps={{
                  className: classes.textField,
                }}
              />
                <TextField
                  id="standard-name"
                  placeholder="Please enter valid Email Id"
                  helperText="ನಿಮ್ಮ ಲೇಖನ ಓದಿದ ನಂತರ ಇವರು ಸಹಿ/ approve ಮಾಡುತ್ತಾರೆ"
                  label="Email Id of the approver"
                  fullWidth
                  value={this.state.name}
                  onChange={this.handleChange('name')}
                  margin="normal"
                  InputLabelProps={{
                    className: classes.textLabelField,
                  }}
                  InputProps={{
                    className: classes.textField,
                  }}
                />
                <Button fullWidth variant="contained" size="large" color="primary"
                        onClick={this.handleSubmit.bind(this)} className={classes.button}>
                  Save
                </Button>
                <Button fullWidth variant="contained" size="large" color="secondary"
                        onClick={this.handleGetApproval.bind(this)} className={classes.button}>
                  Get Approval
                </Button>
              </div>}
              {this.state.requestForApprovalSent &&
              <Card className={classes.card}>
                <CardContent>
                  <Typography className={classes.cardTitle} color="textSecondary">
                    Want to further edit? please keep this link handy
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Learn More</Button>
                </CardActions>
              </Card>
              }
            </div>
          </div>
          <br/>
          <br/>
          {this.state.getApprovalUI && <div className="col-md-12">
            <button className="btn btn-default btn-block btn-lg" onClick={this.handleFinalSave}>Get Approval</button>
          </div>}

        </div>
      );
  }
}

NewArticle.modules = {
  toolbar: [
    [{'header': '1'}, {'header': '2'}, {'font': []}],
    [{size: []}],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'},
      {'indent': '-1'}, {'indent': '+1'}],
    ['link', 'image', 'video'],
    ['clean']
  ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  }
}

NewArticle.formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image', 'video'
]
NewArticle.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(NewArticle);
