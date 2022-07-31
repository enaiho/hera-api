
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");



router.post("/authenticate",userController.authenticateUser);
router.post("/register",userController.registerUser);
router.post("/get_rec_phone", userController.getUserwithPhone);
router.put("/update_profile/:userId", userController.updateProfile);
router.get("/dependents/:phoneNumber",userController.getDependents);
router.delete("/delete_dependent/:phoneNumber/:dependentPhone", userController.deleteDependent);


module.exports = router;