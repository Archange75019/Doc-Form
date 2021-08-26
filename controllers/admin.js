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
const { get } = require('http');

var types = [
    'Excel','Word', 'PDF', 'Powerpoint', 'Image', 'Scéance clé en main', 'Archive'
  ];

var auteurs = [];
Doc.find().distinct('author', (err, authors)=>{
  if(authors){
    for( var i =0; i<authors.length; i++){
      var element  = authors[i]
      auteurs.push(element)
    }
  }
})

  
  var dom = data.getDomaines()

//Récupérer l'ensemble des documents
exports.getAllDocs = (req, res, next) =>{
  let statut = req.cookies[process.env.cookie_name].role; 
  let nom = req.cookies[process.env.cookie_name].userName;
  let autorisation = req.cookies[process.env.cookie_name].autorisation;  
       Doc.find({}, (err, docs)=>{
        if(err) throw err
        res.render('ListDoc', {title: process.env.TITLE, autorisation: autorisation, types: types, docs: docs, domaines: dom, authors:auteurs,statut: statut, nom:nom})
      })  
};

exports.filterDocs = (req, res, next) =>{
  let statut = req.cookies[process.env.cookie_name].role; 
  let nom = req.cookies[process.env.cookie_name].userName;
  let autorisation = req.cookies[process.env.cookie_name].autorisation;
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

      if(req.body.author != "" && req.body.Domaine != "" && dateD != "" && dateF != ""){
        return res.redirect('/admin/SearchDocs/author/'+req.body.author+'/domaine/'+req.body.Domaine+'/periode/'+dateD+'/'+dateF);
      }

      else if (req.body.author != "" && dateD != "" && dateF != ""){
        return res.redirect('/admin/SearchDocs/author/'+req.body.author+'/periode/'+dateD+'/'+dateF);
      }
      else if(req.body.Domaine != "" && dateD != "" && dateF != ""){
        return res.redirect('/admin/SearchDocs/domaine/'+req.body.Domaine+'/periode/'+dateD+'/'+dateF);
      }
       
      else if (req.body.author != "" && req.body.Domaine != ""){
        return res.redirect('/admin/SearchDocs/author/'+req.body.author+'/domaine/'+req.body.Domaine);
      }
      else if( req.body.author != ""){
        console.log('recherche par auteur')
        return res.redirect('/admin/SearchDocs/author/'+req.body.author);
      }
      else if (req.body.Domaine != ""){
        return res.redirect('/admin/SearchDocs/domaine/'+req.body.Domaine)
      } 
      else if (dateD != "" && dateF != ""){
        return res.redirect('/admin/SearchDocs/periode/'+dateD+'/'+dateF+'/')
      } 
      /*
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
        ;*/
        
}

exports.getDocsByAuthor = (req, res, next) =>{
  let statut = req.cookies[process.env.cookie_name].role; 
  let nom = req.cookies[process.env.cookie_name].userName;
  let autorisation = req.cookies[process.env.cookie_name].autorisation;
    Doc.find({ 'author': req.params.auteur}, (err, docs)=>{
      res.render('ListDoc', {title: process.env.TITLE, autorisation: autorisation, types: types, docs: docs, domaines: dom, authorSelect: req.params.auteur, authors:auteurs,statut: statut, nom:nom})
    })
};

exports.getDocsByDomaine = (req, res, next) =>{
  let statut = req.cookies[process.env.cookie_name].role; 
  let nom = req.cookies[process.env.cookie_name].userName;
  let autorisation = req.cookies[process.env.cookie_name].autorisation;
    Doc.find({ 'domaine': req.params.domaine}, (err, docs)=>{
      res.render('ListDoc', {title: process.env.TITLE, autorisation: autorisation, types: types, docs: docs, domaines: dom, authorSelect: req.params.auteur, authors:auteurs,statut: statut, nom:nom})
    })
}

