const MessagesController = require('../controllers/MessagesController')
const isAuthenticated = require('../policies/isAuthenticated')

module.exports = (app) => {
  app.post('/getmessages', isAuthenticated, MessagesController.getmessages)
  app.post('/downloadfile', isAuthenticated, MessagesController.downloadfile)
}
