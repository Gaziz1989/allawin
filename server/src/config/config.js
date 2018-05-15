
module.exports = {
  development: {
    dialect: 'postgres',
    host: 'localhost',
    user: 'root',
    database: 'allawin',
    password: '4dasjoj!dsaioj1233!%dfjknqrq',
    idleTimeoutMillis: 30000,
    operatorsAliases: false,
    charset: 'utf8',
    logging: false
  },
  production: {
    dialect: 'postgres',
    host: 'localhost',
    user: 'root',
    database: 'allawin',
    password: '4dasjoj!dsaioj1233!%dfjknqrq',
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
