
const SOLACE_CONFIG = require("../utils/solace_config");
const { useHttpOptions } = require("../utils/http_integration");
const {MAPS_API,GEO_APIKEY} = SOLACE_CONFIG;



class GeoLocation{


	constructor(){
	}

	async resolveGeoLocation(location){


		if( location === undefined || location === "" || location.toString() === "{}" ) return false;


		const coordinates = JSON.parse(location);
		const { latitude,longitude } = coordinates.coords;
		const [lat,lng] = [latitude,longitude];



		const latlng = `${lat},${lng}`;


		const options = {
		  method: 'GET',
		  url: MAPS_API,
		  params: {latlng: latlng, key: GEO_APIKEY}
		};



		try{
			

			const response = await useHttpOptions(options);
			return response.data;

			// update the location guy


			
		}
		catch(e){
			console.log( e.message );
			return false;
		}


		return false;
	}

}


module.exports = GeoLocation;

