

const bcrypt = require("bcrypt");
const axios = require("axios");
const User = require("../models/user");
const Location = require("../models/location");
const Trigger = require("../models/trigger");
const Notify = require("../models/notify");
const Contact = require("../models/contact");


const saltRounds = 10;


const getUserRec = async(pl) => {
	const user = await User.find(pl).exec();
	return user;
}

const getContactRec = async(pl) => {

	const contacts = await Contact.find(pl).exec();
	return contacts;

}

const termiiIntegration = async (phone,message,type,event,email,trigger_id) => {


	let pin = "123456";
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

  const response = await axios.post('https://api.ng.termii.com/api/sms/send',data,headers);

  // const response = true;
  if( !response ) return "ko le work";
  

  const message_info = { message:message,trigger_id:trigger_id };
  const notify = new Notify({
  	email:email,
  	message_info:message_info,
  	message_count:message.length,
    type:type,
    event:event

  });

  const save = await notify.save();
  if( !save ) return "did not save"


  return response.data;



}

const sendOTPCode = (otp_data) => {


	const { message, phone} = otp_data;
	termiiIntegration( phone, message, "sms", "otp",""  );



	return true;

}

const generateCode = () => {

	let code = "";
	for(let i=0; i<4; i++){
		code += (Math.floor((Math.random() * 10) + 1)).toString();
	}

	return code;
}


const isUserExist = async(payload) => {


	const user = await getUserRec(payload);
	if( user.length === 0 ) return [];

	return user;

}



exports.triggerPanicAlert = async (req,res)=>{


	const { email,location } = req.body;
	const payload = {email:email };
	const user = await isUserExist(payload);
	const contacts = await getContactRec( payload );

	
	if( user.length === 0  ) return res.json( {message: "user does not exist ", status: "not_sent"} );

	const {  fname,lname,phone  } = user[0]; 


	// store the trigger request from the user


	const trigger = new Trigger({

		email:email,
		safety_status:0

	});


	const save_trigger = await trigger.save();
	if( !save_trigger ) return res.json({ message: "error occured in saving trigger info. ", status: "not_sent" });


	const trigger_id = save_trigger._id;


	// store the location data


	const loc  = new Location({
		email:email,
		location:location,
		trigger_id:trigger_id
	});
	

	const save_location = await loc.save();
	if( !save_location ) return res.json( { message:"error occurred in saving location. ",status: "not_sent" });


	if( contacts.length === 0 ) return res.json( { message:"it looks like you do not have an emergency  ",status: "not_sent" });


	const frsp_phone = contacts[0].contacts[0].phone;
	const frsp_name = contacts[0].contacts[0].name;


	const message = `[Solace] Hi ${frsp_name}, Your friend ${fname} seems to be unsafe. Click the link below to see their location.: www.Solace.com/user-information`;
		

	termiiIntegration( frsp_phone, message, "sms", "trigger",trigger_id  );


	return res.json( {message: "message sent successfully ", trigger_id: trigger_id, status: "sent"} );


}

exports.callTermii = async(req,res) =>{

	console.log("called termii");
	termiiIntegration( req.body.phone, "" );
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

	const {fname,lname,phone,email,password,username} = req.body;
	const phone_rec = await getUserRec({ "phone":phone });
	const email_rec = await getUserRec({ "email":email });
	const otp_code = generateCode();
	let otp_sent = false;


	if( fname === "" || fname === undefined ) return res.json( {message: `first name cannot be empty. `} );
	if( lname === "" || lname === undefined ) return res.json( {message: `last name cannot be empty. `} );
	if( phone_rec.length > 0 || phone_rec === undefined ) return res.json( {message: `this phone exists. `} );
	if( email_rec.length > 0 || email_rec === undefined ) return res.json( {message: `this email exists. `} );
	

	const hash = await bcrypt.hash(password, saltRounds);

	const user  = new User({
		fname:fname,
		lname:lname,
		phone:phone,
		email:email,
		password:hash,
		otp:otp_code,
		otp_verified:0,
		active:0
	});

	

	const saved = await user.save();
	if( !saved ) return res.json( { message:"error occurred in registering user" });

	// send the verification code the user.


	const otp_data = {


		message: `${fname}, your Solace confirmation code is ${otp_code}.`,
		phone: `234${phone.split("").splice(1).join("")}`

	}

	const send_otp = sendOTPCode( otp_data );

	if( send_otp===true ) otp_sent = true;


	return res.json( {message: `user has been registered successfully. `, otp_sent:otp_sent, status:true, otp_code:otp_code } );

}
exports.verifyPhoneNumber = async (req,res) => {

	const { phone } = req.body;
	const user = await getUserRec({ phone:phone });
	if( user.length === 0 || user === undefined ) 	return res.json({ message:"Number does not exist",exist:false });

	return res.json({ message:"Number found", exist:true });
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



