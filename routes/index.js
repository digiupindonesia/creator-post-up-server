const { Router } = require('express')
const authRoute = require('./authRoute')
const videoRoute = require('./videoRoute')
const audioRoute = require('./audioRoute')
const promptRoute = require('./promptRoute')
const tiktokAuthRoute = require('./tiktokAuthRoute')
const imageRoute = require('./imageRoute')
const { verifyAdminRole, authorization } = require('../middleware/userAuth')
const router = Router()

router.use('/api/v1/auth', authRoute)
router.use(authorization)
router.use('/api/v1/video', videoRoute)
router.use('/api/v1/audio', audioRoute)
router.use('/api/v1/image', imageRoute)
router.use('/api/v1/prompt', promptRoute)
router.use('/api/v1/tiktok/auth', tiktokAuthRoute)

module.exports = router
