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
        unique: true,
        required: true,
        trim: true
      },
      role : {
        type: String,
        unique: false,
        required: true
      },
      n1 : {
        type: String
      }
});

var User = mongoose.model("User", userSchema);
module.exports = User;