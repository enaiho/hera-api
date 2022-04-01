const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const contactSchema = new Schema({

    contacts:Object,
    email:String,
    

},{ timestamps:true });


module.exports = mongoose.model("Contact",contactSchema);