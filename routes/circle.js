
const express = require('express');
const router = new express.Router();
const circleController = require('../controllers/circle');

router.post('/add_member', circleController.addMemberToCircle);
router.post('/create_circle', circleController.createCircle);
router.post('/create_contact', circleController.createEmergencyContact);

module.exports = router;
