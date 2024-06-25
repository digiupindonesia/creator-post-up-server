const express = require('express')
const router = express.Router()
const uploadImage = require('../utils/multerUploadImage')
const {
  multipleUploadImg,
  combineSlide,
  processSlides,
  getPrompts,
  getBatch,
} = require('../controller/ImageController')
const { generatePromptSlide } = require('../controller/PromptControllers')
const { generateDynamicPrompt } = require('../controller/PromptControllers')
const responseTemplate = require('../helper/response')
const bodyParser = require('body-parser')

// Middleware untuk mengurai JSON dan form-urlencoded di level router
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

// Rute untuk pengunggahan gambar
router.post(
  '/uploads',
  (req, res, next) => {
    // Gunakan middleware multer
    uploadImage(req, res, function (err) {
      if (err) {
        return responseTemplate(res, 400, 'Pengunggahan gagal', err.message)
      }
      next()
    })
  },
  multipleUploadImg
)

router.get('/combine', combineSlide)
router.post('/prompt', generatePromptSlide)
router.post('/generate/prompt', generateDynamicPrompt)
router.get('/slide', processSlides)
router.get('/prompt/all', getPrompts)
router.get('/batch/:batch_id', getBatch)

module.exports = router
