/*
This file contains all the endpoints related to users.
For the method we use to categorize endpoints in file please read the top
comment in the articles.js (same directory).
*/


// Importing the topics model
var Users = require('../models/user.js');
var bcrypt = require('bcryptjs');
var Articles = require('../models/article.js');
const saltRounds = 10;
var db = require('../db.js'); //this file contains the knex file import. it's equal to knex=require('knex')

module.exports = function(app) {


  app.post('/users',function(req,res){
    /*
    This is a POST endpoint which takes the user name, email, password, and about to create
    a new user profile.
    It responds with the created user object in the data key.
    the error key in the returning object is a boolen which is false if there is no error and true otherwise
    */
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      Users.forge()
        .save({
          name: req.body.name,
          email: req.body.email,
          password: hash,
          about: req.body.about})
        .then(function (collection) {
          res.json({
            error: {
              error: false,
              message: ''
            },
            code: 'B131',
            data: collection.toJSON()
          })
        })
        .catch(function (error) {
          res.status(500).json({
            error: {
              error: true,
              message: error.message
            },
            code: 'B132',
            data: {

            }
          })
        });
        });
      });

  function js_yyyy_mm_dd_hh_mm_ss () {
    now = new Date();
    year = "" + now.getFullYear();
    month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
    day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
    hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
    minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
    second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
  }

  app.post('/users/oauth',function(req,res){
    /*
    This is a POST endpoint which takes the user name, email, password, and about to create
    a new user profile.
    It responds with the created user object in the data key.
    the error key in the returning object is a boolen which is false if there is no error and true otherwise
    */
    Users.forge({email:req.body.email}).fetch().then(function (user) {
      if (user == null) {
        Users.forge()
          .save({
            name: req.body.name,
            email: req.body.email,
            google_access_token: req.body.google_access_token,
            google_id: req.body.google_id,
            google_profileImageUrl: req.body.google_profileImageUrl,
            created_at:js_yyyy_mm_dd_hh_mm_ss(),
            updated_at:js_yyyy_mm_dd_hh_mm_ss()
          })
          .then(function (user) {
            res.json({
              error: {
                error: false,
                message: ''
              },
              code: 'B131',
              data: user.toJSON()
            })
          })
          .catch(function (error) {
            res.status(500).json({
              error: {
                error: true,
                message: error.message
              },
              code: 'B132',
              data: {}
            })
          });
      } else {
        res.json({
          error: {
            error: false,
            message: ''
          },
          code: 'B131',
          data: user.toJSON()
        })
      }
    })
  });

  app.get('/users',function(req,res){
    /*
    This is a GET endpoint that responds with the list of all the topics in the topics table
    the topics are present in the data object in the returning object.
    the error key in the returning object is a boolen which is false if there is no error and true otherwise
    */
    Users.forge()
    .query(function(qb) {
        qb.select('id','name','about','email');
        qb.orderBy('created_at','DESC');
    })
    .fetchAll()
      .then(function (collection) {
        res.json({
          error: {
            error: false,
            message: ''
          },
          code: 'B133',
          data: collection.toJSON()
        })
      })
      .catch(function (error) {
        res.status(500).json({
          error: {
            error: true,
            message: error.message
          },
          code: 'B134',
          data: {

          }
        })
      });
      });


  app.put('/users',function(req,res){
    /*
    This is a PUT endpoint which takes the user's ID, name, email, password, and about to create
    a update the user profile of the given ID.
    It responds with the updated user object in the data key.
    the error key in the returning object is a boolen which is false if there is no error and true otherwise
    */
    if(req.body.password!=null){
      bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        Users.forge({id: req.body.id})
          .save({name: req.body.name, email: req.body.email, password: hash, about: req.body.about})
          .then(function (collection) {
            res.json({
              error: {
                error: false,
                message: ''
              },
              code: 'B135',
              data: {
                name: req.body.name,
                email: req.body.email,
                about: req.body.about
              }
            })
          })
          .catch(function (error) {
            res.status(500).json({
              error: {
                error: true,
                message: error.message
              },
              code: 'B136',
              data: {

              }
            })
          });
      });
    }
    else {
      Users.forge({id: req.body.id})
        .save({name: req.body.name, email: req.body.email, about: req.body.about})
        .then(function (collection) {
          res.json({
            error: {
              error: false,
              message: ''
            },
            code: 'B135',
            data: collection.toJSON()
          })
        })
        .catch(function (error) {
          res.status(500).json({
            error: {
              error: true,
              message: error.message
            },
            code: 'B136',
            data: {

            }
          })
        });
    }
    });

    app.delete('/users',function(req,res){
      /*
      This is a DELETE endpoint for delete a user from the database.
      It takes the id of the user and then deletes that record from the database.
      the error key in the returning object is a boolen which is false if there is no error and true otherwise
      */
      Users.where({id: req.body.id}).fetch({withRelated: ['articles']}).then(function(user) {
        var user = user.toJSON();
        var articles = user.articles;
        for(var i=0; i<articles.length; i++)
        {
          Articles.forge({id: articles[i].id}).save({
            title: articles[i].title,
            body: articles[i].body,
            topic_id: articles[i].topic_id,
            what_changed: articles[i].what_changed,
            user_id: 1
          });
        }
      }).then(function(){
        Users.forge({id: req.body.id})
        .destroy()
          .then(function() {
            res.json({
              error: {
                error: false,
                message: ''
              },
              code: 'B137',
              data: {}
            });
          })
      })
      .catch(function (error) {
          res.status(500).json({
            error: {
              error: true,
              message: error.message
            },
            code: 'B138',
            data: {

            }
          })
        });
      });


        app.get('/users/:id',function(req,res){
          /*
          This is a GET endpoint that responds with the user (with the given id)
          the user is present in the data object in the returning object.
          the error key in the returning object is a boolen which is false if there is no error and true otherwise
          */
          Users.forge({id: req.params.id})
          .query(function(qb) {
              qb.select('id','name','about','email');
          })
          .fetch()
            .then(function (user) {
              res.json({
                error: {
                  error: false,
                  message: ''
                },
                code: 'B133',
                data: user.toJSON()
              })
            })
            .catch(function (error) {
              res.status(500).json({
                error: {
                  error: true,
                  message: error.message
                },
                code: 'B134',
                data: {

                }
              })
            });
            });



}
