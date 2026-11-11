require('dotenv').config()

const express    = require('express')
const bodyParser = require('body-parser')
const puppeteer  = require('puppeteer-core')
const cors       = require('cors')
const fs         = require('fs')
const path       = require('path')
const bcrypt     = require('bcryptjs')
const jwt        = require('jsonwebtoken')
const db         = require('./db')
const { GoogleGenerativeAI } = require("@google/generative-ai")

const app = express()

// ── MIDDLEWARE ──
app.use(cors())
app.use(bodyParser.json({ limit: '10mb' }))

// Points to: C:\Users\peach\OneDrive\Desktop\ProFile\FRONTEND
app.use(express.static(path.join(__dirname, 'FRONTEND')))

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

// ── ROOT ROUTE ──
app.get('/', (req, res) => {
  // Directly targets: C:\Users\peach\OneDrive\Desktop\ProFile\FRONTEND\login.html
  res.sendFile(path.join(__dirname, 'FRONTEND', 'login.html'))
})

// ── AI SUMMARY ROUTE ──
app.post('/api/generate-summary', async (req, res) => {
  try {
    const { jobTitle, tone } = req.body
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const prompt = `Write a professional resume summary for a ${jobTitle}. Tone: ${tone}. Max 3 sentences.`
    const result = await model.generateContent(prompt)
    const response = await result.response
    res.json({ summary: response.text() })
  } catch (err) {
    console.error('AI Error:', err)
    res.status(500).json({ error: 'AI failed' })
  }
})

// ── AUTH ROUTES ──
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username])
    if (users.length === 0) return res.status(400).json({ error: 'User not found' })
    const valid = await bcrypt.compare(password, users[0].password)
    if (!valid) return res.status(400).json({ error: 'Invalid password' })
    const token = jwt.sign({ id: users[0].id, role: users[0].role }, process.env.JWT_SECRET || 'secret123')
    res.json({ token, user: users[0] })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── DOWNLOAD PDF ──
app.post('/api/download-pdf', async (req, res) => {
  let browser, page
  try {
    const { resumeHTML } = req.body
    browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_TOKEN}`
    })
    page = await browser.newPage()
    await page.setContent(resumeHTML, { waitUntil: 'load' })
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
    res.set({ 'Content-Type': 'application/pdf' }).send(pdfBuffer)
  } catch (err) { res.status(500).send(err.message) }
  finally { 
    if (page) await page.close().catch(() => {})
    if (browser) await browser.disconnect().catch(() => {})
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`\n\x1b[32m✔ Server is running at http://localhost:${PORT}\x1b[0m`)
})