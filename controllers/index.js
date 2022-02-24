

const User = require("../models/user");
const PhoneValidation = require("../models/phone_validation");


const generateCode = () => {

	let code = "";
	for(let i=0; i<4; i++){
		code += (Math.floor((Math.random() * 10) + 1)).toString();
	}

	return code;
}

const termiiIntegration = () => {}


exports.homePage = async (req,res,next) => {

	return res.send("<h1>Welcome to Hera Backend. </h1>");
}

exports.verifyPhoneNumber = async (req,res,next) => {


	const { phone } = req.body;
	const user = await User.find({ phone:phone });
	if( user.length === 0 || user === undefined ) 	return res.json({ message:"Number does not exist",exist:false });


	return res.json({ message:"Number found", exist:true });
}

exports.isValidPhoneNumber = async (req,res,next) => {


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

