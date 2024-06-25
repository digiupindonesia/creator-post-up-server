const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
// Ganti `nama_file_audio.mp3` dengan nama file audio yang ingin Anda periksa
const audioFile = path.join(
  __dirname,
  '/download/audio/output_1715139297264.mp3'
)

ffmpeg.ffprobe(audioFile, function (err, metadata) {
  if (err) {
    console.error('Error:', err)
  } else {
    console.log('Metadata:', metadata)
    // Anda dapat menemukan informasi tentang format di dalam metadata
    console.log('Format:', metadata.format.format_name)
  }
})
