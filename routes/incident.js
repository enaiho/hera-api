

const express = require("express");
const router = express.Router();
const incidentController = require("../controllers/incident");


router.post("/create",incidentController.createIncident);
router.get("/get",incidentController.getIncidents);


module.exports = router;