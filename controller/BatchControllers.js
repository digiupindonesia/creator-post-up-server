const responseTemplate = require('../helper/response')
const { SavedPrompt } = require('../models')
const fs = require('fs')
const path = require('path')
const { generateCombinations } = require('../utils/combineVideo')
const { Batch } = require('../models')

let combineResult = null

module.exports = {
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

  async getSavedPromptByBatchId(req, res) {
    const { batch_id } = req.params
    try {
      const batch = await SavedPrompt.findOne({
        where: {
          batch_id: batch_id,
        },
        attributes: ['hook', 'main1', 'main2', 'cta'],
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
