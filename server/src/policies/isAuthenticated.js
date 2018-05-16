const { User } = require('../models')

module.exports = async function (req, res, next) {
  let token = await req.headers.authorization.split(' ')[1]
  const user = await User.findOne({
    where: {
      token
    }
  })
  if (!user) {
      res.status(403).send({
        error: 'Вы не авторизованы!'
      })
  } else {
    req.user = user
    next()
  } 
  // passport.authenticate('jwt', function (err, user) {
  //   if (err || !user) {
  //     res.status(403).send({
  //       error: 'Вы не авторизованы!'
  //     })
  //   } else {

  //   }
  // })(req, res, next)
}
