async function checkVideoInfo(videoPaths) {
  try {
    for (const element of videoPaths) {
      const videoPath = element
      const metadata = await getVideoMetadata(videoPath)
      const resolution = getResolution(metadata)
      const format = getFormat(metadata)
      const fps = getFPS(metadata)
      const duration = getDuration(metadata)
      const fileSize = getFileSize(metadata)
      const { videoCodec, audioCodec } = getCodec(metadata)

      console.log(`Informasi untuk video ${videoPath}:`)
      console.log(`- Resolusi: ${resolution}`)
      console.log(`- Format: ${format}`)
      console.log(`- FPS: ${fps}`)
      console.log(`- Durasi: ${duration}`)
      console.log(`- Ukuran File: ${fileSize} bytes`)
      console.log(`- Codec Video: ${videoCodec}`)
      console.log(`- Codec Audio: ${audioCodec}`)
      console.log('')
    }
    console.log('Proses selesai.')
  } catch (error) {
    console.error('Terjadi kesalahan:', error)
  }
}
function getCodec(metadata) {
  const videoStream = metadata.streams.find(
    (stream) => stream.codec_type === 'video'
  )
  const audioStream = metadata.streams.find(
    (stream) => stream.codec_type === 'audio'
  )

  const videoCodec = videoStream
    ? videoStream.codec_name
    : 'Tidak ada informasi codec video'
  const audioCodec = audioStream
    ? audioStream.codec_name
    : 'Tidak ada informasi codec audio'

  return { videoCodec, audioCodec }
}

function getVideoMetadata(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err)
      } else {
        resolve(metadata)
      }
    })
  })
}

function getFPS(metadata) {
  return metadata.streams[0].r_frame_rate
}
function getResolution(metadata) {
  const videoStream = metadata.streams.find(
    (stream) => stream.codec_type === 'video'
  )
  if (videoStream) {
    return `${videoStream.width}x${videoStream.height}`
  } else {
    return 'Tidak ada informasi resolusi'
  }
}

function getFormat(metadata) {
  return metadata.format.format_name
}

function getDuration(metadata) {
  return metadata.format.duration
}

function getFileSize(metadata) {
  return metadata.format.size
}
