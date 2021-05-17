var mongoose = require('mongoose');


var classSchema = mongoose.Schema({
    nom:{
        type: String,
        required: true
    },
    site:{
        type: String,
        required: true
    },
    formateur:{
        type: String,
        required: true
    },
    dateDebut : {
        type: String,
        unique: false,
        required: true,
        index:true
    }, 
    dateDebutFull:{
        type: Date,
        required: true 
    },
    dateFin : {
        type: String,
        unique: false,
        required: true,
        index:true
    }, 
    dateFinFull:{
        type: Date,
        required: true 
    },
    Eleves:[{
        id:{type: String}
    }]
});

var Class = mongoose.model("Class", classSchema);
module.exports = Class;