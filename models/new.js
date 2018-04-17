var mongoose = require("mongoose");

var newSchema = new mongoose.Schema({
   title : String,
   link : String
});

module.exports = mongoose.model("New", newSchema);