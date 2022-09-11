

const ActivityMessage = require('../services/activity_message');
const ActivityModel = require('../models/activity');
const User = require('../models/user');
const Dao = require('../services/dao');


exports.getActivity = async (req, res) => {
  try {
    const {userId} = req.params;
    const payload = {receiverId: userId};
    const response = [];
    let empty = true;


    const activities = await Dao.get( ActivityModel, payload );


    if ( activities.length === 0 ) return res.status(200).json({response: response, empty: false});
    for ( const activity of activities ) {
      const {_id, action, createdAt} = activity;
      let messageBody = '';


      const user = await Dao.get( User, {_id: activity.userId});
      if ( user.length === 0 ) continue;


      empty = false;
      const {fname, lname} = user[0];
      const name = `${fname} ${lname}`;


      if ( action === 'add' ) messageBody = ActivityMessage.addContactMessageFactory(name);
      else if ( action === 'delete' ) messageBody = ActivityMessage.deleteContactMessageFactory(name);


      const responseData = {notificationBody: messageBody, notificationTime: createdAt, action: action, id: _id.toString()};
      response.push( responseData );
    }


    return res.status(200).json( {response: response, empty: empty} );
  } catch (e) {
    console.log( e.message );
    return res.status(500).json({response: [], empty: true});
  }


  return res.status(200).json({response: [], empty: true});
};
