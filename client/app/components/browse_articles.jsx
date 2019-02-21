import React from 'react';
import Loader from './loader.jsx';
import {Link, hashHistory} from 'react-router';
import Alert from 'react-s-alert';


class BrowseArticles extends React.Component {
  constructor(props) {
    super(props);
    this.state = { articles: [], url: "/api/articles", loading: true};
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
    var url = '/api/topic/'+this.props.params.topicId+'/articles';
    fetch(url,myInit)
    .then(function(response) {
      return response.json();
    })
    .then(function(response) {
      if(response.error.error)
        Alert.error(response.error.message);
      else {
        that.setState({articles: response.data})
      }
      that.setState({loading: false});
    });
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.params.topicId == this.props.params.topicId) {
      return
    }
    var myHeaders = new Headers({
        "Content-Type": "application/x-www-form-urlencoded",
        "x-access-token": window.localStorage.getItem('userToken')
    });
    var myInit = { method: 'GET',
               headers: myHeaders,
               };
    var that = this;
    var url = '/api/topic/'+nextProps.params.topicId+'/articles';
    fetch(url,myInit)
    .then(function(response) {
      return response.json();
    })
    .then(function(response) {
      if(response.error.error)
        Alert.error(response.error.message);
      else {
        that.setState({articles: response.data})
      }
      that.setState({loading: false});
    });
  }


  render () {
    return(
    <div className="article-list">
      {this.state.loading && <Loader/>}
      {this.state.articles.length<1 &&  <p className="help-block center-align">There are no articles under this topic</p>}

            {this.state.articles.map(article => (
            <div key={article.id} className="article-item">
              <div className="article-item-title">
                <Link to={"/article/"+article.id} >{article.title}</Link>
              </div>
              <div className="article-item-description">
                Last updated on {new Date(article.updated_at.replace(' ','T')).toDateString()}
              </div>
              <hr className="article-separator"></hr>
            </div>

          ))}
      </div>
    )
  }
}

export default BrowseArticles;
