

const SOLACE_CONFIG = require("../utils/solace_config");
const { useHttpOptions } = require("../utils/http_integration");
const Transaction = require("mongoose-transactions");
const mongoose = require("mongoose");
const transaction = new Transaction();


class TriggerService{


	constructor(){
	}

	static async #createPanicAlertFactory(triggerResourceParams){


		const { requestBody,models,dependencies } = triggerResourceParams;
		const [ Trigger,Instance,Battery,Location,User  ] = models;
		const [ Geolocation,Dao,Notification ] = dependencies;
		let { email,location,batteryDetails,triggerId } = requestBody;




		const payload = {email:email };
		const geolocation = new Geolocation();



		try{
		
			if( triggerId === "" || triggerId === undefined ) triggerId= transaction.insert( "Trigger", { email:email,safety_status:0,instances:[]});
			  

			const instanceId = transaction.insert( "Instance",{email:email,trigger_id:triggerId});
		    let triggerInstances = await Dao.get( Trigger, { _id:triggerId } );



		    if( triggerInstances.length === 0 ) triggerInstances.push(instanceId.toString());
		    else{
		    	triggerInstances = triggerInstances[0].instances;
		    	triggerInstances.push(instanceId.toString());
		    }
			

			const updateInstancesBody = { instances:triggerInstances };

			transaction.update("Trigger",triggerId, updateInstancesBody);


			const batteryId = transaction.insert( "Battery", {email:email,battery_details:batteryDetails,instance_id: instanceId,trigger_id:triggerId} );
			const locationId = transaction.insert( "Location", {email:email,location:location,trigger_id:triggerId,instance_id: instanceId,battery_id: batteryId,reverse_geodata:""});


			const resolveStatus = await geolocation.resolveGeoLocation(location);
			if( resolveStatus === false ) return { message:"There was an error in resolving the geo location data. ", status:"" };


			const updateData = { reverse_geodata:resolveStatus };
			transaction.update( "Location", locationId, updateData );



		    const final = await transaction.run();


			

		    if( final ) return {message: "message sent successfully ", triggerId: triggerId.toString(), status: "sent"};


		}
		catch(error){

			console.error(error);
		    const rollbackObj = await transaction.rollback().catch(console.error);
		    transaction.clean();
		    return {message: error.message, status: "not sent"};

		}


		return {message: "error in sending trigger ", status: "not sent"};
	}
	static async createPanicAlertResource( triggerResourceParams ){


		const { message,status,triggerId } = await TriggerService.#createPanicAlertFactory(triggerResourceParams);


		if( status === false) return { message:message, status:status };


		const { requestBody,models,dependencies } = triggerResourceParams;
		const [Trigger,Instance,Battery,Location,User,Contact,IncidentOptions] = models;
		const [ Geolocation,Dao,Notification ] = dependencies;
		const { email } = requestBody;



		try{


			const user = await Dao.get(User, { email:email } );
			const contacts = await Dao.get(Contact, { email:email } );
			const incidents = await Dao.get(IncidentOptions);



			if( user.length === 0   ) return  {message: "user does not exist ", status: "not_sent"};
			if( contacts.length === 0 ) return { message:"it looks like you do not have an emergency  ",status: "not_sent" };


			const {  fname,lname,phone  } = user[0];
			const frsp_name = contacts[0].contacts[0].name;
			let frsp_phone = contacts[0].contacts[0].phoneNumbers[0].number;
			frsp_phone = frsp_phone.replace(/\s/g, '');

			if( frsp_phone.indexOf("+") > -1 ) frsp_phone = frsp_phone.slice(1,frsp_phone.length) ;


			// console.log(frsp_phone);


			const outBoundMessage = `[Solace] Hi ${frsp_name}, Your friend ${fname} seems to be unsafe. Click the link below to see their location.:  ${SOLACE_CONFIG.SOLACE_DOMAIN}/emergency/${triggerId} `;
			const sendTriggerMessage = await new Notification().sendOTPCode( { message:outBoundMessage,phone:frsp_phone,event:"trigger" } );
			

			if( sendTriggerMessage["status"] === false ) return {message: sendTriggerMessage["message"], status: "not sent"};


			return {message: "panic alert has been triggered successfully. ", status: "sent", trigger_id:triggerId, incidents: incidents};


		}
		catch(e){
			return {message: e.message, status: "not sent"};
		}

		return {message: "error occurred in triggering panic alert. ", status: "not sent"};

	}
	static async createPanicInstanceResource(triggerResourceParams){


		const { message,status,triggerId } = await TriggerService.#createPanicAlertFactory(triggerResourceParams);
		if( status === false ) return { message:message,status:status };
		return { message:"instance of this location has been saved. ",status: true };
	}
	static async updateTriggerSafety(safetyTriggerParams){


		const { requestBody,updateBody,models,dependencies } = safetyTriggerParams;
		const [ Trigger  ] = models;
		const [ Dao ] = dependencies;
		const { triggerId } = requestBody;

		try{

			const update = await Dao.updateOne(Trigger,{_id:triggerId},updateBody);
			if( update && update.acknowledged === true ) return 1;

			return 0;
			
		}
		catch(e){
		}


		return -1;


	}
	static async getPushTokensForCron(triggerResourceParams){


		const { requestBody,models,dependencies } = triggerResourceParams;
		const [Trigger,Instance,Battery,Location,User,Contact] = models;
		const [Dao] = dependencies;


		let counter = 0;
		let [email,triggerId] = ["",""];
		let pushTokens = new Map();
		const triggers = await  Dao.get(Trigger,{safety_status:0} );

		if( triggers.length === 0 ) return [];

		for(const trigger of triggers){

			email = trigger.email;	
			triggerId = trigger._id;


			if( email !== undefined ){

				let user_rec = await Dao.get(User, { email:email } );
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

}

module.exports = TriggerService;

