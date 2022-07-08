

const Transaction = require("mongoose-transactions");
const mongoose = require("mongoose");
const transaction = new Transaction();



class IncidentService{


	constructor(){
	}

	static async createIncident(incidentParamResources){


		const { requestBody,models,dependencies } = incidentParamResources;
		const [ IncidentOptions  ] = models;
		const [ Dao ] = dependencies;
		const { label,tag } = requestBody;


		const saved = await Dao.save(IncidentOptions,requestBody);
		if( saved ) return true;

		return false;
	}
	static async deleteIncident(){
	}
	static async getIncidents(incidentParamResources){


		const { models,dependencies } = incidentParamResources;
		const [ IncidentOptions  ] = models;
		const [ Dao ] = dependencies;

		return await Dao.get(IncidentOptions);
	}


}

module.exports = IncidentService;