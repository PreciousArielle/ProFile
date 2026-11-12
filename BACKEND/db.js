require('dotenv').config()
const { Pool, types } = require('pg')

// COUNT(*) comes back as a number instead of a string
types.setTypeParser(20, v => parseInt(v, 10))

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
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

const toPg = sql => {
  let i = 0
  return sql.replace(/\?/g, () => `$${++i}`)
}

async function run(sql, params = []) {
  let text = toPg(sql)
  const wantsId = /^\s*insert\s+into\s+(users|resumes)\b/i.test(text) && !/returning/i.test(text)
  if (wantsId) text += ' RETURNING id'

  try {
    const result = await pool.query(text, params)
    if (wantsId) result.rows.insertId = result.rows[0]?.id
    return [result.rows, result.fields]
  } catch (err) {
    if (err.code === '23505') err.code = 'ER_DUP_ENTRY'
    throw err
  }
}

module.exports = { execute: run, query: run }