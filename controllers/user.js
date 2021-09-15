const jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt')
var User = require('../models/User');
var nodemailer = require('nodemailer');
const notifier = require('node-notifier');
var data = require('../controllers/data')

function generate(l){
    if (typeof l==='undefined'){var l=20;}
    /* c : chaîne de caractères alphanumérique */
    var c='abcdefghijknopqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ12345679',
    n=c.length,
    /* p : chaîne de caractères spéciaux */
    p='!@#$+-*&_',
    o=p.length,
    r='',
    n=c.length,
    /* s : determine la position du caractère spécial dans le mdp */
    s=Math.floor(Math.random() * (p.length-1));

    for(var i=0; i<l; ++i){
        if(s == i){
            /* on insère à la position donnée un caractère spécial aléatoire */
            r += p.charAt(Math.floor(Math.random() * o));
        }else{
            /* on insère un caractère alphanumérique aléatoire */
            r += c.charAt(Math.floor(Math.random() * n));
        }
    }
    return r;
};
var role =[
  'administrateur',
  'DTF',
  'responsable pédagogique',
  'formateur'
]

// fonctions d'envoi de mail
function sendMail(destinataire, objet, corp){
  smtpTrans = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
      authMethod: "PLAIN",
      user: process.env.EMAIL,
      pass: process.env.PASS
    }
  });
  var mailOptions = {
    from: process.env.EMAIL, // sender address
    to: destinataire, // list of receivers
    subject: objet, // Subject line
    html: corp // html body
  };
  smtpTrans.sendMail(mailOptions, function(error, info){
    console.log(info)
    if(error){
        return console.log(error);
    }

  });
};
//Connexion à l'appli 
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
         toastr.error('Information d\'identification erronnées')
          res.redirect('/')
        }
        bcrypt.compare(req.body.password, user.password)
          .then(valid => {
            if (!valid) {
              toastr.error('Information d\'identification erronnées');
              res.redirect('/')
            }
            console.log('USER SE CONNECTE')
             const token = {
                userId: user._id,
                userName: user.username,
                service: user.service,
                autorisation: user.autorisation,
                role: user.role,
                token: jwt.sign(
                  { userId: user._id },
                  process.env.TOKEN,
                  { expiresIn: '8h' }
                )
              };
              console.log(token)
              res.cookie(process.env.cookie_name,token,{maxAge: 288*100*1000, httpOnly: true })
           res.redirect('/app/home/1')
          })
          .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};
