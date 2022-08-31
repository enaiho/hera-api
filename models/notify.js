
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const notifySchema = new Schema({

  phone: String,
  message_info: Object,
  message_count: Number,
  type: String,
  event: String,


}, {timestamps: true});

module.exports = mongoose.model('Notify', notifySchema);
