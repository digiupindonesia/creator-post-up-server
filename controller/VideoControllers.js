const path = require('path')
const responseTemplate = require('../helper/response')
const { deleteFolderRecursive } = require('../utils/func/deleteFolder')

module.exports = {
  multipleUpload: async (req, res) => {
    try {
      const fileNames = []

      // Iterasi semua bidang dalam req.files
      for (let key in req.files) {
        const file = req.files[key]
        fileNames.push(file.filename)
        // Di sini Anda bisa menambahkan proses konversi atau pemrosesan lainnya jika diperlukan
      }

      // Hapus direktori setelah semua file diunggah
      deleteFolderRecursive(
        path.join(__dirname, '..', 'public', 'uploads', 'videos')
      )

      // Kirim respons setelah semua file diunggah berhasil
      return responseTemplate(res, 200, 'Upload Success', fileNames)
    } catch (error) {
      console.error('Error during file upload:', error)
      return responseTemplate(res, 500, 'Internal Server Error', error.message)
    }
  },
}
