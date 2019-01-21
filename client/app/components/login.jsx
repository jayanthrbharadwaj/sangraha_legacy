import React from 'react';
import {browserHistory} from 'react-router';
import Alert from 'react-s-alert';
import GoogleLogin from 'react-google-login';
import cookie from "react-cookies";

class Login extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (window.localStorage.getItem('userToken')) {
      browserHistory.push('');
    }
  }

  onSignInSuccess(googleUser) {
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

  onSignFailure(error) {
    Alert.success("Unable to login. Please try again later " + JSON.stringify(error));
  }

  addUser(user) {
    var myHeaders = new Headers({
      "Content-Type": "application/x-www-form-urlencoded",
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
          Alert.success(response.data.name + '!! Welcome back to Madhwa Sangraha');
          cookie.save("google_email", response.data.email)
          cookie.save("google_name", response.data.name)
          cookie.save("user_id", response.data.id)
          browserHistory.push('/#/');
          location.reload()
        }
      });
  }

  render() {
    return (<div>
      <div className="container login-box row">
        <div className="col-md-12 col-sm-12">
          <center><a href ="https://wa.me/+919008671876?text=Hi%20Jayanth%2C%20I%20need%20help%20in%20writing%20an%20article%20in%20Madhwa%20Sangraha" className="text-center my-5">Click here to Whatsapp Jayanth Bharadwaj for any help</a></center>
          <h3>Welcome to Madhwawiki(sangraha)</h3>
          <h5><u>Login to write or approve an article</u></h5>
          <form>
            <GoogleLogin
              clientId="707850557465-1bgam53d1v1cer3ebrvj0gfv38dh61ms.apps.googleusercontent.com"
              buttonText="Login to Madhwa Sangraha"
              onSuccess={this.onSignInSuccess.bind(this)}
              onFailure={this.onSignFailure.bind(this)}/>
          </form>
        </div>
      </div>
      <hr className="style5"/>
      <section className="my-5">
        <center><a href ="https://github.com/jayanthrbharadwaj/sangraha" className="text-center text-warning">Open source website project on github</a></center>
        <h2 className="h1-responsive font-weight-bold text-center my-5">ಯೇಕೆಂದರೆ?</h2>
        <h3 className="wp-block-quote font-weight-bold text-info grey-text text-center w-responsive mx-auto mb-5"> ಮಧ್ವ
          ಸಂಸ್ಕ್ರುತಿ deserves a wikipedia in its own. The content here is not just about tradition. Its a unified
          cultural knowledgebase under teachings of ಶ್ರೀ ಮಧ್ವಾಚಾರ್ಯ transcending through his disciples</h3>
        <hr className="style5"/>
        <div className="row">

          <div className="col-lg-5 text-center text-lg-left">
            <img className="img-fluid" src="https://res.cloudinary.com/dbcfxsz3x/image/upload/v1548096393/wikipedia-logo_pfypcx.jpg"
                 alt="Sample image"/>
          </div>

          <div className="col-lg-7 blue-gradient">
            <blockquote>
              <div className="row mb-3">
                <div className="col-xl-10 col-md-11 col-10">
                  <h5 className="font-weight-bold mb-3 lead">Be an Author or an Approver of an article</h5>
                  <h5 className="grey-text my-5">ಕನ್ನಡದಲ್ಲಿ or in English scholaristic articles written in Madhwawiki
                    needs 1 approval from any of your friends/ family for publishing your article on Madhwawiki</h5>
                </div>
              </div>
            </blockquote>
            <blockquote>
              <div className="row mb-3">
                <div className="col-xl-10 col-md-11 col-10">
                  <h5 className="font-weight-bold mb-3 lead">After approval</h5>
                  <h5 className="dark-grey-text">Madhwawiki mentions and credits the author of the article and the
                    approver suitably for their contribuition to the knowledge base. The article can be further edited
                    and approval seeked by anybody.</h5>
                </div>
              </div>
            </blockquote>
            <blockquote>
              <div className="row">
                <div className="col-xl-10 col-md-11 col-10">
                  <h5 className="font-weight-bold mb-3 lead">This project aims at being your Google for Madhwa content</h5>
                  <p className="grey-text mb-0">2) A quora for your intriguing questions, 3) A guided platform for imbibing ಶ್ರೀ ಮಧ್ವಾಚಾರ್ಯ teachings through everday life</p>

                </div>
              </div>
            </blockquote>
            <blockquote>
              <div className="row mb-3">
                <div className="col-xl-10 col-md-11 col-10">
                  <h5 className="font-weight-bold mb-3 lead">Searchable wiki (work in progress)</h5>
                  <h5 className="grey-text">Searching content is Top priority of this Open Source project. Search results contains
                    ಪಧ್ಹತಿಗಳ ಉಲ್ಲೆಖನೆ, ಆಚರಣೆಗಳ ಉಲ್ಲೆಖನೆ, ಹಬ್ಬ ಹರಿದಿನಗಳು with author mentions</h5>
                </div>
              </div>
            </blockquote>
            <blockquote>
              <div className="row mb-3">
                <div className="col-xl-10 col-md-11 col-10">
                  <h5 className="font-weight-bold mb-3 lead">ಶಾಸ್ತ್ರಾಭ್ಯಾಸ (work in progress)</h5>
                  <h5 className="grey-text">Voice + content driven ಶ್ಲೊಕ ಪಠನ, ಅರ್ಥಗಳ ವಿವರಣೆ</h5>
                </div>
              </div>
            </blockquote>
            <blockquote>
              <div className="row">
                <div className="col-xl-10 col-md-11 col-10">
                  <h5 className="font-weight-bold mb-3 lead">ಯೇಕೆ ಹೀಗೆ? (Ideation in progress)</h5>
                  <p className="grey-text mb-0">ಪದ್ಧತಿಗಳ ಅಥವ ಕ್ಷೇತ್ರ ಮಹಿಮೆ ಗಳ ಪ್ರಶ್ನೊತ್ತರ wiki</p>
                </div>
              </div>
            </blockquote>

          </div>
        </div>
      </section>
      <div className="jumbotron jumbotron-fluid">
        <div className="container">
          <p className="lead">Open source on github</p>
          <h1 className="display-4"><a href="https://github.com/jayanthrbharadwaj/sangraha">"Sangraha project"</a> is a React JS frontend, NodeJS backend project. More tech spec on github. </h1>
          <p className="lead">Graphic designers, Software Testers, Devs alike are welcome to contribute. Feel free to dive-in &amp; say hello to me on <a href="https://gitter.im/sangrahatalk/community?utm_source=share-link&utm_medium=link&utm_campaign=share-link">gitter Sangraha.</a> Open source project currently owned by <a href="https://www.linkedin.com/in/jayanth-bharadwaj-79795818/">Jayanth Bharadwaj</a>.
          </p>
        </div>
      </div>
    </div>);
  }
}

export default Login;
