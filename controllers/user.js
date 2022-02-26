

const bcrypt = require("bcrypt");
const User = require("../models/user");


const saltRounds = 10;

const getUserRec = async(pl) => {
	const user = await User.find(pl).exec();
	return user;
}

exports.authenticateUser = async (req,res) => {

	const { username,password } = req.body;
	const hash_password = await bcrypt.hash(password, saltRounds);
	const user  = new User({
		username:username,
		password:hash_password
	});

	const user_rec  = await getUserRec(user);
	if( user_rec.length > 0 ) return res.json( { message:"user authenticated successfully. " });

	return res.json( {message: "error in authenticating user. "} );

}
exports.registerUser = async(req,res)=>{

	// const save = await GGEntries.insertMany( sanitized_pl );

	const {fname,lname,phone,email,password,username} = req.body;
	const phone_rec = await getUserRec({ "phone":phone });
	const email_rec = await getUserRec({ "email":email });
	const username_rec = await getUserRec({"username":username});


	if( fname === "" || fname === undefined ) return res.json( {message: `first name cannot be empty. `} );
	if( lname === "" || lname === undefined ) return res.json( {message: `last name cannot be empty. `} );
	if( username === "" || username === undefined ) return res.json( {message: `username cannot be empty from the payload. `} );
	if( phone_rec.length > 0 || phone_rec === undefined ) return res.json( {message: `this phone exists. `} );
	if( email_rec.length > 0 || email_rec === undefined ) return res.json( {message: `this email exists. `} );
	if( username_rec.length > 0 || username_rec === undefined ) return res.json( {message: `this username exists. `} );

	const hash = await bcrypt.hash(password, saltRounds);

	const user  = new User({
		fname:fname,
		lname:lname,
		phone:phone,
		email:email,
		password:hash
	});

	const saved = await user.save();
	if( !saved ) return res.json( { message:"error occurred in registering user" });

	return res.json( {message: `user has been registered successfully. `} );


}
exports.verifyPhoneNumber = async (req,res) => {

	const { phone } = req.body;
	const user = await getUserRec({ phone:phone });
	if( user.length === 0 || user === undefined ) 	return res.json({ message:"Number does not exist",exist:false });

	return res.json({ message:"Number found", exist:true });

}
