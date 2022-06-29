

const bcrypt = require("bcrypt");
const axios = require("axios");
const User = require("../models/user");
const Location = require("../models/location");
const Trigger = require("../models/trigger");
const Contact = require("../models/contact");
const Battery = require("../models/battery");
const Instance = require("../models/instance");
const SolacePNService = require("../services/push_notification");
const SOLACE_CONFIG = require("../utils/solace_config");
const SmsIntegration = require("../utils/sms_integration");
const Notification = require("../services/notification");
const Geolocation = require("../services/geolocation");
const Dao = require("../services/dao");


const saltRounds = 10;



const GEO_APIKEY = SOLACE_CONFIG.GEO_APIKEY;
const MAPS_API = SOLACE_CONFIG.MAPS_API;
const SOLACE_DOMAIN = SOLACE_CONFIG.SOLACE_DOMAIN;


const geolocation = new Geolocation();


exports.authenticateUser = async (req,res) => {


	const { email,password } = req.body;
	const payload  = {email:email};
	const user  = await Dao.get(User,payload);


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
	const phone_rec = await Dao.get(User,{"phone":phone});
	const email_rec = await Dao.get(User,{"email":email});
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


	return res.json( {message: `user has been registered successfully. `, status:true } );
}

exports.getUserwithPhone = async(req,res) => {


	const { phone } = req.body;
	const payload  = {phone:phone};
	const user  = await Dao.get(User,payload);


	if( user.length === 0 ) return res.json( {message: "phone number is incorrect. ", authenticated: false} );
	
	return res.json( { message:"record retrieved successfully. ",authenticated:true, user:user[0]  });	
}
exports.updateProfile = async(req,res) => {


	const {userId} = req.params; console.log( userId );
	try{


		const update = await User.updateOne({ _id: userId }, req.body);
		if( update) {
			const user = await Dao.get(User,{ _id:userId });
			return res.json( {message: "Profile has been updated successfully. ", status: true, user:user[0]} );
		}

		return res.json( {message: "Error occured in updating profile. ", status: false} );

	}
	catch(e){
		return res.json( {message: e.message, status: false} );
	}
}



