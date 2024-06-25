const express = require('express')
const cors = require('cors')
const routes = require('./routes')
const bodyParser = require('body-parser')

const app = express()

const host = process.env.HOST || undefined
const port = parseInt(process.env.PORT || 3000)
require('dotenv').config()

app.use(cors())

app.use(express.urlencoded({ extended: true }))
app.use(express.json()) // Untuk meng-handle JSON bodies
app.use(bodyParser.json()) // Middleware untuk meng-handle JSON bodies
app.use(bodyParser.urlencoded({ extended: true })) // Middleware untuk meng-handle URL-encoded bodies

app.use('/', routes)

const listenerCallback = () => {
  console.log(`Server is listening on http://${host || 'localhost'}:${port}`)
}

if (host) {
  app.listen(port, host, listenerCallback)
} else {
  app.listen(port, listenerCallback)
}

module.exports = app
