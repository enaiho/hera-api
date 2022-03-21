

const bcrypt = require("bcrypt");
const axios = require("axios");
const User = require("../models/user");



const saltRounds = 10;

const getUserRec = async(pl) => {
	const user = await User.find(pl).exec();
	return user;
}

const termiiIntegration = (phone,message) => {


	let pin = "123456";
	let data = {
	
	 "to":`${phone}`,
	  "from":"Hera",
	  "sms":`${message}`,
	  "type":"plain",
	  "api_key":"TLruBy8ctJSOJCPNeWRW0aYFDTIcGyPYEJTj3AHGWHqQq76MAJm1XGdiZts6oh",
	  "channel":"generic"
    };



  let headers = {

  	'headers': {
      'Content-Type': ['application/json', 'application/json']
    }

  }

  axios.post('https://api.ng.termii.com/api/sms/send',data,headers).then(response=>{
  	console.log( response );

  }).catch(err=>{

  	console.log(err);


  });

}

const sendOTPCode = (phone) => {

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


	const { email } = req.body;
	const payload = {email:email};
	const user = await isUserExist(payload);




	
	
	if( user.length === 0  ) return res.json( {message: "user does not exist ", status: "not_sent"} );


	const frsp_phone = "0912";
	const message = "Your contact has triggered an unsafe experience and is requesting for you. Please check up with the person to confirm he/she is safe ."
		

	// termiiIntegration( frsp_phone, message  );


	console.log( message );
	return res.json( {message: "message sent successfully ", status: "sent"} );

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

	const send_otp = sendOTPCode( phone );

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
