var express = require('express');
var router = express.Router();
var EventEmitter = require('events');

var user = require('../controllers/user');
var doc = require('../controllers/docs');
const User = require('../models/User');
const Doc = require('../models/Doc');

var event = new EventEmitter()

var role = []

//Affiche la page home
router.get('/home', doc.getDoc);
//affiche la page d'inscription utilisateur
router.get('/register', (req, res, next)=>{
  let statut = req.cookies[process.env.cookie_name].role;
  User.find({},{ role: 1 } , (err, Role)=>{
   
    if(Role != statut){
      role.push(Role[0].role)
    }
  })
  console.log(role)
  res.render('register', {title: process.env.TITLE, role: role, statut: statut})
})
// Traite l'inscription utilisateur
router.post('/register', user.register);
//Affiche la page d'ajout de documents
router.get('/AddDocs', (req, res, next)=>{
  
  let statut = req.cookies[process.env.cookie_name].role;
  Doc.find({},{ domaine: 1 } , (err, domaines)=>{


  res.render('addDoc',{title: process.env.TITLE,domaines: domaines, statut: statut})
  });
});
//Traite l'ajout de documents
router.post('/AddDocs',doc.addDoc);
//Recherche de documents
router.get('/SearchDocs/', (req, res, next)=>{
  let statut = req.cookies[process.env.cookie_name].role;
  res.render('search',{title: process.env.TITLE,statut: statut })
});
//Soumission des termes de la recharche
router.post('/SearchDocs', doc.searchDoc);
//Recherche dans la base
router.get('/SearchDocs/result=:recherche', (req, res, next)=>{
  let statut = req.cookies[process.env.cookie_name].role;
  if( req.params.recherche){

    recherche = req.params.recherche
    console.log("recherche en base :"+ recherche);
    console.log(" type de la recherche :"+typeof recherche)

    Doc.find({ $text: { $search: recherche } }, {score: {$meta: "textScore"}})
    .sort({score:{$meta:"textScore"}})
    .exec(function (err, docs) {
      res.render('search',{title: process.env.TITLE, docs: docs,statut: statut})

    })
  }
})
//Telecharger un document
router.get('/download/:id', function (req, res, next)
 {
  if(req.params.id){
    Doc.findOne({'_id': req.params.id}, function (error, docFile)
    {
      var file = docFile.link;
    res.download(file);
    })


  }
    
    
   
 
});
router.get('/MyDocs', doc.MyDocs, (req, res, next)=>{
  console.log("mydocs")
  Doc.find({}, {'author': req.cookies[process.env.cookie_name].userName}, (err, docs)=>{
    if(err) throw err;
    console.log(docs)
  })

})
/*router.get('/DeleteDoc/:id',doc.DeleteDoc, (req, res, next)=>{
  
  let statut = req.cookies[process.env.cookie_name].role;


  res.render('docs',{title: process.env.TITLE,docs: doc, statut: statut})
});*/


router.get('/logout', user.logout);

module.exports = router;
