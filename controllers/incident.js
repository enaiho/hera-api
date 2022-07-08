
const IncidentService = require("../services/incident_service");
const IncidentOptions = require("../models/incident_options");
const Dao = require("../services/dao");


exports.createIncident = async(req,res) => {

	const incidentResourceParams = {
		"requestBody":req.body,
		"models":[IncidentOptions],
		"dependencies":[Dao]
	}
	const created =  await IncidentService.createIncident(incidentResourceParams);
	if( created ) return res.json({ message:`incident ${req.body.label} has been created successfully. ` });
	
	return res.json({message: "error occurred in creating incident "});

}

exports.getIncidents = async(req,res)=>{


	try{
		const incidentResourceParams = {
			"models":[IncidentOptions],
			"dependencies":[Dao]
		}
		const incidents = await IncidentService.getIncidents(incidentResourceParams);
		return res.json({ message:"incidents have been retrieved", incidents:incidents });
	}
	catch(e){
		return res.json({ message:"error in getting incidents. ",  incidents:[]});
	}

}