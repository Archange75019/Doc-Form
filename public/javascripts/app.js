
document.addEventListener('DOMContentLoaded', function() {

    const triggers = document.querySelectorAll('[aria-haspopup="dialog"]');
    const page = document.getElementById('main');
  
    const open = function (dialog) {
      dialog.setAttribute('aria-hidden', false);
      page.setAttribute('aria-hidden', true);
    };
  
    triggers.forEach((trigger) => {
      const dialog = document.getElementById(trigger.getAttribute('aria-controls'));
  
      // open dialog
      trigger.addEventListener('click', (event) => {
        event.preventDefault();

  
        open(dialog);
      });
    });

    var urlcourante = document.location.href; 
    var urlcourante = urlcourante.replace(/\/$/, "");
        // Gardons dans la variable queue_url uniquement la portion derrière le dernier slash de urlcourante
    var queue_url = urlcourante.substring (urlcourante.lastIndexOf( "/" )+1 );
    var formUpdate = document.getElementById('update');
    var socket = io();
    var textarea  = document.getElementById('textarea');
    var forgot = document.getElementById('for');
    var oubli = document.getElementById('oubli')
    var form = document.getElementById('add');
    var ShareTo = document.getElementById('ShareTo')
    var titre = document.getElementById('titre');
    var btnSbmit = document.createElement('input');
    btnSbmit.id='envoiID';
    btnSbmit.type = 'submit';
    btnSbmit.style.width = '100%';
    var newContent = document.createTextNode('Ajouter un document');
    btnSbmit.appendChild(newContent);
    var selectService = document.getElementById('service-select')
    var selectRole = document.getElementById('role-select')
    var shareWithUser = document.getElementById('shareWithUser');
    var shareToUser =document.getElementById('shareToUser ')
    var userList = document.querySelector(' li')
    

    var sub = document.getElementById('sub');
    var valider = document.getElementById('valider');
    var close = document.getElementById('closeModal');
    var modif = document.querySelectorAll('.modification');
    var share = document.querySelectorAll('.partager');
    var listing = document.querySelectorAll('.list')
    var docContainer = document.getElementById('containerDoc');
    var file = document.getElementById('fileUpload');  
    var select = document.getElementById('role-select');
    var apercu = document.querySelectorAll('.apercu');
    var conteneur = document.getElementById('document');
    var other = document.getElementById('otherRole');
    var select2 = document.getElementById('domain-select');
    var formations = document.getElementById('formation-select')
    var other2 = document.getElementById('otherDomaine');
    var otherForm = document.getElementById('otherFormation');
    var doc = document.getElementById('c-dialog__box');
    if(select){
        select.addEventListener('change', function() {
            if(select.value == "Autre"){
                other.style.display= 'block';
            }else{
                other.style.display='none';
            }
        })
    }
    if(forgot){
        forgot.addEventListener('click', function(){
            if(oubli.style.visibility == 'hidden'){
                oubli.style.visibility = 'visible';
            }else{
                oubli.style.visibility = 'hidden';
            }
        })
    }
    if(select2 && btnSbmit && textarea){
        if(queue_url == "AddDocs"){
            textarea.value = "";
        }				
        textarea.setSelectionRange(textarea, 1, 2);
        select2.addEventListener('change', function() {
            if(select2.value == "Autre"){
                other2.style.display= 'block';
            }else{
                other2.style.display='none';
            };
        });
        if(queue_url == "AddDocs"){
        shareWithUser.addEventListener('change', function(){
            if(shareWithUser.value == "oui"){
                var users = document.getElementById('users');
                
            }

        })
        valider.addEventListener('click', function(){
            var fichier = {
                'title': titre.value,
                'domaine': select2.value,
                'description': textarea.value
            };
            if(file.value){
                fichier.link = file.files[0].name;
                fichier.size = file.files[0].size;
                fichier.extension = file.files[0].extension;
            }else{
                toastr.error('Veuillez choisir un fichier');
            };
            if(fichier.title.length != 0 && fichier.domaine.length != 0 && fichier.description.length != 0 && fichier.link.length != 0 && fichier.size.length != 0 ){
                socket.emit('File',fichier);
            }else{
                toastr.error('Tous les champs doivent être renseignés');
            }
        })
    }
    var url2 = urlcourante.split("/");
    console.log(url2);
    if(url2[4] == "UpdateDoc"){  
        valider.addEventListener('click', (e)=>{
            e.preventDefault();
           
            var fichier = {
                'url': 'updateDoc',
                'title': titre.value,
                'domaine': select2.value,
                'description': textarea.value
            }
            if(document.getElementById('fileUpdate').value){
                fichier.link = document.getElementById('fileUpdate').files[0].name
                fichier.size = document.getElementById('fileUpdate').files[0].size
                fichier.extension = document.getElementById('fileUpdate').files[0].extension
            }
            if(fichier.title.length != 0 && fichier.domaine.length != 0 && fichier.description.length != 0 ){
                socket.emit('File',fichier)
            }else{
                toastr.error('Tous les champs doivent être renseignés')
            }

        })

    }
        socket.on('FichierLourd', (data)=>{

            toastr.error(data)
        });
        socket.on('FichierPresent', (data)=>{
            toastr.error(data)
        });
        socket.on('success', (data)=>{
            console.log(data)
            if(data){
                form.removeChild(valider)
                sub.appendChild(btnSbmit)
            } 
        });
        btnSbmit.addEventListener('click', function(){
            console.log()
            var obj = {
                url: url2[4],
                id: url2[5]
            }
            console.log('clique detecter')
            socket.emit('envoi', obj)
        })
        socket.on('notif', (data)=>{
            if(data){
                toastr.success('Envoi réussi')
            }
        })
        socket.on('remplirChamps', (data)=>{
            toastr.error(data)
        })   
    }
    if(formations){
        formations.addEventListener('change', function() {
            if(formations.value == "Autre"){
                otherForm.style.display= 'block';
            }else{
                otherForm.style.display='none';
            }
        });
    }
    if(apercu && close){
        for (let i = 0; i < apercu.length; i++) {
            apercu[i].addEventListener('click', ()=>{
                var link = apercu[i].getAttribute('name');
                if(docContainer){
                    close.style.display = 'none'
                    docContainer.innerHTML = ""  
                }
                socket.emit('getApercu', link);
            })
        }
        socket.on('link', (data)=>{
            var modale = document.getElementById('dialog');
            var extension = data[0];
            close.style.display = 'block'
            var link = '.'+data[1];
             switch(extension){
                    case 'PDF':
                    var docu = document.createElement('embed');
                    docu.type = 'application/pdf';
                    break;
                    case 'Word':
                    var docu = document.createElement('iframe')
                    docu.type = 'application/msword';
                    break;
                    case 'Video':
                    var docu = document.createElement('video');
                    docu.style.width = "500px";
                    var source = document.createElement('source');
                    source.type = "video/mp4"
                    break;
                    case 'Image':
                    var docu = document.createElement('img');
                }
                docu.id = "document";
                /*if(extension == 'Word'){
                    docu.src = "https://docs.google.com/gview?url="+link+"&embedded=true"
                }*/
            if(extension == 'Video'){
                source.src = link
                docu.appendChild(source)
                docContainer.appendChild(docu)
            }else{
                if(extension == 'Word'){
                    docu.src = "https://docs.google.com/gview?url="+link+"&embedded=true"
                }else{
                    docu.src = link;
                }
                docu.style.width = '100%';
                docu.style.height = '100%';
                docu.style.textAlign = 'center';
                docContainer.appendChild(docu)
                doc.style.textAlign = "center";
                modale.style.display = 'block';
            }
            if(apercu && close){
                close.addEventListener('click', function(){
                    close.style.display = 'none'
                    docContainer.innerHTML = ""                
                })
            } 
        })
    }
    if(modif){
        
        for(let i = 0; i<modif.length; i++){
            modif[i].addEventListener('click', ()=>{
                if(queue_url == "getUsers"){
                    var link = modif[i].getAttribute('name');
    
                window.open('/app/UpdateUser/'+link,"menubar=no, scrollbars=no, top=100, left=100, width=300, height=200")
                }else{
                    var link = modif[i].getAttribute('name');
                console.log('aaaaaaaaaaaa')
                console.log(link)
                /*if(docContainer){
                    close.style.display = 'none';
                    docContainer.innerHTML = "";
                }*/
                window.open('/app/UpdateDoc/'+link,"menubar=no, scrollbars=no, top=100, left=100, width=300, height=200")
                }
            });
        };
    
    }
    if(share){ 
        var dataShare = {};
        var input;
        var id;
        for(let i = 0; i<share.length; i++){
            share[i].addEventListener('click', ()=>{
                var link = share[i].getAttribute('name');
                if(docContainer){
                    docContainer.innerHTML = ""  
                }
                close.style.display = 'block'
                close.style.color = "white";
                close.style.backgroundColor = "black";
                close.style.border = "none";
                var formShare = document.createElement('form');
                formShare.id = "ShareTo";
                formShare.method = "post";
                formShare.action = "/app/shareTo";
                var titre = document.createElement('h3');
                titre.style.paddingBottom = "2em";
                var partage = document.createTextNode("Avec quel(s) utilisateur(s) voulez-vous partager \" "+share[i].getAttribute('alt')+"\" ?");
                titre.appendChild(partage)
                var searchUser = document.createElement('input');
                searchUser.placeholder = "Saisir noms d'utilisateur"
                searchUser.id = 'shareToUser';
                var sharingDestination = document.createElement('select');
                sharingDestination.setAttribute('size', '5');
                sharingDestination.id = 'listUser';
                var buttonSearchUser = document.createElement('input');
                buttonSearchUser.type = 'submit';
                buttonSearchUser.value = 'Partager';
                buttonSearchUser.style.marginLeft = "1.2em"
                formShare.appendChild(titre)
                formShare.appendChild(searchUser);
                formShare.style.width = '100%';
                formShare.style.height = '100%';
                formShare.style.margin = '0 auto';
                docContainer.appendChild(formShare)
                doc.style.textAlign = "center";
                if(formShare){

                   searchUser.addEventListener('input', function(){

                       socket.emit('userShare', searchUser.value)
                       
                   })
                   socket.on('usersForSharing', (data)=>{
                    sharingDestination.innerHTML = "";

                       for( var i=0; i<data.length; i++){
                           
                            if(data[i] != "" ){
                                var opt = document.createElement("option");
                                opt.setAttribute('value',data[i])
                                opt.style.textAlign = "left";
                                var itmText = document.createTextNode(data[i]);
                                opt.appendChild(itmText);
                                sharingDestination.appendChild(opt);
                            }
                        }
                          sharingDestination.style.display = 'block';
                          sharingDestination.style.backgroundColor = 'white';
                       formShare.appendChild(sharingDestination)

                       sharingDestination.addEventListener('change', function(){
                            searchUser.name = "utilisateur";
                           searchUser.value =  sharingDestination.value;

                        formShare.appendChild(buttonSearchUser)
                    })
                      
                           var id = document.createElement('input');
                           id.type = 'hidden';
                           id.name = "idDocument";
                           id.value = link;
                           formShare.appendChild(id)

                           formShare.addEventListener('submit', function(){
                              // e.preventDefault();
                              toastr.success('Partage éffectué')
                              /*var tab = {
                                  name: searchUser.value,
                                  id: link
                              }
                              console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
                              console.log(tab)
                               socket.emit('userShareTo', tab)*/
                               
                               dialog.setAttribute('aria-hidden', true);
                               page.setAttribute('aria-hidden', false);
                           })
                       
                   })
                }
            })
        }
///////////////////////////////////////////////////////////////////////////////////////////////////////



    }
    if(listing){
        for(let i = 0; i<listing.length; i++){
            listing[i].addEventListener('click', ()=>{
                var link = share[i].getAttribute('name');
                if(docContainer){
                    docContainer.innerHTML = ""  
                }
                alert('AFFICHAGE listing user')
            close.style.display = 'block'
            close.style.color = "white";
            close.style.backgroundColor = "black";
            close.style.border = "none";
            var formShare = document.createElement('form');
                formShare.id = "listingUsers";
                formShare.method = "post";
                formShare.action = "/app/listingUsersDocSharing";
            var titre = document.createElement('h3');
                titre.style.paddingBottom = "2em";
            var partage = document.createTextNode("Liste des utilisateurs autorisés à voir \" "+share[i].getAttribute('alt')+"\" ?");
                titre.appendChild(partage)
            socket.emit('getUserListSharing', link)

            })
        }

    }
    if(apercu && close){
        close.addEventListener('click', function(){
            close.style.display = 'none'
            docContainer.innerHTML = "" ;
            dialog.setAttribute('aria-hidden', true);
            page.setAttribute('aria-hidden', false);
        })
    } 

        
    
 
    
    if(formUpdate){
        formUpdate.addEventListener('submit', (e)=>{
            e.preventDefault();

            var fiche = {
                titre: titre.value,
                description:textarea.getAttribute('placeholder')
            };
            console.log(fiche)
            if(select2.value != "Autre"){
                fiche.domaine = select2.value;
            }else{
                fiche.domaine = document.getElementById('do').value;
            }
        })
    }
    if(queue_url == "register"){
        var registerAuth = document.getElementById('registerUserauth-select')
        if(selectService){
            selectService.addEventListener('change', function (){
                //alert(selectService.value)
                socket.emit ('selectService', selectService.value)
            })
        }
        if(registerAuth){
            registerAuth.addEventListener('change', function(){
                if(registerAuth.value == 'oui'){
                    socket.emit('register')
                }else{
                    toastr.error('Merci de remplir tous les champs')
                }
            } )
        }
        socket.on ('roles', (data)=>{
            console.log(typeof data)
            selectRole.options.length = 0;
            for( var i=0; i<data.length; i++){
                if(data[i] != ""){
                    console.log('AJOUT')
                    var opt = document.createElement("option");
                    opt.setAttribute("value", data[i]);
                    var itmText = document.createTextNode(data[i]);
                    opt.appendChild(itmText);
                    selectRole.appendChild(opt);

                }
            }
        })
    }

})