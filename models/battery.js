const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const batterySchema = new Schema({

    email:String,
    battery_details:Object,
    trigger_id:String,
    instance_id:String


},{ timestamps:true });



module.exports = mongoose.model("Battery",batterySchema);