exports.getDocsByAuthorDomain = (req, res, next) =>{
  let statut = req.cookies[process.env.cookie_name].role; 
  let nom = req.cookies[process.env.cookie_name].userName;
  let autorisation = req.cookies[process.env.cookie_name].autorisation;
  Doc.find({ 'author': req.params.auteur, 'domaine':req.params.domaine}, (err, docs)=>{
    res.render('ListDoc', {title: process.env.TITLE, autorisation: autorisation, types: types, docs: docs, domaines: dom, authorSelect: req.params.auteur, authors:auteurs,statut: statut, nom:nom})
  })
}
exports.getDocsByAuthorPeriod = (req, res, next) =>{
  let statut = req.cookies[process.env.cookie_name].role; 
  let nom = req.cookies[process.env.cookie_name].userName;
  let autorisation = req.cookies[process.env.cookie_name].autorisation;
  var date1 = req.params.date1.split('-')
  var date2 = req.params.date2.split('-')
  
 
  var dateDeb = new Date(date1[0], date1[1]-1, date1[2]).toISOString();
  console.log('date de debut  :'+dateDeb)
  
  var dateFin = new Date(date2[0], date2[1]-1, date2[2]).toISOString();
  console.log('date de fin  :'+dateFin)
  //dateDeb1 = dateDeb.setDate(dateDeb.getDate()+1)
  //dateFin1 = dateFin.setDate(dateFin.getDate()+1)
  Doc.find({ 'author': req.params.auteur, 'dateFull':{ $gte: dateDeb, $lt: dateFin}}, (err, docs)=>{
    console.log(docs)
    res.render('ListDoc', {title: process.env.TITLE, autorisation: autorisation, types: types, docs: docs, domaines: dom, authorSelect: req.params.auteur,date1: req.params.date1, date2: req.params.date2, authors:auteurs,statut: statut, nom:nom})
  })
}

