const db = require('../db')

module.exports = async function (req, res, next) {
  let access_token = await req.headers.authorization.split(' ')[1]
  const query = await db.query("SELECT * FROM \"user\" WHERE access_token = $1", [access_token])
  let user = query.rows[0]

  if (!user) {
      res.status(403).send({
        error: 'Вы не авторизованы!'
      })
  } else {
    req.user = user
    next()
  }
}
