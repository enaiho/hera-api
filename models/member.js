const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const memberSchema = new Schema({

  circle_id: String,
  member_id: String,
  admin_id: String,
  status: Number,

}, {timestamps: true});


module.exports = mongoose.model('Member', memberSchema);
