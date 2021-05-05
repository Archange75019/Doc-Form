var mongoose = require('mongoose');


var docSchema = mongoose.Schema({
    titre: {
        type: String,
        required: true,
        index: true
      },
      author: {
        type: String, 
        unique: false,
        required: true
      },
      domaine:{
          type: String,
          unique: true,
          required: true,
          index: true
      },
      description: {
        type: String,
        unique: false,
        trim: true,
        required: true,
        index: true
      },
      link : {
        type: String,
        unique: true,
        required: true
      },
      date : {
        type: String,
        unique: false,
        required: true,
        index:true
      }, 
      dateFull:{
        type: Date,
        required: true 
      }
});



var Doc = mongoose.model("Doc", docSchema);
module.exports = Doc;