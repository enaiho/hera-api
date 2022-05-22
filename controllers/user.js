


const bcrypt = require("bcrypt");
const axios = require("axios");
const User = require("../models/user");
const Location = require("../models/location");
const Trigger = require("../models/trigger");
const Notify = require("../models/notify");
const Contact = require("../models/contact");
const Battery = require("../models/battery");
const Instance = require("../models/instance");
const SolacePNService = require("../services/push_notification");




const saltRounds = 10;


const GEO_APIKEY = "AIzaSyC43Jfxgv0EXlXvN3QrUDfPl-lreQ730lQ";
const MAPS_API = "https://maps.googleapis.com/maps/api/geocode/json";
const SOLACE_DOMAIN = "https://solace-web.netlify.app";


const getTriggerRec = async(pl) => {

	if( pl === undefined || pl === "" ) pl = {};

	const triggers = await Trigger.find(pl).exec();
	return triggers;
}

const getUserRec = async(pl) => {
	const user = await User.find(pl).exec();
	return user;
}

const getContactRec = async(pl) => {

	const contacts = await Contact.find(pl).exec();
	return contacts;
}

const termiiIntegration = async (phone,message,type,event,email,trigger_id) => {


	let data = {
	
	 "to":`${phone}`,
	  "from":"N-Alert",
	  "sms":`${message}`,
	  "type":"plain",
	  "api_key":"TLruBy8ctJSOJCPNeWRW0aYFDTIcGyPYEJTj3AHGWHqQq76MAJm1XGdiZts6oh",
	  "channel":"dnd"
    };



  let headers = {

  	'headers': {
      'Content-Type': ['application/json', 'application/json']
    }

  }


  try{

  	  // const response = true;


	  const response = await axios.post('https://api.ng.termii.com/api/sms/send',data,headers);


	  const message_info = { message:message,trigger_id:trigger_id }; 
	  const notify = new Notify({
	  	email:email,
	  	message_info:message_info,
	  	message_count:message.length,
	    type:type,
	    event:event

	  });


	  
	  console.log( message_info );

	  const save = await notify.save();
	  if( !save ) return "did not save"


	  return response.data;


	}
	catch(e){

		console.log(e.message);
		return false;
	}

}

// need to rename this method from OTP to Termii message as this is the general function that pushes message
// via the termii api. 

const sendOTPCode = (otp_data) => {


	const { message, phone} = otp_data;
	const sent_to_termii =  termiiIntegration( phone, message, "sms", "otp",""  );

	return sent_to_termii;

}

const generateCode = () => {

	let code = "";
	for(let i=0; i<4; i++){
		code += (Math.floor((Math.random() * 10) + 1)).toString();
	}

	return code.substring(0,4);
}

const isUserExist = async(payload) => {


	const user = await getUserRec(payload);
	if( user.length === 0 ) return [];

	return user;
}

const resolveGeoLocation = async (location) => {



	if( location === undefined || location === "" || location.toString() === "{}" ) return "cannot resolve. ";


	const coordinates = JSON.parse(location);
	const { latitude,longitude } = coordinates.coords;
	const [lat,lng] = [latitude,longitude];



	if( lat === "" ) return res.json({message: "Latitude coordinate cannot be empty. "});
	if(  lng === ""  ) return res.json({message: "Longitude cannot be empty. "});


	const latlng = `${lat},${lng}`;


	// console.log( latlng );


	const options = {
	  method: 'GET',
	  url: MAPS_API,
	  params: {latlng: latlng, key: GEO_APIKEY}
	};

	try{
		

		const response = await axios.request(options);
		return response.data;

		// update the location guy

		
	}
	catch(e){
		console.log( e.message );
		return false;
	}


	return false;
}


