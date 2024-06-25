// Function to get random value from an object
const getRandomValue = (obj) => {
  const keys = Object.keys(obj)
  const randomKey = keys[Math.floor(Math.random() * keys.length)]
  return obj[randomKey]
}

// Function to get a random structure based on predefined keys
const getRandomStructure = async (data) => {
  // Log data yang diterima untuk debugging
  console.log(
    'Data yang diterima oleh getRandomStructure:',
    JSON.stringify(data, null, 2)
  )

  // Validasi data
  if (!Array.isArray(data) || data.length < 4) {
    console.error('Struktur data tidak valid:', data)
    throw new Error('Struktur data tidak valid')
  }

  // Ambil nilai acak untuk setiap bagian struktur
  const hook = await getRandomValue(data[0])
  const main1 = await getRandomValue(data[1])
  const main2 = await getRandomValue(data[2])
  const cta = await getRandomValue(data[3])

  // Log hasil random untuk debugging
  // console.log('Hasil random:', { hook, main1, main2, cta })

  return {
    hook,
    main1,
    main2,
    cta,
  }
}

module.exports = { getRandomStructure }
