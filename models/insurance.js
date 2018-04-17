var mongoose = require("mongoose");

var insuranceSchema = new mongoose.Schema({
   title : String,
   type : String,
   content : String
});

module.exports = mongoose.model("Insurance", insuranceSchema);