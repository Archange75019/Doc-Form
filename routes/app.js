var express = require('express');
var router = express.Router();


var user = require('../controllers/user');
var doc = require('../controllers/docs');
const User = require('../models/User');
const Doc = require('../models/Doc');



//Affiche la page home
router.get('/home', doc.getDoc);
//affiche la page d'inscription utilisateur
router.get('/register', user.registerShow);
// Traite l'inscription utilisateur
router.post('/register', user.register);
//Affiche la page d'ajout de documents
router.get('/AddDocs', doc.form);
//Traite l'ajout de documents
router.post('/AddDocs',doc.addDoc);
//Recherche de documents
router.get('/SearchDocs/', doc.getDocs);
//Soumission des termes de la recharche
router.post('/SearchDocs', doc.searchDoc);
//Recherche dans la base
router.get('/SearchDocs/result=:recherche', doc.getResults);
//Telecharger un document
router.get('/download/:id', doc.download);
//Supprimer un document
router.get('/delete/:id', doc.deleteDoc);
//Visualiser ses propres documents
router.get('/MyDocs', doc.MyDocs);
// Créer une classe
router.get('/createClass', user.createClass);
//Se déconnecter
router.get('/logout', user.logout);

module.exports = router;
