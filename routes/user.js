
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");



router.post("/authenticate",userController.authenticateUser);
router.post("/register",userController.registerUser);
router.post("/get_rec_phone", userController.getUserwithPhone);
router.put("/update_profile/:userId", userController.updateProfile);


module.exports = router;