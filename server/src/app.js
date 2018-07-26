const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
const config = require('./config/config')
const path = require('path')
var whitelist = ['http://localhost:8080/', 'https://chats.mars.studio/']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": true,
  "optionsSuccessStatus": 204
}
const db = require('./db')

const socket = require('socket.io')
const io = socket()

io.use( async (socket, next) => {
  try {
    let access_token = socket.handshake.query.token
    const query = await db.query("SELECT * FROM \"user\" WHERE access_token = $1", [access_token])
    let user = query.rows[0]
    if (!user) {
      console.log('Не получилось авторизовать пользователя!')
      return next(new Error('authentication error'))
    } else {
      user.socketId = socket.id
      socket.user = user
      next()
    } 
  } catch (error) {
    console.log(error)
  }
})

app.io = io

require('events').EventEmitter.prototype._maxListeners = 100

app.use(express.static(path.resolve(__dirname, '../static/')))

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(cors(corsOptions))

// require('./passport')
// require('./cron')
require('./routes')(app)

app.set('view engine', 'pug')
app.set('views', path.resolve(__dirname, '../static/htmls'))

const s = app.listen(config.port, function () {
  console.log('Application worker ' + process.pid + ' started')
})
io.attach(s)
const socketEvents = require('./socket')(io)
console.log(`Server started at port ${config.port}`)
