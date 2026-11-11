/* =============================================
   ProFile Beta — script.js (rewritten)
   ============================================= */

const SERVER = 'http://localhost:3000'
const STORAGE_KEY = 'profile_canvas_state'
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

    // Apply paper size
    const size = d.paperSize || 'a4'
    applyPaperSize(size)

    // Detect which template we're on
    const title = document.title || ''
    let templateId = 1
    if (title.includes('Bold Header') || title.includes('template2')) templateId = 2
    else if (title.includes('Minimal') || title.includes('template3')) templateId = 3
    else if (title.includes('Two Column') || title.includes('template4')) templateId = 4

    // Clear existing elements
    document.querySelectorAll("#resume .text").forEach(el => el.remove())

    // ── LAYOUT CONFIG PER TEMPLATE ──
    const layouts = {
      1: { // Classic Sidebar
        hasSidebar:   true,
        sidebarW:     188,
        nameLeft:     212, nameTop: 36,  nameW: 540,
        jobLeft:      212, jobTop:  100, jobW:  540,
        mainLeft:     212, mainTop: 145, mainW: 540,
        nameColor:    '#1A1A18', nameFont: "'DM Serif Display', serif", nameSz: '32px',
        jobColor:     '#7A776E',
        sectionColor: '#2B3A2E', sectionBorder: '1px solid #8FB89A',
      },
      2: { // Bold Header — full width dark bar, content below
        hasSidebar:   false,
        hasHeader:    true,
        headerH:      160,
        nameLeft:     48,  nameTop: 32,  nameW: 600,
        jobLeft:      48,  jobTop:  100, jobW:  500,
        contactLeft:  48,  contactTop: 178, contactW: 700,
        mainLeft:     48,  mainTop: 220, mainW: 700,
        nameColor:    '#EDE9DF', nameFont: "'DM Serif Display', serif", nameSz: '36px',
        jobColor:     '#8FB89A',
        sectionColor: '#2B3A2E', sectionBorder: '1px solid #8FB89A',
      },
      3: { // Minimal — full width, thin rule at top
        hasSidebar:   false,
        hasHeader:    false,
        nameLeft:     40,  nameTop: 22,  nameW: 540,
        jobLeft:      40,  jobTop:  75,  jobW:  500,
        contactLeft:  40,  contactTop: 120, contactW: 714,
        mainLeft:     40,  mainTop: 158, mainW: 714,
        nameColor:    '#1A1A18', nameFont: "'DM Serif Display', serif", nameSz: '34px',
        jobColor:     '#7A776E',
        sectionColor: '#2B3A2E', sectionBorder: '1px solid #8FB89A',
      },
      4: { // Two Column
        hasSidebar:   true,
        sidebarW:     300,
        nameLeft:     14,  nameTop: 36,  nameW: 270,
        jobLeft:      14,  jobTop:  90,  jobW:  270,
        mainLeft:     320, mainTop: 36,  mainW: 450,
        nameColor:    '#2B3A2E', nameFont: "'DM Serif Display', serif", nameSz: '24px',
        jobColor:     '#8FB89A',
        sectionColor: '#2B3A2E', sectionBorder: '1px solid #8FB89A',
      }
    }

    const L = layouts[templateId] || layouts[1]

    // ── SIDEBAR (templates 1 and 4) ──
    if (L.hasSidebar) {
      let sidebarHTML = `<div style="font-family:'DM Sans',sans-serif; padding: 8px 10px; box-sizing: border-box;">`
      if (d.photo) {
        sidebarHTML += `<div style="text-align:center; margin-bottom:12px;">
          <img src="${d.photo}" style="width:100px;height:100px;object-fit:cover;border-radius:50%;border:2px solid #8FB89A;display:inline-block;">
        </div>`
      }
      if (d.email || d.phone) {
        if (d.email) sidebarHTML += `<div style="color:rgba(237,233,223,0.85);font-size:11px;margin-bottom:5px;">✉ ${d.email}</div>`
        if (d.phone) sidebarHTML += `<div style="color:rgba(237,233,223,0.85);font-size:11px;margin-bottom:5px;">☎ ${d.phone}</div>`
      }
      if (d.skills && d.skills.trim()) {
        sidebarHTML += `<div style="color:#8FB89A;font-size:11px;font-weight:bold;letter-spacing:0.08em;
          border-bottom:1px solid rgba(143,184,154,0.4);padding-bottom:4px;margin:14px 0 8px;">SKILLS</div>`
        d.skills.split(",").map(s => s.trim()).filter(Boolean).forEach(skill => {
          sidebarHTML += `<div style="color:rgba(237,233,223,0.85);font-size:11px;margin-bottom:4px;">• ${skill}</div>`
        })
      }
      sidebarHTML += `</div>`

      const sidebarEl = document.createElement("div")
      sidebarEl.className = "text"
      sidebarEl.style.cssText = `left:0;top:0;width:${L.sidebarW}px;height:auto;`
      const sh = document.createElement("div"); sh.className = "drag-handle"
      const sc = document.createElement("div"); sc.className = "text-content"
      sc.contentEditable = "true"; sc.innerHTML = sidebarHTML
      const sg = document.createElement("div"); sg.className = "resize-grip"
      sidebarEl.appendChild(sh); sidebarEl.appendChild(sc); sidebarEl.appendChild(sg)
      resume.appendChild(sidebarEl)
      sidebarEl.addEventListener("mousedown", e => { if (e.target !== sg) selectElement(sidebarEl) })
      makeInteractive(sidebarEl)
    }

    // ── CONTACT BAR (templates 2 and 3 — no sidebar) ──
    if (!L.hasSidebar && L.contactLeft !== undefined) {
      let contactText = [d.email, d.phone].filter(Boolean).join('  ·  ')
      if (contactText) {
        buildTextElement({
          classes: ['contact-line'],
          text: contactText,
          left: L.contactLeft, top: L.contactTop, width: L.contactW,
          fontSize: '11px', color: '#7A776E', fontFamily: "'DM Sans', sans-serif"
        })
      }
    }

    // ── NAME ──
    buildTextElement({
      classes: ["name"],
      text: d.name || "Your Name",
      left: L.nameLeft, top: L.nameTop, width: L.nameW,
      fontSize: L.nameSz, fontFamily: L.nameFont, color: L.nameColor
    })

    // ── JOB TITLE ──
    buildTextElement({
      classes: ["jobtitle"],
      text: (d.jobtitle || "Job Title") + (d.location ? " · " + d.location : ""),
      left: L.jobLeft, top: L.jobTop, width: L.jobW,
      fontSize: '13px', color: L.jobColor, fontFamily: "'DM Sans', sans-serif"
    })

    // ── MAIN CONTENT BLOCK ──
    let mainHTML = `<div style="font-family:'DM Sans',sans-serif;font-size:12px;color:#1A1A18;line-height:1.55;box-sizing:border-box;">`

    if (d.summary && d.summary.trim()) {
      mainHTML += `<div style="margin-bottom:16px;color:#1A1A18;font-size:12px;">${d.summary}</div>`
    }

    const hasWork = d.work && d.work.filter(j => j.title || j.company).length
    if (hasWork) {
      mainHTML += `<div style="color:${L.sectionColor};font-size:11px;font-weight:bold;letter-spacing:0.08em;
        text-transform:uppercase;border-bottom:${L.sectionBorder};padding-bottom:4px;margin-bottom:10px;">
        Work Experience</div>`
      d.work.forEach(job => {
        if (!job.title && !job.company) return
        mainHTML += `<div style="margin-bottom:10px;">`
        mainHTML += `<div style="font-weight:bold;font-size:12px;color:#1A1A18;">${job.title || ""}${job.company ? " — " + job.company : ""}</div>`
        if (job.duration) mainHTML += `<div style="font-size:11px;color:#7A776E;margin-bottom:2px;">${job.duration}</div>`
        if (job.desc)     mainHTML += `<div style="font-size:12px;color:#1A1A18;margin-top:3px;">${job.desc}</div>`
        mainHTML += `</div>`
      })
      mainHTML += `<div style="margin-bottom:14px;"></div>`
    }

    const hasEdu = d.edu && d.edu.filter(e => e.school || e.course).length
    if (hasEdu) {
      mainHTML += `<div style="color:${L.sectionColor};font-size:11px;font-weight:bold;letter-spacing:0.08em;
        text-transform:uppercase;border-bottom:${L.sectionBorder};padding-bottom:4px;margin-bottom:10px;">
        Education</div>`
      d.edu.forEach(edu => {
        if (!edu.school && !edu.course) return
        mainHTML += `<div style="margin-bottom:10px;">`
        if (edu.school) mainHTML += `<div style="font-weight:bold;font-size:12px;color:#1A1A18;">${edu.school}</div>`
        if (edu.course) mainHTML += `<div style="font-size:12px;color:#1A1A18;">${edu.course}</div>`
        if (edu.year)   mainHTML += `<div style="font-size:11px;color:#7A776E;">${edu.year}</div>`
        mainHTML += `</div>`
      })
    }

    mainHTML += `</div>`

    const mainEl = document.createElement("div")
    mainEl.className = "text"
    mainEl.style.cssText = `left:${L.mainLeft}px;top:${L.mainTop}px;width:${L.mainW}px;height:auto;`
    const mh = document.createElement("div"); mh.className = "drag-handle"
    const mc = document.createElement("div"); mc.className = "text-content"
    mc.contentEditable = "true"; mc.innerHTML = mainHTML
    const mg = document.createElement("div"); mg.className = "resize-grip"
    mainEl.appendChild(mh); mainEl.appendChild(mc); mainEl.appendChild(mg)
    resume.appendChild(mainEl)
    mainEl.addEventListener("mousedown", e => { if (e.target !== mg) selectElement(mainEl) })
    makeInteractive(mainEl)

    selectElement(null)
    saveSession()
    return true
  } catch(e) {
    console.warn("Could not load form data:", e)
    return false
  }
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
  img.style.borderRadius = "50%"
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
      body: JSON.stringify({
        html: resumeHTML,
        width: size.w,
        height: size.h,
        template: 1
      })
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
