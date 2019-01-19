import React from 'react';
import {hashHistory} from 'react-router';
import PropTypes from 'prop-types';
import Loader from './loader.jsx';
import Alert from 'react-s-alert';
import Button from '@material-ui/core/Button';
import {withStyles} from '@material-ui/core/styles';
import cookie from "react-cookies";
import ReactQuill,{ Quill }  from 'react-quill'; // ES6
import { ImageUpload }  from '@rj12info/quillimageupload';
Quill.register('modules/imageUpload', ImageUpload);


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
    this.handleSave = this.handleSave.bind(this);
    this.state = {
      body: "",
      topics: [],
      error: "",
      loading: true,
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

  handleChange(html, delta) {
    this.setState({body: html});
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

  handleSave(e) {
    e.preventDefault();
    var body = this.state.body;
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
            hashHistory.push('article/edit/' + response.data.id + '?new=true');
          }
        });
    }
    else {
      Alert.error("Article Body, Title and Topic Information is required.");
    }
    this.setState({getApprovalUI: true})
  }

  handleKannadaClick() {
    $('#myModal').modal('show');
  }

  handleTransliterate(value) {
    this.setState({body: this.refs.transliterateTextarea.value});
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
                ref="title"
                className="form-control input-title"
                placeholder="Enter article title..."
              />
            </div>
          </div>
          <br/>
          <div className="row">
            <h5 className="col-md-8 text-left color-text" onClick={this.handleKannadaClick}><b>ಕನ್ನಡ ದಲ್ಲಿ ಬರೆಯಿತಿ</b></h5>
            <div className="col-md-12 new-article-form">
              <ReactQuill value={this.state.body}
                          theme="snow"
                          modules={this.modules}
                          formats={this.formats}
                          onChange={this.handleChange}/>
              <input id="my_input" type="hidden" value="" ref="body" onChange={this.handleSave}/>
              <br/>
              <label>Choose topic</label>
              <select className="form-control topic-select" ref="topic">
                {this.state.topics.map(topic => (
                  <option value={topic.id} key={topic.id}>{topic.name}</option>
                ))}
              </select>

              <br/>
              <br/>
              <div className="col-md-12 row">
              <button className="btn btn-default btn-block btn-lg" onClick={this.handleSave.bind(this)}>Save &amp; continue
              </button>
              </div>
            </div>
          </div>
          <br/>

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
                        <h1><b>Yayyyy!</b></h1>
                        <h2>ಕನ್ನಡ ದಲ್ಲಿ ಬರೆಯಿರಿ</h2>
                        <h5 onClick={this.handleTransliterateRefresh.bind(this)}>type english + spacebar ಇಂಗ್ಲೀಷ್ not showing? <u>Refresh browser</u></h5>
                      </div>
                      <div className="center-block">
                        <textarea ref="transliterateTextarea" onChange={this.handleTransliterate.bind(this)} id="transliterateTextarea" style={{width:'1000px',height:'300px'}}></textarea>
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

NewArticle.modules = {
  toolbar: [
    [{'header': '1'}, {'header': '2'}, {'font': []}],
    [{size: []}],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'},
      {'indent': '-1'}, {'indent': '+1'}],
    ['link', 'image', 'video'],
    ['clean'],
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