const getPushTokensForReTrigger = async() => {

	let counter = 0;
	let [email,triggerId] = ["",""];
	let pushTokens = new Map();
	const triggers = await getTriggerRec( {safety_status:0} );

	if( triggers.length === 0 ) return "do nothing.. ";

	for(const trigger of triggers){

		email = trigger.email;	
		triggerId = trigger._id;


		if( email !== undefined ){

			let user_rec = await getUserRec( { email:email } );
			let user = user_rec[0];

			if( user === undefined ) continue;
			if( !("pushToken" in user) ) continue;

			let pushToken = user.pushToken;
			let data = { email:email, triggerId:triggerId, pushType: "location"  };

			if( pushToken !== undefined && !(pushTokens.has(pushToken)) ) pushTokens.set(pushToken,data);	
			
		}

		counter++;
		
	}


	return pushTokens;

}


exports.cronTriggerPanicAlert = async(req,res) => {


	const pushTokens =  await getPushTokensForReTrigger();
	const pnSolaceService =  SolacePNService( pushTokens );
	

	// loop through the pushTokens and construct the message



	return res.json({message: "cron panic alert... "});



}


exports.triggerPanicAlert = async (req,res)=>{


	const { email,location,batteryDetails } = req.body;
	const payload = {email:email };
	const user = await isUserExist(payload);


	const contacts = await getContactRec( payload );

	
	if( user.length === 0  ) return res.json( {message: "user does not exist ", status: "not_sent"} );
	const {  fname,lname,phone  } = user[0]; 


	// store the trigger request from the user


	const trigger = new Trigger({

		email:email,
		safety_status:0,
		instances:[]

	});



	const save_trigger = await trigger.save();
	if( !save_trigger ) return res.json({ message: "error occured in saving trigger info. ", status: "not_sent" });


	const trigger_id = save_trigger._id;


	// save the instance of this trigger, such that multiple instances of the location can be retrived by the first responder.. 
	const instance = new Instance({
		email:email,
	    trigger_id:trigger_id

	});



	const save_instance = await instance.save();
	if( !save_instance ) return res.json({ message:"error in saving trigger instance. ", status:"not_sent" });



	const instanceId = save_instance._id.toString();
	const triggerInstances = save_trigger.instances;
	triggerInstances.push(instanceId);


	const updateInstancesBody = { instances:triggerInstances };


	const update_trigger = await Trigger.updateOne({ _id: trigger_id.toString() }, updateInstancesBody);


	if(!update_trigger) return res.json({ message:"there was an error in updating trigger instances. ", status:"not_sent" });



	// save the battery details here

	const battery = new Battery({
		email:email,
		battery_details:batteryDetails,
		instance_id: instanceId,
		trigger_id:trigger_id

	});


	const save_battery = await battery.save();
	if( !save_battery ) return res.json( { message:"error occurred in saving battery information. ",status: "not_sent" });


	const batteryId = save_battery._id.toString();


	// store the location data

	const loc  = new Location({
		email:email,
		location:location,
		trigger_id:trigger_id,
		instance_id: instanceId,
		battery_id: batteryId,
		reverse_geodata:""
	});
	

	const save_location = await loc.save();
	if( !save_location ) return res.json( { message:"error occurred in saving location. ",status: "not_sent" });

	// resolve the location here


	const resolveStatus = await resolveGeoLocation( location );
	if( resolveStatus === false ) return res.json({ message:"There was an error in resolving the geo location data. ", status:"" });


	const locationId = save_location._id;
	const updateData = { reverse_geodata:resolveStatus };


	const update = await Location.updateOne({ _id: locationId.toString() }, updateData);



	if( !update ) return res.json( {message: "there was an error in updating the geo data location. ", status: "not sent"} );



	if( contacts.length === 0 ) return res.json( { message:"it looks like you do not have an emergency  ",status: "not_sent" });


	const frsp_phone = contacts[0].contacts[0].phone;
	const frsp_name = contacts[0].contacts[0].name;


	// implement the custom messaging t

	const outBoundMessage = `[Solace] Hi ${frsp_name}, Your friend ${fname} seems to be unsafe. Click the link below to see their location.:  ${SOLACE_DOMAIN}/emergency/${trigger_id} `;
		
	termiiIntegration( frsp_phone, outBoundMessage, "sms", "trigger", email, trigger_id  );

	return res.json( {message: "message sent successfully ", trigger_id: trigger_id, status: "sent"} );


}

