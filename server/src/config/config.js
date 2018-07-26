
module.exports = {
  development: {
    dialect: 'postgres',
    host: 'localhost',
    user: 'mars',
    database: 'allawin',
    password: '15d0f1db3fd726a7cce0b20316a',
    idleTimeoutMillis: 30000,
    operatorsAliases: false,
    charset: 'utf8',
    logging: false
  },
  production: {
    dialect: 'postgres',
    host: 'localhost',
    user: 'mars',
    database: 'allawin',
    password: '4dasjoj!dsaioj1233!%dfjknqrq',
    idleTimeoutMillis: 30000,
    operatorsAliases: false,
    charset: 'utf8',
    logging: false
  },
  port: process.env.PORT || 8081,
  authentication: {
    jwtSecret: process.env.JWT_SECRET || 'super secret string like secretString or SECRETSTRING'
  }
}
