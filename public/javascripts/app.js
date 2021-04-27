document.addEventListener('DOMContentLoaded', function() {

  var socket = io();

    var formAdd = document.getElementById('add');
    var file = document.getElementById('fileUpload');
    var select = document.getElementById('role-select');
    var other = document.getElementById('otherRole');
    var select2 = document.getElementById('domain-select');
    var other2 = document.getElementById('otherDomaine');
    if(select){
        
        select.addEventListener('change', function() {

            if(select.value == "Autre"){
                other.style.display= 'block';

            }else{
                other.style.display='none';
            }

        })
    }
    if(select2){
        
        select2.addEventListener('change', function() {

            if(select2.value == "Autre"){
                other2.style.display= 'block';

            }else{
                other2.style.display='none';
            }

        });
        socket.on('error', (data)=>{
            console.log(data)
        })
    }



})