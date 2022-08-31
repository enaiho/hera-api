

const express = require('express');
const router = new express.Router();
const triggerController = require('../controllers/trigger');


router.post('/panic', triggerController.triggerPanicAlert);
router.post('/crons', triggerController.cronTriggerPanicAlert);
router.post('/submit_trigger_instance', triggerController.createTriggerInstance);
router.put('/update_safety/:triggerId', triggerController.updateSafety);


module.exports = router;
