const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
const fs = require('fs')

function mergedTextSlides(imagesPath, text) {
  return new Promise((resolve, reject) => {
    const fontPath = path.join(
      __dirname,
      '../eksternal/font/bebas_neue/BebasNeue-Regular.ttf'
    )

    const fontPathFormatted = formattedPath(fontPath)

    
  })
}
