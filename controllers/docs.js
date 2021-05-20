var Doc = require('../models/Doc'); 
var formidable = require('formidable');
var fs = require('fs');
const User = require('../models/User');
const { json } = require('body-parser');
var EventEmitter = require('events');
const path = require("path");
var htmlspecialchars = require('htmlspecialchars');

var event = new EventEmitter()


champs = []
//Afficher les documents les plus récents en page home
exports.getDoc = (req, res, next) => {
    let statut = req.cookies[process.env.cookie_name].role;
    Doc.find({})
    .sort({ dateFull: -1 })
    .limit(12)
    .exec(function (err, docs){
      if(err) throw err;
      res.render('home',{title: process.env.TITLE, docs:docs, statut : statut})
    })
  

};
//Afficher le formulaire d'ajout de documents
exports.form = (req, res, next)=>{
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
  console.log(champs)
  res.render('addDoc',{title: process.env.TITLE,domaines: filteredArray,champs: champs, statut: statut})
  });
};
//Ajouter un document à la base
exports.addDoc = (req, res, next) => {
    var form = new formidable.IncomingForm();
    form.multiples = false;

    form.parse(req,  (err, fields, files)=> {
      if(err) {
        console.log(err)
        
      }else{
        champs = {
          'titre':htmlspecialchars(fields.titre) ,
          'domain':htmlspecialchars(fields.domain) ,
          'domaine':htmlspecialchars(fields.domaine) ,
          'description':htmlspecialchars(fields.description)
        }
        var oldpath = files.fileToUpload.path;
        console.log(files)

        var newpath = './uploads/' + files.fileToUpload.name;
        
        if (!fs.existsSync('./uploads')) {
          const mkdirSync = function (dirPath) {
            try {
            fs.mkdirSync(dirPath)
            } catch (err) {
            if (err.code !== "EEXIST") throw err
            }
            }
            mkdirSync(path.resolve('./uploads'))
        }

        fs.rename(oldpath, newpath, function (err) {
          if (err) throw err;
          if(fields.domain == "Autre"){
            domaine = champs.domaine
          }else{
            domaine = champs.domain
          }
          var date = new Date();
          //const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
          var doc = {
            titre: champs.titre,
            domaine: domaine,
            description: champs.description,
            author: req.cookies[process.env.cookie_name].userName,
            dateFull:files.fileToUpload.lastModifiedDate,
            size: files.fileToUpload.size,
            date: date.toLocaleString('fr-FR'),
            link: newpath
          }

          Doc.create({'titre': doc.titre, 'domaine': doc.domaine,'dateFull': doc.dateFull, 'description': doc.description, 'author': doc.author, 'date': doc.date, 'link': doc.link, 'size':doc.size }, (err, doc)=>{
            if(err) throw err;
            res.redirect('/app/home')
            
          })
        });
      }
      
  
    })
    form.on('error', (err)=>{ 
      if (err) {
        //Handle error
        //champs.push(fields)
        return res.end("Something went wrong!" + err);
    }
    
      res.redirect('/app/AddDocs')
     
    })

};
//Afficher le formulaire de recherche de documents
exports.getDocs = (req, res, next) =>{
    let statut = req.cookies[process.env.cookie_name].role;
  res.render('search',{title: process.env.TITLE,statut: statut }); 
};
//Rechercher un document en base
exports.searchDoc = (req, res, next)=>{
  const motsOutils = [
    "mon","ma","mes","Mon","Ma","Mes",
    "ton","ta","tes","Ton","Ta","Tes",
    "le", "la", "les","Le","La", "Les",
    "se", "sa","ses","ces","son","ce","Se","Sa","Ses","Ces","Son","Ce",
    "de", "des", "du", "De", "Des","Du"
  ]
  let search = [];
  let element = req.body.recherche.split(" ");

  element.forEach(elem => {    
    if (motsOutils.includes(elem) == false){
        search.push(elem)
    }
  })
  let rechercheDef = search.toString();
    if(rechercheDef != ""){
      res.redirect('/app/SearchDocs/result=' + rechercheDef );
    }
}; 
//Afficher les documents de l'utilisateur courant
exports.MyDocs = (req, res, next)=>{
  let statut = req.cookies[process.env.cookie_name].role;
  Doc.find({'author': req.cookies[process.env.cookie_name].userName}, (err, docs)=>{
    if(err) throw err;
    res.render('MyDocs',{title: process.env.TITLE, docs: docs, statut: statut    })
  })
};
//Afficher le résultat d'une recherche de documents
exports.getResults = (req, res, next) => {
  let statut = req.cookies[process.env.cookie_name].role;
  if( req.params.recherche){

    var recherche = req.params.recherche


    Doc.find({ $text: { $search: recherche } }, {score: {$meta: "textScore"}})
    .sort({score:{$meta:"textScore"}})
    .exec(function (err, docs) {
      res.render('search',{title: process.env.TITLE, docs: docs,statut: statut})

    })
  }
};
//Télécharger un document
exports.download = (req, res, next) => {
  if(req.params.id){
    Doc.findOne({'_id': req.params.id}, {$set:{'count':+1}}, {new: true}, function (error, docFile)
    {
      var file = docFile.link;
    res.download(file);
    })
  }
};
exports.updateDoc = (req, res, next) => {

};
//Supprimer un document
exports.deleteDoc = (req, res, next) => {
  if(req.params.id){
    var fs = require('fs');
    Doc.findByIdAndDelete({'_id': req.params.id}, (err, doc)=>{
      if(err) throw err;
      var filePath = doc.link; 
      fs.unlinkSync(filePath);
      res.redirect('/app/MyDocs');
    })
  }

};