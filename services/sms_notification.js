



const SmsIntegration = require("../utils/sms_integration");
const SOLACE_CONFIG = require("../utils/solace_config");


class SmsNotification{


	constructor( args  ){

		const { message,phone } = args;
		this.message = message;
		this.phone = phone;
		
	}

	send(){


		// const 



		console.log( `send message as sms... ${ this.message } ${this.phone}` );

	}

}


module.exports = SmsNotification;