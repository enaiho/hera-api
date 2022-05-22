

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const triggerSchema = new Schema({

    email:String,
    safety_status:Number,
    instances:Object

},{ timestamps:true });

module.exports = mongoose.model("Trigger",triggerSchema);