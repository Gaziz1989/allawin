const { Pool } = require('pg')
const config = require('../config/config')
const env = process.env.NODE_ENV || 'development'

var configs = {
  user: config[env].user, // env var: PGUSER
  database: config[env].database, // env var: PGDATABASE
  password: config[env].password, // env var: PGPASSWORD
  host: config[env].host, // Server hosting the postgres database
  port: 5432, // env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
}

const pool = new Pool(configs)

module.exports = {
  query: (text, params) => pool.query(text, params)
}