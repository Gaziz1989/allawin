const MessagesController = require('../controllers/MessagesController')
const isAuthenticated = require('../policies/isAuthenticated')

module.exports = (app) => {
  app.get('/getmessages', isAuthenticated, MessagesController.getmessages)
  app.get('/gettwilliotoken', isAuthenticated, MessagesController.gettwiliotoken)
}
