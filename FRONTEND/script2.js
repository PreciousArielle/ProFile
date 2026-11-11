/* =============================================
   ProFile Beta — script.js (rewritten)
   ============================================= */

const SERVER = 'http://localhost:3000'
const TEMPLATE_NUM = 2
const STORAGE_KEY = 'profile_canvas_state_t2'
const PAPER_KEY   = 'profile_paper_size'

/* ─── PAPER SIZE ─────────────────────────────── */

const PAPER_SIZES = {
  a4:     { w: 794,  h: 1123, label: 'A4' },
  letter: { w: 816,  h: 1056, label: 'Letter' }
}

function applyPaperSize(size) {
  const s = PAPER_SIZES[size] || PAPER_SIZES.a4
  const resume = document.getElementById('resume')
  if (!resume) return
  resume.style.width  = s.w + 'px'
  resume.style.height = s.h + 'px'
  // also update sidebar-accent width
  const accent = resume.querySelector('.sidebar-accent')
  if (accent) accent.style.width = '188px'
  localStorage.setItem(PAPER_KEY, size)
}

/* ─── SESSION (localStorage) ────────────────── */

let saveTimer = null
function scheduleSave() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(saveSession, 800)
}

function serializeElements() {
  return Array.from(document.querySelectorAll('#resume .text')).map(el => {
    const content = el.querySelector('.text-content')
    const img     = el.querySelector('img')
    if (img) {
      return {
        type:    'image',
        left:    el.style.left,
        top:     el.style.top,
        width:   el.style.width,
        height:  el.style.height,
        src:     img.src,
        classes: Array.from(el.classList).filter(c => c !== 'text' && c !== 'selected')
      }
    }
    return {
      type:         'text',
      left:         el.style.left,
      top:          el.style.top,
      width:        el.style.width,
      height:       el.style.height,
      html:         content ? content.innerHTML         : '',
      fontSize:     content ? content.style.fontSize    : '',
      fontFamily:   content ? content.style.fontFamily  : '',
      color:        content ? content.style.color       : '',
      fontWeight:   content ? content.style.fontWeight  : '',
      borderBottom: content ? content.style.borderBottom: '',
      paddingBottom:content ? content.style.paddingBottom:'',
      letterSpacing:content ? content.style.letterSpacing:'',
      classes:      Array.from(el.classList).filter(c => c !== 'text' && c !== 'selected')
    }
  })
}

function saveSession() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeElements()))
  } catch (e) {
    console.warn('Could not save to localStorage:', e)
  }
}


