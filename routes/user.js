
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");

router.post("/authenticate",userController.authenticateUser);
router.post("/register",userController.registerUser);
router.post("/verify_phone",userController.verifyPhoneNumber);


module.exports = router;