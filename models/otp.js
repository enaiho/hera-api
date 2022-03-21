const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const otpSchema = new Schema({

    email:String,
    otp:String,
    otp_activated:Number,
    purpose:String

},{ timestamps:true });

module.exports = mongoose.model("Otp",otpSchema);