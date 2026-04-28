require('dotenv').config()   // ← must be first line

const express    = require('express')
const bodyParser = require('body-parser')
const puppeteer  = require('puppeteer')
const cors       = require('cors')
const fs         = require('fs')
const path       = require('path')
const bcrypt     = require('bcryptjs')
const jwt        = require('jsonwebtoken')
const db         = require('./db')

const app = express()
app.use(cors())
app.use(bodyParser.json({ limit: '10mb' }))

app.use((req, res, next) => {
  console.log(req.method, req.path)
  next()
})

// ── HELPERS ───────────────────────────────────

async function auditLog(userId, action, details = '') {
  try {
    await db.execute(
      'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
      [userId, action, details]
    )
  } catch (e) {
    console.warn('Audit log failed:', e.message)
  }
}

// ── SEED DEFAULT ADMIN ────────────────────────
// Creates admin account on first run if no users exist

async function seedAdmin() {
  try {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM users')
    if (rows[0].count === 0) {
      const hashed = await bcrypt.hash('admin123', 10)
      await db.execute(
        'INSERT INTO users (full_name, username, password, role) VALUES (?, ?, ?, ?)',
        ['Administrator', 'admin', hashed, 'admin']
      )
      console.log('✓ Default admin created — username: admin | password: admin123')
    }
  } catch (e) {
    console.error('Seed admin failed:', e.message)
  }
}

seedAdmin()

// ── AUTH MIDDLEWARE ───────────────────────────

function requireAuth(req, res, next) {
  const header = req.headers['authorization']
  const token  = header && header.replace('Bearer ', '').trim()
  if (!token) return res.status(401).json({ error: 'Not authenticated' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' })
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin')
      return res.status(403).json({ error: 'Admin access only' })
    next()
  })
}

// ── AUTH ROUTES ───────────────────────────────

// REGISTER
app.post('/auth/register', async (req, res) => {
  try {
    const { fullname, username, password } = req.body

    if (!fullname || !username || !password)
      return res.status(400).json({ error: 'All fields required' })
    if (!/^[a-zA-Z0-9]+$/.test(username))
      return res.status(400).json({ error: 'Username must be alphanumeric' })
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' })

    const hashed = await bcrypt.hash(password, 10)
    const [result] = await db.execute(
      'INSERT INTO users (full_name, username, password, role) VALUES (?, ?, ?, ?)',
      [fullname, username, hashed, 'user']
    )

    await auditLog(result.insertId, 'REGISTER', `Username: ${username}`)
    res.json({ ok: true })

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'Username already taken' })
    console.error('Register error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// LOGIN
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password)
      return res.status(400).json({ error: 'All fields required' })

    const [rows] = await db.execute(
      'SELECT * FROM users WHERE username = ?', [username]
    )
    if (!rows.length)
      return res.status(401).json({ error: 'Invalid username or password' })

    const user  = rows[0]
    const match = await bcrypt.compare(password, user.password)
    if (!match)
      return res.status(401).json({ error: 'Invalid username or password' })

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, fullname: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    await auditLog(user.id, 'LOGIN', `Username: ${username}`)
    res.json({
      ok: true, token,
      id: user.id, username: user.username,
      role: user.role, fullname: user.full_name
    })

  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// LOGOUT
app.post('/auth/logout', requireAuth, async (req, res) => {
  await auditLog(req.user.id, 'LOGOUT', `Username: ${req.user.username}`)
  res.json({ ok: true })
})

// GET CURRENT USER
app.get('/auth/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, full_name, username, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'User not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/onboard', requireAuth, async (req, res) => {
  try {
    const { user_type } = req.body;
    await db.execute(
      'UPDATE users SET user_type = ?, onboarded = TRUE WHERE id = ?',
      [user_type, req.user.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// ── RESUME ROUTES ─────────────────────────────

// Save new resume
app.post('/api/resumes', requireAuth, async (req, res) => {
  try {
    const { title, template_num, resume_data } = req.body
    const [result] = await db.execute(
      'INSERT INTO resumes (user_id, title, template_num, resume_data) VALUES (?, ?, ?, ?)',
      [req.user.id, title || 'Untitled Resume', template_num || 1, JSON.stringify(resume_data)]
    )
    await auditLog(req.user.id, 'RESUME_CREATED', `Resume ID: ${result.insertId} | Title: ${title}`)
    res.json({ ok: true, id: result.insertId })
  } catch (err) {
    console.error('Save resume error:', err)
    res.status(500).json({ error: 'Could not save resume' })
  }
})

// Get all resumes for logged-in user
app.get('/api/resumes', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, title, template_num, created_at, updated_at FROM resumes WHERE user_id = ? ORDER BY updated_at DESC',
      [req.user.id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch resumes' })
  }
})

// Get one resume
app.get('/api/resumes/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM resumes WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Resume not found' })
    const resume = rows[0]
    resume.resume_data = JSON.parse(resume.resume_data)
    res.json(resume)
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch resume' })
  }
})

