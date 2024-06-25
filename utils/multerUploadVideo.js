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
}

const storageFile = multer.diskStorage({
  destination: function (req, file, cb) {
    const typeFolder = file.mimetype.startsWith('video/') ? 'videos' : 'images'
    const dir = `public/uploads/${typeFolder}`
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    const filename = `${file.fieldname}-${Date.now()}.${
      FILE_TYPE[file.mimetype]
    }`
    cb(null, filename)
  },
})

const fileFilter = function (req, file, next) {
  if (!FILE_TYPE[file.mimetype]) {
    return next(new Error('Unsupported file type'), false)
  }
  next(null, true)
}

const upload = multer({
  storage: storageFile,
  fileFilter: fileFilter,
}).any() // Menggunakan .any() untuk menerima field dengan nama dinamis

const convertVideo = (inputPath, outputPath, desiredFPS, width, height) => {
  const fileName = path.basename(inputPath)

  return new Promise((resolve, reject) => {
    console.log(`Memulai konversi video ${fileName}...`)
    console.time(`Total waktu konversi ${fileName}`)

    ffmpeg()
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

const processPhoto = (inputPath, outputPath) => {
  const fileName = path.basename(inputPath)

  return new Promise((resolve, reject) => {
    console.log(`Memulai pemrosesan foto ${fileName}...`)
    console.time(`Total waktu pemrosesan ${fileName}`)

    ffmpeg()
      .input(inputPath)
      .outputOptions('-vf', `scale=720:1280`)
      .output(outputPath)
      .on('end', () => {
        console.log(`Foto ${fileName} berhasil diproses`)
        console.timeEnd(`Total waktu pemrosesan ${fileName}`)
        resolve()
      })
      .on('error', (err) => {
        console.error(`Error saat memproses foto ${fileName}:`, err)
        reject(err)
      })
      .run()
  })
}

exports.uploadMultiple = function (req, res, next) {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer Error:', err)
      return next(err)
    } else if (err) {
      console.error('General Error:', err)
      return next(err)
    }

    try {
      const uploadedFiles = req.files
      console.log('Files yang diunggah:', uploadedFiles)

      if (!uploadedFiles || uploadedFiles.length === 0) {
        return responseTemplate(res, 400, 'No files uploaded', null)
      }

      const tasks = uploadedFiles.map((file, index) => {
        const inputPath = file.path
        const typeFolder = file.mimetype.startsWith('video/')
          ? 'videos'
          : 'images'
        const outputDir = `public/converted/${typeFolder}/${file.fieldname}`
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true })
        }
        const outputFilename = `${file.fieldname}_${index + 1}.${
          FILE_TYPE[file.mimetype]
        }`
        const outputPath = `${outputDir}/${outputFilename}`

        if (file.mimetype.startsWith('video/')) {
          console.log(`Memulai pemrosesan video ${inputPath}...`)
          return convertVideo(inputPath, outputPath, 30, 720, 1280)
            .then(() => {
              console.log(`Selesai memproses video ${inputPath}`)
            })
            .catch((err) => {
              console.error(`Error saat memproses video ${inputPath}:`, err)
              throw err // lemparkan error untuk menangkapnya di catch blok di bawah
            })
        } else if (file.mimetype.startsWith('image/')) {
          console.log(`Memulai pemrosesan foto ${inputPath}...`)
          return processPhoto(inputPath, outputPath)
            .then(() => {
              console.log(`Selesai memproses foto ${inputPath}`)
            })
            .catch((err) => {
              console.error(`Error saat memproses foto ${inputPath}:`, err)
              throw err // lemparkan error untuk menangkapnya di catch blok di bawah
            })
        }
      })

      await Promise.all(tasks)

      next()
    } catch (error) {
      console.error('Error processing uploaded files:', error)
      return responseTemplate(res, 500, 'Error processing uploaded files', null)
    }
  })
}
