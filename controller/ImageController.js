const responseTemplate = require('../helper/response')
const path = require('path')
const fs = require('fs')
const { wrapText } = require('../utils/func/wrappedText')
const { Batch, SavedPrompt } = require('../models')
const { addTextToImage } = require('../utils/mergedSlide')

let selectedFiles = {}

const getRandomFile = (folderPath) => {
  const files = fs.readdirSync(folderPath)

  // Ambil file yang belum dipilih
  const availableFiles = files.filter((file) => {
    return !(
      selectedFiles.hasOwnProperty(folderPath) &&
      selectedFiles[folderPath].includes(file)
    )
  })

  // Jika semua file telah dipilih, reset selectedFiles[folderPath] dan coba lagi
  if (availableFiles.length === 0) {
    selectedFiles[folderPath] = []
    return getRandomFile(folderPath) // Rekursif memanggil getRandomFile untuk mencoba lagi
  }

  // Pilih secara acak dari file yang tersedia
  const randomIndex = Math.floor(Math.random() * availableFiles.length)
  const chosenFile = path.join(folderPath, availableFiles[randomIndex])

  // Tandai file yang dipilih dalam selectedFiles[folderPath]
  if (!selectedFiles.hasOwnProperty(folderPath)) {
    selectedFiles[folderPath] = []
  }
  selectedFiles[folderPath].push(availableFiles[randomIndex])

  return chosenFile
}

const generateRandomCombination = (folders) => {
  return folders.map((folder) => getRandomFile(folder))
}

const isCombinationDuplicate = (combination, existingCombinations) => {
  const combinationString = JSON.stringify(combination)
  return existingCombinations.has(combinationString)
}

const addCombination = (
  combination,
  existingCombinations,
  resultCombinations
) => {
  const combinationString = JSON.stringify(combination)
  existingCombinations.add(combinationString)
  resultCombinations.push(combination)
}

const structure = [
  'hook',
  'main1',
  'main2',
  'main3',
  'main4',
  'main5',
  'main6',
  'main7',
  'main8',
  'cta',
]

const createOutputFolder = (outputBaseFolder, combinationIndex) => {
  const outputFolder = path.join(
    outputBaseFolder,
    `konten_${parseInt(combinationIndex) + 1}`
  )
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true })
  }
  return outputFolder
}

const processSingleImage = async (
  image,
  text,
  textType,
  outputFolder,
  index
) => {
  try {
    if (image && text) {
      const outputFileName = `${parseInt(index) + 1}-${textType}${path.extname(
        image
      )}`
      const outputPath = path.join(outputFolder, outputFileName)
      await addTextToImage(image, wrapText(text, 35), outputPath)
    } else {
      console.error(`Teks atau gambar tidak ditemukan untuk: ${textType}`)
    }
  } catch (error) {
    console.error(`Terjadi kesalahan saat memproses ${image}:`, error)
    throw error
  }
}

const processImageCombination = async (
  combination,
  texts,
  combinationIndex,
  outputBaseFolder
) => {
  const outputFolder = createOutputFolder(outputBaseFolder, combinationIndex)

  try {
    // Ensure combination is an array of image paths
    if (!Array.isArray(combination)) {
      throw new Error(`Kombinasi ${combinationIndex + 1} tidak valid.`)
    }

    // Ensure texts is an object with all required keys
    const requiredKeys = [
      'hook',
      'main1',
      'main2',
      'main3',
      'main4',
      'main5',
      'main6',
      'main7',
      'main8',
      'cta',
    ]
    if (!requiredKeys.every((key) => texts.hasOwnProperty(key))) {
      throw new Error(
        `Data teks untuk kombinasi ${combinationIndex + 1} tidak lengkap.`
      )
    }

    // Process each image-text pair
    for (let i = 0; i < structure.length; i++) {
      const textType = structure[i]
      const image = combination[i]
      const text = texts[textType]

      if (!image || !text) {
        console.error(
          `Data gambar atau teks tidak lengkap untuk kombinasi ${
            combinationIndex + 1
          }, index ${i}.`
        )
        continue
      }

      await processSingleImage(image, text, textType, outputFolder, i)
    }

    console.log(`Kombinasi ${combinationIndex + 1} berhasil diproses.`)
  } catch (error) {
    console.error(
      `Terjadi kesalahan saat memproses kombinasi ${combinationIndex + 1}:`,
      error
    )
    throw error
  }
}

