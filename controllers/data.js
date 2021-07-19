const { Console } = require('console');
var Doc = require('../models/Doc')
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
exports.getDate = ()=>{
    
    const event = new Date();
    var jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    var mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Décembre' ]
    var day = event.getDay()-1;
    var month = event.getMonth();
    var num  = event.getDate();
    var dayDef = jours[day]
    var moisDef = mois[month]
    var date = dayDef + ' '+num+' '+moisDef
    return date

}
exports.getAuthors = (req, res, next)=>{

    /*return new Promise(resolve => {

        resolve(
            Doc.find().distinct('author', (err, authors)=>{
                console.log('auteur dans la fonctions')
               return authors
            })

    )
    })*/
    var listAuteurs = new Promise(
        function(resolve, reject){
            resolve(
                Doc.find().distinct('author', (err, authors)=>{

                   return authors
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


 
 