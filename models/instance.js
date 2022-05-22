const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const instanceSchema = new Schema({

    email:String,
    trigger_id:String,
    

},{ timestamps:true });



module.exports = mongoose.model("Instance",instanceSchema);