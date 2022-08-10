

const generateCode = () => {

	let code = "";
	for(let i=0; i<4; i++) code += (Math.floor((Math.random() * 10) + 1)).toString();
	return code.substring(0,4);
}
const cleanPhoneNumber = (string) => {


	if( string === "" ) return string;

	let newString = "";
	for( const char of string ){


		if( char === "+" ) continue;
		if( char !== " ") newString = `${ newString }${char}`;
	}


	return newString;
}


module.exports = { generateCode,cleanPhoneNumber };