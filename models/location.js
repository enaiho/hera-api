const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const locationSchema = new Schema({

    email:String,
    location:String,
    trigger_id:String,
    instance_id:String,
    battery_id:{
    	type: mongoose.Schema.Types.ObjectId, ref: "Battery"
    },
    reverse_geodata:Object

},{ timestamps:true });

module.exports = mongoose.model("Location",locationSchema);