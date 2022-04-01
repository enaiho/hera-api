

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const triggerSchema = new Schema({

    email:String,
    safety_status:Number

},{ timestamps:true });

module.exports = mongoose.model("Trigger",triggerSchema);