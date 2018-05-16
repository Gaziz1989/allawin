const UsersController = require('../controllers/UsersController')
const isAuthenticated = require('../policies/isAuthenticated')

module.exports = (app) => {
  app.get('/getusers', isAuthenticated, UsersController.getusers)
}
