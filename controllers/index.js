const User = require('../models/user');
const Location = require('../models/location');
const Trigger = require('../models/trigger');
const {generateCode} = require('../utils/helper');
const Dao = require('../services/dao');
const Notification = require('../services/notification');


exports.homePage = async (req, res) => {
  return res.send('<div align=\'center\'><h1>Welcome to Hera Backend. </h1></div>');
};
exports.getEmergencyDetails = async (req, res) => {
  const {triggerId} = req.params;


  if ( triggerId === '' || triggerId === undefined ) return res.json( {message: 'Trigger Id cannot be empty. '});


  const triggerPl = {_id: triggerId};
  const payload = {trigger_id: triggerId};


  try {
    const triggers = await Dao.get( Trigger, triggerPl );
    if ( triggers.length === 0 ) return res.json({message: 'Unable to load data. It appears that the trigger id is not correct. '});


    const locations = await Dao.getPopulate( Location, payload, 'battery_id' );
    if ( locations.length === 0 ) return res.json({message: 'Unable to load location data. It appears that location data could not be retrived. '});


    const email = triggers[0].email;
    const userPayload = {email: email};


    const userRec = await Dao.get(User, userPayload);


    if ( userRec.length === 0 ) return res.json({message: 'Unable to load user record.'});


    const {fname, lname, phone} = userRec[0];


    const userData = {


      name: `${fname} ${lname}`,
      phone: phone,
      triggerMessage: triggers[0].incidentMessage, // this is the extra message that


    };


    // console.log( locations );
    // if( locations.length === 0 ) return res.json({ message: "battery and location length should jive. " });

    /*

country - gives me the country of that location
locality/administrative_area_level_1 - gives me the state of that location
postal_code - gives me the postal code, state and country of the user
route - gives me the actual address with the location type being  ("GEOMETRIC_CENTER") - makes the cut
street-address - gives me the street address - makes the cut
administrative_area_level_1

*/

    const processedEmergencyData = [];
    const locationData = {

      location: {},
      battery: {},
    };

    const computeLocations = (location, index) => {
      const {batteryLevel, batteryState} = JSON.parse(location.battery_id.battery_details);
      const {results, status} = location.reverse_geodata;


      if ( status.toLowerCase() === 'ok' ) {
        for ( const result of results ) {
          const boolLoc = (result.types.includes('street_address') && ( result.formatted_address !== '' || result.formatted_address !== undefined ));
          if ( boolLoc ) locationData['location']['address'] = result.formatted_address;
          if ( result.types.includes('administrative_area_level_1') ) locationData['location']['stateCountry'] = result.formatted_address;
        }
      }


      locationData['battery'].batteryLevel = Math.floor((Number.parseFloat(batteryLevel)*100));
      locationData['battery'].batteryState = (batteryState === 0 ? 'DEVICE UNPLUGGED':'DEVICE PLUGGED');

      processedEmergencyData[index] = locationData;
    };


    locations.forEach( computeLocations );

    return res.json({message: processedEmergencyData, info: userData, status: 'retrieved'}); // info data that would get the information of the user
  } catch (e) {
    return res.json({message: `${e.message}`, status: 'failed'});
  }
};
exports.verifyPhoneNumber = async (req, res) => {
  try {
    const {phone} = req.body;
    const otpCode = generateCode();
    let otpSent = false;


    const otpData = {

      message: `Hello, your Solace confirmation code is ${otpCode}.`,
      phone: `${phone}`,
      event: `otp`,
    };


    const notification = new Notification();
    const otpResponse = await notification.sendOTPCode( otpData );

    const {message, status} = otpResponse;


    if ( status===false ) return res.status(500).json({message: message, exist: status, otpSent: otpSent, otpCode: otpCode});

    otpSent = true;

    const payload = {phone: phone};
    const user = await Dao.get(User, payload);
    if ( user.length === 0 || user === undefined ) return res.json({message: 'Number does not exist', exist: false, otpSent: otpSent, otpCode: otpCode});
    return res.json({message: 'Number found', exist: true, otpSent: otpSent, otpCode: otpCode});
  } catch (e) {
    return res.status(500).json({message: e.message, exist: false});
  }
};

