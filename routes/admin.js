var express = require('express');
var router = express.Router();
var EventEmitter = require('events');
var user = require('../controllers/user');
var doc = require('../controllers/docs');
var admin = require('../controllers/admin')
var event = new EventEmitter()

/* GET users listing. */
router.get('/getUsers', user.getUsers);

router.get('/getLogs', user.getLogs);

router.get('/Documents', admin.getAllDocs);

router.post('/filterDocs', admin.filterDocs );

router.get('/SearchDocs/author/:auteur', admin.getDocsByAuthor)

module.exports = router;