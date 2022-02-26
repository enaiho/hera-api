
const express = require("express");
const router = express.Router();
const circleController = require("../controllers/circle");

router.post("/add_member",circleController.addMemberToCircle);
router.post("/create_circle",circleController.createCircle);

module.exports = router;