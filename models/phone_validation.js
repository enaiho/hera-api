

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const phoneValidationSchema = new Schema({

	phone: String,
	code: String,
	api_message:String,
	status: Number,
	sms_status:Number

},{ timestamps:true });


module.exports = mongoose.model("PhoneValidation",phoneValidationSchema);




