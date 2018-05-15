const Joi = require('joi')

module.exports = {
  register (req, res, next) {
    console.log(req.body)
    const schema = {
      email: Joi.string().email(),
      password: Joi.string().regex(
        new RegExp('^[a-zA-Z0-9]{8,32}$')
      )
    }
    const user = {
      email: JSON.parse(req.body.user).email,
      password: JSON.parse(req.body.user).password
    }
    const { error, value } = Joi.validate(user, schema)
    if (error) {
      switch (error.details[0].context.key) {
        case 'email':
          res.status(400).send({
            error: 'Введите корректный email адрес.'
          })
          break
        case 'password':
          res.status(400).send({
            error: `Введенный пароль должен соответствовать следующим требованиям:
              1. Содержать символы: буквенные(в нижнем или верхнем регистре), цифры
              2. Длина должна быть не менее 8 и не превышать 32 символов              
            `
          })
          break
        default:
          res.status(400).send({
            error: 'Не корректная информация'
          })
      }
    } else {
      next()
    }
  },
  mregister (req, res, next) {
    const schema = {
      phone: Joi.string().regex(
        new RegExp('^[0-9]{11,32}$')
      )
    }
    // const user = {
    //   email: JSON.parse(req.body.user).email,
    //   password: JSON.parse(req.body.user).password
    // }
    const { error, value } = Joi.validate(req.body, schema)
    if (error) {
      res.status(400).send({
        error: `Введите правильный номер телефона:
                1. Длина номера должна быть 11 символов;`
      })
    } else {
      next()
    }
  }
}
