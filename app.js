
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/user");
const indexRoutes = require("./routes/index");
const circleRoutes = require("./routes/circle");
const triggerRoutes = require("./routes/trigger");
const incidentRoutes = require("./routes/incident");
const SOLACE_CONFIG = require("./utils/solace_config");
const mongoose = require("mongoose");
const app = express();
const server = require("http").createServer(app);


const DB_URI = SOLACE_CONFIG.DB_URI;


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());

app.use("/", indexRoutes);
app.use("/user", userRoutes);
app.use("/circle", circleRoutes);
app.use("/trigger", triggerRoutes);
app.use("/incident", incidentRoutes);



const PORT = process.env.PORT || 5000;



mongoose.connect(DB_URI)
.then( connect => {

	if( !connect ) {console.log("connection to hera db failed."); return; }
	app.listen(PORT,() => console.log(`Server running in ${PORT} and connnection to db established`));


}).catch( err=>{

	console.error( err );

});