function loadFormData() {
  const raw = localStorage.getItem("profile_form_data")
  if (!raw) return false
  try {
    const d = JSON.parse(raw)
    localStorage.removeItem("profile_form_data")
    const size = d.paperSize || 'a4'
    applyPaperSize(size)
    document.querySelectorAll("#resume .text").forEach(el => el.remove())

    // Name
    buildTextElement({
      classes: ["name"],
      text: d.name || "Your Name",
      left: 48, top: 32, width: 600,
      fontSize: '36px', fontFamily: "'DM Serif Display', serif", color: '#EDE9DF'
    })
    // Job title
    buildTextElement({
      classes: ["jobtitle"],
      text: (d.jobtitle || "Job Title") + (d.location ? " · " + d.location : ""),
      left: 48, top: 100, width: 500,
      fontSize: '12px', color: '#8FB89A', fontFamily: "'DM Sans', sans-serif"
    })

    // Contact bar (below header)
    let contactParts = []
    if (d.email) contactParts.push("✉ " + d.email)
    if (d.phone) contactParts.push("☎ " + d.phone)
    buildTextElement({
      classes: ["contact-bar"],
      text: contactParts.join("  ·  ") || "email · phone",
      left: 48, top: 178, width: 700,
      fontSize: '11px', color: '#7A776E', fontFamily: "'DM Sans', sans-serif"
    })

    // Photo — top right of dark header bar (square 2x2 style)
    if (d.photo) {
      buildImageElement({
        src: d.photo,
        left: 686, top: 18, width: 110, height: 110
      })
    }

    // Main content block
    let mainHTML = `<div style="font-family:'DM Sans',sans-serif;font-size:12px;color:#1A1A18;line-height:1.6;box-sizing:border-box;">`

    if (d.summary && d.summary.trim()) {
      mainHTML += `<div style="margin-bottom:18px;">${d.summary}</div>`
    }

    if (d.skills && d.skills.trim()) {
      const skillList = d.skills.split(",").map(s => s.trim()).filter(Boolean)
      mainHTML += `<div style="color:#2B3A2E;font-size:11px;font-weight:bold;letter-spacing:0.08em;
        text-transform:uppercase;border-bottom:1px solid #8FB89A;padding-bottom:4px;margin-bottom:10px;">Skills</div>`
      mainHTML += `<div style="margin-bottom:16px;color:#1A1A18;font-size:12px;">${skillList.join("  ·  ")}</div>`
    }

    const hasWork = d.work && d.work.filter(j => j.title || j.company).length
    if (hasWork) {
      mainHTML += `<div style="color:#2B3A2E;font-size:11px;font-weight:bold;letter-spacing:0.08em;
        text-transform:uppercase;border-bottom:1px solid #8FB89A;padding-bottom:4px;margin-bottom:10px;">Work Experience</div>`
      d.work.forEach(job => {
        if (!job.title && !job.company) return
        mainHTML += `<div style="margin-bottom:12px;">`
        mainHTML += `<div style="font-weight:bold;font-size:12px;">${job.title || ""}${job.company ? " — " + job.company : ""}</div>`
        if (job.duration) mainHTML += `<div style="font-size:11px;color:#7A776E;">${job.duration}</div>`
        if (job.desc)     mainHTML += `<div style="margin-top:3px;">${job.desc}</div>`
        mainHTML += `</div>`
      })
      mainHTML += `<div style="margin-bottom:14px;"></div>`
    }

    const hasEdu = d.edu && d.edu.filter(e => e.school || e.course).length
    if (hasEdu) {
      mainHTML += `<div style="color:#2B3A2E;font-size:11px;font-weight:bold;letter-spacing:0.08em;
        text-transform:uppercase;border-bottom:1px solid #8FB89A;padding-bottom:4px;margin-bottom:10px;">Education</div>`
      d.edu.forEach(edu => {
        if (!edu.school && !edu.course) return
        mainHTML += `<div style="margin-bottom:10px;">`
        if (edu.school) mainHTML += `<div style="font-weight:bold;">${edu.school}</div>`
        if (edu.course) mainHTML += `<div>${edu.course}</div>`
        if (edu.year)   mainHTML += `<div style="font-size:11px;color:#7A776E;">${edu.year}</div>`
        mainHTML += `</div>`
      })
    }

    mainHTML += `</div>`

    const mainEl = document.createElement("div")
    mainEl.className = "text main-body"
    mainEl.style.left = "48px"
    mainEl.style.top  = "220px"
    mainEl.style.width = "700px"
    mainEl.style.height = "auto"
    const mh = document.createElement("div"); mh.className = "drag-handle"
    const mc = document.createElement("div"); mc.className = "text-content"
    mc.contentEditable = "true"; mc.innerHTML = mainHTML
    const mg = document.createElement("div"); mg.className = "resize-grip"
    mainEl.appendChild(mh); mainEl.appendChild(mc); mainEl.appendChild(mg)
    resume.appendChild(mainEl)
    mainEl.addEventListener("mousedown", e => { if (e.target !== mg) selectElement(mainEl) })
    makeInteractive(mainEl)

    selectElement(null); saveSession(); return true
  } catch(e) { console.warn("Could not load form data:", e); return false }
}

function loadSession() {
  if (loadFormData()) return   // form data takes priority
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) { saveSession(); return }   // first visit — save defaults
    const elements = JSON.parse(saved)
    document.querySelectorAll('#resume .text').forEach(el => el.remove())
    elements.forEach(data => {
      if (data.type === 'image') buildImageElement(data)
      else buildTextElement(data)
    })
    selectElement(null)
  } catch (e) {
    console.warn('Could not load from localStorage:', e)
  }
}

function resetSession() {
  if (!confirm('Reset canvas? This will clear all your changes.')) return
  localStorage.removeItem(STORAGE_KEY)
  document.querySelectorAll('#resume .text').forEach(el => el.remove())
}

let selected = null

const resume = document.getElementById("resume")

/* ─── SELECTION ─────────────────────────────── */

function selectElement(el) {
  document.querySelectorAll(".text").forEach(t => t.classList.remove("selected"))
  selected = el
  if (el) el.classList.add("selected")
}

// Deselect only when clicking outside both the canvas AND the toolbar
document.addEventListener("mousedown", e => {
  const isText    = e.target.closest(".text")
  const isToolbar = e.target.closest(".toolbar")
  const isHeader  = e.target.closest(".header")
  if (!isText && !isToolbar && !isHeader) selectElement(null)
})

