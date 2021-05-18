const jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt')
var User = require('../models/User');

var nodemailer = require('nodemailer');
const notifier = require('node-notifier');



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
// fonctions d'envoi de mail
function sendMail(destinataire, objet, corp){
  smtpTrans = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS
    }
  });
  var mailOptions = {
    from: process.env.mail, // sender address
    to: destinataire, // list of receivers
    subject: objet, // Subject line
    html: corp // html body
  };
  smtpTrans.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }

  });
}

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
             const token = {
                userId: user._id,
                userName: user.username,
                role: user.role,
                token: jwt.sign(
                  { userId: user._id },
                  process.env.TOKEN,
                  { expiresIn: '24h' }
                )
              };
              res.cookie(process.env.cookie_name,token,{maxAge: 900000, httpOnly: true })
           res.redirect('/app/home')
          })
          .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};
//Afficher le formulaire d'inscription utilisateur
exports.registerShow = (req, res, next) =>{
  let statut = req.cookies[process.env.cookie_name].role;
  var role = [];
  User.find({},{ role: 1 } , (err, Role)=>{
   for (var i = 0; i<Role.length; i++){
     var element = Role[i].role
     role.push(element)
   }
   
    res.render('register', {title: process.env.TITLE, role: role, statut: statut})
  })
  
  
};
//Inscription utilisateur
exports.register = (req, res, next) => {
    User.findOne({ email: req.body.email }, ( err, user)=>{
        if (!user) {
            var Pass = generate()
            if(req.body.role[0] == "Autre"){
              req.body.role = req.body.role[1]
            };
           bcrypt.hash(Pass, 10)
           .then(hash =>{
              var user = {
                username: req.body.username,
                email: req.body.email,
                password: hash,
                role: req.body.role,
                site: req.body.site
              };
              if(req.body.role == "administrateur"){
                user.n1 = "none"; 
              }else{
                user.n1 = ""+req.cookies[process.env.cookie_name].userId+"";
              };
              console.log(user)
              User.create(user, (err, userData)=>{
                if(err) throw err;
                sendMail(user.email, 'inscription sur '+process.env.TITLE, Pass)
                res.redirect('/app/home')
              });
           });
        }else{
          console.log('user déjà existant');
        };
    })
};

/*exports.getUser = (req, res, next) => {

};
exports.updateUser = (req, res, next) =>{

};
exports.deleteUser = (req, res, next) =>{

};*/
//Déconnexion
exports.logout = (req, res, next)=>{
  res.cookie(process.env.cookie_name, {expires: Date.now()});
  res.redirect('/');
};