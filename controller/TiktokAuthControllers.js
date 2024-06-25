const axios = require('axios')
const { Token } = require('../models')

const CLIENT_KEY = process.env.CLIENT_KEY
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI

exports.oauth = (req, res) => {
  const csrfState = Math.random().toString(36).substring(2)
  res.cookie('csrfState', csrfState, { maxAge: 60000 })

  let url = 'https://www.tiktok.com/v2/auth/authorize/'
  url += `?client_key=${CLIENT_KEY}`
  url += '&scope=user.info.basic'
  url += '&response_type=code'
  url += `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
  url += `&state=${csrfState}`

  res.redirect(url)
}

exports.callback = async (req, res) => {
  const { code, state } = req.query
  const csrfState = req.cookies.csrfState

  if (state !== csrfState) {
    return res.status(403).send('State mismatch. Potential CSRF attack.')
  }

  const tokenUrl = 'https://open-api.tiktok.com/oauth/access_token/'
  const params = new URLSearchParams()
  params.append('client_key', CLIENT_KEY)
  params.append('client_secret', CLIENT_SECRET)
  params.append('code', code)
  params.append('grant_type', 'authorization_code')
  params.append('redirect_uri', REDIRECT_URI)

  try {
    const response = await axios.post(tokenUrl, params)

    const data = response.data

    if (data.error) {
      return res.status(400).send(`Error: ${data.error_description}`)
    }

    const { access_token, refresh_token, expires_in } = data

    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + expires_in)

    await Token.upsert({
      user_id,
      access_token,
      refresh_token,
      expires_in: expiresAt,
    })

    res.send(`Access Token: ${access_token}`)
  } catch (error) {
    res.status(500).send('Internal Server Error')
  }
}

exports.refreshToken = async (req, res) => {
  try {
    const { user_id } = req.params
    const token = await Token.findOne({
      where: {
        user_id: user_id,
      },
    })

    if (!token) {
      return res.status(404).send('Token not found')
    }

    const now = new Date()
    if (token.expires_in > now) {
      return res.send('Access token is still valid')
    }

    const refreshTokenUrl = 'https://open-api.tiktok.com/oauth/refresh_token/'
    const params = new URLSearchParams()
    params.append('client_key', CLIENT_KEY)
    params.append('client_secret', CLIENT_SECRET)
    params.append('refresh_token', token.refresh_token)
    params.append('grant_type', 'refresh_token')

    const response = await axios.post(refreshTokenUrl, params)

    const data = response.data

    if (data.error) {
      return res.status(400).send(`Error: ${data.error_description}`)
    }

    const { access_token, refresh_token, expires_in } = data

    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + expires_in)

    token.user_id = user_id
    token.access_token = access_token
    token.refresh_token = refresh_token
    token.expires_in = expiresAt
    await token.save()



    res.send(`New Access Token: ${access_token}`)
  } catch (error) {
    res.status(500).send('Internal Server Error')
  }
}
