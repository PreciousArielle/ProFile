initResumeEditor({
  templateNum: 4,
  storageKey: 'profile_canvas_state_t4',
  renderFromFormData({ data, buildTextElement, buildHtmlElement, buildImageElement }) {

    const SIDEBAR_W = 260
    const MAIN_L    = 260
    const MAIN_W    = 495
    const PAGE_H    = 1123

    const fontFamily = data.fontFamily || "'DM Sans', sans-serif"
    const fontSize   = parseFloat(data.fontSize) || 12

    // Accent colors from saved data
    const accentDark  = data.accentDark  || '#EDEAE3'
    const accentLight = data.accentLight || '#8FB89A'

    // Determine if sidebar is dark (needs light text) or light (keep dark text)
    const isDark = accentDark !== '#EDEAE3' && accentDark !== '#F0EDE5'
    const sidebarText    = isDark ? '#ccc'     : '#7A776E'
    const sidebarLabel   = isDark ? '#fff'     : '#2B3A2E'
    const sidebarBorder  = isDark ? 'rgba(255,255,255,0.2)' : '#D4CFC4'
    const sidebarSubtext = isDark ? '#aaa'     : '#7A776E'

    // SIDEBAR BACKGROUND
    buildHtmlElement({
      left: 0, top: 0, width: SIDEBAR_W,
      html: `<div style="width:${SIDEBAR_W}px;height:${PAGE_H}px;background:${accentDark};"></div>`
    })

    // MAIN BACKGROUND
    buildHtmlElement({
      left: MAIN_L, top: 0, width: MAIN_W,
      html: `<div style="width:${MAIN_W}px;height:${PAGE_H}px;background:#FFFFFF;"></div>`
    })

    // SIDEBAR CONTENT
    let sidebarHTML = `<div style="font-family:${fontFamily};box-sizing:border-box;width:${SIDEBAR_W}px;">`

    // Photo
    if (data.photo) {
      sidebarHTML += `
        <div style="width:100%;padding:20px 0 16px;display:flex;align-items:center;justify-content:center;">
          <img src="${data.photo}" style="width:160px;height:160px;object-fit:cover;display:block;border-radius:4px;">
        </div>`
    } else {
      sidebarHTML += `<div style="width:100%;height:180px;background:${isDark ? 'rgba(255,255,255,0.08)' : '#D4CFC4'};"></div>`
    }

    sidebarHTML += `<div style="padding:10px 18px 20px;">`

    function sidebarSection(title, content) {
      return `<div style="font-size:${fontSize - 3}px;font-weight:700;color:${sidebarLabel};letter-spacing:0.12em;text-transform:uppercase;border-bottom:1px solid ${sidebarBorder};padding-bottom:3px;margin-bottom:8px;margin-top:10px;">${title}</div>${content}`
    }

    // Education
    const eduData = data.edu || []
    if (eduData.some(e => e.school || e.course)) {
      let eduHTML = ''
      eduData.forEach(edu => {
        if (!edu.school && !edu.course) return
        eduHTML += `<div style="margin-bottom:10px;">`
        if (edu.year)   eduHTML += `<div style="font-size:${fontSize - 3}px;color:${sidebarSubtext};margin-bottom:2px;">${edu.year}</div>`
        if (edu.course) eduHTML += `<div style="font-size:${fontSize - 2}px;font-weight:600;color:${sidebarLabel};line-height:1.3;">${edu.course}</div>`
        if (edu.school) eduHTML += `<div style="font-size:${fontSize - 2}px;color:${sidebarText};font-style:italic;">${edu.school}</div>`
        eduHTML += `</div>`
      })
      sidebarHTML += sidebarSection('Education', eduHTML)
    }

    // Skills
    if (data.skills && data.skills.trim()) {
      let skillsHTML = ''
      data.skills.split(',').map(s => s.trim()).filter(Boolean).forEach(skill => {
        skillsHTML += `<div style="font-size:${fontSize - 2}px;color:${sidebarText};margin-bottom:4px;display:flex;align-items:center;gap:6px;">
          <span style="color:${accentLight};font-size:${fontSize}px;">•</span>${skill}
        </div>`
      })
      sidebarHTML += sidebarSection('Skills', skillsHTML)
    }

    // Languages
    if (data.languages && data.languages.some(l => l.name)) {
      let langHTML = ''
      data.languages.forEach(lang => {
        if (!lang.name) return
        langHTML += `<div style="font-size:${fontSize - 2}px;color:${sidebarText};margin-bottom:4px;">
          <span style="color:${sidebarLabel};font-weight:600;">${lang.name}</span>${lang.level ? ` <span style="color:${sidebarSubtext};font-size:${fontSize - 3}px;">(${lang.level})</span>` : ''}
        </div>`
      })
      sidebarHTML += sidebarSection('Languages', langHTML)
    }

    // Certifications
    if (data.certifications && data.certifications.some(c => c.name || c.org)) {
      let certHTML = ''
      data.certifications.forEach(cert => {
        if (!cert.name && !cert.org) return
        certHTML += `<div style="margin-bottom:6px;">
          <div style="font-size:${fontSize - 2}px;font-weight:600;color:${sidebarLabel};">${cert.name || ''}</div>
          ${cert.org  ? `<div style="font-size:${fontSize - 3}px;color:${sidebarText};">${cert.org}</div>`  : ''}
          ${cert.date ? `<div style="font-size:${fontSize - 3}px;color:${sidebarSubtext};">${cert.date}</div>` : ''}
        </div>`
      })
      sidebarHTML += sidebarSection('Certifications', certHTML)
    }

    // Contact
    let contactHTML = ''
    if (data.email)    contactHTML += `<div style="font-size:${fontSize - 2.5}px;color:${sidebarText};margin-bottom:4px;word-break:break-all;">📧 ${data.email}</div>`
    if (data.phone)    contactHTML += `<div style="font-size:${fontSize - 2.5}px;color:${sidebarText};margin-bottom:4px;">📞 ${data.phone}</div>`
    if (data.location) contactHTML += `<div style="font-size:${fontSize - 2.5}px;color:${sidebarText};margin-bottom:4px;">📍 ${data.location}</div>`
    if (contactHTML) sidebarHTML += sidebarSection('Contact', contactHTML)

    // Custom sections in sidebar
    if (data.customSections && data.customSections.length) {
      data.customSections.forEach(sec => {
        const items = (sec.entries || []).filter(e => e && e.trim())
        if (!items.length) return
        let customHTML = ''
        items.forEach(item => {
          customHTML += `<div style="font-size:${fontSize - 2}px;color:${sidebarText};margin-bottom:3px;line-height:1.5;">• ${item}</div>`
        })
        sidebarHTML += sidebarSection(sec.name, customHTML)
      })
    }

    sidebarHTML += `</div></div>`
    buildHtmlElement({ left: 0, top: 0, width: SIDEBAR_W, html: sidebarHTML })

    // MAIN CONTENT
    buildTextElement({
      left: MAIN_L + 20, top: 30, width: MAIN_W - 40,
      text: (data.name || 'Your Name').toUpperCase(),
      fontSize: '26px', fontFamily: "'DM Serif Display', serif", color: '#1A1A18'
    })
    buildTextElement({
      left: MAIN_L + 20, top: 76, width: MAIN_W - 40,
      text: data.jobtitle || 'Job Title',
      fontSize: `${fontSize}px`, color: accentLight, fontFamily: fontFamily
    })
    buildHtmlElement({
      left: MAIN_L + 20, top: 98, width: MAIN_W - 40,
      html: `<div style="height:1px;background:#D4CFC4;"></div>`
    })

    function sectionHead(title) {
      return `<div style="font-size:${fontSize - 2}px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
        color:#2B3A2E;border-bottom:1.5px solid ${accentLight};padding-bottom:3px;margin-bottom:8px;margin-top:14px;">${title}</div>`
    }

    let mainHTML = `<div style="font-family:${fontFamily};font-size:${fontSize}px;color:#1A1A18;line-height:1.55;box-sizing:border-box;padding:0 20px;">`

    if (data.summary && data.summary.trim()) {
      mainHTML += sectionHead('Profile')
      mainHTML += `<div style="font-size:${fontSize - 0.5}px;color:#555;line-height:1.6;margin-bottom:10px;">${data.summary}</div>`
    }

    if (data.work && data.work.some(j => j.title || j.company)) {
      mainHTML += sectionHead('Work Experience')
      data.work.forEach(job => {
        if (!job.title && !job.company) return
        mainHTML += `<div style="display:flex;gap:8px;margin-bottom:10px;align-items:flex-start;">
          <div style="flex-shrink:0;width:8px;height:8px;border-radius:50%;background:#2B3A2E;border:2px solid ${accentLight};margin-top:4px;"></div>
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;">
              <div style="font-weight:700;font-size:${fontSize}px;">${job.title || ''}</div>
              ${job.duration ? `<div style="font-size:${fontSize - 2}px;color:#7A776E;white-space:nowrap;">${job.duration}</div>` : ''}
            </div>
            ${job.company ? `<div style="font-size:${fontSize - 1}px;color:#555;font-style:italic;margin-bottom:2px;">${job.company}</div>` : ''}
            ${job.desc    ? `<div style="font-size:${fontSize - 1}px;color:#444;line-height:1.5;">${job.desc}</div>` : ''}
          </div>
        </div>`
      })
    }

    if (data.awards && data.awards.some(a => a.name || a.issuer)) {
      mainHTML += sectionHead('Awards & Achievements')
      mainHTML += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">`
      data.awards.forEach(award => {
        if (!award.name && !award.issuer) return
        mainHTML += `<div style="background:#F7F5F0;padding:8px 10px;border-left:3px solid ${accentLight};">
          ${award.year   ? `<div style="font-size:${fontSize - 3}px;color:#7A776E;">${award.year}</div>` : ''}
          <div style="font-weight:600;font-size:${fontSize - 1}px;">${award.name || ''}</div>
          ${award.issuer ? `<div style="font-size:${fontSize - 2}px;color:#555;">${award.issuer}</div>` : ''}
        </div>`
      })
      mainHTML += `</div>`
    }

    if (data.customSections && data.customSections.length) {
      data.customSections.forEach(sec => {
        const items = (sec.entries || []).filter(e => e && e.trim())
        if (!items.length) return
        mainHTML += sectionHead(sec.name)
        mainHTML += `<div style="margin-bottom:12px;">`
        items.forEach(item => {
          mainHTML += `<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:4px;">
            <span style="color:${accentLight};flex-shrink:0;">•</span>
            <div style="font-size:${fontSize - 1}px;color:#444;line-height:1.5;">${item}</div>
          </div>`
        })
        mainHTML += `</div>`
      })
    }

    mainHTML += `</div>`
    buildHtmlElement({ left: MAIN_L, top: 112, width: MAIN_W, classes: ['main-body'], html: mainHTML })
  }
})