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
router.get('/SearchDocs/:recherche', doc.getResults);
//Tri par filtre
router.post('/SearchDocs/:recherche/filter', doc.searchDocByFilter);
//Obtenir les documents par type, domaine, period
router.get('/SearchDocs/:recherche/type/:type/domaine/:domaine/periode/:date1/:date2/', doc.getByTypeDomainePeriod);
//Obtenir les documents trié par type
router.get('/SearchDocs/:recherche/type/:type/', doc.getByType);
//Obtenir les documents trié par type et domaine
router.get('/SearchDocs/:recherche/type/:type/domaine/:domaine/', doc.getByTypeDomaine);
//Obtenir les documents trié par domaine
router.get('/SearchDocs/:recherche/domaine/:domaine/', doc.getByDomaine);
//Obtenir les documents par type et period
router.get('/SearchDocs/:recherche/type/:type/periode/:date1/:date2/', doc.getByTypePeriod);

//Obtenir les documents par domaine et periode
router.get('/SearchDocs/:recherche/:domaine/:date1/:date2', doc.getByDomainePeriod);
//Obtenir les documents par periode
router.get('/SearchDocs/:recherche/:date1/:date2', doc.getByPeriod);
//Réinitialiser les termes de la recherche
router.get('/resetrecherche', doc.resetSearch);
//Telecharger un document
router.get('/download/:id', doc.download);
//Supprimer un document
router.get('/delete/:id', doc.deleteDoc);
//Visualiser ses propres documents
router.get('/MyDocs', doc.MyDocs);
// Obtenir le formulaire de mise à jour pour la mise à jour d'un document
router.get('/updateDoc/:id', doc.getUpdateDoc);
//Soumettre la mise à jour d'un document
router.post('/updateDoc/:id', doc.postUpdateDoc);
//Définir les roles
router.get('/Roles', user.getRoles);
//Supprimer un utilisateur
router.get('/deleteUser/:id', user.deleteUser);
//Se déconnecter
router.get('/logout', user.logout);

module.exports = router;
