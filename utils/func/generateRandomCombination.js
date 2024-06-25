module.exports = {
  generateRandomCombination: (folders) => {
    return folders.map((folder) => getRandomFile(folder))
  },
}
