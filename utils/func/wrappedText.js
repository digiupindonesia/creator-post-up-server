module.exports = {
  wrapText(text, maxWidth) {
    let words = text.split(' ')
    let lines = []
    let currentLine = ''

    words.forEach((word) => {
      if (currentLine.length + word.length <= maxWidth) {
        currentLine += word + ' '
      } else {
        lines.push(currentLine.trim())
        currentLine = word + ' '
      }
    })

    if (currentLine.trim() !== '') {
      lines.push(currentLine.trim())
    }

    return lines.join('\n')
  },
}
