
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({

	username:String,
	fname:String,
	lname:String,
	phone: String,
	email: String,
	gender:String,
	bloodGroup:String,
	message:String,
	pushToken:String,
	password:String,
	otp:String,
	otp_verified:Number,
	active:Number


},{ timestamps:true });



module.exports = mongoose.model("User",userSchema);


