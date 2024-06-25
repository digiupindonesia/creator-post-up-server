const multer = require('multer')
const fs = require('fs')

// Fungsi untuk membuat direktori upload jika belum ada
const createUploadDir = (uploadDir) => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
}

// Fungsi untuk mengatur nama file
const generateFilename = (fieldname, mimetype) => {
  const ext = mimetype.split('/')[1]
  return `${fieldname}-${Date.now()}.${ext}`
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Tentukan folder berdasarkan nama field file yang diunggah
    const fieldNameFolder = file.fieldname
    const typeFolder = file.mimetype.startsWith('image/') ? 'images' : 'others'

    const uploadDir = `public/uploads/${typeFolder}/${fieldNameFolder}`
    createUploadDir(uploadDir)
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    // Ambil nama field dari bidang file yang diunggah
    const fieldName = file.fieldname
    const filename = generateFilename(fieldName, file.mimetype)
    cb(null, filename)
  },
})

// Konfigurasi multer untuk menangani pengunggahan file tanpa filter tipe data
const uploadImage = multer({
  storage: storage,
}).any()

module.exports = uploadImage
