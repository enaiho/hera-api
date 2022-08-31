

const Circle = require('../models/circle');
const Member = require('../models/member');
const Contact = require('../models/contact');


exports.createCircle = async (req, res)=>{
  const {name, userId} = req.body;
  if ( name === '' || name === undefined ) {
    return res.json( {message: 'Circle name cannot be empty. '});
  }
  if ( name.length > 20 ) {
    return res.json( {message: 'Circle name cannot be greater than 20 characters. '});
  }

  const circleRec = await Circle.find({name: name}).exec();
  if ( circleRec.length > 0 ) return res.json( {message: 'Circle with this name has already been created. '});

  const circle = new Circle({name: name, userId: userId});
  const saved = await circle.save();

  if (!saved) return res.json( {message: 'error occurred in saving circle'});

  return res.json( {message: 'circle has been saved successfully. '});
};
exports.addMemberToCircle = async (req, res)=>{
  const {circleId, memberId, adminId} = req.body;

  const member = new Member({circleId: circleId, memberId: memberId, adminId: adminId});
  const saved = await member.save();

  if (!saved) return res.json( {message: 'member has been added to circle'});
  return res.json( {message: 'circle has been saved successfully. '});
};
exports.createEmergencyContact = async (req, res)=> {
  const {contacts, email} = req.body;
  const contact = new Contact({
    contacts: JSON.parse(contacts),
    email: email,
  });


  const saved = await contact.save();


  if (!saved) return res.json( {message: 'an error occurred in saving contact', saved: false});
  return res.json( {message: 'Emergency contact has been created successfully. ', saved: true});
};
