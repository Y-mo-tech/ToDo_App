const express = require('express');
const router = express.Router();
const verifyfun = require('../middlewares/middleware.js')
const path = require('../controllers/userControllers.js')
router.use(express.json());

router.post('/register', path.user_register)

router.post('/login', path.user_login)

router.post('/changepassword', verifyfun, path.change_user_password)

module.exports = router;