const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
const fs = require('fs')

const outputDir = 'output'
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir)
}

async function mergeVideos(arrayInputPath, outputPath) {
  console.log('Memulai penggabungan video...')
  console.time('Total waktu penggabungan')

  return new Promise((resolve, reject) => {
    try {
      const command = ffmpeg()

      // Tambahkan setiap file input yang valid ke command ffmpeg
      arrayInputPath.forEach((inputPath) => {
        command.input(path.join(__dirname, inputPath))
      })

      command
        .videoBitrate(3500)
        .outputFPS(20)
        .mergeToFile(outputPath, { format: 'mp4' }) // Pastikan untuk menyertakan format untuk file output
        .on('error', (err) => {
          console.error(`Error saat menggabungkan video: ${err.message}`)
          console.timeEnd('Total waktu penggabungan')
          reject(`Error saat menggabungkan video: ${err.message}`)
        })
        .on('end', () => {
          console.log(`Video ${outputPath} telah dibuat.`)
          console.timeEnd('Total waktu penggabungan')
          resolve(`Video ${outputPath} telah dibuat.`)
        })
    } catch (error) {
      console.error(`Error saat menggabungkan video: ${error.message}`)
      console.timeEnd('Total waktu penggabungan')
      reject(`Error saat menggabungkan video: ${error.message}`)
    }
  })
}

// console.log(path.join(__dirname, '../public/uploads/hook/hook-1.mp4'))
async function processCombinations(combinations) {
  try {
    for (let i = 0; i < combinations.length; i++) {
      let total = combinations.length
      const outputName = `output_${i}.mp4`
      const outputPath = path.join(__dirname, '../', outputDir, outputName)
      try {
        console.log(`Menggabungkan video ${i + 1}...`)
        await mergeVideos(combinations[i], outputPath)
        console.log(`Video ${outputName} telah dibuat.`)
      } catch (error) {
        console.error(error)
        continue // Continue with next combination if error occurs
      }
      console.log(`${i + 1}/${total} video selesai..`)
    }
    // Hapus semua file input setelah selesai menggabungkan semua kombinasi
    for (const element of combinations) {
      for (const inputPath of element) {
        // Periksa apakah file input ada sebelum mencoba untuk menghapusnya
        if (fs.existsSync(path.join(__dirname, inputPath))) {
          fs.unlinkSync(path.join(__dirname, inputPath))
        }
      }
    }
    console.log('Semua file convert telah dihapus.')
  } catch (error) {
    console.error('Error:', error)
  }
}

module.exports = { mergeVideos, processCombinations }