exports.createTriggerInstance = async( req,res ) => {



	// we are saving location, battert and instance separately

	const { location,email,triggerId,batteryDetails } = req.body;
	

	// save the instance of this trigger, such that multiple instances of the location can be retrived by the first responder.. 
	const instance = new Instance({
		email:email,
	    trigger_id:triggerId

	});

	// save instance details

	const save_instance = await instance.save();
	if( !save_instance ) return res.json({ message:"error in saving trigger instance. ", status:"not_sent" });


	const instanceId = save_instance._id;

	const trigger = await getTriggerRec( { _id:triggerId } );
	const trigger_rec = trigger[0];


	if( !( "instances" in trigger_rec ) ) return res.json({ message: "could not find instance key" });


	const triggerInstances = trigger_rec.instances;


	triggerInstances.push(instanceId); // we are adding new instance id to the list of instances


	const updateInstancesBody = { instances:triggerInstances };


	const update_trigger = await Trigger.updateOne({ _id: triggerId.toString() }, updateInstancesBody);


	if(!update_trigger) return res.json({ message:"there was an error in updating trigger instances. ", status:"not_sent" });


	// save battery details

	const battery = new Battery({
		email:email,
		battery_details:batteryDetails,
		instance_id: instanceId,
		trigger_id:triggerId

	});


	const save_battery = await battery.save();
	if( !save_battery ) return res.json( { message:"error occurred in saving battery information. ",status: "not_sent" });


	const batteryId = save_battery._id;

	// save location details

	const loc  = new Location({
		email:email,
		location:location,
		trigger_id:triggerId,
		instance_id: instanceId,
		battery_id: batteryId,
		reverse_geodata:""
	});
	


	const save_location = await loc.save();
	if( !save_location ) return res.json( { message:"error occurred in saving location. ",status: "not_sent" });




	// open a socket connection and 



	// return; 




	const resolveStatus = await resolveGeoLocation( location );
	if( resolveStatus === false ) return res.json({ message:"There was an error in resolving the geo location data. ", status:"" });


	const locationId = save_location._id;
	const updateData = { reverse_geodata:resolveStatus };


	const update = await Location.updateOne({ _id: locationId.toString() }, updateData);


	if( !update ) return res.json( {message: "there was an error in updating the geo data location. ", status: "not sent"} );


	return res.json( { message:"instance of this location has been saved. ",status: true });



}


// so what this guy would do is to push the location data to the server by a service worker if the user say's he is not active


exports.logLocationOnTrigger = async(req,res) => {

	// we would have our triggerId and use that guy to push more instances for location and battery info


}

exports.callTermii = async(req,res) =>{


	const egg = termiiIntegration( req.body.phone, req.body.message, "sms", "otp",""  );
	return res.json({ message:egg });
	
}


