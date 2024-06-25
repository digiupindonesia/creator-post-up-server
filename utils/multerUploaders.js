const async = require('async')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const ffmpeg = require('fluent-ffmpeg')
const responseTemplate = require('../helper/response')

const FILE_TYPE = {
  'video/mp4': 'mp4',
  'video/mkv': 'mkv',
  'video/avi': 'avi',
  'video/mov': 'mov',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const storageFile = multer.diskStorage({
  destination: function (req, file, cb) {
    const keyName = file.fieldname
    const dir = `public/uploads/${keyName}`
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    const keyName = file.fieldname
    const filename = `${keyName}-${Date.now()}.${FILE_TYPE[file.mimetype]}`
    cb(null, filename)
  },
})

const fileFilter = function (req, file, cb) {
  const isValidFormat = !!FILE_TYPE[file.mimetype]
  if (!isValidFormat) {
    return cb(new Error('Invalid File Type'), false)
  }
  cb(null, true)
}

// Function to generate dynamic fields
function generateFields(req) {
  const dynamicFields = []
  const fieldRegex = /^(hook|content\d+|cta|main\d+)$/
  for (const key in req.body) {
    if (fieldRegex.test(key)) {
      dynamicFields.push({ name: key, maxCount: 11 })
    }
  }
  return dynamicFields
}

function convertVideo(inputPath, outputPath, desiredFPS, width, height) {
  const fileName = path.basename(inputPath)

  return new Promise((resolve, reject) => {
    console.log(`Memulai konversi video ${fileName}...`)
    console.time(`Total waktu konversi ${fileName}`)

    const command = ffmpeg()
      .input(inputPath)
      .videoBitrate(3500)
      .videoCodec('libx264')
      .outputOptions('-r', desiredFPS)
      .outputOptions('-vf', `scale=${width}:${height}`)
      .noAudio()
      .on('end', () => {
        console.log(`Video ${fileName} berhasil dikonversi`)
        console.timeEnd(`Total waktu konversi ${fileName}`)
        resolve()
      })
      .on('error', (err) => {
        console.error(`Error saat mengkonversi video ${fileName}:`, err)
        reject(err)
      })
      .save(outputPath)
  })
}

function processPhoto(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    fs.copyFile(inputPath, outputPath, (err) => {
      if (err) {
        console.error(`Error saat memproses foto ${inputPath}:`, err)
        return reject(err)
      }
      console.log(`Foto ${inputPath} berhasil diproses`)
      resolve()
    })
  })
}

exports.uploadMultiple = function (req, res, next) {
  const fields = generateFields(req)
  const upload = multer({
    storage: storageFile,
    fileFilter: fileFilter,
  }).fields(fields)

  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return next(err)
    } else if (err) {
      return next(err)
    }

    try {
      const uploadedFiles = req.files

      if (!uploadedFiles || Object.keys(uploadedFiles).length === 0) {
        return responseTemplate(res, 400, 'No files uploaded', null)
      }

      const tasks = []

      for (const key in uploadedFiles) {
        const files = uploadedFiles[key]
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const inputPath = file.path
          const outputDir = `public/converted/${key}`
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true })
          }
          const outputFilename = `${key}_${i + 1}.${FILE_TYPE[file.mimetype]}`
          const outputPath = `${outputDir}/${outputFilename}`

          if (file.mimetype.startsWith('video/')) {
            tasks.push((callback) => {
              convertVideo(inputPath, outputPath, 30, 720, 1280)
                .then(() => callback(null))
                .catch((err) => callback(err))
            })
          } else if (file.mimetype.startsWith('image/')) {
            tasks.push((callback) => {
              processPhoto(inputPath, outputPath)
                .then(() => callback(null))
                .catch((err) => callback(err))
            })
          }
        }
      }

      async.parallelLimit(tasks, 5, (err) => {
        if (err) {
          console.error('Error processing uploaded files:', err)
          return responseTemplate(
            res,
            500,
            'Error processing uploaded files',
            null
          )
        }
        next()
      })
    } catch (error) {
      console.error('Error processing uploaded files:', error)
      return responseTemplate(res, 500, 'Error processing uploaded files', null)
    }
  })
}
