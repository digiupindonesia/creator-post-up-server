const axios = require('axios')
const fs = require('fs')
const path = require('path')

const { SavedPrompt } = require('../models')

const responseTemplate = require('../helper/response')
const {
  mergeAudiosAndCaption,
  mergeAudiosAndSub,
} = require('../utils/mergedAudio')

module.exports = {
  async generateAudioAutomate(text, voice_id, category, index, batch_id) {
    try {
      const response = await axios({
        url: `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
        data: {
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.3,
            similarity_boost: 1.0,
          },
        },
        responseType: 'stream',
      })

      const cleanedText = text.replace(/[^\w\s]/gi, '')
      const dir = path.join(__dirname, '../download/audio', batch_id, category)
      const filePath = path.join(dir, `${cleanedText}.mp3`)

      // Membuat direktori jika belum ada
      fs.mkdirSync(dir, { recursive: true })

      const writer = fs.createWriteStream(filePath)
      response.data.pipe(writer)

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
      })
        .then(() => console.log(`File downloaded successfully: ${filePath}`))
        .catch((error) => {
          console.error(`Error downloading file: ${filePath}`, error)
          throw error
        })
    } catch (error) {
      console.error(`Error generating audio for text: "${text}"`, error)
      throw error
    }
  },

  async processVoiceOvers(req, res) {
    const { batch_id } = req.params

    try {
      const texts = await SavedPrompt.findOne({
        where: { batch_id },
        attributes: ['hook', 'main1', 'main2', 'cta'],
      })
      const categories = ['hook', 'main1', 'main2', 'cta']
      for (const category of categories) {
        if (texts[category] && Array.isArray(texts[category])) {
          for (let i = 0; i < texts[category].length; i++) {
            await module.exports.generateAudioAutomate(
              texts[category][i],
              'FYIinzOBnGxWQWrcAiza',
              category,
              i,
              batch_id
            )
          }
        }
      }

      return responseTemplate(
        res,
        200,
        'success',
        'All files downloaded successfully'
      )
    } catch (error) {
      console.error(error)
      return responseTemplate(
        res,
        500,
        'error',
        'An error occurred while processing voice overs'
      )
    }
  },
  async generateAudio(req, res) {
    const { text, model_id, voice_settings, voice_id } = req.body
    try {
      const response = await axios({
        url: `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
        data: {
          text,
          model_id,
          voice_settings,
        },
        responseType: 'stream',
      })

      // Membuat timestamp sebagai bagian dari nama file
      const timestamp = Date.now()
      const dir = path.join(__dirname, '../download/audio')
      const filePath = path.join(dir, `output_${timestamp}.mp3`)

      // Membuat direktori jika belum ada
      fs.mkdirSync(dir, { recursive: true })

      const writer = fs.createWriteStream(filePath)
      response.data.pipe(writer)

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
      })
        .then(() =>
          responseTemplate(res, 200, 'success', 'File downloaded successfully')
        )
        .catch((error) => responseTemplate(res, 500, 'error', error.message))
    } catch (error) {
      console.error(error)
      return responseTemplate(
        res,
        500,
        'error',
        'An error occurred while generating audio'
      )
    }
  },
  async mergedAudioToVideo(req, res) {
    const { batch_id } = req.params
    try {
      // Gunakan ffprobe untuk memeriksa format file audi
      const videoPath = fs
        .readdirSync(path.join(__dirname, '../output'))
        .map((file) => path.join(__dirname, '../output', file))
      // Lakukan penggabungan jika format file audio valid

      videoPath.forEach((video, index) => {
        const outputName = `${batch_id}-konten${index + 1}`
        mergeAudiosAndSub(video, batch_id, outputName)
          .then(() => {
            console.log(`Successfully processed ${outputName}`)
          })
          .catch((error) => {
            console.error(`Error processing ${outputName}:`, error)
          })
      })

      return responseTemplate(res, 200, 'success', 'File merged successfully')
    } catch (error) {
      console.log(error)
      return responseTemplate(
        res,
        500,
        'error',
        'Terjadi kesalahan saat menghasilkan audio'
      )
    }
  },

  async mergedAudioPreview(req, res) {
    const video = path.join(__dirname, '../output/output_0.mp4')
    try {
      await mergeAudiosAndCaption(video)
      return responseTemplate(res, 200, 'success', 'File merged successfully')
    } catch (error) {
      return responseTemplate(res, 500, 'error', error.message)
    }
  },
}
