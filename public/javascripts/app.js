
document.addEventListener('DOMContentLoaded', function() {

    var socket = io();
    var textarea  = document.getElementById('textarea');
    var formAdd = document.getElementById('add');
    var titre = document.getElementById('titre');
    var btnSbmit = document.createElement('input');
    btnSbmit.id='envoiID'
    btnSbmit.type = 'submit'
    btnSbmit.style.width = '100%';
    var newContent = document.createTextNode('Ajouter un document');
    btnSbmit.appendChild(newContent);

    var sub = document.getElementById('sub');
    var valider = document.getElementById('valider');
    //var inputFile = document.getElementById('fileUpload')
    //var submit = document.getElementById('submit')
    var close = document.getElementById('closeModal')
    var docContainer = document.getElementById('containerDoc')
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
    if(select2 && btnSbmit && textarea){
        textarea.value = "";				
        textarea.setSelectionRange(textarea, 1, 2);

        select2.addEventListener('change', function() {

            if(select2.value == "Autre"){
                other2.style.display= 'block';

            }else{
                other2.style.display='none';
            }

        });
        valider.addEventListener('click', function(){
            var fichier = {
                'title': titre.value,
                'domaine': select2.value,
                'description': textarea.value
            }
            if(file.value){
                fichier.link = file.files[0].name
                fichier.size = file.files[0].size
            }else{
                toastr.error('Veuillez choisir un fichier')
            }

            if(fichier.title.length != 0 && fichier.domaine.length != 0 && fichier.description.length != 0 && fichier.link.length != 0 && fichier.size.length != 0 ){
                socket.emit('File',fichier)
            }else{
                toastr.error('Tous les champs doivent être renseignés')
            }
        })
        socket.on('FichierLourd', (data)=>{

            toastr.error(data)
        });
        socket.on('FichierPresent', (data)=>{
            toastr.error(data)
        });
        
        socket.on('success', (data)=>{
            if(data){
                formAdd.removeChild(valider)
                sub.appendChild(btnSbmit)
            } 
        });
        btnSbmit.addEventListener('click', function(){
            socket.emit('envoi', 'envoi success')
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
            apercu[i].addEventListener('click', function(){
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
            if(extension == 'Video'){
                alert('video')
                source.src = link
                docu.appendChild(source)
                docContainer.appendChild(docu)
            }else{
                docu.src = link;
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
})