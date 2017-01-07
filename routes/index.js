var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var assert = require('assert');
var Flickr = require('flickrapi');

var flickrOptions = {
    api_key:'4aaeddd00e3be920ffb847186e27534e',
    secret:'ba71a1135ae7f57d'
}



var url = 'mongodb://redtil:future8:12@ds145848.mlab.com:45848/emotivebackend-db';

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

router.post('/insert', function(req, res, next) {

});

router.post('/update', function(req, res, next) {

});

router.post('/delete', function(req, res, next) {

});

module.exports = router;
