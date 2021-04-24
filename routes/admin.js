var express = require('express');
var router = express.Router();
var EventEmitter = require('events');
var event = new EventEmitter()

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('home');
});

module.exports = router;