/* ─── DRAG + RESIZE ─────────────────────────── */

function makeInteractive(el) {
  let mode = null       // "drag" | "resize"
  let startX, startY, startLeft, startTop, startW, startH

  const handle = el.querySelector(".drag-handle")
  const grip   = el.querySelector(".resize-grip")

  /* drag via handle */
  handle.addEventListener("mousedown", e => {
    e.preventDefault()
    selectElement(el)
    mode   = "drag"
    startX = e.clientX
    startY = e.clientY
    startLeft = parseInt(el.style.left) || 0
    startTop  = parseInt(el.style.top)  || 0
  })

  /* resize via grip */
  grip.addEventListener("mousedown", e => {
    e.preventDefault()
    e.stopPropagation()
    selectElement(el)
    mode   = "resize"
    startX = e.clientX
    startY = e.clientY
    startW = el.offsetWidth
    startH = el.offsetHeight
  })

  document.addEventListener("mousemove", e => {
    if (!mode) return

    const canvasRect = resume.getBoundingClientRect()
    const dx = e.clientX - startX
    const dy = e.clientY - startY

    if (mode === "drag") {
      const maxX = canvasRect.width  - el.offsetWidth
      const maxY = canvasRect.height - el.offsetHeight
      el.style.left = Math.max(0, Math.min(startLeft + dx, maxX)) + "px"
      el.style.top  = Math.max(0, Math.min(startTop  + dy, maxY)) + "px"
    }

    if (mode === "resize") {
      const minW = 80, minH = 28
      const maxW = canvasRect.width  - parseInt(el.style.left)
      const maxH = canvasRect.height - parseInt(el.style.top)
      el.style.width  = Math.max(minW, Math.min(startW + dx, maxW)) + "px"
      el.style.height = Math.max(minH, Math.min(startH + dy, maxH)) + "px"
    }
  })

  document.addEventListener("mouseup", () => {
    if (mode) scheduleSave()
    mode = null
  })
}

/* ─── BUILD ELEMENT ─────────────────────────── */

function buildTextElement(opts = {}) {
  const el = document.createElement("div")
  el.className = "text"
  if (opts.classes) opts.classes.forEach(c => el.classList.add(c))

  el.style.left  = (typeof opts.left  === 'number' ? opts.left  : parseInt(opts.left)  || 220) + "px"
  el.style.top   = (typeof opts.top   === 'number' ? opts.top   : parseInt(opts.top)   || 80)  + "px"
  if (opts.width)  el.style.width  = (parseInt(opts.width)  || 200) + "px"
  if (opts.height) el.style.height = (parseInt(opts.height) || 0)   + "px"

  const handle = document.createElement("div")
  handle.className = "drag-handle"

  const content = document.createElement("div")
  content.className = "text-content"
  content.contentEditable = "true"

  // Restore from session (innerHTML) or use plain text default
  if (opts.html)       content.innerHTML         = opts.html
  else                 content.innerText          = opts.text ?? "New Text"
  if (opts.fontSize)   content.style.fontSize    = opts.fontSize
  if (opts.fontFamily) content.style.fontFamily  = opts.fontFamily
  if (opts.color)      content.style.color       = opts.color
  if (opts.fontWeight) content.style.fontWeight  = opts.fontWeight

  const grip = document.createElement("div")
  grip.className = "resize-grip"

  el.appendChild(handle)
  el.appendChild(content)
  el.appendChild(grip)
  resume.appendChild(el)

  content.addEventListener("blur", () => {
    if (content.innerText.replace(/\n/g, "").trim() === "") {
      el.remove()
      if (selected === el) selected = null
      scheduleSave()
    }
  })

  // Save on any content edit
  content.addEventListener("input", scheduleSave)

  el.addEventListener("mousedown", e => {
    if (e.target === grip) return
    selectElement(el)
  })

  makeInteractive(el)
  selectElement(el)
  return el
}

/* ─── BUILD IMAGE ELEMENT ────────────────────── */

