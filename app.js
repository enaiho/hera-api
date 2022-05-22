
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/user");
const indexRoutes = require("./routes/index");
const circleRoutes = require("./routes/circle");
const mongoose = require("mongoose");
const app = express();
const server = require("http").createServer(app);
const DB_URI = 'mongodb+srv://sabiplay_user:R2kMcuhqb52MVwjp@cluster-sabiplay.vr22h.mongodb.net/HeraDB?retryWrites=true&w=majority';
// const io = require("socket.io")(server,{ cors:{ origin:"*" } });



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());

app.use("/", indexRoutes);
app.use("/user", userRoutes);
app.use("/circle", circleRoutes);


const PORT = process.env.PORT || 5000;



mongoose.connect(DB_URI)
.then( connect => {

	if( !connect ) {console.log("connection to hera db failed."); return; }
	app.listen(PORT,() => console.log(`Server running in ${PORT} and connnection to db established`));


}).catch( err=>{

	console.error( err );

});


// io.on("connection", (socket) => {
// 	console.log( socket.id );

// });









