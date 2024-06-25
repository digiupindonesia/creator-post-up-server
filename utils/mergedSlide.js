const path = require('path')
const ffmpeg = require('fluent-ffmpeg')
const { formattedPath } = require('./func/formattedPath')

// Fungsi untuk meng-escape karakter-karakter khusus dalam teks
function escapeText(text) {
  return text
    .replaceAll('\\', '\\\\') // Escape backslash
    .replaceAll("'", "\\\\\\'") // Escape single quote
    .replaceAll(':', '\\\\\\:') // Escape colon
    .replaceAll('%', '\\\\\\%') // Escape percent
    .replaceAll('\n', '\\\\\n') // Escape newline
}

async function addTextToImage(imagePath, text, outputPath) {
  const fontPath = path.join(
    __dirname,
    '../eksternal/font/roboto/Roboto-Bold.ttf'
  )

  const fontPathFormatted = formattedPath(fontPath)

  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(imagePath, (err, metadata) => {
      if (err) {
        console.error(`Error getting metadata: ${err.message}`)
        reject(err)
        return
      }

      const width = metadata.streams[0].width
      const height = metadata.streams[0].height

      // Menyesuaikan ukuran font berdasarkan dimensi gambar
      const fontSize = Math.floor(Math.min(width, height) / 20)

      const escapedText = escapeText(text)

      ffmpeg()
        .input(imagePath)
        .complexFilter([
          {
            filter: 'drawtext',
            options: {
              fontfile: fontPathFormatted,
              text: escapedText,
              x: '(w-text_w)/2',
              y: '(h-text_h)/8',
              fontsize: `${fontSize}`,
              fontcolor: 'white',
              box: 1,
              boxborderw: 7,
              text_align: 'center',
              boxcolor: 'random@1',
              expansion: 'normal',
            },
          },
        ])
        .output(outputPath)
        .on('end', function () {
          console.log('Penggabungan teks ke gambar berhasil selesai.')
          resolve()
        })
        .on('error', function (err, stdout, stderr) {
          console.error('Error saat menggabungkan teks ke gambar:')
          console.error(err)
          console.error(stdout)
          console.error(stderr)
          reject(err)
        })
        .run()
    })
  })
}

module.exports = { addTextToImage }