module.exports = {
  multipleUploadImg: async (req, res) => {
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return responseTemplate(res, 400, 'Tidak ada file yang diunggah', null)
      }

      const fileNames = {}
      for (const key in req.files) {
        const fieldFiles = req.files[key]
        fileNames[key] = Array.isArray(fieldFiles)
          ? fieldFiles.map((file) => file.filename)
          : [fieldFiles.filename]
      }

      return responseTemplate(res, 200, 'Pengunggahan Berhasil', fileNames)
    } catch (error) {
      console.error(error)
      return responseTemplate(res, 500, 'Error Internal Server', error.message)
    }
  },

  async combineSlide(req, res) {
    const { totalLimits, batchName } = req.body
    try {
      const folderUtama = path.join(__dirname, `../public/uploads/images`)
      let folders = fs.readdirSync(folderUtama)

      folders = folders.filter((folder) => folder !== 'cta')
      folders.push('cta')

      const folderPaths = folders.map((folder) =>
        path.join(folderUtama, folder)
      )

      const existingCombinations = new Set()
      const resultCombinations = []
      let maxAttempts = 1000
      let attempts = 0

      while (
        (totalLimits && resultCombinations.length < totalLimits) ||
        (!totalLimits && attempts < maxAttempts)
      ) {
        const newCombination = generateRandomCombination(folderPaths)
        if (!isCombinationDuplicate(newCombination, existingCombinations)) {
          addCombination(
            newCombination,
            existingCombinations,
            resultCombinations
          )
          maxAttempts++ // Tambahkan 10 ke maxAttempts setiap kali menemukan kombinasi baru
        }
        attempts++
      }

      const totalCombined = resultCombinations.length

      await Batch.create({
        name: batchName,
        combination_path: resultCombinations,
        type: 'video',
        status: 'combined',
      })

      if (totalCombined < 1) {
        return responseTemplate(res, 400, 'Tidak ada kombinasi ditemukan', null)
      }

      return responseTemplate(res, 200, 'Kombinasi Berhasil', {
        totalCombined,
        resultCombinations,
      })
    } catch (error) {
      console.error('Terjadi kesalahan:', error)
      return responseTemplate(res, 500, 'Error Internal Server', error.message)
    }
  },

  processSlides: async (req, res) => {
    const { batchName } = req.body
    const outputBaseFolder = path.join(
      __dirname,
      `../public/results/${batchName}`
    )

    try {
      const batchData = await Batch.findOne({ where: { name: batchName } })

      if (!batchData) {
        return responseTemplate(res, 404, 'Batch tidak ditemukan', null)
      }

      const savedPromptData = await SavedPrompt.findOne({
        where: { batch_id: batchData.batch_id },
        attributes: structure, // Pastikan atribut disesuaikan dengan yang Anda butuhkan
      })

      if (!savedPromptData) {
        return responseTemplate(res, 404, 'Data teks tidak ditemukan', null)
      }

      const imageData = batchData.combination_path
      const textData = savedPromptData.dataValues

      // Validate imageData

      // Validate imageData
      if (!Array.isArray(imageData) || !imageData.every(Array.isArray)) {
        console.error('imageData bukan array dari array.')
        return responseTemplate(res, 400, 'Format data tidak valid.')
      }

      // Proceed to process each combination
      for (
        let combinationIndex = 0;
        combinationIndex < imageData.length;
        combinationIndex++
      ) {
        const combination = imageData[combinationIndex]
        const texts = {
          hook: textData.hook[combinationIndex],
          main1: textData.main1[combinationIndex],
          main2: textData.main2[combinationIndex],
          main3: textData.main3[combinationIndex],
          main4: textData.main4[combinationIndex],
          main5: textData.main5[combinationIndex],
          main6: textData.main6[combinationIndex],
          main7: textData.main7[combinationIndex],
          main8: textData.main8[combinationIndex],
          cta: textData.cta[combinationIndex],
        }

        await processImageCombination(
          combination,
          texts,
          combinationIndex,
          outputBaseFolder
        )
      }

      return res.status(200).send('Semua gambar berhasil diproses.')
    } catch (error) {
      console.error('Terjadi kesalahan saat memproses gambar:', error)
      return responseTemplate(
        res,
        500,
        'Terjadi kesalahan saat memproses gambar.'
      )
    }
  },

  getPrompts: async (req, res) => {
    try {
      const prompts = await SavedPrompt.findAll({
        attributes: structure,
      })
      return responseTemplate(res, 200, 'Success', prompts)
    } catch (error) {
      return responseTemplate(res, 500, 'Error Internal Server', error.message)
    }
  },

  getBatch: async (req, res) => {
    const { batch_id } = req.params
    try {
      const batch = await Batch.findOne({
        where: { batch_id },
        attributes: ['combination_path'],
      })
      if (!batch) {
        return responseTemplate(res, 404, 'Batch name not found', null)
      }
      return responseTemplate(res, 200, 'Get batch success', batch)
    } catch (error) {
      return responseTemplate(res, 500, 'Internal Server Error', error.message)
    }
  },
}
