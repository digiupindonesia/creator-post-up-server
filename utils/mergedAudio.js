const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
const fs = require('fs')
const { formattedPath } = require('./func/formattedPath')
const { drawText } = require('./func/drawText')
const { wrapText } = require('./func/wrappedText')

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}
async function mergeAudiosAndCaption(video) {
  return new Promise((resolve, reject) => {
    const fontPath = path.join(
      __dirname,
      '../eksternal/font/bebas_neue/BebasNeue-Regular.ttf'
    )

    const fontPathFormatted = formattedPath(fontPath)

    console.log(video)

    const hookText =
      'Inin adalah struktur hook satu yang sudah dilakukan perubahan wrappedText'

    const main1Text =
      'Inin adalah struktur main1 satu yang sudah dilakukan perubahan wrappedText'

    const main2Text =
      'Inin adalah struktur main2 satu yang sudah dilakukan perubahan wrappedText'

    const ctaText =
      'Inin adalah struktur cta satu yang sudah dilakukan perubahan wrappedText'

    const hookNormalize = wrapText(hookText, 35)

    const hook = drawText(
      wrapText(hookText, 35),
      'black',
      'white',
      0,
      5,
      fontPathFormatted,
      '0:v',
      'v1',
      1
    )

    const content1 = drawText(
      wrapText(main1Text, 35),
      'black',
      'white',
      5,
      12,
      fontPathFormatted,
      'v1',
      'v2',
      1
    )

    const content2 = drawText(
      wrapText(main2Text, 35),
      'black',
      'white',
      12,
      19,
      fontPathFormatted,
      'v2',
      'v3',
      1
    )

    const cta = drawText(
      wrapText(ctaText, 35),
      'black',
      'white',
      19,
      24,
      fontPathFormatted,
      'v3',
      'out',
      1
    )

    const command = ffmpeg()
      .input(video)
      .complexFilter([hook, content1, content2, cta])
      .outputOptions('-map', '[out]')
      .output(path.join(__dirname, '../download/video/video.mp4'))
      .outputOption('-y')
      .on('end', () => {
        console.log(`Video ${outputPath} telah dibuat.`)
        resolve(`Video ${outputPath} telah dibuat.`)
      })
      .on('error', (err, stdout, stderr) => {
        console.error('Error: ' + err.message)
        console.log('ffmpeg output:\n' + stdout)
        console.log('ffmpeg stderr:\n' + stderr)
        reject(err)
      })

    command.run()
  })
}

