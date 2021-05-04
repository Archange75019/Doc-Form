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
router.get('/register', user.registerShow);
// Traite l'inscription utilisateur
router.post('/register', user.register);
//Affiche la page d'ajout de documents
router.get('/AddDocs', (req, res, next)=>{
  
  let statut = req.cookies[process.env.cookie_name].role;

  Doc.find({},{ domaine: 1 } , (err, domaines)=>{

    var dom = [];

    
    for(var i=0; i<domaines.length; i++ ){
      var element = domaines[i].domaine
      dom.push(element)
      
      
    }
    const filteredArray = dom.filter(function(ele , pos){
      return dom.indexOf(ele) == pos;
  }) 



  res.render('addDoc',{title: process.env.TITLE,domaines: filteredArray, statut: statut})
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
});
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
router.get('/MyDocs', doc.MyDocs);
/*router.get('/DeleteDoc/:id',doc.DeleteDoc, (req, res, next)=>{
  
  let statut = req.cookies[process.env.cookie_name].role;


  res.render('docs',{title: process.env.TITLE,docs: doc, statut: statut})
});*/


router.get('/logout', user.logout);

module.exports = router;
