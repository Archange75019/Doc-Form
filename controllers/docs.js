var Doc = require('../models/Doc'); 
var formidable = require('formidable');
var fs = require('fs');
const User = require('../models/User');
var querystring = require("querystring"); 
var EventEmitter = require('events');
const path = require("path");
var url = require("url"); 
var htmlspecialchars = require('htmlspecialchars');

var event = new EventEmitter()


champs = []
//Afficher les documents les plus récents en page home
exports.getDoc = (req, res, next) => {
  let statut = req.cookies[process.env.cookie_name].role; 
   let nom = req.cookies[process.env.cookie_name].userName;
  if(statut){
    Doc.find({})
    .sort({ dateFull: -1 })
    .limit(12)
    .exec(function (err, docs){
      if(err) throw err;
      res.render('home',{title: process.env.TITLE, docs:docs, statut : statut, nom: nom})
    })
  }
};
//Afficher le formulaire d'ajout de documents
exports.form = (req, res, next)=>{
  let statut = req.cookies[process.env.cookie_name].role;
  let nom = req.cookies[process.env.cookie_name].userName;
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
  res.render('addDoc',{title: process.env.TITLE,domaines: filteredArray,champs: champs, statut: statut, nom: nom})
  });
};
//Ajouter un document à la base
exports.addDoc = (req, res, next) => {
  console.log('on accede à la route ajout')
    var form = new formidable.IncomingForm();
    form.multiples = false;

    form.parse(req,  (err, fields, files)=> {
      if(err) {
        console.log(err)
        
      }else{
        console.log('fields '+fields)

        champs = {
          'titre':htmlspecialchars(fields.titre) ,
          'domain':htmlspecialchars(fields.domain) ,
          'domaine':htmlspecialchars(fields.domaine) ,
          'description':htmlspecialchars(fields.description)
        }
        var oldpath = files.fileToUpload.path;
        console.log(files)

        var newpath = './uploads/' + files.fileToUpload.name;

        var ext = newpath;
        var re = /(?:\.([^.]+))?$/;
        var extens = re.exec(ext)[1];
        console.log('extens '+extens)
  
        switch(extens){
          case 'pdf':
            case 'PDF':
            extens = "PDF"
            break;
            case 'doc':
            case'docx':
            extens = "Word";
            break;
            case 'xlsx':
            case 'xls':
            extens = "Excel";
            break;
            case 'ppt':
            case 'pptx':
            extens = "Powerpoint";
            break;
            case 'jpg':
            case 'jpeg':  
            case 'png':
            case 'gif':
            extens = "Image";
            break;
            case 'flv':
            case 'mp4':
            extens = "Video";
            break;
            case 'zip':
              extens = "Archive";
              break;
            default:
                extens = "document"
                return
        }

        
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
            extension: extens,
            description: champs.description,
            author: req.cookies[process.env.cookie_name].userName,
            dateFull:files.fileToUpload.lastModifiedDate,
            size: files.fileToUpload.size,
            date: date.toLocaleString('fr-FR'),
            link: newpath
          }

          Doc.create({'titre': doc.titre, 'domaine': doc.domaine,'extension': doc.extension,'dateFull': doc.dateFull, 'description': doc.description, 'author': doc.author, 'date': doc.date, 'link': doc.link, 'size':doc.size }, (err, doc)=>{
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
    let nom = req.cookies[process.env.cookie_name].userName;
  res.render('search',{title: process.env.TITLE,statut: statut, nom: nom }); 
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
      res.redirect('/app/SearchDocs?recherche=' + rechercheDef );
    }
}; 
//Afficher les documents de l'utilisateur courant
exports.MyDocs = (req, res, next)=>{
  let statut = req.cookies[process.env.cookie_name].role;
  let nom = req.cookies[process.env.cookie_name].userName;
  Doc.find({'author': req.cookies[process.env.cookie_name].userName}, (err, docs)=>{
    if(err) throw err;
    res.render('MyDocs',{title: process.env.TITLE, docs: docs, statut: statut, nom: nom    })
  })
};
//Afficher le résultat d'une recherche de documents
exports.getResults = (req, res, next) => {
  let statut = req.cookies[process.env.cookie_name].role;
  let nom = req.cookies[process.env.cookie_name].userName;
  console.log('AAAAA')
  if( req.params.recherche){
    var recherche = req.params.recherche
    console.log('recherche :'+recherche)
    Doc.find({ $text: { $search: recherche } }, {score: {$meta: "textScore"}})
    .sort({score:{$meta:"textScore"}})
    .exec(function (err, docs) {
      res.render('search',{title: process.env.TITLE, recherche: req.params.recherche, docs: docs,statut: statut, nom: nom})

    })
  }
};
//Réinitialiser les terme de la recherche
exports.resetSearch = (req, res, next) => {
  res.redirect('/app/SearchDocs');
};
//recherche par type
exports.searchDocByType = (req, res, next) =>{
  var params = req.params.recherche
  var type = req.body.type

   res.redirect('/app/SearchDocs?recherche='+params+'?type='+type);
  
};
//Afficher les documents rechercher par type 
exports.getByType = (res, req, next) =>{


  console.log('&&&&&&' + req.path)
  console.log(req.url, req.originalUrl, req.baseUrl, req.path)
  var url_parts = url.parse(req.url, true);
var query = url_parts.query;
console.log(query)

  //console.log('type :'+aa)
 //const search = req.params.result

 
  console.log('type :'+type)
    Doc.find({'extension': req.params.type}, (err, docs)=>{
      if(err) throw err;
      console.log('docs')
      console.log(docs)
      res.render('search',{title: process.env.TITLE, recherche: req.params.recherche, docs: docs,statut: statut, nom: nom})
    })
  
}
//Télécharger un document
exports.download = (req, res, next) => {
  if(req.params.id){
    Doc.findOne({'_id': req.params.id},{'link': 1}, {new: true}, function (error, docFile)
    {
      var file = docFile.link;
      res.download(file)
    })
  }
};
// Renvoyer le formulaire de modification de document avec les infos du doc
exports.getUpdateDoc = (req, res, next) => {
  let statut = req.cookies[process.env.cookie_name].role;
  let nom = req.cookies[process.env.cookie_name].userName;
  if(req.params.id){
    Doc.findById({'_id': req.params.id}, (err, doc)=>{
      if(err) throw err;
      var chemin = doc.link.replace(/\/$/, "");
      cheminDef = chemin.substring (chemin.lastIndexOf( "/" )+1 );
      Doc.find({},{'domaine': 1},(err, domaines)=>{
        var dom = [];
        for(var i=0; i<domaines.length; i++ ){
          var element = domaines[i].domaine;
          dom.push(element);
        };
        const filteredArray = dom.filter(function(ele , pos){
          return dom.indexOf(ele) == pos;
        });
        res.render('updateDoc',{title: process.env.TITLE,FileName: cheminDef,doc: doc,domaines: filteredArray, statut: statut, nom: nom});
      });
    });
  };
};
//Mettre à jour la fiche du document
exports.postUpdateDoc = (req, res, next) => {
  let statut = req.cookies[process.env.cookie_name].role;
  var form = new formidable.IncomingForm();
    form.multiples = false;
    form.parse(req,  (err, fields, files)=> {
      if(err) {
        console.log(err)
        
      }else{
        console.log('fields ')
        console.log(fields)
        console.log('files')
        console.log( files)

        champs = {
          'titre':htmlspecialchars(fields.titre) ,
          'description':htmlspecialchars(fields.description)
        }
        var date = new Date();
        if(fields.domain == "Autre"){
          champs.domaine = fields.domaine
        }else{
          champs.domaine = fields.domain
        }

        if(files.fileToUpload.size > 0){
          var fs = require('fs');
          Doc.findById({'_id': req.params.id}, {'link':1}, (err, data)=>{
            if(err) throw err;
            if(data){
              console.log('datatatata');
              fs.unlinkSync(data.link)
            }
          })
          var oldpath = files.fileToUpload.path;
          console.log('vieux chemin :'+oldpath)
          var newpath = './uploads/' + files.fileToUpload.name;
          console.log('new chemin :' +newpath)
          var ext = newpath;
          var re = /(?:\.([^.]+))?$/;
          var extens = re.exec(ext)[1]; 
          switch(extens){
            case 'pdf':
              case 'PDF':
              extens = "PDF"
              break;
              case 'doc':
              case'docx':
              extens = "Word";
              break;
              case 'xlsx':
              case 'xls':
              extens = "Excel";
              break;
              case 'ppt':
              case 'pptx':
              extens = "Powerpoint";
              break;
              case 'jpg':
              case 'jpeg':  
              case 'png':
              case 'gif':
              extens = "Image";
              break;
              case 'flv':
              case 'mp4':
              extens = "Video";
              break;
              case 'zip':
                extens = "Archive";
                break;
              default:
                  extens = "document"
                  return
          }
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
            
            
            //const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            var doc = {
              titre: champs.titre,
              domaine: champs.domaine,
              extension: extens,
              description: champs.description,
              author: req.cookies[process.env.cookie_name].userName,
              dateFull:files.fileToUpload.lastModifiedDate,
              size: files.fileToUpload.size,
              date: date.toLocaleString('fr-FR'),
              link: newpath
            }
            Doc.findByIdAndUpdate({'_id': req.params.id},
            {'titre': doc.titre, 'author': doc.author, 'domaine': doc.domaine, 'description':doc.description, 'link':doc.link, 'size': doc.size, 'date':doc.date, 'extension': doc.extension, 'dateFull': doc.dateFull}, (err, data)=>{
              if(err) throw err
              res.redirect('/app/MyDocs');
            })
          });
  
        

        
        }else{
          Doc.findByIdAndUpdate({'_id': req.params.id}, {'titre': champs.titre, 'description': champs.description, 'domaine': champs.domaine, 'date': date.toLocaleString('fr-FR')},{new: true}, (err, data)=>{
            if(err) throw err;
            res.redirect('/app/MyDocs');
          })
        }
      }
    })
};
//Supprimer un document
exports.deleteDoc = (req, res, next) => {
  let statut = req.cookies[process.env.cookie_name].role;
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