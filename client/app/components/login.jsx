import React from 'react';
import { browserHistory } from 'react-router';
import Alert from 'react-s-alert';
import GoogleLogin from 'react-google-login';
import cookie from "react-cookies";

class Login extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount(){
    if(window.localStorage.getItem('userToken')) {
      browserHistory.push('');
    }
  }

  onSignInSuccess(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    cookie.save('accessToken',googleUser.accessToken,{path:'/'})
    var user = {
      name: profile.getName(),
      email: profile.getEmail(),
      google_profileImageUrl: profile.getImageUrl(),
      google_id:profile.getId(),
      google_access_token:googleUser.accessToken
    };
    this.addUser(user)
  }

  onSignFailure(error) {
    Alert.success("Unable to login. Please try again later");
  }

  addUser(user) {
    var myHeaders = new Headers({
      "Content-Type": "application/x-www-form-urlencoded",
    });
    var myInit = { method: 'POST',
      headers: myHeaders,
      body: "name="+user.name+"&email="+user.email+"&google_access_token="+user.google_access_token+"&google_id="+user.google_id+"&google_profileImageUrl"+user.google_profileImageUrl
    };
    var that = this;
    fetch('/api/users/oauth',myInit)
      .then(function(response) {
        return response.json();
      })
      .then(function(response) {
        if(response.error.error)
          Alert.error(response.error.message);
        else {
          Alert.success(response.data.name+'!! Welcome back to Madhwa Sangraha');
          cookie.save("google_email", response.data.email)
          cookie.save("google_name", response.data.name)
          cookie.save("user_id", response.data.id)
          browserHistory.push('/#/');
          location.reload()
        }
      });
  }

  render () {
    return(<div className="container login-box row">
      <div className="col-md-12 col-sm-12">
        <h3>Welcome to Madhwa Wiki site</h3>
          <form>
            <GoogleLogin
              clientId="707850557465-1bgam53d1v1cer3ebrvj0gfv38dh61ms.apps.googleusercontent.com"
              buttonText="Login to Madhwa Sangraha"
              onSuccess={this.onSignInSuccess.bind(this)}
              onFailure={this.onSignFailure.bind(this)}/>
      </form>
      </div>
    </div>);
  }
}

export default Login;
