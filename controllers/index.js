

const PhoneValidation = require("../models/phone_validation");

const generateCode = () => {

	let code = "";
	for(let i=0; i<4; i++){
		code += (Math.floor((Math.random() * 10) + 1)).toString();
	}

	return code;
}
const termiiIntegration = () => {}

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

