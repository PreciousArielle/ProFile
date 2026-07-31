require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } ,
  family: 4
})

pool.connect((err, client, release) => {
  if (err) {
    console.error('✗ PostgreSQL connection failed:', err.message)
    return
  }
  console.log('✓ PostgreSQL connected successfully')
  release()
})

module.exports = {
  execute: async (sql, params = []) => {
    let i = 0
    const pgSql = sql.replace(/\?/g, () => `$${++i}`)
    const result = await pool.query(pgSql, params)
    return [result.rows, result.fields]
  },
  query: async (sql, params = []) => {
    const result = await pool.query(sql, params)
    return [result.rows, result.fields]
  }
}