const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const { sequelize, User } = require('./models')

const app = express()
const config = require('./config/config')
const path = require('path')

const socket = require('socket.io')
const io = socket()

io.use( async (socket, next) => {
  let token = socket.handshake.query.token
  const user = await User.findOne({
    where: {
      token
    }
  })

  if (!user) {
    console.log('Не получилось авторизовать пользователя!')
    socket.user = {
      email: 'noauth@gmail.com',
      id: 'noauthID'
    }
    next()
    // return next(new Error('authentication error'))
  } else {
    socket.user = user.toJSON()
    next()
  } 
})

app.io = io

require('events').EventEmitter.prototype._maxListeners = 100

app.use(express.static(path.resolve(__dirname, '../static/')))

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(cors())

require('./passport')
require('./cron')
require('./routes')(app)

app.set('view engine', 'pug')
app.set('views', path.resolve(__dirname, '../static/htmls'))

sequelize.sync({
  force: false
})
  .then(() => {
    const s = app.listen(config.port, function () {
      console.log('Application worker ' + process.pid + ' started')
    })
    io.attach(s)
    const socketEvents = require('./socket')(io)
    console.log(`Server started at port ${config.port}`)
  })
