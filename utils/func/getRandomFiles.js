const fs = require('fs')
const path = require('path')

const getRandomFile = (folderPath) => {
  const files = fs.readdirSync(folderPath)
  const randomIndex = Math.floor(Math.random() * files.length)
  return path.join(folderPath, files[randomIndex])
}

module.exports = {
  getRandomFile,
}
