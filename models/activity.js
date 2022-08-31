const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const activitySchema = new Schema({

  userId: String,
  service: String,
  action: String,
  receiverId: String,


}, {timestamps: true});

module.exports = mongoose.model('Activity', activitySchema);
