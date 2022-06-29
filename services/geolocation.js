
const SOLACE_CONFIG = require("../utils/solace_config");
const { useHttpOptions } = require("../utils/http_integration");
const {MAPS_API,GEO_APIKEY} = SOLACE_CONFIG;



class GeoLocation{


	constructor(){
	}

	resolveGeoLocation(location){


		if( location === undefined || location === "" || location.toString() === "{}" ) return "cannot resolve. ";


		const coordinates = JSON.parse(location);
		const { latitude,longitude } = coordinates.coords;
		const [lat,lng] = [latitude,longitude];



		// if( lat === "" ) return res.json({message: "Latitude coordinate cannot be empty. "});
		// if(  lng === ""  ) return res.json({message: "Longitude cannot be empty. "});


		const latlng = `${lat},${lng}`;


		// console.log( latlng );


		const options = {
		  method: 'GET',
		  url: MAPS_API,
		  params: {latlng: latlng, key: GEO_APIKEY}
		};


		try{
			

			const response = useHttpOptions(options);
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