//Afficher le formulaire d'inscription utilisateur
exports.registerShow = (req, res, next) =>{
  let statut = req.cookies[process.env.cookie_name].role;
  let nom = req.cookies[process.env.cookie_name].userName;
  let autorisation = req.cookies[process.env.cookie_name].autorisation;
  let role = req.cookies[process.env.cookie_name].role;
  let serv = req.cookies[process.env.cookie_name].service;
  var Role = role;
  var services = data.getServices()
  
    if(statut == "DTF"){
      var Role = role.splice(0, 1) 
    }
    if(statut == "responsable pédagogique"){
      var Role = role.splice(0, 2)
    }
    res.render('register', {title: process.env.TITLE, serv: serv/*, service: service*/, autorisation: autorisation, services: services, role: Role, statut: statut, nom: nom})
  

  

  
};
//Inscription utilisateur
exports.register = (req, res, next) => {
    User.findOne({ email: req.body.email }, ( err, user)=>{
        if (!user) {
            var Pass = generate()

           bcrypt.hash(Pass, 10)
           .then(hash =>{ 
              var user = {
                username: req.body.username,
                email: req.body.email,
                password: hash,
                autorisation: req.body.registerUser,
                service: req.body.service,
                role: req.body.role,
                site: req.body.site
              };
              if(req.body.role == "administrateur"){
                user.n1 = "none"; 
              }else{
                user.n1 = ""+req.cookies[process.env.cookie_name].userId+"";
              };
              var ip = req.headers.origin
              console.log(req.headers)
              User.create(user, (err, userData)=>{
                if(err) throw err;
                var corp = '<h1 style="color: red">Création de compte sur Doc-Form</h1>'+
                '<img style="width: 300px; height: auto;"src="http://instep-leolagrange-idf.e-monsite.com/medias/site/logos/instep.jpg?fx=r_500_250"><br>'+
                '<p> Votre compte vient d\'être créé sur la plateforme de partage documentaire <span style="color: red;"><b>Doc-Form</b></span>.'+
                '<p style="margin-top: 10px">Pour vous connecter, rendez-vous à l\'adresse <a href="'+ ip +'">'+ip+'</a> et utilisez les informations de connexion suivantes : </p>'+ 
                '<p><b>Nom d\'utilisateur :</b>    '+req.body.email+'</p>'+
                '<p><b>Mot de passe : </b>    '+Pass+'</p></br>'+
                '<p style="margin-top: 10px">Si vous rencontrez des problèmes de connexion, Veuillez contacter l\'administrateur de la plateforme: <a href="mailto:arnaud.escalier@gmail.com?subject=Problème de connexion">arnaud.escalier@gmail.com</a></p>'+
                '<b> Bon partage</b></br>'+
                
                '</br><p style="color: blue; font-size: 18px;"> Administrateur de la plateforme Doc-Form</p>'
                sendMail(user.email, 'inscription sur '+process.env.TITLE, corp)
                res.redirect('/app/home/1')
              });
           });
        }else{
          console.log('user déjà existant');
        };
    })
};
exports.getUsers = (req, res, next) => {
  let statut = req.cookies[process.env.cookie_name].role; 
  let nom = req.cookies[process.env.cookie_name].userName;
  let autorisation = req.cookies[process.env.cookie_name].autorisation;
  User.find({},{'username': 1, 'email': 1, 'date': 1, 'role': 1, 'site':1 }, (err, users)=>{
    res.render('adminUser',   {title: process.env.TITLE, autorisation: autorisation, statut: statut, statut: statut, nom: nom, users: users});
  });
};
exports.getLogs = (req, res, next) =>{
  console.log("azazazaz")
  let statut = req.cookies[process.env.cookie_name].role;
  let nom = req.cookies[process.env.cookie_name].userName;
  let autorisation = req.cookies[process.env.cookie_name].autorisation;
 var result = data.getLogs()
 console.log('logs      :')
 console.log(result)
  
  //console.log(log)
  res.render('getLog',{title: process.env.TITLE,result: result,autorisation: autorisation, statut: statut, nom: nom})

};
exports.deleteUser = (req, res, next) =>{
  let statut = req.cookies[process.env.cookie_name].role;
  let nom = req.cookies[process.env.cookie_name].userName;
  if(statut && nom && req.params.id){
    User.findByIdAndDelete({'_id': req.params.id}, (err, user)=>{
      if(err) throw err;
      res.redirect('/admin/getUsers')
    })

  }

};
exports.getRoles = (req, res, next) =>{
  let statut = req.cookies[process.env.cookie_name].role;
  let nom = req.cookies[process.env.cookie_name].userName;

  res.render('Roles',{title: process.env.TITLE, statut: statut, nom: nom} )
};
//Reenvoyer password 
exports.forgotPass = (req, res, next) =>{
  if(req.body.email){
    User.findOne({'email': req.body.email}, (err, use)=>{
      if(use){
        var Pass = generate()
        bcrypt.hash(Pass, 10)
           .then(hash =>{
            User.findByIdAndUpdate({'_id': use._id}, {'password': hash}, (err, user)=>{
            if(err) throw err;
              sendMail(use.email, 'mise à jour du mot de pass sur '+process.env.TITLE, Pass)
              res.redirect('/')
          })
        })
      }
    })
  }
}
//Déconnexion
exports.logout = (req, res, next)=>{
  res.cookie(process.env.cookie_name, {expires: Date.now()});
  res.redirect('/');
};
exports.getUpdateUser = (req, res, next) => {
  let statut = req.cookies[process.env.cookie_name].role;
  let nom = req.cookies[process.env.cookie_name].userName;
  if(req.params.id){
    console.log(req.params.id)
    User.findById({'_id': req.params.id}, (err, user)=>{
      if(err) throw err;      
      //console.log(doc)
      //var chemin = doc.link.replace(/\/$/, "");
      //cheminDef = chemin.substring (chemin.lastIndexOf( "/" )+1 );
      var dom =  data.getDomaines()
      var services = data.getServices()
        res.render('user',{title: process.env.TITLE, services: services,user: user,domaines: dom, statut: statut, nom: nom});
      
    });
  };
};
exports.postUpdateUser = (req, res, next) =>{
  var user = {
    username : req.body.name,
    email: req.body.email,
    role: req.body.role,
    service: req.body.service,
    autorisation: req.body.registerUser,
    site: req.body.site
  }
  User.findByIdAndUpdate({'_id': req.params.id}, {'email': user.email, 'username': user.username, 'role': user.role, 'service': user.service, 'autorisation': user.autorisation, 'site': user.site}, (err, user)=>{
    if(err)  throw err;
    res.redirect('/admin/getUsers')
  })

}