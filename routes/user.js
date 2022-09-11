
const express = require('express');
const router = new express.Router();
const userController = require('../controllers/user');
const multer = require('multer');

const isvalidFile = (file) => {

    const {mimetype} = file;
    const [fileType] = mimetype.split('/');

    if ( fileType !== 'image' ) return false;

    return true;
}
const storage = multer.diskStorage({
  destination: function(req, file, cb) {

    if ( !isvalidFile(file) ) return;
    cb(null, './uploads');

  },
  filename: function(req, file, cb) {

    if( !isvalidFile(file) ) return;

    const {fieldname, mimetype} = file;
    const extension = mimetype.split('/')[1];

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${fieldname}-${uniqueSuffix}.${extension}`);

  },
});

const upload = multer({storage: storage});

router.post('/authenticate', userController.authenticateUser);
router.post('/register', userController.registerUser);
router.post('/get_rec_phone', userController.getUserwithPhone);
router.put('/update_profile/:userId', userController.updateProfile);
router.get('/dependents/:phoneNumber', userController.getDependents);
router.delete('/delete_dependent/:phoneNumber/:dependentPhone', userController.deleteDependent);
router.post('/add_contacts', userController.addEmergencyContact);
router.get('/get_contacts/:email', userController.getEmergencyContact);
router.patch('/delete_contact/:email', userController.deleteEmergencyContact);
router.post('/update_picture', upload.single('photo'), userController.updateProfilePicture);

module.exports = router;
