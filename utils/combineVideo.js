// Fungsi untuk menghasilkan semua kombinasi
function generateCombinations(arrays) {
  return arrays.reduce(
    (acc, curr) => acc.flatMap((c) => curr.map((n) => [].concat(c, n))),
    [[]]
  )
}

module.exports = { generateCombinations }
