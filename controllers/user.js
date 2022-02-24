

const bcrypt = require("bcrypt");
const User = require("../models/user");
const Circle = require("../models/circle");


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
exports.saveEntries = async (req,res) =>{


	const  { input } = req.body;
	const pls = JSON.parse(input);
	const gg_entries = new GGEntries();
	
	if( pls.length === 0 ) return;

	try{

		for(const pl of pls ){

			const sanitized_pl = await composeSanitizePl(pl.payload);
			if( sanitized_pl.length === 0 )	 return res.json({ "message":"entries already exists. " });; 
			const save = await GGEntries.insertMany( sanitized_pl );
			
		}

		console.log( "saved successful. " );
		return res.json({ "message":"saved successful" });

	}
	catch(err){

		console.log(err);
		return res.json({ "message":err.toString() });

	}
}
exports.registerUser = async(req,res)=>{

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
exports.createCircle = async(req,res)=>{

	const {name,user_id} = req.body;
	if( name === "" || name === undefined ) return res.json( { message:"Circle name cannot be empty. " });
	if( name.length > 20 ) return res.json( { message:"Circle name cannot be greater than 20 characters. " });

	const circle_rec = await Circle.find({name:name}).exec();
	if( circle_rec.length > 0 )  return res.json( { message:"Circle with this name has already been created. " });

	const circle = new Circle({name:name,user_id:user_id});
	const saved = await circle.save();

	if(!saved) return res.json( { message:"error occurred in saving circle" });

	return res.json( { message:"circle has been saved successfully. " });

}
exports.addMemberToCircle = async(req,res)=>{

}
