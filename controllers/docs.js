var Doc = require('../models/Doc'); 
var formidable = require('formidable');
var fs = require('fs');
const User = require('../models/User');
const { json } = require('body-parser');


exports.getDoc = (req, res, next) => {
    let statut = req.cookies[process.env.cookie_name].role;
    Doc.find({}, (err, docs)=>{
      if(err) throw err;
      res.render('home',{title: process.env.TITLE, docs:docs, statut : statut})
    }).sort({date: -1})
  

};

exports.addDoc = (req, res, next) => {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      if(fields && files){
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

}

exports.updateDoc = (req, res, next) => {

}
exports.deleteDoc = (req, res, next) => {
    if(req.params.id){
        Doc.findByIdAndDelete({'_id': req.params.id}, (err, doc)=>{
            if(err) throw err;
        })
    }

}