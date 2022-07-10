
const SOLACE_CONFIG = require("../utils/solace_config");
const SmsIntegration = require("../utils/sms_integration");
const Dao = require("./dao");
const Notify = require("../models/notify");


class Notification{


	async sendOTPCode(data){


		const { message,phone,event } = data;
		const smsIntegration = new SmsIntegration({api_key: SOLACE_CONFIG.SMS_API_KEY });

		try{


			const response = { message_id: "message_id", sent: "ok" };
			console.log( message );


			// const response = smsIntegration.send( data);
			const { message_id,sent  } = response;


			const message_info = { message:message,message_id:message_id,sent:sent };
			const payload = {phone:phone,message_info:message_info,message_count:message.length,type:"sms",event:event};
			const logged = await this.logNotification(payload);


			if( logged  ) return { message: "sms sent", status: true   };


			return { message: "sms message not logged. ", status: false   };



		}
		catch(e){ 
			return { message: e.message, status: false   };
		}


	}

	sendEmail(data){

	}

	sendPushNotification(data){
	}

	async logNotification(payload){

		const saved = await Dao.save( Notify,payload );
		return saved;

	}

}


module.exports = Notification;