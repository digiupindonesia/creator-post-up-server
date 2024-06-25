const OpenAI = require('openai')
const responseTemplate = require('../helper/response')
const { getRandomStructure } = require('../utils/func/savePromptResponse')
const { SavedPrompt, Batch } = require('../models')

const openai = new OpenAI({
  organization: process.env.GPT_ORGANIZATION_KEY,
  project: process.env.GPT_PROJECT_ID,
})

module.exports = {
  async generatePrompt(req, res) {
    const { countRowCaption, hookPrompt, main1Prompt, main2Prompt, ctaPrompt } =
      req.body
    const { batch_id } = req.params

    const textPrompt = `tolong buatkan script voice over yang artikulasi dan cara berbicaranya mirip dengan artis nagita slavina beri tanda baca yang benar karena nantinya akan digenerate ke voice over, dan berdasarkan struktur template dan batasan minimal dan maksimal karakter dibawah ini. :

hook:
template: ${hookPrompt}. 
batasan: setiap kalimat hook mengandung karakter > 80 && karakter < 100.
batasan: tidak boleh ada kata nama brand di struktur hook, agar penonton makin penasaran

main1:
template: ${main1Prompt}. 
batasan: setiap kalimat main1 mengandung karakter > 90 && karakter < 100

main2:
template: ${main2Prompt}. 
batasan: setiap kalimat main2 mengandung karakter > 90 && karakter < 100.

cta:
template: ${ctaPrompt}. 
batasan:setiap kalimat cta mengandung karakter > 90 && karakter < 85
batasan: tambahkan titik agar kata katanya voice overnya seperti mengakhiri sebuah konten

lalu struktur responsenya seperti ini
[
  {
    "hook": [response1, ... response${countRowCaption}]
    "main1":[response1, ...response${countRowCaption}]
    "main2":[response1, ...response${countRowCaption}]
    "cta":[response1, ...response${countRowCaption}]
    }
]
  `

    let responses = []
    let totalContent = 0

    // Mengulangi permintaan sampai jumlah konten mencapai yang ditentukan
    while (totalContent < countRowCaption) {
      try {
        const response = await openai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content:
                'kamu adalah social media specialist yang kreatif dan mampu membuat konten yang viral, yang di desain outputnya dalam bentuk json array yang isinya objek yg didalammnya lagi berisi array tanpa dikasih nama',
            },
            { role: 'user', content: textPrompt },
          ],
          model: 'gpt-3.5-turbo',
          max_tokens: 4000,
        })

        const responseContent = response.choices[0].message.content

        // Menghilangkan karakter newline atau tab dan validasi JSON
        const cleanedResponseContent = responseContent.replace(
          /(\r\n|\n|\r|\t)/gm,
          ''
        )

        // Menambahkan tanda kurung siku jika tidak ada di dalam respons
        let validJSONContent = cleanedResponseContent.trim()
        if (!validJSONContent.startsWith('[')) {
          validJSONContent = '[' + validJSONContent
        }
        if (!validJSONContent.endsWith(']')) {
          validJSONContent = validJSONContent + ']'
        }

        // Menghilangkan trailing commas sebelum menutup kurung siku
        validJSONContent = validJSONContent.replace(/,(\s*[\]}])/g, '$1')

        try {
          const parsedData = JSON.parse(validJSONContent)
          if (Array.isArray(parsedData)) {
            const remainingContent = countRowCaption - totalContent
            const slicedData = parsedData.slice(0, remainingContent) // Batasi konten yang ditambahkan

            responses = responses.concat(slicedData)
            totalContent += slicedData.length // Penambahan total konten
          } else {
          }
        } catch (jsonParseError) {
          continue // Lanjutkan ke iterasi berikutnya
        }
      } catch (error) {
        console.error(error)
        return responseTemplate(res, 500, 'error', error.message)
      }
    }

    const hooks = []
    const main1s = []
    const main2s = []
    const ctas = []

    responses.forEach((response) => {
      if (response.hook) hooks.push(...response.hook)
      if (response.main1) main1s.push(...response.main1)
      if (response.main2) main2s.push(...response.main2)
      if (response.cta) ctas.push(...response.cta)
    })

    try {
      const prompt = await SavedPrompt.create({
        batch_id: batch_id,
        hook: hooks.slice(0, countRowCaption), // Batasi jumlah yang disimpan
        main1: main1s.slice(0, countRowCaption), // Batasi jumlah yang disimpan
        main2: main2s.slice(0, countRowCaption), // Batasi jumlah yang disimpan
        cta: ctas.slice(0, countRowCaption), // Batasi jumlah yang disimpan
      })
      return responseTemplate(res, 200, 'success', responses)
    } catch (error) {
      console.error(error)
      return responseTemplate(res, 500, 'error', error.message)
    }
  },

  async generatePromptSlide(req, res) {
    const promptData = req.body
    const countRowCaption = parseInt(promptData.countRowCaption)
    const batchName = promptData.batchName

    console.log('batchName', batchName)

    const batchDatas = await Batch.findOne({ where: { name: batchName } })
    console.log(batchDatas)
    if (!batchDatas) {
      return responseTemplate(res, 404, 'Batch id tidak ditemukan', null)
    }

    const mainPrompts = []
    for (const [key, value] of Object.entries(promptData)) {
      if (key.startsWith('main')) {
        mainPrompts.push(`${key}: ${value}`)
      }
    }

    const textPrompt = `Tolong buatkan kata-kata untuk slide TikTok dengan template dan konteks seperti di bawah ini:\n\nhook:\ntemplate: ${
      promptData.hook
    }.\n\n${mainPrompts.join('\n')}\ncta:\ntemplate: ${promptData.cta}. \n`

    let responses = {
      hook: new Set(),
      main1: new Set(),
      main2: new Set(),
      main3: new Set(),
      main4: new Set(),
      main5: new Set(),
      main6: new Set(),
      main7: new Set(),
      main8: new Set(),
      cta: new Set(),
    }

    const systemRole = `
    Kamu adalah AI yang bertugas untuk membuat teks konten TikTok yang menarik dan sesuai dengan template yang diberikan. Pastikan untuk mengikuti instruksi berikut:

    1. **Hook**: Buat kalimat pembuka yang menarik dan memancing rasa penasaran penonton.
    2. **Main Sections**: Buat konten utama yang informatif, menarik, dan sesuai dengan tema yang diberikan. Bagi menjadi beberapa bagian (main1, main2, dst.) agar mudah dipahami.
    3. **CTA (Call To Action)**: Akhiri dengan ajakan yang jelas dan memotivasi penonton untuk bertindak, seperti mengikuti akun, memberikan like, atau meninggalkan komentar.

    Pastikan respons yang kamu berikan terstruktur dalam format JSON berikut:
    [
      {
        "hook": [response1, ... response${countRowCaption}],
        "main1": [response1, ... response${countRowCaption}],
        "main2": [response1, ... response${countRowCaption}],
        "main3": [response1, ... response${countRowCaption}],
        "main4": [response1, ... response${countRowCaption}],
        "main5": [response1, ... response${countRowCaption}],
        "main6": [response1, ... response${countRowCaption}],
        "main7": [response1, ... response${countRowCaption}],
        "main8": [response1, ... response${countRowCaption}],
        "cta": [response1, ... response${countRowCaption}]
      }
    ]

    Gunakan kreativitasmu untuk memastikan setiap bagian teks menarik dan relevan dengan tema yang diberikan.
  `

    while (
      responses.hook.size < countRowCaption ||
      responses.main1.size < countRowCaption ||
      responses.main2.size < countRowCaption ||
      responses.main3.size < countRowCaption ||
      responses.main4.size < countRowCaption ||
      responses.main5.size < countRowCaption ||
      responses.main6.size < countRowCaption ||
      responses.main7.size < countRowCaption ||
      responses.main8.size < countRowCaption ||
      responses.cta.size < countRowCaption
    ) {
      try {
        const response = await openai.chat.completions.create({
          messages: [
            { role: 'system', content: systemRole },
            { role: 'user', content: textPrompt },
          ],
          model: 'gpt-3.5-turbo',
          max_tokens: 4000,
        })

        const responseContent = response.choices[0].message.content
        console.log('API response content:', responseContent)

        const cleanedResponseContent = responseContent.replace(
          /(\r\n|\n|\r|\t)/gm,
          ''
        )
        let validJSONContent = cleanedResponseContent.trim()
        if (!validJSONContent.startsWith('[')) {
          validJSONContent = '[' + validJSONContent
        }
        if (!validJSONContent.endsWith(']')) {
          validJSONContent = validJSONContent + ']'
        }
        validJSONContent = validJSONContent.replace(/,(\s*[\]}])/g, '$1')
        console.log('Valid JSON content:', validJSONContent)

        try {
          const parsedData = JSON.parse(validJSONContent)
          if (Array.isArray(parsedData)) {
            parsedData.forEach((item) => {
              if (item.hook && responses.hook.size < countRowCaption) {
                item.hook.forEach((text) => responses.hook.add(text))
              }
              if (item.main1 && responses.main1.size < countRowCaption) {
                item.main1.forEach((text) => responses.main1.add(text))
              }
              if (item.main2 && responses.main2.size < countRowCaption) {
                item.main2.forEach((text) => responses.main2.add(text))
              }
              if (item.main3 && responses.main3.size < countRowCaption) {
                item.main3.forEach((text) => responses.main3.add(text))
              }
              if (item.main4 && responses.main4.size < countRowCaption) {
                item.main4.forEach((text) => responses.main4.add(text))
              }
              if (item.main5 && responses.main5.size < countRowCaption) {
                item.main5.forEach((text) => responses.main5.add(text))
              }
              if (item.main6 && responses.main6.size < countRowCaption) {
                item.main6.forEach((text) => responses.main6.add(text))
              }
              if (item.main7 && responses.main7.size < countRowCaption) {
                item.main7.forEach((text) => responses.main7.add(text))
              }
              if (item.main8 && responses.main8.size < countRowCaption) {
                item.main8.forEach((text) => responses.main8.add(text))
              }
              if (item.cta && responses.cta.size < countRowCaption) {
                item.cta.forEach((text) => responses.cta.add(text))
              }
            })
          }
        } catch (jsonParseError) {
          console.error('JSON parse error:', jsonParseError)
          continue
        }
      } catch (error) {
        console.error('API error:', error)
        return responseTemplate(res, 500, 'error', error.message)
      }
    }

    // Convert Set to Array and slice to match countRowCaption
    const hooks = Array.from(responses.hook).slice(0, countRowCaption)
    const main1s = Array.from(responses.main1).slice(0, countRowCaption)
    const main2s = Array.from(responses.main2).slice(0, countRowCaption)
    const main3s = Array.from(responses.main3).slice(0, countRowCaption)
    const main4s = Array.from(responses.main4).slice(0, countRowCaption)
    const main5s = Array.from(responses.main5).slice(0, countRowCaption)
    const main6s = Array.from(responses.main6).slice(0, countRowCaption)
    const main7s = Array.from(responses.main7).slice(0, countRowCaption)
    const main8s = Array.from(responses.main8).slice(0, countRowCaption)
    const ctas = Array.from(responses.cta).slice(0, countRowCaption)

    try {
      const prompt = await SavedPrompt.create({
        batch_id: batchDatas.batch_id,
        hook: hooks,
        main1: main1s,
        main2: main2s,
        main3: main3s,
        main4: main4s,
        main5: main5s,
        main6: main6s,
        main7: main7s,
        main8: main8s,
        cta: ctas,
      })
      return responseTemplate(res, 200, 'success', responses)
    } catch (error) {
      console.error('Database error:', error)
      return responseTemplate(res, 500, 'error', error.message)
    }
  },

  async generateDynamicPrompt(req, res) {
    const promptData = req.body
    const countRowCaption = parseInt(promptData.countRowCaption)
    const batchName = promptData.batchName

    const batchDatas = await Batch.findOne({ where: { name: batchName } })
    if (!batchDatas) {
      return responseTemplate(res, 404, 'Batch id tidak ditemukan', null)
    }

    // Construct text prompt
    const textPrompt = `Tolong buatkan kata-kata untuk konten TikTok dengan template dan konteks seperti di bawah ini sebanyak ${countRowCaption}:\n\nhook:\ntemplate: ${promptData.hook}.\n\nmain1:\ntemplate: ${promptData.main1}.\n\nmain2:\ntemplate: ${promptData.main2}.\n\ncta:\ntemplate: ${promptData.cta}. \n`

    // Prepare system role dynamically
    let systemRole = `
    Kamu adalah AI yang bertugas untuk membuat teks konten TikTok yang menarik dan sesuai dengan template yang diberikan. Pastikan untuk mengikuti instruksi berikut:

    1. **Hook**: Buat kalimat pembuka yang menarik dan memancing rasa penasaran penonton.
    2. **Main1**: Buat konten utama yang informatif, menarik, dan sesuai dengan tema yang diberikan.
    3. **Main2**: Buat konten utama yang informatif, menarik, dan sesuai dengan tema yang diberikan.
    4. **CTA (Call To Action)**: Akhiri dengan ajakan yang jelas dan memotivasi penonton untuk bertindak, seperti mengikuti akun, memberikan like, atau meninggalkan komentar.

    Pastikan respons yang kamu berikan terstruktur dalam format JSON berikut:
    [
      {
        "hook": [response1, ... response${countRowCaption}],
        "main1": [response1, ... response${countRowCaption}],
        "main2": [response1, ... response${countRowCaption}],
        "cta": [response1, ... response${countRowCaption}]
      }
    ]

    Gunakan kreativitasmu untuk memastikan setiap bagian teks menarik dan relevan dengan tema yang diberikan.
  `

    // Initialize responses object
    let responses = {
      hook: [],
      main1: [],
      main2: [],
      cta: [],
    }

    // Call OpenAI API and process responses
    while (
      responses.hook.length < countRowCaption ||
      responses.main1.length < countRowCaption ||
      responses.main2.length < countRowCaption ||
      responses.cta.length < countRowCaption
    ) {
      try {
        const response = await openai.chat.completions.create({
          messages: [
            { role: 'system', content: systemRole },
            { role: 'user', content: textPrompt },
          ],
          model: 'gpt-3.5-turbo',
          max_tokens: 4000,
        })

        const responseContent = response.choices[0].message.content
        console.log('API response content:', responseContent)

        // Parse and validate JSON content
        let parsedData
        try {
          parsedData = JSON.parse(responseContent)
        } catch (jsonParseError) {
          console.error('JSON parse error:', jsonParseError)
          continue
        }

        if (!Array.isArray(parsedData)) {
          console.error('Response is not in expected array format')
          continue
        }

        // Process each item in the response array
        parsedData.forEach((item) => {
          // Handle hook responses
          if (item.hook && responses.hook.length < countRowCaption) {
            item.hook.forEach((text) => {
              if (!responses.hook.includes(text)) {
                responses.hook.push(text)
              }
            })
          }

          // Handle main1 responses
          if (item.main1 && responses.main1.length < countRowCaption) {
            item.main1.forEach((text) => {
              if (!responses.main1.includes(text)) {
                responses.main1.push(text)
              }
            })
          }

          // Handle main2 responses
          if (item.main2 && responses.main2.length < countRowCaption) {
            item.main2.forEach((text) => {
              if (!responses.main2.includes(text)) {
                responses.main2.push(text)
              }
            })
          }

          // Handle cta responses
          if (item.cta && responses.cta.length < countRowCaption) {
            item.cta.forEach((text) => {
              if (!responses.cta.includes(text)) {
                responses.cta.push(text)
              }
            })
          }
        })
      } catch (error) {
        console.error('API error:', error)
        return responseTemplate(res, 500, 'error', error.message)
      }
    }

    // Slice responses to match countRowCaption
    const slicedResponses = {
      hook: responses.hook.slice(0, countRowCaption),
      main1: responses.main1.slice(0, countRowCaption),
      main2: responses.main2.slice(0, countRowCaption),
      cta: responses.cta.slice(0, countRowCaption),
    }

    // Save prompts to database
    try {
      const prompt = await SavedPrompt.create({
        batch_id: batchDatas.batch_id,
        hook: slicedResponses.hook,
        main1: slicedResponses.main1,
        main2: slicedResponses.main2,
        cta: slicedResponses.cta,
      })
      return responseTemplate(res, 200, 'success', responses)
    } catch (error) {
      console.error('Database error:', error)
      return responseTemplate(res, 500, 'error', error.message)
    }
  },
}
