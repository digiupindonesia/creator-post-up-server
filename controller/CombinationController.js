const fs = require('fs')
const path = require('path')
const responseTemplate = require('../helper/response')
const { generateCombinations } = require('../utils/combineVideo')
const { processCombinations } = require('../utils/mergedVideo')
const { shuffleFilesInFolder } = require('../utils/func/combinePrompt')

const {
  generateRandomCombination,
  isCombinationDuplicate,
  addCombination,
} = require('../utils/func/combination')
const { Batch } = require('../models')

let combineResult = null

module.exports = {
  async combineVideo(req, res) {
    const { totalLimits, batchName } = req.body
    try {
      const folderUtama = path.join(__dirname, `../public/converted/videos`)
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
  async createBatch(req, res) {
    const { name } = req.body
    try {
      let hook = fs
        .readdirSync(path.join(__dirname, '../public/converted/hook'))
        .map((file) => path.join('../public/converted/hook', file))
      let content1 = fs
        .readdirSync(path.join(__dirname, '../public/converted/content1'))
        .map((file) => path.join('../public/converted/content1', file))
      let content2 = fs
        .readdirSync(path.join(__dirname, '../public/converted/content2'))
        .map((file) => path.join('../public/converted/content2', file))
      let cta = fs
        .readdirSync(path.join(__dirname, '../public/converted/cta'))
        .map((file) => path.join('../public/converted/cta', file))

      combineResult = generateCombinations([hook, content1, content2, cta])

      const batch = await Batch.create({
        name: name,
        combination_path: combineResult,
        status: 'not_merged',
      })
      if (batch.combination_path.length < 1) {
        return responseTemplate(res, 400, 'No combinations found', null)
      }

      return responseTemplate(
        res,
        200,
        `Combination Success with name ${name}`,
        batch.combination_path.length
      )
    } catch (error) {
      return responseTemplate(res, 500, 'Internal Server Error', error.message)
    }
  },

  async mergedVideo(req, res) {
    const { batch_id } = req.params
    try {
      const batch = await Batch.findOne({ where: { batch_id: batch_id } })
      if (!batch) return responseTemplate(res, 404, 'Batch id not found', null)

      await processCombinations(batch.combination_path)

      return responseTemplate(res, 200, 'Merged video success', null)
    } catch (error) {
      return responseTemplate(res, 500, 'Internal Server Error', error.message)
    }
  },

  async getBatch(req, res) {
    const { batchName } = req.body
    try {
      const batch = await Batch.findOne({ where: { name: batchName } })
      if (!batch)
        return responseTemplate(res, 404, 'Batch name not found', null)
      return responseTemplate(res, 200, 'Get batch success', batch)
    } catch (error) {
      return responseTemplate(res, 500, 'Internal Server Error', error.message)
    }
  },

  async deleteBatch(req, res) {
    const { batchName } = req.body
    try {
      const batch = await Batch.findOne({ where: { name: batchName } })
      if (!batch)
        return responseTemplate(res, 404, 'Batch name not found', null)
      await Batch.destroy({ where: { name: batchName } })
      return responseTemplate(res, 200, 'Delete batch success', null)
    } catch (error) {
      return responseTemplate(res, 500, 'Internal Server Error', error.message)
    }
  },

  async shuffleFiles(req, res) {
    const { batch_id } = req.body
    try {
      const folders = ['hook', 'main1', 'main2', 'cta']

      const shuffledPaths = {}
      folders.forEach((folder) => {
        shuffledPaths[folder] = shuffleFilesInFolder(folder)
      })

      await Batch.create({
        combination_path: shuffledPaths,
        status: 'shuffled',
        where: {
          id: batch_id,
        },
      })

      return responseTemplate(res, 200, 'Shuffle files success', shuffledPaths)
    } catch (error) {
      return responseTemplate(res, 500, 'Internal Server Error', error.message)
    }
  },

  async getSavedPrompts(req, res) {
    const { batch_id } = req.params
    try {
      const batch = await Batch.findOne({
        hook,
        main1,
        main2,
        cta,
        where: { id: batch_id },
      })
      if (!batch)
        return responseTemplate(res, 404, 'Batch name not found', null)
      return responseTemplate(res, 200, 'Get batch success', batch)
    } catch (error) {
      return responseTemplate(res, 500, 'Internal Server Error', error.message)
    }
  },
}
