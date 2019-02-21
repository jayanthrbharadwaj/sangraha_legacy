import React from 'react';
import {hashHistory} from 'react-router';
import PropTypes from 'prop-types';
import Alert from 'react-s-alert';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/core/styles';
import ReactQuill,{ Quill }  from 'react-quill'; // ES6
import { ImageUpload }  from '@rj12info/quillimageupload';
Quill.register('modules/imageUpload', ImageUpload);

import Loader from './loader.jsx';
import cookie from "react-cookies";

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

class EditArticle extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.state = {
      body: "", title: "", topic_id: "", topics: [], loading: true, getApprovalUI: true, authorUrlHash:"",
      requestForApprovalSent: false
    };

    this.modules = {
      imageUpload: {
        url: 'https://api.imgur.com/3/image', // server url. If the url is empty then the base64 returns
        method: 'POST', // change query method, default 'POST'
        name: 'image', // custom form name
        withCredentials: false, // withCredentials
        headers: {
          Authorization: 'Client-ID 475e317e867ddce',
        },
        // personalize successful callback and call next function to insert new url to the editor
        callbackOK: (serverResponse, next) => {
          next(serverResponse.data.link);
        },
        // personalize failed callback
        callbackKO: serverError => {
          alert(serverError);
        },
        // optional
        // add callback when a image have been chosen
        checkBeforeSend: (file, next) => {
          console.log(file);
          next(file); // go back to component and send to the server
        }
      },
      toolbar: {container:[
          [{'header': '1'}, {'header': '2'}, {'font': []}],
          [{size: []}],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{'list': 'ordered'}, {'list': 'bullet'},
            {'indent': '-1'}, {'indent': '+1'}],
          ['link', 'image', 'video'],
          ['clean'],
        ]},
      clipboard: {
        // toggle to add extra line breaks when pasting HTML:
        matchVisual: false,
      }
    }

    this.formats = [
      'header', 'font', 'size',
      'bold', 'italic', 'underline', 'strike', 'blockquote',
      'list', 'bullet', 'indent',
      'link', 'image', 'video'
    ]
  }

  handleChange(html) {
    this.setState({body: html});
  }

  componentDidUpdate() {
    if (this.props.location.query.new) {
      $('#myModal').modal('show');
    }
  }

  handleSave(e) {
    e.preventDefault();
    var body = this.state.body;
    var title = this.refs.title.value;
    var topicId = this.refs.topic.value;
    var what_changed = this.refs.what_changed.value;
    if (body && title && topicId && what_changed) {
      var myHeaders = new Headers({
        "Content-Type": "application/x-www-form-urlencoded",
        "x-access-token": window.localStorage.getItem('userToken')
      });
      var myInit = {
        method: 'PUT',
        headers: myHeaders,
        body: "id=" + this.props.params.articleId + "&title=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(body) + "&topic_id=" + topicId + "&user_id=" + window.localStorage.getItem("userId") + "&what_changed=" + what_changed
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
            hashHistory.push('article/edit/' + response.data.id);
          }
        });
    }
    else {
      Alert.error("Article Body, Title, Topic and Change Info is required.");
    }
  }

  componentWillMount() {
    if(cookie.load('google_email') === undefined) {
      hashHistory.push('login');
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
          that.setState({body: response.data.body, title: response.data.title, topic_id: response.data.topic_id})
        }
        that.setState({loading: false});
      });
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
      });
  }


  handleEmailChange(event) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(String(event.target.value).toLowerCase())) {
      this.setState({emailFormatError: '', approverEmailEntered: event.target.value})
    } else {
      this.setState({emailFormatError: 'Invalid format: abc@abc.com'})
    }
  }

  handleNameChange(event) {
    if (event.target.value != null && event.target.value.length > 0) {
      this.setState({nameFormatError: '', approverNameEntered: event.target.value})
    } else {
      this.setState({nameFormatError: 'Name cannot be empty'})
    }
  }

  handleGetApproval(e) {
    var body = this.state.body;
    var title = this.refs.title.value;
    var topicId = this.refs.topic.value;
    var that = this
    if (body && title && topicId) {
      var myHeaders = new Headers({
        "Content-Type": "application/x-www-form-urlencoded",
      });
      var myInit = {
        method: 'PUT',
        headers: myHeaders,
        body: "id=" + this.props.params.articleId + "&approved=0&title=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(body) + "&topic_id=" + topicId + "&user_id=" + cookie.load("user_id")
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
              body: "&user_id=" + cookie.load("user_id") + "&article_id=" + response.data.id + "&author_name=" + cookie.load('google_name') + "&author_email=" + cookie.load('google_email') + "&approver_email=" + that.state.approverEmailEntered + "&approver_name=" + that.state.approverNameEntered
            };
            fetch('/api/approvals', myInit)
              .then(function (response) {
                return response.json();
              })
              .then(function (response) {
                if (response.error.error)
                  Alert.error(response.error.message);
                else {
                  Alert.success("Article saved. Sent an email for your reference");
                }
                that.setState({loading: false, getApprovalUI: false, requestForApprovalSent: true, authorUrlHash:window.location.origin+"/#/article/"+response.data.article_id+"?author="+ response.data.approver_url_hash});
              });
          }
        });
    }
    else {
      Alert.error("Article Body, Title and Topic Information is required.");
    }

  }


  handleKannadaClick() {
    pramukhIME.enable();
    $('#myModalTransliterate').modal('show');
    $('#myModalTransliterate').on('hidden.bs.modal', function () {
      // do something…
      pramukhIME.disable();
    })
  }

  handleTransliterate(value) {
    this.setState({body: this.state.body.concat(this.refs.transliterateTextareaEdit.value)});
  }

  handleTransliterateRefresh(value) {
    window.location.reload()
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
                onChange={this.handleChange}
                ref="title"
                className="form-control input-title"
                value={this.state.title}
              />
            </div>
          </div>
          <br/>
          <div className="row">
            <h5 className="col-md-8 text-left color-text" onClick={this.handleKannadaClick.bind(this)}><b>ಕನ್ನಡ ದಲ್ಲಿ ಬರೆಯಿತಿ</b></h5>
            <div className="col-md-12 new-article-form">
              <ReactQuill value={this.state.body}
                          theme="snow"
                          modules={this.modules}
                          formats={this.formats}
                          onChange={this.handleChange}/>
              <br/>
              <label>Choose topic</label>
              <select className="form-control topic-select" ref="topic" defaultValue={this.state.topic_id}>
                {this.state.topics.map(topic => (
                  <option value={topic.id} key={topic.id}>{topic.name}</option>
                ))}
              </select>
              <br/>
              <div className="whatwrapper">
                <label>What improvements did you make in this edit?</label>
                <textarea
                  ref="what_changed"
                  className="form-control what_changed what"
                  id="what"
                  placeholder="Example: Fixed a typo. It's grammer not grammar"
                />
                <p className="help-block">Keep it short and descriptive :)</p>
              </div>
              <br/>
            </div>

            {this.state.getApprovalUI && <div><TextField
              id="standard-name"
              placeholder="ನಿಮ್ಮ ಆಧ್ಯಾತ್ಮ ಗುರುಗಳಿಂದ ಸಹಿ ಪಡೆಯಿರಿ"
              helperText="Please don't misuse this feature!"
              label="Name of your approver in English"
              fullWidth
              errorText={this.state.nameFormatError}
              value={this.state.name}
              onChange={this.handleNameChange.bind(this)}
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
                errorText={this.state.emailFormatError}
                value={this.state.name}
                onChange={this.handleEmailChange.bind(this)}
                margin="normal"
                InputLabelProps={{
                  className: classes.textLabelField,
                }}
                InputProps={{
                  className: classes.textField,
                }}
              />
            </div>}
            {this.state.requestForApprovalSent &&
            <div className="row">
              <div className="col-md-12">
                <Card className={classes.card}>
                  <CardContent>
                    <Typography className={classes.cardTitle} color="textSecondary">
                      Further editing is allowed? please keep this link handy
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" href={this.state.authorUrlHash}>Open link</Button>
                  </CardActions>
                </Card>
              </div>
            </div>
            }

            <div className="row">
              <div className="col-md-12">
                <button className="btn btn-default btn-block btn-lg" onClick={this.handleSave}>Save Article</button>
              </div>
              {this.state.getApprovalUI && <div className="col-md-12"><br/>
                <br/>
                <button className="btn btn-default btn-block btn-lg" onClick={this.handleGetApproval.bind(this)}>Get
                  Approval
                </button>
              </div>}
            </div>
          </div>


          <div className="modal modal-fullscreen fade" id="myModal" tabIndex="-1" role="dialog"
               aria-labelledby="myModalLabel">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span
                    aria-hidden="true">&times;</span></button>
                </div>
                <div className="modal-body">
                  <center>
                    <div className="row">

                      <div className="col-md-6 col-sd-12">
                        <h1><b>Yayyyy!</b></h1><h3>Your article has been updated</h3>
                        <br/>
                        <br/>
                        <button type="button" className="btn btn-default btn-block btn-lg" data-dismiss="modal">That's
                          great
                        </button>
                      </div>
                    </div>
                  </center>
                </div>

              </div>
            </div>
          </div>


          <div className="modal modal-fullscreen fade" id="myModalTransliterate" tabIndex="-1" role="dialog"
               aria-labelledby="myModalLabel">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span
                    aria-hidden="true">&times;</span></button>
                </div>
                <div className="modal-body">
                  <center>
                    <div className="row">

                      <div className="col-md-6 col-sd-12">
                        <h1><b>Yayyyy!</b></h1>
                        <h2>ಕನ್ನಡ ದಲ್ಲಿ ಬರೆಯಿರಿ</h2>
                        <h5 onClick={this.handleTransliterateRefresh.bind(this)}>type english + spacebar ಇಂಗ್ಲೀಷ್ not showing? <u>Refresh browser</u></h5>
                      </div>
                      <div className="center-block">
                        <textarea ref="transliterateTextareaEdit" onChange={this.handleTransliterate.bind(this)} id="transliterateTextareaEdit" style={{width:'1000px',height:'300px'}}></textarea>
                      </div>
                      <br/>
                      <br/>
                      <br/>
                      <div className="col-md-6">
                        <button type="button" className="btn btn-default btn-block btn-lg" data-dismiss="modal">Continue formatting</button>
                      </div>
                    </div>
                  </center>
                </div>

              </div>
            </div>
          </div>
        </div>
      );
  }
}

EditArticle.formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image', 'video'
]
EditArticle.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EditArticle);
