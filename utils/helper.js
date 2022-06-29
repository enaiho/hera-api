

const generateCode = () => {

	let code = "";
	for(let i=0; i<4; i++) code += (Math.floor((Math.random() * 10) + 1)).toString();
	return code.substring(0,4);

}

// const getPushTokens = async() => {


// 	let pushToken = "";
// 	const push_tokens = [];
// 	const users = await User.find().exec();

// 	if( users.length === 0 ) return [];

// 	for( const user of users ){


// 		pushToken = user.pushToken;
// 		if( pushToken !== ""  && pushToken !== undefined ) push_tokens.push(pushToken);

// 	}
	
// 	return push_tokens;
// }

module.exports = { generateCode };