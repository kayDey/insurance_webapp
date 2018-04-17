var mongoose = require("mongoose");

var buySchema = new mongoose.Schema({
   username : {type: String, unique: true},
   buys : [{
               policy : String,
               time : Number,
               sum : Number,
               prem : Number
   }]
});

module.exports = mongoose.model("Buy", buySchema);