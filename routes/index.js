const express = require('express');
const router = express.Router();
const mongo = require('mongodb');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const assert = require('assert');
const Flickr = require('flickrapi');
const vision = require('node-cloud-vision-api');


vision.init({auth:'AIzaSyCXHDuPtgcSxbaov_6M-VG7jkYFABBdNhg'});

const User = require('../models/Users');

const flickrOptions = {
    api_key:'4aaeddd00e3be920ffb847186e27534e',
    secret:'ba71a1135ae7f57d'
};

const url = 'mongodb://redtil:future812@ds145848.mlab.com:45848/emotivebackend-db';
mongoose.connect(url);
const db = mongoose.connection;

function detectFaces(inputFile, callback){
    vision.detectFaces(inputFile, function(err, faces){
        if(err){
            return callback(err)
        }
        const numFaces = faces.length;
        console.log('Found ' + numFaces + (numFaces === 1 ? ' face' : ' faces'));
        for (face in faces) {
            console.log(face);
        }
        return faces;
    })
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/get-data', function(req, res, next) {
    console.log("get-data got calleld");
    tags = ["Brasil","mountains","rivers","ocean","animals","faces"];
    const val = Math.floor(Math.random() * tags.length) ;
    console.log(val);
    Flickr.tokenOnly(flickrOptions,function(error,flickr){
        flickr.photos.search({text:tags[val],
        tag:tags[val],
        page:1,
        per_page:10,
        sort:"relevance"},function(error,results){
           // console.log(results);
           const photos = results.photos.photo;
           const urlsJson = {"urls":[],"description":""};
           // console.log(photos);
           // for(i = 0; i < photos.length; i++){
            i = Math.floor(Math.random() * 10);
               console.log(photos[i]);
               const title = photos[i].title;
               const source = "flickr";
               const url = "https://farm" + photos[i].farm +
                        ".staticflickr.com/" + photos[i].server + "/" + photos[i].id +
                    "_" + photos[i].secret+ ".jpg";
               const photo = {
                   title:title,
                   url:url,
                   source:source
               };
               urlsJson.urls.push(photo);
               if(val == 5){
                   const req2 = new vision.Request({
                       image: new vision.Image({
                           url: url
                       }),
                       features: [
                           new vision.Feature('FACE_DETECTION', 10),
                       ]
                   });

                    // send multi requests by one API call
                   vision.annotate([req2]).then((res2) => {
                       // handling response for each request
                       console.log(JSON.stringify(res2.responses));
                       console.log(JSON.stringify(res2.responses)[0].labelAnnotations[0].description);
                       urlsJson.description = "";
                   }, (e) => {
                       console.log('Error: ', e)
                   })
               }
               else{
                   const req3 = new vision.Request({
                       image: new vision.Image({
                           url: url
                       }),
                       features: [
                           new vision.Feature('LABEL_DETECTION', 1),
                       ]
                   });

                    // send multi requests by one API call
                   vision.annotate([req3]).then((res3) => {
                       // handling response for each request
                       // console.log(JSON.stringify(res3.responses))
                       console.log(JSON.stringify(res3.responses));

                       urlsJson.description = "";
                   }, (e) => {
                       console.log('Error: ', e)
                   })
               }

           // }
           res.send(urlsJson);
        });
        if(error) {
            console.log(error);
        }
    })
});

router.get("/categorizeImage",function(req, res){
    const req2 = new vision.Request({
        image: new vision.Image({
            url: 'https://scontent-nrt1-1.cdninstagram.com/hphotos-xap1/t51.2885-15/e35/12353236_1220803437936662_68557852_n.jpg'
        }),
        features: [
            new vision.Feature('LABEL_DETECTION', 1),
        ]
    });

// send multi requests by one API call
    vision.annotate([req2]).then((res) => {
        // handling response for each request
        console.log(JSON.stringify(res.responses))
    }, (e) => {
        console.log('Error: ', e)
    })
});

router.get("/detectFacialExpression",function(req,res){
    const req2 = new vision.Request({
        image: new vision.Image({
            url: 'https://scontent-nrt1-1.cdninstagram.com/hphotos-xap1/t51.2885-15/e35/12353236_1220803437936662_68557852_n.jpg'
        }),
        features: [
            new vision.Feature('FACE_DETECTION', 10),
        ]
    });

// send multi requests by one API call
    vision.annotate([req2]).then((res) => {
        // handling response for each request
        console.log(JSON.stringify(res.responses))
    }, (e) => {
        console.log('Error: ', e)
    })
});

router.post('/uploadImage', function(req,res){
    console.log(req.fields);
    console.log(req.files);
});

router.post('/users/register',function(req,res){

    console.log(req.body.username);
    console.log(req.body.password);


    const name = req.body.username;

    const newUser = new User({
        username: req.body.username,
        password: req.body.password
    });

    User.createUser(newUser, function(err, user){
        if(err) throw err;
        console.log(user);
    });

});


passport.use(new LocalStrategy(
    function(username, password, done) {
        User.getUserByUsername(username,function(err,user){

            console.log(user);
            if(err) throw err;
            if(!user){
                return done(null, false, {message: 'Unknown User'});
            }

            User.comparePassword(password, user.password, function(err, isMatch){
                if(err) throw err;
                if(isMatch){
                    console.log("is Match!");
                    return done(null, user);
                } else {
                    return done(null, false, {message:'Invalid password'});
                }
            });
        })
    }
));

passport.serializeUser(function(user, done) {
    console.log("I am in serializeUser");
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    console.log("I am in deserializeUser");
    console.log(id);
    User.getUserById(id, function(err, user) {
        console.log(user);
        console.log("I got the user by id");
        done(err, user);
    });
});

router.post('/users/login',
    passport.authenticate('local'),
    function(req, res) {
        console.log("I am in authenticated");
        res.send({'status': "success"});}
);

router.post('/users/logout',function(req,res){
    req.logout();
    res.send({'status':"success"});
});

router.post('/insert', function(req, res, next) {

});

router.post('/update', function(req, res, next) {

});

router.post('/delete', function(req, res, next) {

});

module.exports = router;
