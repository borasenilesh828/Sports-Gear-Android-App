const express = require('express')
const router =express.Router()
const userController = require('../Controllers/user')


router.post('/get-user-by-username',userController.userByUserName)

router.post('/contact-us',userController.contactUs)


module.exports = router