var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var assert = require('assert');


var url = 'mongodb://redtil:future8:12@ds145848.mlab.com:45848/emotivebackend-db';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/get-data', function(req, res, next) {

});

router.post('/insert', function(req, res, next) {

});

router.post('/update', function(req, res, next) {

});

router.post('/delete', function(req, res, next) {

});

module.exports = router;
