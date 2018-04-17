var mongoose = require("mongoose");
require("mongoose-type-email");
var passportLocalMongoose = require("passport-local-mongoose");
//var Insurance             = require("./models/insurance.js")

var userSchema = new mongoose.Schema({
   username : {type: String, unique: true},
   fullname : String,
   email : {type: mongoose.SchemaTypes.Email, unique: true},
   isAdmin : {type : Boolean, default : false},
   password : String,
   buys : [{
               type : mongoose.Schema.Types.ObjectId,
               ref : "Insurance"
   }]
});
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);