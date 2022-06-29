


class Dao{

	static async save( model,payload ){


		const daoObject = new model(payload);
		const saved = await daoObject.save();
		return saved;
	}
	static async get( model,payload ){
		const data = await model.find(payload).exec();
		return data;
	}
	static async getPopulate( model,payload,populateParam ){
		const data = await model.find(payload).populate(populateParam);
		return data;
	}
	static async updateOne(model,updateCondition,updateBody){

		const update = await model.updateOne( updateCondition,updateBody );
		return update;
	}


}


module.exports = Dao;