exports.getDocsByPeriod = (req, res, next) =>{
  let statut = req.cookies[process.env.cookie_name].role; 
  let nom = req.cookies[process.env.cookie_name].userName;
  let autorisation = req.cookies[process.env.cookie_name].autorisation;
  var date1 = req.params.date1.split('-')
  var date2 = req.params.date2.split('-')
  
 
  var dateDeb = new Date(date1[0], date1[1]-1, date1[2]).toISOString();
  console.log('date de debut  :'+dateDeb)
  
  var dateFin = new Date(date2[0], date2[1]-1, date2[2]).toISOString();
  console.log('date de fin  :'+dateFin)
  //dateDeb1 = dateDeb.setDate(dateDeb.getDate()+1)
  //dateFin1 = dateFin.setDate(dateFin.getDate()+1)
  Doc.find({ 'dateFull':{ $gte: dateDeb, $lt: dateFin}}, (err, docs)=>{
    console.log(docs)
    res.render('ListDoc', {title: process.env.TITLE, autorisation: autorisation, types: types, docs: docs, domaines: dom, authorSelect: req.params.auteur,date1: req.params.date1, date2: req.params.date2, authors:auteurs,statut: statut, nom:nom})
  })

}
exports.getDocsByDomainePeriod = (req, res, next) =>{
  let statut = req.cookies[process.env.cookie_name].role; 
  let nom = req.cookies[process.env.cookie_name].userName;
  let autorisation = req.cookies[process.env.cookie_name].autorisation;
  var date1 = req.params.date1.split('-')
  var date2 = req.params.date2.split('-')
  
 
  var dateDeb = new Date(date1[0], date1[1]-1, date1[2]).toISOString();
  console.log('date de debut  :'+dateDeb)
  
  var dateFin = new Date(date2[0], date2[1]-1, date2[2]).toISOString();
  console.log('date de fin  :'+dateFin)
  //dateDeb1 = dateDeb.setDate(dateDeb.getDate()+1)
  //dateFin1 = dateFin.setDate(dateFin.getDate()+1)
  Doc.find({ 'domaine': req.params.domaine,'dateFull':{ $gte: dateDeb, $lt: dateFin}}, (err, docs)=>{
    console.log(docs)
    res.render('ListDoc', {title: process.env.TITLE, autorisation: autorisation, types: types, docs: docs, domaines: dom, authorSelect: req.params.auteur,date1: req.params.date1, date2: req.params.date2, authors:auteurs,statut: statut, nom:nom})
  })

}
exports.getDocsByAuthorDomainePeriod = (req, res, next)=>{
  let statut = req.cookies[process.env.cookie_name].role; 
  let nom = req.cookies[process.env.cookie_name].userName;
  let autorisation = req.cookies[process.env.cookie_name].autorisation;
  var date1 = req.params.date1.split('-')
  var date2 = req.params.date2.split('-')
  
 
  var dateDeb = new Date(date1[0], date1[1]-1, date1[2]).toISOString();
  console.log('date de debut  :'+dateDeb)
  
  var dateFin = new Date(date2[0], date2[1]-1, date2[2]).toISOString();
  console.log('date de fin  :'+dateFin)
  //dateDeb1 = dateDeb.setDate(dateDeb.getDate()+1)
  //dateFin1 = dateFin.setDate(dateFin.getDate()+1)
  Doc.find({ 'author': req.params.auteur,'domaine': req.params.domaine,'dateFull':{ $gte: dateDeb, $lt: dateFin}}, (err, docs)=>{
    console.log(docs)
    res.render('ListDoc', {title: process.env.TITLE, autorisation: autorisation, types: types, docs: docs, domaines: dom, authorSelect: req.params.auteur,date1: req.params.date1, date2: req.params.date2, authors:auteurs,statut: statut, nom:nom})
  })

}
exports.reinitfilter = (req, res, next)=>{
  res.redirect('/admin/Documents')
}
exports.createServices = (req, res, next) =>{
  let statut = req.cookies[process.env.cookie_name].role;
  let nom = req.cookies[process.env.cookie_name].userName;
  let autorisation = req.cookies[process.env.cookie_name].autorisation;
  let role = req.cookies[process.env.cookie_name].role;
  let serv = req.cookies[process.env.cookie_name].service;
  var services = data.getServices()
  res.render('services',{title: process.env.TITLE, role: role, services: services, autorisation: autorisation, statut: statut, nom:nom})
}

exports.putServices = (req, res, next) =>{
  let statut = req.cookies[process.env.cookie_name].role;
  let nom = req.cookies[process.env.cookie_name].userName;
  if(req.body.service){
    console.log('service')
    console.log(req.body.service)
    data.putService(req.body.service)
    res.redirect('/admin/Services')
  }
}






exports.getRoles = (req, res, next) =>{
  let statut = req.cookies[process.env.cookie_name].role; 
  let nom = req.cookies[process.env.cookie_name].userName;
  let autorisation = req.cookies[process.env.cookie_name].autorisation;

  var services = data.getServices()




  var roles = data.getRoles(services)
  //console.log(roles)
  console.log('Affichage des roles en fonction du service XXX')
  console.log(roles)

  res.render('Roles',{title: process.env.TITLE, autorisation: autorisation, roles: roles, services: services, statut: statut, nom:nom})

}
exports.putRoles = (req, res, next)=>{
  let statut = req.cookies[process.env.cookie_name].role;
  let nom = req.cookies[process.env.cookie_name].userName;

  var role = [
    req.params.role,
    req.body.nameRole
  ]
  console.log("ROLE")
  console.log(role)
data.putRoles(role)
res.redirect('/admin/Roles')


}
exports.downLoadLog = (req, res, next) =>{
  var file = require('../controllers/organigramme/access.csv')
  console.log('fichier à télécharger')
  if (fs.existsSync(file)) { 
    console.log('fichier téléchargé')
  res.download(file)
  res.redirect('/admin/getLogs')
  }
  
}