async function mergeAudiosAndSub(video, batch_id, outputName) {
  return new Promise((resolve, reject) => {
    const fontPath = path.join(
      __dirname,
      '../eksternal/font/bebas_neue/BebasNeue-Regular.ttf'
    )

    const fontPathFormatted = formattedPath(fontPath)

    const audioPaths = {
      hook: shuffleArray(
        fs
          .readdirSync(
            path.join(__dirname, `../download/audio/${batch_id}/hook`)
          )
          .map((file) => path.join(`../download/audio/${batch_id}/hook`, file))
      ),
      main1: shuffleArray(
        fs
          .readdirSync(
            path.join(__dirname, `../download/audio/${batch_id}/main1`)
          )
          .map((file) => path.join(`../download/audio/${batch_id}/main1`, file))
      ),
      main2: shuffleArray(
        fs
          .readdirSync(
            path.join(__dirname, `../download/audio/${batch_id}/main2`)
          )
          .map((file) => path.join(`../download/audio/${batch_id}/main2`, file))
      ),
      cta: shuffleArray(
        fs
          .readdirSync(
            path.join(__dirname, `../download/audio/${batch_id}/cta`)
          )
          .map((file) => path.join(`../download/audio/${batch_id}/cta`, file))
      ),
    }

    // Mengambil teks dari nama file audio secara acak untuk setiap bagian
    const hookText = path.basename(
      audioPaths.hook[0],
      path.extname(audioPaths.hook[0])
    )
    const main1Text = path.basename(
      audioPaths.main1[0],
      path.extname(audioPaths.main1[0])
    )
    const main2Text = path.basename(
      audioPaths.main2[0],
      path.extname(audioPaths.main2[0])
    )
    const ctaText = path.basename(
      audioPaths.cta[0],
      path.extname(audioPaths.cta[0])
    )

    // Membuat drawText untuk setiap bagian dengan teks dari nama file audio

    function getAudioDuration(audioPath) {
      return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(audioPath, (err, metadata) => {
          if (err) {
            reject(err)
          } else {
            const duration = metadata.format.duration
            const roundedDuration = Math.ceil(duration)

            resolve(roundedDuration)
          }
        })
      })
    }

    const outputDir = path.join(__dirname, '../download/video')
    // Membuat direktori output jika belum ada
    fs.mkdirSync(outputDir, { recursive: true })

    // Mendapatkan durasi audio dari setiap file
    Promise.all([
      getAudioDuration(path.join(__dirname, audioPaths.hook[0])),
      getAudioDuration(path.join(__dirname, audioPaths.main1[0])),
      getAudioDuration(path.join(__dirname, audioPaths.main2[0])),
      getAudioDuration(path.join(__dirname, audioPaths.cta[0])),
    ])
      .then(([hookDuration, main1Duration, main2Duration, ctaDuration]) => {
        const hookDelay = Math.ceil(hookDuration)
        const main1Delay = Math.ceil(main1Duration)
        const main2Delay = Math.ceil(main2Duration)
        const ctaDelay = Math.ceil(ctaDuration)

        const hook = drawText(
          wrapText(hookText, 35),
          'black',
          'white',
          0,
          hookDelay,
          fontPathFormatted,
          '0:v',
          'v1'
        )

        const content1 = drawText(
          wrapText(main1Text, 35),
          'black',
          'white',
          hookDelay,
          hookDelay + main1Delay,
          fontPathFormatted,
          'v1',
          'v2'
        )

        const content2 = drawText(
          wrapText(main2Text, 35),
          'black',
          'white',
          main1Delay + hookDelay,
          hookDelay + main1Delay + main2Delay,
          fontPathFormatted,
          'v2',
          'v3'
        )

        const cta = drawText(
          wrapText(ctaText, 35),
          'black',
          'white',
          main2Delay + hookDelay + main1Delay,
          hookDelay + main1Delay + main2Delay + ctaDelay,
          fontPathFormatted,
          'v3',
          'out'
        )

        console.log(hookDelay + main1Delay * 1000)
        console.log(hookDelay + main1Delay + main2Delay * 1000)

        const command = ffmpeg()
          .input(video)
          .input(path.join(__dirname, audioPaths.hook[0]))
          .input(path.join(__dirname, audioPaths.main1[0]))
          .input(path.join(__dirname, audioPaths.main2[0]))
          .input(path.join(__dirname, audioPaths.cta[0]))
          .complexFilter([
            hook,
            content1,
            content2,
            cta,
            `[1:a]adelay=100|100[hook]`,
            `[2:a]adelay=${hookDelay * 1000}|${hookDelay * 1000}[main1]`,
            `[3:a]adelay=${(hookDelay + main1Delay) * 1000}|${
              (hookDelay + main1Delay) * 1000
            }[main2]`,
            `[4:a]adelay=${(hookDelay + main1Delay + main2Delay) * 1000}|${
              (hookDelay + main1Delay + main2Delay) * 1000
            }[cta]`,
            '[hook][main1][main2][cta]amix=inputs=4[aout]',
          ])
          .outputOptions('-map', '[out]')
          .outputOptions('-map', '[aout]')
          .output(path.join(outputDir, `${outputName}.mp4`))
          .outputOption('-y')
          .on('end', () => {
            console.log('Penggabungan berhasil selesai')
            resolve()
          })
          .on('error', (err, stdout, stderr) => {
            console.error('Error: ' + err.message)
            console.log('Keluaran ffmpeg:\n' + stdout)
            console.log('Keluaran stderr ffmpeg:\n' + stderr)
            reject(err)
          })

        command.run()
      })
      .catch((err) => {
        console.error('Error:', err)
        reject(err)
      })
  })
}

module.exports = { mergeAudiosAndCaption, mergeAudiosAndSub }
