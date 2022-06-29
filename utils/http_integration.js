
const axios = require("axios");


const useHttpPost = async( postParams ) => {

	const { url,data,headers } = postParams;
	try{
		const response = await axios.post(url,data,headers);
		return response;
	}

	catch( e ){

		console.log( e.message );
		return e;
	}
}
const useHttpGet = async( getParams ) => {

	const { url,data,headers } = postParams;
	try{
		const response = await axios.get(url,data,headers);
		return response;
	}

	catch( e ){ return e; }
}
const useHttpOptions = async(optionParams) => {

	try{
		const response = await axios.request(optionParams);
		return response;
	}
	catch(e){ return e; }
}


module.exports = { useHttpPost,useHttpGet,useHttpOptions };