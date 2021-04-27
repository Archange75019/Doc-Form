var express = require('express');
var router = express.Router();
var EventEmitter = require('events');
var event = new EventEmitter()
var user = require('../controllers/user')

/* GET home page. */
router.get('/', function(req, res, next) {
  
  res.render('index', { title: 'Express', req:req });
});
router.post('/login', user.login);



module.exports = router;
