const fs = require('fs')
const path = require('path')

const deleteFolderRecursive = function (folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach(function (file, index) {
      const curPath = path.join(folderPath, file)
      if (fs.lstatSync(curPath).isDirectory()) {
        // recursive
        deleteFolderRecursive(curPath)
      } else {
        // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(folderPath)
    console.log(`Folder ${folderPath} has been deleted`)
  } else {
    console.log(`Folder ${folderPath} does not exist`)
  }
}

module.exports = {
  deleteFolderRecursive,
}
