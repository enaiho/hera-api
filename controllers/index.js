

const PhoneValidation = require("../models/phone_validation");
const axios = require("axios");
const User = require("../models/user");
const Location = require("../models/location");
const Trigger = require("../models/trigger");
const Battery = require("../models/battery");
const Instance = require("../models/instance");





const getTriggerRec = async(pl) => {

	if( pl === undefined || pl === "" ) pl = {};


	const triggers = await Trigger.find(pl).exec();
	return triggers;
}

const getLocationTriggerRec = async(pl) => {
	const locations = await Location.find(pl).populate("battery_id");
	return locations;
}

const getUserRec = async(pl) => {
	const user = await User.find(pl).exec();
	return user;
}


const getPushTokens = async() => {


	let pushToken = "";
	const push_tokens = [];
	const users = await User.find().exec();

	if( users.length === 0 ) return [];

	for( const user of users ){


		pushToken = user.pushToken;
		if( pushToken !== ""  && pushToken !== undefined ) push_tokens.push(pushToken);

	}
	
	return push_tokens;
}


const generateCode = () => {

	let code = "";
	for(let i=0; i<4; i++){
		code += (Math.floor((Math.random() * 10) + 1)).toString();
	}

	return code;
}


exports.homePage = async (req,res) => {

	return res.send("<div align='center'><h1>Welcome to Hera Backend. </h1></div>");
}
exports.isValidPhoneNumber = async (req,res) => {


	const code = generateCode();
	const { phone } = req.body; 


	const phone_validation  = new PhoneValidation({
		phone:phone,
		code: code,
		api_message:"Delivered successfully. ",
		status:0,
		sms_status:1
	});

	const saved = await phone_validation.save();

	if( !saved ) 	return res.json( {message: "error in sending code ", status:-1  } );



	// call termii api that would send the message


	return res.json( { message:"sms code has been sent. ", status:1, token: code } );
}
exports.getEmergencyDetails = async(req,res) => {


	const { triggerId } = req.params;


	if( triggerId === "" || triggerId === undefined ) return res.json( {message:"Trigger Id cannot be empty. "});

	


	const trigger_pl = { _id:triggerId };
	const payload = { trigger_id:triggerId };


	try{


		const triggers = await getTriggerRec( trigger_pl ); // get info that would be displayed as the main data

		// console.log( trigger_pl );
		// console.log( triggers );



		if( triggers.length === 0 ) return res.json({ message:"Unable to load data. It appears that the trigger id is not correct. "  });
		
		const locations = await getLocationTriggerRec(payload); // displayed in tabular data

		if( locations.length === 0  ) return res.json({ message: "Unable to load location data. It appears that location data could not be retrived. " });




		const email = triggers[0].email;
		const user_payload = { email:email };



		const userRec = await getUserRec(user_payload);



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