function buildImageElement(opts = {}) {
  const el = document.createElement("div")
  el.className = "text img-element"
  el.style.left   = (opts.left ?? 10) + "px"
  el.style.top    = (opts.top  ?? 10) + "px"
  el.style.width  = (opts.width  ?? 100) + "px"
  el.style.height = (opts.height ?? 100) + "px"

  const handle = document.createElement("div")
  handle.className = "drag-handle"

  const img = document.createElement("img")
  img.src = opts.src
  img.style.width   = "100%"
  img.style.height  = "100%"
  img.style.objectFit = "cover"
  img.style.borderRadius = "4px"
  img.style.border = "2px solid #8FB89A"
  img.style.display = "block"
  img.draggable = false

  const grip = document.createElement("div")
  grip.className = "resize-grip"

  el.appendChild(handle)
  el.appendChild(img)
  el.appendChild(grip)
  resume.appendChild(el)

  el.addEventListener("mousedown", e => {
    if (e.target === grip) return
    selectElement(el)
  })

  makeInteractive(el)
  return el
}

document.querySelectorAll(".text").forEach(el => {
  const rawText = el.innerText
  el.innerHTML = ""

  const handle = document.createElement("div")
  handle.className = "drag-handle"

  const content = document.createElement("div")
  content.className = "text-content"
  content.contentEditable = "true"
  content.innerText = rawText

  const grip = document.createElement("div")
  grip.className = "resize-grip"

  el.appendChild(handle)
  el.appendChild(content)
  el.appendChild(grip)

  content.addEventListener("blur", () => {
    if (content.innerText.replace(/\n/g, "").trim() === "") {
      el.remove()
      if (selected === el) selected = null
      scheduleSave()
    }
  })

  // Wire save on edits — same as buildTextElement
  content.addEventListener("input", scheduleSave)

  el.addEventListener("mousedown", e => {
    if (e.target === grip) return
    selectElement(el)
  })

  makeInteractive(el)
})

/* ─── CONTEXT MENU ──────────────────────────── */

const menu = document.getElementById("ctx-menu")

// Store click position relative to the resume canvas for accurate placement
let menuCanvasX = 220, menuCanvasY = 80

resume.addEventListener("contextmenu", e => {
  e.preventDefault()
  const canvasRect = resume.getBoundingClientRect()
  menuCanvasX = e.clientX - canvasRect.left
  menuCanvasY = e.clientY - canvasRect.top
  // Position the menu at cursor using page coords
  menu.style.display = "block"
  menu.style.left = (e.clientX + window.scrollX) + "px"
  menu.style.top  = (e.clientY + window.scrollY) + "px"
})

/* single unified document click handler */
document.addEventListener("click", e => {
  if (e.target.id === "addTextOption") {
    buildTextElement({ left: menuCanvasX, top: menuCanvasY })
  }
  menu.style.display = "none"
})

/* ─── FORMATTING ────────────────────────────── */

// Toolbar mousedown must not steal focus from the contenteditable.
// We call preventDefault on the toolbar's mousedown so the active
// selection / caret inside .text-content is preserved.
document.querySelector(".toolbar").addEventListener("mousedown", e => {
  // Allow the color input and size input to receive focus normally
  if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return
  e.preventDefault()
})

function getContent() {
  return selected ? selected.querySelector(".text-content") : null
}

function formatText(command) {
  const content = getContent()
  if (!content) return
  content.focus()
  document.execCommand(command, false, null)
}

function changeFont(font) {
  const content = getContent()
  if (!content || !font) return
  content.style.fontFamily = font
  scheduleSave()
}

function changeColor(color) {
  const content = getContent()
  if (!content) return
  content.style.color = color
  scheduleSave()
}

function applyFontSize() {
  const content = getContent()
  if (!content) return
  const size = document.getElementById("fontSizeInput").value
  if (size) { content.style.fontSize = size + "px"; scheduleSave() }
}

/* ─── PDF EXPORT ────────────────────────────── */

async function generatePDF() {
  selectElement(null)

  const sizeKey = localStorage.getItem(PAPER_KEY) || 'a4'
  const size    = PAPER_SIZES[sizeKey]
  const token   = localStorage.getItem('profile_token')

  try {
    const resumeHTML = document.getElementById('resume').outerHTML

    const res = await fetch(`${SERVER}/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ html: resumeHTML, width: size.w, height: size.h, template: TEMPLATE_NUM })
    })

    if (!res.ok) {
      const msg = await res.text()
      throw new Error(msg || `Server error: ${res.status}`)
    }

    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'resume.pdf'
    a.click()
    URL.revokeObjectURL(url)

  } catch (e) {
    console.error('PDF generation failed:', e)
    alert('Could not generate PDF: ' + e.message)
  }
}

/* ─── INIT ───────────────────────────────────── */

// Apply saved paper size first
applyPaperSize(localStorage.getItem(PAPER_KEY) || 'a4')

// Try to restore session
loadSession()
