
const { useHttpPost,useHttpGet } = require("./http_integration");
const SOLACE_CONFIG = require("./solace_config");



class SmsIntegration{


	constructor( args ){

	 	const { api_key } = args;
	 	this.api_key = api_key;	

	}
	async send( params ){


		const { message,phone } = params;
		const data = { "to":phone,"from":"N-Alert","sms":message,"type":"plain","api_key":`${this.api_key}`,"channel":"dnd"};
		const headers = {'headers': {'Content-Type': ['application/json', 'application/json']  }}


		try{


			const postParams = { "url":SOLACE_CONFIG.SMS_API,"data":data,"headers":headers  };
			const response = await useHttpPost( postParams );


			console.log( response.data );


			const { code,message_id  } = response.data;


			if( code === "ok" ) return { message_id:message_id, sent:code };


			return { message_id:null, sent:"not_ok" };

		}
		catch(e){

			console.log(e.message);
			return false;
		}

	}

}


module.exports = SmsIntegration;