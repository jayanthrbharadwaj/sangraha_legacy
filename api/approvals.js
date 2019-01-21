/*
This file contains all endpoints related to articles.
The endpoint to display articles related to a particular topic (/topics/:id/articles)
is not in this file because that is a topics endpoint.
To avoid any confusion, here is how you filter which file should an endpoint belong to.
Check the first word in the url. If topics comes first (as it does in the above example)
then move it to the topics endpoints file.
*/


// Importing the articles model
var Articles = require('../models/article.js');
var Users = require('../models/user.js');
var fs = require('fs');
var path = require('path');
var Approvals = require('../models/approval.js');
var nodemailer = require('nodemailer');



var helper = require('sendgrid').mail;

var crypto = require('crypto');
var from_email = new helper.Email('test@example.com');
var to_email = new helper.Email('jayforum87@gmail.com');
var subject = 'Hello World from the SendGrid Node.js Library!';
var content = new helper.Content('text/plain', 'Hello, Email!');
var mail = new helper.Mail(from_email, subject, to_email, content);

var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
var db = require('../db.js'); //this file contains the knex file import. it's equal to knex=require('knex')

module.exports = function (app) {


  app.post('/articles', function (req, res) {
    /*
    This endpoint takes the article title, article body, and topic id from the request body.
    It then saves those values in the database using the insert query.
    After the operation is complete the endpoint returns the success object.
    TODO: create formal guidelines for different object structures and follow that throughout the API.
    */
    Articles.forge().save({
      title: req.body.title,
      body: req.body.body,
      topic_id: req.body.topic_id,
      user_id: req.body.user_id,
      what_changed: "Another drop in the ocean of knowledge"
    }).then(function (article) {
      res.json({
        error: {
          error: false,
          message: ''
        },
        code: 'B103',
        data: article
      });     // responds back to request
    })
      .catch(function (error) {
        res.status(500).json({
          error: {
            error: true,
            message: error.message
          },
          code: 'B104',
          data: {}
        });
      });
  });


  app.get('/approvals', function (req, res) {
    /*
    This is a GET endpoint that responds with the list of all the articles in the articles table
    the articles are present in the data object in the returning object.
    the error key in the returning object is a boolen which is false if there is no error and true otherwise
    */
    Approvals.forge({'approver_url_hash': req.headers.referrertoken, 'article_id':req.query.articleId})
      .fetch()
      .then(function (approver) {
        res.json({
          error: {
            error: false,
            message: ''
          },
          code: 'B111',
          data: approver
        });
      })
      .catch(function (error) {
        res.status(500).json({
          error: {
            error: true,
            message: error.message
          },
          code: 'B106',
          data: {}
        });
      });

  })


  app.put('/approvals/approved', function (req, res) {
    /*
    This is a PUT endpoint for updating an article information.
    It takes the id of the topic to be updated and then updates it with the new object.
    the error key in the returning object is a boolen which is false if there is no error and true otherwise

    TODO: Add updates only for columns that are in the request body. Handle exceptions.
    */
    Articles.forge({id: req.body.article_id}).fetch().then(function (article) {
      article
        .save({
          "approve_status": 1
        })
        .then(function () {
          Approvals.where('article_id', req.body.article_id).fetch().then(function (approval) {
            approval
              .save({
                "approve_status": 1
              })
              .then(function (saved) {
                sendEmailToAuthor(saved, 'approved_author.html','Your article is approved')
                sendEmailToApprover(saved, 'approved_approver.html', 'You just Approved an article')
                res.json({
                  error: {
                    error: false,
                    message: ''
                  },
                  code: 'B107',
                  data: saved
                });
              })
          })
            .catch(function (error) {
              res.status(500).json({
                error: {
                  error: true,
                  message: error.message
                },
                code: 'B108',
                data: {}
              });
            });

        })
    })
      .catch(function (error) {
        res.status(500).json({
          error: {
            error: true,
            message: error.message
          },
          code: 'B108',
          data: {}
        });
      });
  });

  function sendEmailToApprover(saved, filename, subject) {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rj12info@gmail.com',
        pass: 'bertyui1234'
      }
    });
    var mailOptions = {
      from: 'rj12info@gmail.com',
      to: 'jayforum87@gmail.com',
      subject: 'Sending Email using Node.js',
      html: 'Madhwa Sangraha Wiki. View your article!'
    };
    mailOptions.subject = subject
    mailOptions.to = [saved.attributes.approver_email]
    var jsonPath = path.join(__dirname, '..', 'mailers', filename);
    fs.readFile(jsonPath, 'utf8', function (err, html) {
      if (err) {
        console.log(err);
      } else {
        html = html.replace("[[${author}]]", saved.attributes.author_name)
        html = html.replace("[[${recipient}]]", saved.attributes.approver_name)
        html = html.replace("[[${articleUrl}]]", "https://sangraha.herokuapp.com//#/article/"+saved.attributes.article_id+"?author=" + saved.attributes.approver_url_hash)
        mailOptions.html = html
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });

      }
    });

    var request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON(),
    });

    sg.API(request, function (error, response) {
      console.log(response.statusCode);
      console.log(response.body);
      console.log(response.headers);
    });
  }

  function sendEmailToAuthor(saved, filename, subject) {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rj12info@gmail.com',
        pass: 'bertyui1234'
      }
    });
    var mailOptions = {
      from: 'rj12info@gmail.com',
      to: 'jayforum87@gmail.com',
      subject: 'Sending Email using Node.js',
      html: 'Madhwa Sangraha Wiki. View your article!'
    };
    mailOptions.subject = subject
    mailOptions.to = [saved.attributes.author_email]
    var jsonPath = path.join(__dirname, '..', 'mailers', filename);
    fs.readFile(jsonPath, 'utf8', function (err, html) {
      if (err) {
        console.log(err);
      } else {
        html = html.replace("[[${approver}]]", saved.attributes.approver_name)
        html = html.replace("[[${recipient}]]", saved.attributes.author_name)
        html = html.replace("[[${articleUrl}]]", "https://sangraha.herokuapp.com/#/article/new?author=" + saved.attributes.author_url_hash)
        mailOptions.html = html
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });

      }
    });

    var request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON(),
    });

    sg.API(request, function (error, response) {
      console.log(response.statusCode);
      console.log(response.body);
      console.log(response.headers);
    });
  }


  app.put('/approvals', function (req, res) {
    /*
    This is a PUT endpoint for updating an article information.
    It takes the id of the topic to be updated and then updates it with the new object.
    the error key in the returning object is a boolen which is false if there is no error and true otherwise

    TODO: Add updates only for columns that are in the request body. Handle exceptions.
    */
    var authorHash = crypto.createHash('md5').update(req.body.author_email+req.body.article_id).digest('hex');
    var approverrHash = crypto.createHash('md5').update(req.body.approver_email+req.body.article_id).digest('hex');
    Approvals.where({'author_email': req.body.author_email, 'article_id':req.body.article_id}).fetch().then(function (approval) {
      if (approval == null) {
        Approvals.forge().save({
          author_id: req.body.user_id,
          author_email: req.body.author_email,
          author_name: req.body.author_name,
          article_id: req.body.article_id,
          approver_id: req.body.approver_id,
          approver_email: req.body.approver_email,
          approver_name: req.body.approver_name,
          author_url_hash: authorHash,
          approver_url_hash:approverrHash
        }).then(function (saved) {
          sendEmailToAuthor(saved, 'request_by_author.html', "Your article has a pending review from "+saved.attributes.approver_name)
          sendEmailToApprover(saved, 'request_to_approver.html', saved.attributes.author_name+" is requesting your review")
          res.json({
            error: {
              error: false,
              message: ''
            },
            code: 'B107',
            data: saved
          });
        })
      } else {
        approval
          .save({
            author_url_hash: authorHash,
            approver_url_hash: approverrHash,
            approver_email: req.body.approver_email,
            approver_name: req.body.approver_name
          })
          .then(function (saved) {
            sendEmailToAuthor(saved, 'request_by_author.html', "Your article has a pending review from "+saved.attributes.approver_name)
            sendEmailToApprover(saved, 'request_to_approver.html', saved.attributes.author_name+" is requesting your review")
            res.json({
              error: {
                error: false,
                message: ''
              },
              code: 'B107',
              data: saved
            });
          })
      }
    })
      .catch(function (error) {
        res.status(500).json({
          error: {
            error: true,
            message: error.message
          },
          code: 'B108',
          data: {}
        });
      });

  });


  app.put('/approvals/save', function (req, res) {
    /*
    This is a PUT endpoint for updating an article information.
    It takes the id of the topic to be updated and then updates it with the new object.
    the error key in the returning object is a boolen which is false if there is no error and true otherwise

    TODO: Add updates only for columns that are in the request body. Handle exceptions.
    */
    var hash = crypto.createHash('md5').update(req.body.author_email+req.body.article_id).digest('hex');
    // TODO fix with req.body.user_id rather than req.body.author_email
    Approvals.where('author_email', req.body.author_email).fetch().then(function (approval) {
      if (approval == null) {
        Approvals.forge().save({
          author_id: req.body.user_id,
          author_email: req.body.author_email,
          author_name: req.body.author_name,
          article_id: req.body.article_id,
          approver_id: req.body.approver_id,
          approver_email: req.body.approver_email,
          approver_name: req.body.approver_name,
          author_url_hash: hash
        }).then(function (saved) {
          sendEmailToAuthorOnArticleSave(saved)
          res.json({
            error: {
              error: false,
              message: ''
            },
            code: 'B107',
            data: saved
          });
        })
      } else {
        approval
          .save({
            "author_url_hash": hash
          })
          .then(function (saved) {
            sendEmailToAuthorOnArticleSave(saved)
            res.json({
              error: {
                error: false,
                message: ''
              },
              code: 'B107',
              data: saved
            });
          })
      }
    })
      .catch(function (error) {
        res.status(500).json({
          error: {
            error: true,
            message: error.message
          },
          code: 'B108',
          data: {}
        });
      });

    function sendEmailToAuthorOnArticleSave(saved) {
      //TODO send email to correct recipients
      mailOptions.subject = "Your just saved a new article"
      mailOptions.to = [saved.attributes.author_email]
      var jsonPath = path.join(__dirname, '..', 'mailers', 'savearticle.html');
      fs.readFile(jsonPath, 'utf8', function (err, html) {
        if (err) {
          console.log(err);
        } else {
          html = html.replace("[[${recipient}]]", saved.attributes.author_name)
          html = html.replace("[[${articleUrl}]]", "http://sangraha.herokuapp.com/#/article/"+saved.attributes.article_id+"?author=" + saved.attributes.author_hash_url)
          mailOptions.html = html
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

        }
      });

      var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON(),
      });

      sg.API(request, function (error, response) {
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
      });
    }
  });

  app.get('/articles/compare', function (req, res) {
    /*
    This is a GET endpoint that takes IDs of two articles as parameters.
    It then returns both the article which could then be compared with each other
    through diffing which will be done on the front-end.
    The IDs params names are:
    article1: id of the first article
    article2: id of the second article
    The article with ID article1 is the first object in the Data array.
    The article with ID article2 is the second object in the Data array.
    The error key in the returning object is a boolen which is false if there is no error and true otherwise
    */

    Articles.forge({id: req.query.article1})
      .fetch()
      .then(function (article1) {
        Articles.forge({id: req.query.article2}).fetch().then(function (article2) {
          result = [];
          result.push(article1.toJSON());
          result.push(article2.toJSON());
        }).then(function () {
          res.json({
            error: {
              error: false,
              message: ''
            },
            code: 'B111',
            data: result
          });
        })
      })
      .catch(function (error) {
        res.status(500).json({
          error: {
            error: true,
            message: error.message
          },
          code: 'B112',
          data: {}
        });
      });
  });


  app.get('/articles/:id/', function (req, res) {
    /*
    This is a GET endpoint that responds with one article of the specific ID (identified through the ID param)
    the article is present in the data object in the returning object.
    the error key in the returning object is a boolen which is false if there is no error and true otherwise
    */
    Articles.forge({id: req.params.tokem})
      .fetch()
      .then(function (article) {
        Topics.forge({id: article.attributes.topic_id}).fetch().then(function (topic) {
          articleObj = article.toJSON();
          topicObj = topic.toJSON();
          articleObj.topic = topicObj;
        }).then(function () {
          Users.forge({id: articleObj.user_id}).fetch().then(function (user) {
            userObj = user.toJSON();
            articleObj.user = {
              id: userObj.id,
              name: userObj.name,
              email: userObj.email,
              about: userObj.about
            };
          })
            .then(function () {
              res.json({
                error: {
                  error: false,
                  message: ''
                },
                code: 'B113',
                data: articleObj
              });
            })
        })
      })
      .catch(function (error) {
        res.status(500).json({
          error: {
            error: true,
            message: error.message
          },
          code: 'B114',
          data: {}
        });
      });
  });


  app.get('/articles/:id/history', function (req, res) {
    /*
    This is a GET endpoint that responds with previous versions of the
    article of the specific ID (identified through the ID param).
    The article is present in the data object in the returning object.
    The error key in the returning object is a boolen which is false if there is no error and true otherwise
    */

    Articles.where({id: req.params.id}).fetch({
      withRelated: [{
        'archives': function (qb) {
          qb.orderBy("updated_at", "DESC");
        }
      }]
    }).then(function (article) {
      res.status(200).json({
        error: {
          error: false,
          message: ''
        },
        code: 'B115',
        data: article.related('archives')
      });
    })
      .catch(function (error) {
        res.status(500).json({
          error: {
            error: true,
            message: error.message
          },
          code: 'B116',
          data: {}
        });
      });
  });


}
