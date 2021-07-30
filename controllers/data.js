const { Console } = require('console');
var Doc = require('../models/Doc')
var fs = require('fs');

//Ajout de service
exports.putService = (service)=>{
    var data = service.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    
    fs.appendFile('services.csv', data+',', function (err) {
        if (err) throw err;
        console.log('Fichier créé !');
     });

}
//Récupérer les services
exports.getServices = ()=>{
    const result =  fs.readFileSync('services.csv', 'utf8', function(err, data) {
        if (err) throw err;
      });
      var tab = new Array()
      //console.log(typeof result)
      tab = result.split(',');
      tab.sort()

      console.log('tableau :'+ tab)
      return tab

}

//Ajout de domaine
exports.putDomaine = ( req, res, next ) =>{    
    var data = domaine.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    
    fs.appendFile('domaines.csv', data+',', function (err) {
        if (err) throw err;
        console.log('Fichier créé !');
     });
}
//Récupérer la liste des domaines
exports.getDomaines = ()=>{
    const result =  fs.readFileSync('domaines.csv', 'utf8', function(err, data) {
        if (err) throw err;
      });
      var tab = new Array()
      //console.log(typeof result)
      tab = result.split(',');
      tab.sort()

      console.log('tableau :'+ tab)
      return tab

}
exports.getDate = ()=>{
    
    const event = new Date();
    var jours = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
    var mois = ['Janv', 'Févr', 'Mars', 'Avri', 'Mai', 'Juin', 'Juil', 'Aout', 'Sept', 'Oct', 'Nov', 'Déc' ]
    var day = event.getDay()-1;
    var month = event.getMonth();
    var num  = event.getDate();
    var year = event.getFullYear();
    var dayDef = jours[day]
    var moisDef = mois[month]
    var date = dayDef + ' '+num+' '+moisDef+ ' '+year
    return date

}
exports.getExtens = (extens) =>{
    switch(extens){
        case 'pdf':
          case 'PDF':
          case 'pdf':
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
          case 'bmp':
          case 'gif':
          case 'webp':
          extens = "Image";
          break;
          case 'oga':
          case 'wav':
          case 'weba':
          case 'mid':
          case 'midi':
          case 'mp3':
          extens = "Audio"
          case 'flv':
          case 'mp4':
          case 'avi':
          case 'mpeg':
          case 'ogv':
          case 'webm':
          extens = "Video";
          break;
          case 'zip':
          extens = "Archive";
            break;
          default:
              extens = "document"
              return
      }
      return extens
}
exports.putRoles = (role)=>{
     var json = JSON.stringify(role);

     fs.appendFile('personnage2.csv', json+',', 'utf8', function(err){

     });
  
    
}
exports.getRoles = ()=>{

    if (fs.existsSync('personnage2.csv')) {
        const result =  fs.readFileSync('personnage2.csv', 'utf8', function(err, data) {
            if (err) throw err;
          });
          var tab = new Array()
          //console.log(typeof result)
          tab = result.split(',');
          tab.sort()
    
          console.log('tableau :'+ tab)
          return tab
    
      }

}



