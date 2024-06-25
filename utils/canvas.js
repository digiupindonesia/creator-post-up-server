const fs = require('fs')
const path = require('path')
const { createCanvas, loadImage } = require('canvas')

// Function to add text to image
async function addCopyWriting(imagePath, text, outputPath) {
  try {
    // Load the base image
    const image = await loadImage(imagePath)
    const canvas = createCanvas(image.width, image.height)
    const ctx = canvas.getContext('2d')

    // Draw the image onto the canvas
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    // Set font properties
    ctx.font = '18px Arial'
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Wrap text into lines
    const maxWidth = canvas.width * 0.8 // Adjust this value as needed
    const lines = wrapText(ctx, text, maxWidth)

    // Calculate position to center the text
    const x = canvas.width / 2
    const y = canvas.height - 50 - ((lines.length - 1) * 20) / 2

    // Draw each line of wrapped text
    lines.forEach((line, index) => {
      ctx.fillText(line, x, y + index * 20)
    })

    // Save the resulting image
    const outputFilePath = path.join(__dirname, '..', outputPath) // Assuming output path is relative to current script
    const out = fs.createWriteStream(outputFilePath)
    const stream = canvas.createPNGStream()
    stream.pipe(out)
    out.on('finish', () =>
      console.log(`Image with text added saved to ${outputFilePath}`)
    )
  } catch (error) {
    console.error('Error adding text to image:', error)
  }
}

// Function to wrap text to fit within maxWidth
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ')
  let lines = []
  let currentLine = ''

  words.forEach((word) => {
    const width = ctx.measureText(currentLine + ' ' + word).width
    if (width < maxWidth) {
      currentLine += (currentLine === '' ? '' : ' ') + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  })

  lines.push(currentLine)
  return lines
}

module.exports = {
  addCopyWriting,
}
