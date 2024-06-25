const express = require('express')
const router = express.Router()
const { uploadMultiple } = require('../utils/multerUploadVideo')
const { multipleUpload } = require('../controller/VideoControllers')

const {
  createBatch,
  mergedVideo,
  combineVideo,
} = require('../controller/CombinationController')

router.post('/uploads', uploadMultiple, multipleUpload)
router.get('/combination', createBatch)
router.get('/combine', combineVideo)
router.get('/merged-video/:batch_id', mergedVideo)

module.exports = router
