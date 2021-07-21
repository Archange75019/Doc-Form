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
const { Console } = require('console');

var event = new EventEmitter()


champs = [];
var types = [
  'Excel','Word', 'PDF', 'Powerpoint', 'Image', 'Scéance clé en main', 'Archive'
];

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
      res.render('home',{title: process.env.TITLE, docs:docs, statut : statut, nom: nom});
    });
  }
};
//Afficher le formulaire d'ajout de documents
exports.form = (req, res, next)=>{
  let statut = req.cookies[process.env.cookie_name].role;
  let nom = req.cookies[process.env.cookie_name].userName;



var dom =  data.getDomaines()

  res.render('addDoc',{title: process.env.TITLE,domaines: dom,champs: champs, statut: statut, nom: nom})
 
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
            data.putDomaine(domaine)
          }else{
            domaine = champs.domain
          }
          
          var dat = data.getDate()

          var doc = {
            titre: champs.titre,
            domaine: domaine,
            extension: extens,
            description: champs.description,
            author: req.cookies[process.env.cookie_name].userName,
            dateFull:files.fileToUpload.lastModifiedDate.toISOString(),
            size: files.fileToUpload.size,
            createdat: dat,
            link: newpath
          }
console.log(doc)

          Doc.create({'titre': doc.titre, 'domaine': doc.domaine,'extension': doc.extension,'dateFull': doc.dateFull, 'description': doc.description, 'author': doc.author, 'createdat': doc.createdat, 'link': doc.link, 'size':doc.size }, (err, doc)=>{
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
    };
      res.redirect('/app/AddDocs')
    });
};
//Afficher le formulaire de recherche de documents
exports.getDocs = (req, res, next) =>{
    let statut = req.cookies[process.env.cookie_name].role;
    let nom = req.cookies[process.env.cookie_name].userName;

    
    res.render('search',{title: process.env.TITLE, statut: statut, nom: nom }); 
  
  
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
  let recherche = rechercheDef.replace(',', ' ')
  console.log(rechercheDef)
    if(recherche != ""){
      res.redirect('/app/SearchDocs/' + recherche );
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
  if( req.params.recherche){
    var recherche = req.params.recherche
    console.log('Recherche111  :'+recherche)
    Doc.find({ $text: { $search: recherche } }, {score: {$meta: "textScore"}})
    .sort({score:{$meta:"textScore"}})
    .exec(function (err, docs) {
      console.log('documents :')
      console.log(docs)
      
      var dom = data.getDomaines()
      
      res.render('search',{title: process.env.TITLE,domaines: dom, types: types, recherche: req.params.recherche, docs: docs,statut: statut, nom: nom})
    })
  }
};
//recherche par filtre
exports.searchDocByFilter = (req, res, next) =>{
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
    return res.redirect('/app/SearchDocs/'+req.params.recherche+'/type/'+req.body.type+'/domaine/'+req.body.Domaine+'/periode/'+dateD+'/'+dateF);
  }
  else if( req.params.recherche != "" && req.body.Domaine != "" && date1 != "" && date2 != ""){
    console.log('recherchepar type et periode')
    return res.redirect('/app/SearchDocs/'+paramsRecherche+'/domaine/'+req.body.Domaine+'/periode/'+dateD+'/'+dateF);
  }
  else if( req.params.recherche != "" && req.body.type != "" && date1 != "" && date2 != ""){
    console.log('recherchepar type et periode')
    return res.redirect('/app/SearchDocs/'+paramsRecherche+'/type/'+typeBody+'/periode/'+dateD+'/'+dateF);
  }
  else if( req.params.recherche != "" && req.body.type != "" && req.body.Domaine != "" ){
    console.log('recherche par type')
    return res.redirect('/app/SearchDocs/'+paramsRecherche+'/type/'+typeBody+'/domaine/'+req.body.Domaine);
  }
  else if( req.params.recherche != "" && req.body.type != "" ){
    console.log('recherche par type')
    return res.redirect('/app/SearchDocs/'+paramsRecherche+'/type/'+typeBody);
  }
  else if( req.params.recherche && req.body.Domaine){
    console.log('On entre dans la route de recherche par domaine')
    return res.redirect('/app/SearchDocs/'+paramsRecherche+'/domaine/'+domaineBody);
  }
  else if( paramsRecherche != "" && date1 != "" && date2 != ""){
    console.log('recherche par periode res')
    return res.redirect('/app/SearchDocs/'+paramsRecherche+'/periode/'+dateD+'/'+dateF);
  };
 
/*




if( paramsRecherche && domaineBody && date1 && date2){
  return res.redirect('/app/SearchDocs/'+paramsRecherche+'/'+domaineBody+'/'+date1+'/'+date2+'/');
}
*/

};
//Afficher les documents rechercher par type 
exports.getByType = (req, res, next) =>{
  let statut = req.cookies[process.env.cookie_name].role;
  let nom = req.cookies[process.env.cookie_name].userName;
  

   Doc.find({ $text: { $search: req.params.recherche },'extension': req.params.type }, {score: {$meta: "textScore"}})
  .sort({score:{$meta:"textScore"}})
  .exec(function (err, docs) {
    var dom =  data.getDomaines()
    console.log(docs)
  
  res.render('search',{title: process.env.TITLE,domaines: dom, typeSelect:req.params.type, types: types,recherche: req.params.recherche, docs: docs,statut: statut, nom: nom})
  
})
};
//Afficher les documents rechercher par type et par domaine
exports.getByTypeDomaine = (req, res, next) =>{
  let statut = req.cookies[process.env.cookie_name].role;
  let nom = req.cookies[process.env.cookie_name].userName;

   Doc.find({ $text: { $search: req.params.recherche },'extension': req.params.type, 'domaine': req.params.domaine }, {score: {$meta: "textScore"}})
  .sort({score:{$meta:"textScore"}})
  .exec(function (err, docs) {
    
    console.log(docs)
    var dom =  data.getDomaines()
  
  res.render('search',{title: process.env.TITLE,domaines: dom, domaineSelect: req.params.domaine,typeSelect:req.params.type, types: types,recherche: req.params.recherche, docs: docs,statut: statut, nom: nom})
  
})
};
//Afficher les documents par domaine
exports.getByDomaine = (req, res, next) =>{
  let statut = req.cookies[process.env.cookie_name].role;
  let nom = req.cookies[process.env.cookie_name].userName;
  console.log('RECHERCHE PAR FDOMAINE')

   Doc.find({ $text: { $search: req.params.recherche }, 'domaine': req.params.domaine }, {score: {$meta: "textScore"}})
  .sort({score:{$meta:"textScore"}})
  .exec(function (err, docs) {
    console.log('recherche par domaine')
    console.log(docs)
    var dom =  data.getDomaines()
  
  res.render('search',{title: process.env.TITLE,domaines: dom, domaineSelect:req.params.domaine, types: types,recherche: req.params.recherche, docs: docs,statut: statut, nom: nom})
  
})
//****************************************************************************** */
/*let statut = req.cookies[process.env.cookie_name].role;
let nom = req.cookies[process.env.cookie_name].userName;

 Doc.find({ $text: { $search: req.params.recherche },'extension': req.params.type }, {score: {$meta: "textScore"}})
.sort({score:{$meta:"textScore"}})
.exec(function (err, docs) {
  var dom =  data.getDomaines()
  console.log(docs)

res.render('search',{title: process.env.TITLE,domaines: dom, typeSelect:req.params.type, types: types,recherche: req.params.recherche, docs: docs,statut: statut, nom: nom})

})*/
};
//Afficher les documents par type et periode
exports.getByTypePeriod = (req, res, next) => {
  let statut = req.cookies[process.env.cookie_name].role;
  let nom = req.cookies[process.env.cookie_name].userName;
 console.log('recherche par type et periode')
  var date1 = req.params.date1.split('-')
  var date2 = req.params.date2.split('-')
  
 
  var dateDeb = new Date(date1[0], date1[1]-1, date1[2])//.toISOString();
  
  var dateFin = new Date(date2[0], date2[1]-1, date2[2])//.toISOString();
  dateDeb1 = dateDeb.setDate(dateDeb.getDate()+1)
  dateFin1 = dateFin.setDate(dateFin.getDate()+1)
  Doc.find({ $text: { $search: req.params.recherche },'extension':req.params.type, 'dateFull':{ $gte: dateDeb, $lt: dateFin}},{score: {$meta: "textScore"}})
  .sort({score:{$meta:"textScore"}})
  .exec(function (err, docs) {
    console.log('recherche par periode')
    console.log(docs)
    var dom =  data.getDomaines()
  
  res.render('search',{title: process.env.TITLE,domaines: dom, domaineSelect:req.params.domaine, types: types,typeSelect: req.params.type,recherche: req.params.recherche, docs: docs,statut: statut,date1: req.params.date1, date2: req.params.date2, nom: nom})
  
})

};
//Afficher les documents par type, domaine, periode
exports.getByTypeDomainePeriod = (req, res, next) =>{
  let statut = req.cookies[process.env.cookie_name].role;
  let nom = req.cookies[process.env.cookie_name].userName;
 console.log('recherche par type domaine et periode')
  var date1 = req.params.date1.split('-')
  var date2 = req.params.date2.split('-')
  
 
  var dateDeb = new Date(date1[0], date1[1]-1, date1[2])//.toISOString();
  
  var dateFin = new Date(date2[0], date2[1]-1, date2[2])//.toISOString();
  dateDeb1 = dateDeb.setDate(dateDeb.getDate()+1)
  dateFin1 = dateFin.setDate(dateFin.getDate()+1)

  Doc.find({ $text: { $search: req.params.recherche },'domaine':req.params.domaine,'extension':req.params.type, 'dateFull':{ $gte: dateDeb, $lt: dateFin}},{score: {$meta: "textScore"}})
  .sort({score:{$meta:"textScore"}})
  .exec(function (err, docs) {
    console.log('recherche par periode')
    console.log(docs)
    var dom =  data.getDomaines()
  
  res.render('search',{title: process.env.TITLE,domaines: dom, domaineSelect:req.params.domaine, types: types,typeSelect: req.params.type,recherche: req.params.recherche, docs: docs,statut: statut,date1: req.params.date1, date2: req.params.date2, nom: nom})
  
})

};
//Afficher les documents par Domaine, periode
exports.getByDomainePeriod = (req, res, next)=>{
  let statut = req.cookies[process.env.cookie_name].role;
  let nom = req.cookies[process.env.cookie_name].userName;
 
  var date1 = req.params.date1.split('-')
  var date2 = req.params.date2.split('-')
  
 
  var dateDeb = new Date(date1[0], date1[1]-1, date1[2])//.toISOString();
  
  var dateFin = new Date(date2[0], date2[1]-1, date2[2])//.toISOString();
  dateDeb1 = dateDeb.setDate(dateDeb.getDate()+1)
  dateFin1 = dateFin.setDate(dateFin.getDate()+1)

  Doc.find({ $text: { $search: req.params.recherche }, 'domaine': req.params.domaine, 'dateFull':{ $gte: dateDeb, $lt: dateFin}},{score: {$meta: "textScore"}})
  .sort({score:{$meta:"textScore"}})
  .exec(function (err, docs) {
    console.log('recherche par periode')
    console.log(docs)
    var dom =  data.getDomaines()
  
  res.render('search',{title: process.env.TITLE,domaines: dom, domaineSelect:req.params.domaine, types: types,recherche: req.params.recherche, docs: docs,statut: statut,date1: req.params.date1, date2: req.params.date2, nom: nom})
  
})

};
exports.getByPeriod = (req, res, next)=>{
  let statut = req.cookies[process.env.cookie_name].role;
  let nom = req.cookies[process.env.cookie_name].userName;
  console.log('RECHERCHE PAR periode')
console.log(req.params.date1)
  var date1 = req.params.date1.split('-')
  var date2 = req.params.date2.split('-')
  
 
  var dateDeb = new Date(date1[0], date1[1]-1, date1[2])//.toISOString();
  
  var dateFin = new Date(date2[0], date2[1]-1, date2[2])//.toISOString();
  dateDeb1 = dateDeb.setDate(dateDeb.getDate()+1)
  dateFin1 = dateFin.setDate(dateFin.getDate()+1)


   Doc.find({ $text: { $search: req.params.recherche }, 'dateFull':{ $gte: dateDeb, $lt: dateFin}},{score: {$meta: "textScore"}})
  .sort({score:{$meta:"textScore"}})
  .exec(function (err, docs) {
    console.log('recherche par periode')
    console.log(docs)
    var dom =  data.getDomaines()
  
  res.render('search',{title: process.env.TITLE,domaines: dom, domaineSelect:req.params.domaine, types: types,recherche: req.params.recherche, docs: docs,statut: statut,date1: req.params.date1, date2: req.params.date2, nom: nom})
  
})

}
exports.reinitFilter = (req, res, next)=>{
  res.redirect('/app/SearchDocs/'+req.params.recherche)
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
      if(err) throw err;      var chemin = doc.link.replace(/\/$/, "");
      cheminDef = chemin.substring (chemin.lastIndexOf( "/" )+1 );
      var dom =  data.getDomaines()
        res.render('updateDoc',{title: process.env.TITLE,FileName: cheminDef,doc: doc,domaines: dom, statut: statut, nom: nom});
      
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
        champs = {
          'titre':htmlspecialchars(fields.titre) ,
          'description':htmlspecialchars(fields.description)
        }
        //var date = new Date();
        if(fields.domain == "Autre"){
          champs.domaine = fields.domaine
        }else{
          champs.domaine = fields.domain
        }
        var dat = data.getDate()
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
            
            
            console.log('date de mise à jour :'+dat)
            //const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            var doc = {
              titre: champs.titre,
              domaine: champs.domaine,
              extension: extens,
              description: champs.description,
              author: req.cookies[process.env.cookie_name].userName,
              dateFull:files.fileToUpload.lastModifiedDate,
              size: files.fileToUpload.size,
              createdat: dat,
              link: newpath
            }
            console.log('Mis à jours du doc')
            console.log(doc)
            Doc.findByIdAndUpdate({'_id': req.params.id},
            {'titre': doc.titre, 'author': doc.author, 'domaine': doc.domaine, 'description':doc.description, 'link':doc.link, 'size': doc.size, 'createdat':doc.createdat, 'extension': doc.extension, 'dateFull': doc.dateFull}, (err, data)=>{
              if(err) throw err
              res.redirect('/app/MyDocs');
            })
          });
  
        

        
        }else{
          Doc.findByIdAndUpdate({'_id': req.params.id}, {'titre': champs.titre, 'description': champs.description, 'domaine': champs.domaine, 'updatedat': dat}, (err, data)=>{
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
