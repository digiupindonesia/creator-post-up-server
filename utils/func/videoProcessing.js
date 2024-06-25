const fs = require('fs')
const path = require('path')
const { addTextToImage } = require('../mergedSlide')
const { wrapText } = require('./wrappedText')

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

module.exports = {
  structure,
  createOutputFolder,
  processSingleImage,
}
