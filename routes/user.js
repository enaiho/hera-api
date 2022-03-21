
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");

router.post("/authenticate",userController.authenticateUser);
router.post("/register",userController.registerUser);
router.post("/verify_phone",userController.verifyPhoneNumber);
router.post("/verify_account",userController.verifyAccount);
router.post("/call_termii",userController.callTermii);
router.post("/trigger_panic",userController.triggerPanicAlert);



module.exports = router;