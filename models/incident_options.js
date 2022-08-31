

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const incidentOptionsSchema = new Schema({

  label: String,
  tag: String,

}, {timestamps: true});


module.exports = mongoose.model('IncidentOptions', incidentOptionsSchema);
