
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");


router.post("/authenticate",userController.authenticateUser);
router.post("/gg/save",userController.saveEntries);
router.post("/register",userController.registerUser);


module.exports = router;