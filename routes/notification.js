
const express = require('express');
const router = new express.Router();
const notificationController = require('../controllers/notification');


router.get('/activity/:userId', notificationController.getActivity);


module.exports = router;
