const express = require('express')
const router = express.Router()
const tiktokAuthController = require('../controller/TiktokAuthControllers')

router.get('/oauth', tiktokAuthController.oauth)
router.get('/callback', tiktokAuthController.callback)
router.get('/refresh-token', tiktokAuthController.refreshToken)

module.exports = router