// Update existing resume
app.put('/api/resumes/:id', requireAuth, async (req, res) => {
  try {
    const { title, template_num, resume_data } = req.body
    await db.execute(
      'UPDATE resumes SET title = ?, template_num = ?, resume_data = ? WHERE id = ? AND user_id = ?',
      [title, template_num, JSON.stringify(resume_data), req.params.id, req.user.id]
    )
    await auditLog(req.user.id, 'RESUME_UPDATED', `Resume ID: ${req.params.id}`)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Could not update resume' })
  }
})

// Delete resume
app.delete('/api/resumes/:id', requireAuth, async (req, res) => {
  try {
    await db.execute(
      'DELETE FROM resumes WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    )
    await auditLog(req.user.id, 'RESUME_DELETED', `Resume ID: ${req.params.id}`)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Could not delete resume' })
  }
})

// ── ADMIN ROUTES ──────────────────────────────

// GET SYSTEM STATS
app.get('/admin/stats', requireAdmin, async (req, res) => {
  try {
    const [u] = await db.execute('SELECT COUNT(*) as count FROM users');
    const [r] = await db.execute('SELECT COUNT(*) as count FROM resumes');
    const [l] = await db.execute('SELECT COUNT(*) as count FROM audit_logs');
    
    res.json({
      userCount: u[0].count,
      resumeCount: r[0].count,
      logCount: l[0].count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get all users
app.get('/admin/users', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, full_name, username, role, created_at FROM users ORDER BY created_at DESC'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch users' })
  }
})

// Delete a user
app.delete('/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'User not found' })
    if (rows[0].role === 'admin') return res.status(403).json({ error: 'Cannot delete admin' })

    await db.execute('DELETE FROM users WHERE id = ?', [req.params.id])
    await auditLog(req.user.id, 'DELETE_USER', `Deleted user: ${rows[0].username}`)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Could not delete user' })
  }
})

// Get audit logs — last 100, newest first, with username joined
app.get('/admin/audit', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT audit_logs.*, users.username
       FROM audit_logs
       LEFT JOIN users ON audit_logs.user_id = users.id
       ORDER BY audit_logs.created_at DESC
       LIMIT 100`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch audit logs' })
  }
})

// ── STATIC + ROUTING ──────────────────────────

app.use(express.static(path.join(__dirname, '..', 'FRONTEND')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'FRONTEND', 'login.html'))
})

// ── PDF GENERATION ────────────────────────────

// Load all template CSS files at startup
const cssMap = {}
;[1, 2, 3, 4].forEach(n => {
  const file = path.join(__dirname, '..', 'FRONTEND', n === 1 ? 'style.css' : `style${n}.css`)
  try { cssMap[n] = fs.readFileSync(file, 'utf8') }
  catch (e) { console.warn(`Could not load style${n}.css`); cssMap[n] = '' }
})

app.post('/generate-pdf', requireAuth, async (req, res) => {
  try {
    const resumeHTML  = req.body.html
    const pdfW        = req.body.width    || 794
    const pdfH        = req.body.height   || 1123
    const templateNum = req.body.template || 1
    const templateCSS = cssMap[templateNum] || cssMap[1]

    console.log('PDF request | Template:', templateNum, '| Size:', pdfW + 'x' + pdfH)

    const fullHTML = [
      '<!DOCTYPE html><html><head><meta charset="UTF-8">',
      '<link rel="preconnect" href="https://fonts.googleapis.com">',
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
      '<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">',
      '<style>',
      templateCSS,
      '*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }',
      `html, body { width: ${pdfW}px; height: ${pdfH}px; overflow: hidden; background: white; }`,
      '.drag-handle, .resize-grip { display: none !important; }',
      '.text.selected { outline: none !important; }',
      '#resume { position: absolute; top: 0; left: 0; box-shadow: none; }',
      '</style></head><body>',
      resumeHTML,
      '</body></html>'
    ].join('\n')

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    })
    const page = await browser.newPage()
    await page.setViewport({ width: pdfW, height: pdfH })
    await page.setContent(fullHTML, { waitUntil: 'networkidle0', timeout: 30000 })
    await page.evaluate(() => document.fonts ? document.fonts.ready : Promise.resolve())

    const pdfBuffer = await page.pdf({
      width: pdfW + 'px', height: pdfH + 'px',
      printBackground: true, pageRanges: '1'
    })
    await browser.close()

    await auditLog(req.user.id, 'RESUME_DOWNLOADED', `Template: ${templateNum}`)

    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': 'attachment; filename=resume.pdf'
    })
    res.send(pdfBuffer)

  } catch (err) {
    console.error('PDF error:', err)
    res.status(500).send('PDF generation failed: ' + err.message)
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`✓ Server running on http://localhost:${PORT}`))
