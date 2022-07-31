

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
const {cleanPhoneNumber} = require("../utils/helper");


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
exports.getDependents = async(req,res) => {


	// get the phone number of the user
	// use the phone number to search within the contacts array
	// establish all of the user that we are able to find
	// return an array of items/payload of the user for that guy. 


	const {phoneNumber} = req.params;
	const allContactList = await Dao.get(Contact);
	const arrDependents = [];
	

	try{


		if( allContactList.length === 0  ) return res.status(200).json({ message: "This user doesn't have any dependent. ", dependents:arrDependents });


		for( const contactList of allContactList  ){


			const phoneNumbers = contactList.contacts[0].phoneNumbers;
			const email = contactList.email;


			for( const rec of phoneNumbers ){


				if( rec.number === null || rec.number === undefined ) continue;


				const number = cleanPhoneNumber( rec.number);
				if( number.substring( number.length-4 ) !== phoneNumber.substring(phoneNumber.length-4)  ) continue;


				// we have to get the user based on the email

				const userObjectPayload = { email:email };
				const user = await Dao.get( User,userObjectPayload );


				if( user.length === 0 ) return res.status(200).json({ message: "user record does not exist. ",dependents:arrDependents });


				const { fname,lname,phone,_id } = user[0];
				const dependentObject = {
					"firstName":fname,
					"lastName":lname,
					"phoneNumber":phone,
					"userId":_id.toString()
				};

				arrDependents.push(dependentObject);
				break;


			}

		}

		return res.status(200).json({ message:"Loaded dependents.  ", dependents:arrDependents  });

	}
	catch(ex){

		// console.log( ex );
		// console.log( "error ");

		return res.status(500).json({ message:ex.message, dependents:[]  });

	}

}
exports.deleteDependent = async(req,res) => {



	const { phoneNumber,dependentPhone } = req.params;
	const payloadUser = { phone:phoneNumber };


	try{


		
		const user = await Dao.get(User,payloadUser);
		if( user.length === 0 ) return res.status(200).json({ message:"Couldn't find details for this user. ",status:false } );


		const payload = { email:user[0].email };


		const contactList = await Dao.get(Contact,payload);

		const phoneNumbers = contactList[0].contacts[0].phoneNumbers;
		if( phoneNumbers.length === 0 ) return res.status(200).json({ message:"Dependent could not be deleted",status:false } );


		for( const [index,rec] of phoneNumbers.entries() ){


			if( rec.number === null || rec.number === undefined || rec.number === "" ) continue;


			const number = cleanPhoneNumber(rec.number);
			if( number.substring( number.length-4 ) === dependentPhone.substring(dependentPhone.length-4)  ){


				phoneNumbers.splice(index,1); // remove the item from the array ...
				contactList[0].contacts[0].phoneNumbers = phoneNumbers; // reupdate the phoneNumbers array into the system.


				// update the new contact lists


				const updateCondition = { email:email }; 
				const updateBody = { contacts:contactList }
				const updateContact = await Dao.updateOne(Contact,updateCondition,updateBody);


				if( updateContact ) return res.status(200).json( { message:"Dependent has been deleted successfully. ", status:true } );


			}

		}


		return res.status(200).json( { message:"Error in deleting the dependent contact. ", status:false } );


	}
	catch(ex){
		return res.status(500).json({ message:ex.message, status:false });
	}


}

