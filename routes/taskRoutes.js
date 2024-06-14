const express = require('express')
const path = require('../controllers/taskControllers.js')
const router = express.Router();
const verifyfun = require('../middlewares/middleware.js')
router.use(express.json())

router.post('/user', verifyfun, path.task_add)

router.get('/user/:id', verifyfun, path.updating_task)

router.get('/user', verifyfun, path.getting_user_task)

router.get('/users', path.getting_all_tasks)

module.exports = router