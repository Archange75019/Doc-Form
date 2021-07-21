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

router.get('/SearchDocs/domaine/:domaine', admin.getDocsByDomaine)

router.get('/SearchDocs/author/:auteur/domaine/:domaine/', admin.getDocsByAuthorDomain)

router.get('/SearchDocs/author/:auteur/periode/:date1/:date2', admin.getDocsByAuthorPeriod)

router.get('/SearchDocs/author/:auteur/domaine/:domaine/periode/:date1/:date2', admin.getDocsByAuthorDomainePeriod)

router.get('/SearchDocs/periode/:date1/:date2/', admin.getDocsByPeriod)

router.get('/SearchDocs/domaine/:domaine/periode/:date1/:date2/', admin.getDocsByDomainePeriod)

router.get('/ListDoc/reinitFilter', admin.reinitfilter)

module.exports = router;