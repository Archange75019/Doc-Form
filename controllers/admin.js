var Doc = require('../models/Doc'); 
var formidable = require('formidable');
var fs = require('fs');
const User = require('../models/User');
var querystring = require("querystring"); 
var EventEmitter = require('events');
var url = require("url"); 
var qs = require('qs');
var htmlspecialchars = require('htmlspecialchars');
var data = require('./data');
const { ProxyAuthenticationRequired } = require('http-errors');
const { brotliCompress } = require('zlib');

var types = [
    'Excel','Word', 'PDF', 'Powerpoint', 'Image', 'Scéance clé en main', 'Archive'
  ];
function getAuthors(){
  var result;
  Doc.find().distinct('author', (err, authors)=>{
   
    var result = authors
 })
 return result
}
  
  var dom = data.getDomaines()

//Récupérer l'ensemble des documents
exports.getAllDocs = (req, res, next) =>{
    let statut = req.cookies[process.env.cookie_name].role;
    let nom = req.cookies[process.env.cookie_name].userName;
    
    //let authors = [];
////////////////////////////////////////////////
    function b(){
      var listAuteurs = new Promise(
        function(resolve, reject){
            resolve(
                Doc.find().distinct('author', (err, authors)=>{

                   //return authors
                })
            )
        }
    )
    listAuteurs.then(
        function(val){
            console.log('Retour dans le code')
            console.log(val)
            return val
        }
    )
    //console.log(listAuteurs)
    return listAuteurs
    }
/////////////////////////////////////////
    async function getListAuthors(){
      let auteurs = await b();
      console.log('toto')
      /*for (var i =0; i< auteurs.length; i++){
        element = auteurs[i]
        authors.push(element)
      }*/
      console.log(auteurs)

      return auteurs
    }

       var a = getListAuthors()
       console.log('a')
       console.log(a)
    Doc.find({}, (err, docs)=>{
      if(err) throw err

      res.render('ListDoc', {title: process.env.TITLE, types: types, docs: docs, domaines: dom, authors:b,statut: statut, nom:nom})
    })     
      
      
      
    
};

exports.filterDocs = (req, res, next) =>{
    
        /**/
        let statut = req.cookies[process.env.cookie_name].role;
        let nom = req.cookies[process.env.cookie_name].userName;
        var paramsRecherche = req.params.recherche;
        var typeBody = req.body.type;
        var dateD = req.body.date1;
        var dateF = req.body.date2
        var domaineBody = req.body.Domaine;
        var domaineParams = req.params.domaine;
        var date1 = dateD.split('-')
        var date2 = dateF.split('-')
        
       
        var dateDeb = new Date(date1[0], date1[1]-1, date1[2])//.toISOString();
        
        var dateFin = new Date(date2[0], date2[1]-1, date2[2])//.toISOString();
        var dateDeb1 = dateDeb.setDate(dateDeb.getDate()+1)
        var dateFin1 = dateFin.setDate(dateFin.getDate()+1)
      console.log('req.params')
      console.log(req.params)
      console.log('req.body')
      console.log(req.body)
      
        if( req.params.recherche != "" && req.body.type != "" && req.body.Domaine != "" && req.body.date1 != "" && req.body.date2 != ""){
          console.log('recherche par type domaine et periode')
          return res.redirect('/admin/SearchDocs/'+req.params.recherche+'/type/'+req.body.type+'/domaine/'+req.body.Domaine+'/periode/'+dateD+'/'+dateF);
        }
        else if( req.params.recherche != "" && req.body.Domaine != "" && date1 != "" && date2 != ""){
          console.log('recherchepar type et periode')
          return res.redirect('/admin/SearchDocs/'+paramsRecherche+'/domaine/'+req.body.Domaine+'/periode/'+dateD+'/'+dateF);
        }
        else if( req.params.recherche != "" && req.body.type != "" && date1 != "" && date2 != ""){
          console.log('recherchepar type et periode')
          return res.redirect('/admin/SearchDocs/'+paramsRecherche+'/type/'+typeBody+'/periode/'+dateD+'/'+dateF);
        }
        else if( req.params.recherche != "" && req.body.type != "" && req.body.Domaine != "" ){
          console.log('recherche par type')
          return res.redirect('/admin/SearchDocs/'+paramsRecherche+'/type/'+typeBody+'/domaine/'+req.body.Domaine);
        }
        else if( req.params.recherche != "" && req.body.type != "" ){
          console.log('recherche par type')
          return res.redirect('/admin/SearchDocs/'+paramsRecherche+'/type/'+typeBody);
        }
        else if( req.params.recherche && req.body.Domaine){
          console.log('On entre dans la route de recherche par domaine')
          return res.redirect('/admin/SearchDocs/'+paramsRecherche+'/domaine/'+domaineBody);
        }
        else if( req.body.author){
          console.log('recherche par periode res')
          return res.redirect('/admin/SearchDocs/author/'+req.body.author);
        };
        
}

exports.getDocsByAuthor = (req, res, next) =>{
    let statut = req.cookies[process.env.cookie_name].role;
    let nom = req.cookies[process.env.cookie_name].userName;
    console.log('auteurs :'+authors)
    authors   = data.getAuthors()

    Doc.find({ 'author': req.params.auteur}, (err, docs)=>{

res.render('ListDoc', {title: process.env.TITLE, types: types, docs: docs, domaines: dom, authorSelect: req.params.auteur, authors:authors,statut: statut, nom:nom})
    })
}