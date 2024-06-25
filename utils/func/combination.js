const { getRandomFile } = require('./getRandomFiles')

const generateRandomCombination = (folders) => {
  return folders.map((folder) => getRandomFile(folder))
}

const isCombinationDuplicate = (combination, existingCombinations) => {
  const combinationString = JSON.stringify(combination)
  return existingCombinations.has(combinationString)
}

const addCombination = (
  combination,
  existingCombinations,
  resultCombinations
) => {
  const combinationString = JSON.stringify(combination)
  existingCombinations.add(combinationString)
  resultCombinations.push(combination)
}

module.exports = {
  generateRandomCombination,
  isCombinationDuplicate,
  addCombination,
}
