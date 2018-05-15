module.exports = (io) => {
  require('./sms')(io)
  require('./users')(io)
}
