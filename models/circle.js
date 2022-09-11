const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const circleSchema = new Schema({

  name: String,
  userId: String,
  status: Number,

}, {timestamps: true});

module.exports = mongoose.model('Circle', circleSchema);
