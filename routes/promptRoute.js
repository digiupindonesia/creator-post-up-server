const express = require('express')
const router = express.Router()

const {
  generatePrompt,
  generateDynamicPrompt,
} = require('../controller/PromptControllers')
const { getSavedPromptByBatchId } = require('../controller/BatchControllers')

router.post('/generate/:batch_id', generatePrompt)
router.post('/generate/prompt', generateDynamicPrompt)
router.get('/get-prompt/:batch_id', getSavedPromptByBatchId)

module.exports = router
