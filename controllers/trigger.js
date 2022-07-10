
const bcrypt = require("bcrypt");
const axios = require("axios");
const User = require("../models/user");
const Location = require("../models/location");
const Contact = require("../models/contact");
const Battery = require("../models/battery");
const Instance = require("../models/instance");
const Trigger = require("../models/trigger");
const IncidentOptions = require("../models/incident_options");
const SolacePNService = require("../services/push_notification");
const SOLACE_CONFIG = require("../utils/solace_config");
const SmsIntegration = require("../utils/sms_integration");
const Notification = require("../services/notification");
const Geolocation = require("../services/geolocation");
const Dao = require("../services/dao");
const TriggerService = require("../services/trigger_service");



const { GEO_APIKEY,MAPS_API,SOLACE_DOMAIN } = SOLACE_CONFIG;
const geolocation = new Geolocation();


exports.cronTriggerPanicAlert = async(req,res) => {


	const triggerResourceParams = {
		"requestBody":req.body,
		"models":[Trigger,Instance,Battery,Location,User,Contact],
		"dependencies":[Dao]
	}
	const pushTokens =  await TriggerService.getPushTokensForCron(triggerResourceParams);
	const pnSolaceService =  SolacePNService( pushTokens );


	// console.log( pushTokens );
	// loop through the pushTokens and construct the message to submit all the trigger instances to the users


	return res.json({message: "schedule has been triggered "});
}
exports.triggerPanicAlert = async (req,res)=>{

	try{

		const triggerResourceParams = {

			"requestBody":req.body,
			"models":[Trigger,Instance,Battery,Location,User,Contact,IncidentOptions],
			"dependencies":[Geolocation,Dao,Notification]
		}

		const createTriggerPanic = await TriggerService.createPanicAlertResource(triggerResourceParams);
		return res.json( createTriggerPanic );

	}
	catch(e){
		return res.json( { message:e.message,status:"not sent" } );
	}
}
exports.createTriggerInstance = async( req,res ) => {

	try{

		const triggerResourceParams = {

			"requestBody":req.body,
			"models":[Trigger,Instance,Battery,Location,User,Contact],
			"dependencies":[Geolocation,Dao,Notification]
		}
		const createTriggerPanicInstance = await TriggerService.createPanicInstanceResource(triggerResourceParams);
		return res.json( createTriggerPanicInstance );


	}
	catch(e){
		return res.json( {message:e.message, status:"instance could not be sent. "} );

	}
}
exports.updateSafety = async(req,res) => {

	try{

		const triggerResourceParams = {
			"requestBody":req.params,
			"updateBody":req.body,
			"models":[Trigger],
			"dependencies":[Dao]
		}
		const update = await TriggerService.updateTriggerSafety(triggerResourceParams);
		if( update === 1 || update === 0 ) return res.json( {message: "user is safe.. ", safe: true} );

		return res.json( {message: "exception occured in updating this user. ", safe: false} );

	}
	catch(ex){
		return res.json( {message: "user is not safe.. ", safe: false} );
	}
}