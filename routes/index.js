const express = require("express");
const router = express.Router();
const indexController = require("../controllers/index");

router.get("/",indexController.homePage);
router.post("/is_valid_phone",indexController.isValidPhoneNumber);

module.exports = router;