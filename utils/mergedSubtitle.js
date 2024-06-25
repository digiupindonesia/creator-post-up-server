const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
const fs = require('fs')

async function mergeAudios(video, audio, subtitle) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(video)
      .input(audio)
      .input(subtitle)
      .videoCodec('copy')
      .audioCodec('aac')
      .outputOptions('-map 0:v:0')
      .outputOptions('-map 1:a:0')
      .outputOptions('-map 2:s:0') // Memetakan subtitle dari input 2
      .outputOptions('-c:s ass') // Menggunakan format subtitle ASS
      .save(path.join(__dirname, '../download/video.mp4'))
      .on('end', () => {
        console.log('Merge completed successfully')
        resolve()
      })
      .on('error', (err) => {
        console.error('Error merging video with audio:', err)
        reject(err)
      })
  })
}

module.exports = { mergeAudios }
