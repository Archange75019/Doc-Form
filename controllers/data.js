const { Console } = require('console');
var Doc = require('../models/Doc')
var fs = require('fs');

function objectsToSv(a, b) {
    var x = (b && b.columnDelimiter) ? b.columnDelimiter : ';',
        y = (b && b.lineDelimiter) ? b.lineDelimiter : 'n',
        k = Object.keys(a[0]),
        l = k.length,
        s = k.join(x) + y,
        i = 0, j = a.length, r;
    for (; i  < j; i++) {
      r = a[i];
      if (i > 0) {
        s += y;
      }
      for (var c = 0; c < l; c++) {
        if (c > 0) {
          s += x;
        }
        s += r[k[c]];
      }
    }
    return s;
  }
function getRoleByService(service){
    const result =  fs.readFileSync('controllers/organigramme/'+service+'.csv', 'utf8', function(err, data) {
      if (err) throw err;
    });
    return result
  
}
//Ajout de service
exports.putService = (service)=>{
  console.log(service)
    var data = service.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    
    fs.appendFile(service+'.csv', data+',', function (err) {
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
    console.log('jours  :'+dayDef)
    var moisDef = mois[month]
    var date = dayDef + ' '+num+' '+moisDef+ ' '+year
    console.log('date d\'ajout  :'+date)
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
  
  var data = role[1].toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

     fs.appendFile('controllers/organigramme/'+role[0]+'.csv', data+',\n', 'utf8', function(err){

     });
  
    
}
exports.getRoles = (services)=>{
  //console.log(services)
    if (fs.existsSync('controllers/organigramme')) {
      var roleByService = new Object()
      for( var i = 1; i< services.length; i++){
        var titleFile = services[i];
        var appel = getRoleByService(services[i])

        /*const result =  fs.readFileSync('controllers/organigramme/'+titleFile+'.csv', 'utf8', function(err, data) {
          if (err) throw err;
        });
        return result*/
        if( appel.length != 0){
          var tableau = appel.split('\n')
          roleByService[services[i]] = tableau
        }

      }
      
      return roleByService

    }
        /*const result =  fs.readFileSync('personnage2.csv', 'utf8', function(err, data) {
            if (err) throw err;
            console.log('type   /////'+typeof data)
            
          });
          //console.log('resultat/.//     :'+result.split('\n'))
          var services = {}
          var a = result.split("\n")
          for(var i = 0; i< a.length; i++){
              if(a[i] != ""){
                var element = a[i].split('|')
                console.log('XXXXXXXX')
                if(element[0] == element[0].toUpperCase()){
                    services.element = element
                    services.element.defineProperty(element[1])
                }
              }
              

          }
         
          return a
          /*var tab = new Array()
          //console.log(typeof result)
          tab = result.split(',');
          tab.sort()
    
          console.log('tableau :'+ tab)
          return tab
    
      }*/


}



