const fs = require('fs')
const path = require('path')

// Daftar folder yang ingin Anda proses
const folders = ['hook', 'main1', 'main2', 'cta']

// Fungsi untuk mengacak array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// Fungsi untuk membaca direktori, mengambil daftar file, dan mengembalikan array path yang sudah diacak
function shuffleFilesInFolder(folderName) {
  const folderPath = path.join(__dirname, `../../public/prompt/${folderName}`)
  const files = fs.readdirSync(folderPath)
  
  const shuffledFiles = shuffle(files).map((file) =>
    path.join(folderPath, file)
  )
  return shuffledFiles
}

// Proses masing-masing folder dan simpan hasilnya dalam objek
const shuffledPaths = {}
folders.forEach((folder) => {
  shuffledPaths[folder] = shuffleFilesInFolder(folder)
})

module.exports = {
  shuffleFilesInFolder,
}