exports.authenticateUser = async (req,res) => {


	const { email,password } = req.body;
	const payload  = {email:email};
	const user  = await getUserRec(payload);


	if( user.length === 0 ) return res.json( {message: "email address is incorrect. ", authenticated: false} );

	const usr = user[0];
	const cmp_pword =  await bcrypt.compare(password,usr.password);


	if( cmp_pword ===  false ) return res.json( {message: "error in authenticating user. ", authenticated: false} );


	usr.password = "";


	return res.json( { message:"user authenticated successfully. ",authenticated:true, user:usr  });


}
exports.registerUser = async(req,res)=>{

	// const save = await GGEntries.insertMany( sanitized_pl );

	const {user,contacts,pushToken } = req.body;
	const {fname,lname,phone,email,otp_code} = JSON.parse(user);
	const phone_rec = await getUserRec({ "phone":phone });
	const email_rec = await getUserRec({ "email":email });
	let otp_sent = false;


	if( fname === "" || fname === undefined ) return res.json( {message: `first name cannot be empty. `} );
	if( lname === "" || lname === undefined ) return res.json( {message: `last name cannot be empty. `} );
	if( phone_rec.length > 0 || phone_rec === undefined ) return res.json( {message: `this phone exists. `} );
	if( email_rec.length > 0 || email_rec === undefined ) return res.json( {message: `this email exists. `} );
	

	// const hash = await bcrypt.hash(password, saltRounds); // would come back here when there is a need for the password requirement. 



	const user_obj  = new User({
		fname:fname,
		lname:lname,
		phone:phone,
		email:email,
		active:1,
		pushToken:pushToken
	});

	


	const saved_user = await user_obj.save();
	if( !saved_user ) return res.json( { message:"error occurred in registering user" });


	// setup the emergency contact


    const contact = new Contact({
        contacts:JSON.parse(contacts),
        email:email
    });


    const saved_contact = await contact.save();
    

    if(!saved_contact) return res.json( { message:"an error occurred in setting up this user", saved:false });
    



	// send the verification code the user.

	// const otp_data = {

	// 	message: `${fname}, your Solace confirmation code is ${otp_code}.`,
	// 	phone: `234${phone.split("").splice(1).join("")}`

	// }

	// const send_otp = sendOTPCode( otp_data );

	// if( send_otp===true ) otp_sent = true;


	return res.json( {message: `user has been registered successfully. `, status:true } );


}
exports.verifyPhoneNumber = async (req,res) => {


	const { phone } = req.body;
	const otp_code = generateCode();
	let otp_sent = false;
	

	// the next thing would be to send in the verification code


	const otp_data = {

		message: `Hello, your Solace confirmation code is ${otp_code}.`,
		phone: `${phone}` 
	}


	const send_otp = await sendOTPCode( otp_data );
	if( send_otp===false ) return res.status(500).json({ message:"OTP could not be sent. ",exist:false, otp_sent:otp_sent,otp_code:otp_code });


	otp_sent = true;


	const user = await getUserRec({ phone:phone });
	if( user.length === 0 || user === undefined ) 	return res.json({ message:"Number does not exist",exist:false, otp_sent:otp_sent,otp_code:otp_code });
	return res.json({ message:"Number founded", exist:true, otp_sent:otp_sent,otp_code:otp_code });
}
exports.verifyAccount = async(req,res)=> {


	const {email} = req.body;
	const user = await getUserRec({ email:email });

	if( user.length === 0 || user === undefined ) 	return res.json({ message:"Email does not exist",exist:false });


	return res.json({ message:"This email address is already registered on Hera. ", exist:true });
}
exports.getTriggerInfo = async(req,res)=>{

	console.log( "output trigger info. " );
}
exports.updateSafety = async(req,res) => {


	const { triggerId } = req.params;
	try{

		const update = await Trigger.updateOne({ _id: triggerId }, req.body);
		if( update && update.acknowledged === true ) return res.json( {message: "user is safe.. ", safe: true} );

		return res.json( {message: "user is not safe.. ", safe: false} );

	}
	catch(ex){
		return res.json( {message: "user is not safe.. ", safe: false} );
	}
}

exports.getUserwithPhone = async(req,res) => {


	const { phone } = req.body;
	const payload  = {phone:phone};
	const user  = await getUserRec(payload);


	if( user.length === 0 ) return res.json( {message: "phone number is incorrect. ", authenticated: false} );
	

	return res.json( { message:"record retrieved successfully. ",authenticated:true, user:user[0]  });
}

exports.updateProfile = async(req,res) => {


	const {userId} = req.params; console.log( userId );
	try{

		const update = await User.updateOne({ _id: userId }, req.body);
		if( update) {
			const user = await getUserRec({ _id:userId });
			return res.json( {message: "Profile has been updated successfully. ", status: true, user:user[0]} );
		}

		return res.json( {message: "Error occured in updating profile. ", status: false} );

	}
	catch(e){
		return res.json( {message: e.message, status: false} );
	}
}
exports.resolveLocation = async(req,res) => {


	return res.json({ message:"not working" });
}



