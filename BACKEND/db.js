require('dotenv').config()
const mysql = require('mysql2')

const pool = mysql.createPool({
  // This looks at Render first, then uses localhost if Render isn't there
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'profile_db',
  

  port: process.env.DB_PORT || 3306, 


  ssl: {
    rejectUnauthorized: false
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Test the connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('✗ MySQL connection failed:', err.message)
    return
  }
  console.log('✓ MySQL connected successfully')
  connection.release()
})

module.exports = pool.promise()