
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({

	username:String,
	fname:String,
	lname:String,
	phone: String,
	email: String,
	password:String,

},{ timestamps:true });

module.exports = mongoose.model("User",userSchema);




