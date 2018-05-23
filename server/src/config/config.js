
module.exports = {
  development: {
    dialect: 'postgres',
    host: 'localhost',
    user: 'gaziz',
    database: 'chats',
    password: 'jgj7079048961',
    idleTimeoutMillis: 30000,
    operatorsAliases: false,
    charset: 'utf8',
    logging: false
  },
  production: {
    dialect: 'postgres',
    host: 'localhost',
    user: 'gaziz',
    database: 'chats',
    password: 'jgj7079048961',
    idleTimeoutMillis: 30000,
    operatorsAliases: false,
    charset: 'utf8',
    logging: false
  },
  port: process.env.PORT || 2018,
  authentication: {
    jwtSecret: process.env.JWT_SECRET || 'super secret string like secretString or SECRETSTRING'
  }
}
