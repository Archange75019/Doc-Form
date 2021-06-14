var express = require('express');
var router = express.Router();
var EventEmitter = require('events');
var user = require('../controllers/user');
var doc = require('../controllers/docs');
var event = new EventEmitter()

/* GET users listing. */
router.get('/getUsers', user.getUsers);

router.get('/getLogs', user.getLogs);

module.exports = router;