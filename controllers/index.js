

const axios = require("axios");
const User = require("../models/user");
const Location = require("../models/location");
const Trigger = require("../models/trigger");
const { generateCode } = require("../utils/helper");
const Dao = require("../services/dao");
const Notification = require("../services/notification");



exports.homePage = async (req,res) => {

	return res.send("<div align='center'><h1>Welcome to Hera Backend. </h1></div>");
}
exports.getEmergencyDetails = async(req,res) => {


	const { triggerId } = req.params;


	if( triggerId === "" || triggerId === undefined ) return res.json( {message:"Trigger Id cannot be empty. "});


	const trigger_pl = { _id:triggerId };
	const payload = { trigger_id:triggerId };


	try{

		const triggers = await Dao.get( Trigger,payload );
		if( triggers.length === 0 ) return res.json({ message:"Unable to load data. It appears that the trigger id is not correct. "  });		


		const locations = await Dao.getPopulate( Location,payload,"battery_id" );
		if( locations.length === 0  ) return res.json({ message: "Unable to load location data. It appears that location data could not be retrived. " });


		const email = triggers[0].email;
		const user_payload = { email:email };


		const userRec = await Dao.get(User,user_payload);
		

		if( userRec.length === 0 ) return res.json({ message: "Unable to load user record." });


		const { fname,lname,phone } = userRec[0];

		const userData = {


			name: `${fname} ${lname}`,
			phone: phone


		}



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

			location:{},
			battery:{}
		};
			
		const computeLocations = (location,index) => {


			// console.log( JSON.stringify( location ) );
			

			const { plus_code,results,status } = location.reverse_geodata;
			const { batteryLevel,batteryState,lowPowerMode } = JSON.parse(location.battery_id.battery_details);


			// console.log( location.battery_id.battery_details ); 



			if( status.toLowerCase() === "ok" ){

				for(  let result of results ){

					 const boolLoc = (result.types.includes("street_address") &&  ( result.formatted_address !== "" || result.formatted_address !== undefined ));				 
					 if( boolLoc  ) locationData["location"]["address"] = result.formatted_address; 
					 if( result.types.includes("administrative_area_level_1") ) locationData["location"]["stateCountry"] = result.formatted_address;  
					 	 

				}

			}


			locationData["battery"].batteryLevel = Math.floor((Number.parseFloat(batteryLevel)*100));
			locationData["battery"].batteryState = (batteryState === 0 ? "DEVICE UNPLUGGED":"DEVICE PLUGGED");



			processedEmergencyData[index] =  locationData;


		}


		locations.forEach( computeLocations );

		return res.json({message: processedEmergencyData, info:userData,  status: "retrieved" }); // info data that would get the information of the user

	}
	catch(e){ 
		return res.json({message: `${e.message}`, status: "failed"});
	}
}
exports.verifyPhoneNumber = async (req,res) => {


	const { phone } = req.body;
	const otp_code = generateCode();
	let otp_sent = false;
	

	const otp_data = {

		message: `Hello, your Solace confirmation code is ${otp_code}.`,
		phone: `${phone}`,
		event: `otp`
	}


	const notification = new Notification();
	const otp_response =  await notification.sendOTPCode( otp_data );

	const { message,status } = otp_response;

	// console.log( otp_response );

	if( status===false ) return res.status(500).json({ message:message,exist:status, otp_sent:otp_sent,otp_code:otp_code });

	otp_sent = true;

	const payload = {phone:phone};
	const user = Dao.get(User,payload);
	if( user.length === 0 || user === undefined ) 	return res.json({ message:"Number does not exist",exist:false, otp_sent:otp_sent,otp_code:otp_code });
	return res.json({ message:"Number founded", exist:true, otp_sent:otp_sent,otp_code:otp_code });
}