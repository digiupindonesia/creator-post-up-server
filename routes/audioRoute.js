const express = require('express')
const router = express.Router()
const {
  processVoiceOvers,
  mergedAudioToVideo,
  mergedAudioPreview,
} = require('../controller/AudioControllers')

router.post('/generate/:batch_id', processVoiceOvers)
router.get('/merged/:batch_id', mergedAudioToVideo)
router.get('/preview', mergedAudioPreview)

module.exports = router
