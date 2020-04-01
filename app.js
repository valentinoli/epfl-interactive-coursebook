const express = require('express')
require('dotenv').config()
const path = require('path')

const server = express()
server.use(require('serve-favicon')(path.join(__dirname, 'public/img', 'favicon.ico')))

server.use(express.static(__dirname + '/dist'))
server.use(express.static(__dirname + '/public'))

server.get('/', (req, res) => res.sendfile('index.html'))

const PORT = process.env.PORT || 8080

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
