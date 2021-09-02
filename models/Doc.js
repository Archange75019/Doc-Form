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
          index:true,
          required: true,
          //index: true
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
        required: true
      },
      size:{
        type: String,
        required: true
      },
      shareTo:{
        
          _id: {
            type: String
          }
        
      },
      service:{
        type: String,
        required: true
      },
      createdat : {
        type: String,
        unique: false,
        required: true,
        index:true
      }, 
      updatedat:{
        type: String,
        unique: false,
      },
      extension:{
        type: String,
        required: true
      },
      dateFull:{
        type: Date,
        required: true,
        index: true
      }
});

docSchema.index({ titre: 'text', description: 'text' });

var Doc = mongoose.model("Doc", docSchema);
module.exports = Doc;
