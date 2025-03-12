const express = require('express')
const router = express.Router()
const visitController = require('../Controllers/visit')

router.post('/request-visit',visitController.requestVisit)

module.exports = router