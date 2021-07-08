const { Console } = require('console');
var fs = require('fs');

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


 
 