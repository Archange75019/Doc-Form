var Doc = require('../models/Doc'); 
var formidable = require('formidable');
var fs = require('fs');
const User = require('../models/User');
const { json } = require('body-parser');
var EventEmitter = require('events');
const { Console } = require('console');

var event = new EventEmitter()


champs = []

exports.getDoc = (req, res, next) => {
    let statut = req.cookies[process.env.cookie_name].role;
    Doc.find({}, (err, docs)=>{
      if(err) throw err;
      res.render('home',{title: process.env.TITLE, docs:docs, statut : statut})
    }).sort({date: -1})
  

};
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



  res.render('addDoc',{title: process.env.TITLE,domaines: filteredArray, statut: statut})
  });
};

exports.addDoc = (req, res, next) => {
    var form = new formidable.IncomingForm();
    form.multiples = false;
    form.maxFileSize = 30 * 1024 * 1024
    form.parse(req,  (err, fields, files)=> {
      if(err) {
        res.redirect('/app/AddDocs')
        
      }else{
        var oldpath = files.fileToUpload.path;

        var newpath = './uploads/' + files.fileToUpload.name;

        fs.rename(oldpath, newpath, function (err) {
          if (err) throw err;
          if(fields.domain == "Autre"){
            domaine = fields.domaine
          }else{
            domaine = fields.domain
          }
          var date = new Date();
          var doc = {
            titre: fields.titre,
            domaine: domaine,
            description: fields.description,
            author: req.cookies[process.env.cookie_name].userName,
            dateFull:new Date(),
            date: date.toLocaleString(),
            link: newpath
          }
          Doc.create({'titre': doc.titre, 'domaine': doc.domaine,'dateFull': doc.dateFull, 'description': doc.description, 'author': doc.author, date: doc.date, 'link': doc.link }, (err, doc)=>{
            if(err) throw err;
            res.redirect('/app/home')
            
          })
        });
      }
      
  
    })
    form.on('progress', (bytesReceived, bytesExpected)=>{
      if(bytesExpected > form.maxFileSize){
        form.on('file',{})
       
      }
     
    })

};
exports.getDocs = (req, res, next) =>{
    let statut = req.cookies[process.env.cookie_name].role;
  res.render('search',{title: process.env.TITLE,statut: statut }) 
};
exports.searchDoc = (req, res, next)=>{
  const motsOutils = [
    "mon","ma","mes","Mon","Ma","Mes",
    "ton","ta","tes","Ton","Ta","Tes",
    "le", "la", "les","Le","La", "Les",
    "se", "sa","ses","ces","son","ce","Se","Sa","Ses","Ces","Son","Ce",
    "de", "des", "du", "De", "Des","Du"
  ]
  let search = [];
  let item = req.body.recherche;
  let element = item.split(" ");

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
exports.MyDocs = (req, res, next)=>{
  let statut = req.cookies[process.env.cookie_name].role;
  Doc.find({'author': req.cookies[process.env.cookie_name].userName}, (err, docs)=>{
    if(err) throw err;
    res.render('MyDocs',{title: process.env.TITLE, docs: docs, statut: statut    })
  })
};
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
exports.download = (req, res, next) => {
  if(req.params.id){
    Doc.findOne({'_id': req.params.id}, function (error, docFile)
    {
      var file = docFile.link;
    res.download(file);
    })
  }
};
exports.updateDoc = (req, res, next) => {

}
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

}