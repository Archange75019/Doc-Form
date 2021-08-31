var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
      },
      username: {
        type: String, 
        unique: false,
        required: true
      },
      password: {
        type: String,
        required: true,
      },
    site : {
        type: String,
        required: true,
        trim: true
      },
      autorisation:{
        type: String,
        required: true,
        trim: true
      },
      role : {
        type: String,
        unique: false,
        required: true
      },
      service: {
        type: String,
        unique: false
      },
      specialite : {
        type: String,
        unique: false
      },
      n1 : {
        type: String
      }
});
userSchema.index({ username: 'text' });

var User = mongoose.model("User", userSchema);
module.exports = User;