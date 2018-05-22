const { User } = require('../models')
const jwt = require('jsonwebtoken')
const request = require('request')
const config = require('../config/config')
const appKey = 'b60ce3cf8697fa6d2ef145c429eea815128dc7ca'
const path = 'https://api.mobizon.com/service/'
const mailer = require("../config/mail")
function jwtSignUser (user) {
  const ONE_WEEK = 60 * 60 * 24 * 1000
  return jwt.sign(user, config.authentication.jwtSecret, {
    expiresIn: ONE_WEEK
  })
}

module.exports = {
  async register (req, res) {
    try {
      const user = await User.create(JSON.parse(req.body.user))
      res.send({
        user: user.toJSON()
      })
    } catch (error) {
      console.log(error)
      res.status(400).send({
        error: 'Этот е-мэйл уже используется'
      })
    }
  },
  async login (req, res) {
    try {
      const { email, password } = JSON.parse(req.body.user)

      const user = await User.findOne({
        where: {
          email: email,
          archived: false
        }
      })

      if (!user) {
        return res.status(403).send({
          error: 'Предоставленная информация не корректна или пользователь не существует'
        })
      }

      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        return res.status(403).send({
          error: 'Не правильный пароль'
        })
      }
      user.token = null
      let token = jwtSignUser(user.toJSON())
      await user.update({
        token
      })
      await res.send({
        token
      })
    } catch (error) {
      console.log(error)
      res.status(500).send({
        error: 'Произошла какая то ошибка'
      })
    }
  }
}
