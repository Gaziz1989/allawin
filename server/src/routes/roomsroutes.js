const RoomsController = require('../controllers/RoomsController')
const isAuthenticated = require('../policies/isAuthenticated')

module.exports = (app) => {
  app.post('/createroom', isAuthenticated, RoomsController.createroom)
  app.get('/getrooms', isAuthenticated, RoomsController.getrooms)
  app.get('/connect', RoomsController.connect)
}
