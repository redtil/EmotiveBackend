var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var assert = require('assert');
var Flickr = require('flickrapi');
var User = require('../models/Users');

var flickrOptions = {
    api_key:'4aaeddd00e3be920ffb847186e27534e',
    secret:'ba71a1135ae7f57d'
};

var url = 'mongodb://redtil:future812@ds145848.mlab.com:45848/emotivebackend-db';
mongoose.connect(url);
var db = mongoose.connection;



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/get-data', function(req, res, next) {
    Flickr.tokenOnly(flickrOptions,function(error,flickr){
        flickr.photos.search({text:"Brazil",
        tag:"Brasil",
        page:1,
        per_page:10,
        sort:"relevance"},function(error,results){
           console.log(results);
           var photos = results.photos.photo;
           var urlsJson = {"urls":[]};
           for(photo in photos){
               var title = photos[photo].title;
               var source = "flickr";
               var url = "https://farm" + photos[photo].farm +
                        ".staticflickr.com/" + photos[photo].server + "/" + photos[photo].id +
                    "_" + photos[photo].secret+ ".jpg";
               var photo = {
                   title:title,
                   url:url,
                   source:source
               }
               urlsJson.urls.push(photo);
           }
           res.send(urlsJson);
        });
        if(error) {
            console.log(error);
        }
    })
});

router.post('/users/register',function(req,res){

    console.log(req.body.username);
    console.log(req.body.password);


    var name = req.body.username;

    var newUser = new User({
        username: req.body.username,
        password: req.body.password
    });

    User.createUser(newUser, function(err, user){
        if(err) throw err;
        console.log(user);
    });

});

router.post('/users/login',function(req,res){

});


router.post('/insert', function(req, res, next) {

});

router.post('/update', function(req, res, next) {

});

router.post('/delete', function(req, res, next) {

});

module.exports = router;
