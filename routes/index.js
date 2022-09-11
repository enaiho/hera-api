const express = require('express');
const router = new express.Router();
const indexController = require('../controllers/index');

router.get('/', indexController.homePage);
router.get('/emergency/:triggerId', indexController.getEmergencyDetails);
router.post('/verify_phone', indexController.verifyPhoneNumber);


module.exports = router;
