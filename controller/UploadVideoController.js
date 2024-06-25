const responseTemplate = require('../helper/response')

module.exports = {
  multipleUpload: async (req, res) => {
    try {
      const { hook, content1, content2, cta } = req.files || {}

      // Pastikan semua file telah diunggah
      if (!hook || !content1 || !content2 || !cta) {
        return responseTemplate(res, 400, 'No files uploaded', null)
      }

      // Ambil nama file dari setiap bidang
      const fileNames = []
      for (let key in req.files) {
        const files = req.files[key]
        files.forEach((file) => {
          fileNames.push(file.filename)
        })
      }

      return responseTemplate(res, 200, 'Upload Success', fileNames)
    } catch (error) {
      console.error(error)
      return responseTemplate(res, 500, 'Internal Server Error', error.message)
    }
  },
}
