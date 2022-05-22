
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");



router.post("/authenticate",userController.authenticateUser);
router.post("/register",userController.registerUser);
router.post("/verify_phone",userController.verifyPhoneNumber);
router.post("/verify_account",userController.verifyAccount);
router.post("/call_termii",userController.callTermii);
router.post("/trigger_panic",userController.triggerPanicAlert);
router.get("/trigger_info", userController.getTriggerInfo);
router.put("/update_safety/:triggerId",userController.updateSafety);
router.post("/get_rec_phone", userController.getUserwithPhone);
router.put("/update_profile/:userId", userController.updateProfile);
router.post("/resolve_location", userController.resolveLocation);
router.post("/cron_triggers", userController.cronTriggerPanicAlert);
router.post("/submit_trigger_instance", userController.createTriggerInstance);



module.exports = router;