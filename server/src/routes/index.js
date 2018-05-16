module.exports = (app) => {
  require('./authroutes')(app)
  require('./usersroutes')(app)
  require('./roomsroutes')(app)
  require('./messagesroutes')(app)
}
