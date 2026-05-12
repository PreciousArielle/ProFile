initResumeEditor({
  templateNum: 1,
  storageKey: 'profile_canvas_state',
  renderFromFormData({ data, buildTextElement, buildHtmlElement, buildImageElement }) {

    const SIDEBAR_W = 220
    const MAIN_L    = 240
    const MAIN_W    = 530

    const fontFamily = data.fontFamily || "'DM Sans', sans-serif"
    const fontSize   = parseFloat(data.fontSize) || 12

    // Accent colors from saved data
   const accentDark  = data.accentDark  || localStorage.getItem('profile_accent_dark')  || '#2C2C2C'
   const accentLight = data.accentLight || localStorage.getItem('profile_accent_light') || '#8FB89A'

    // SIDEBAR BACKGROUND
    buildHtmlElement({
      left: 0, top: 0, width: SIDEBAR_W,
      html: `<div style="width:100%;height:1123px;background:${accentDark};position:absolute;top:0;left:0;"></div>`
    })

    // SIDEBAR CONTENT
    let sidebarHTML = `<div style="font-family:${fontFamily};box-sizing:border-box;width:100%;background:${accentDark};padding:0;">`

    // Photo
    if (data.photo) {
      sidebarHTML += `
        <div style="width:100%;height:200px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <img src="${data.photo}" style="width:180px;height:180px;object-fit:cover;display:block;border-radius:2px;">
        </div>`
    } else {
      sidebarHTML += `<div style="width:100%;height:200px;background:rgba(255,255,255,0.08);flex-shrink:0;"></div>`
    }

    sidebarHTML += `<div style="padding:16px 14px;">`

    // Education
    const eduData = data.edu || data.education || []
    if (eduData.some(e => e.school || e.course)) {
      sidebarHTML += `<div style="font-size:${fontSize - 3}px;font-weight:600;color:${accentLight};letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">Education</div>`
      eduData.forEach(edu => {
        if (!edu.school && !edu.course) return
        sidebarHTML += `<div style="margin-bottom:10px;">`
        if (edu.year)   sidebarHTML += `<div style="font-size:${fontSize - 3}px;color:#999;margin-bottom:2px;">${edu.year}</div>`
        if (edu.course) sidebarHTML += `<div style="font-size:${fontSize - 2}px;font-weight:600;color:#fff;text-transform:uppercase;line-height:1.3;">${edu.course}</div>`
        if (edu.school) sidebarHTML += `<div style="font-size:${fontSize - 2}px;color:#ccc;font-style:italic;">${edu.school}</div>`
        sidebarHTML += `</div>`
      })
      sidebarHTML += `<div style="height:1px;background:rgba(255,255,255,0.15);margin-bottom:14px;"></div>`
    }

    // Skills
    if (data.skills && data.skills.trim()) {
      sidebarHTML += `<div style="font-size:${fontSize - 3}px;font-weight:600;color:${accentLight};letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">Skills</div>`
      data.skills.split(',').map(s => s.trim()).filter(Boolean).forEach(skill => {
        sidebarHTML += `<div style="font-size:${fontSize - 2}px;color:#ccc;margin-bottom:4px;display:flex;align-items:center;gap:6px;">
          <span style="color:${accentLight};">•</span> ${skill}
        </div>`
      })
      sidebarHTML += `<div style="height:1px;background:rgba(255,255,255,0.15);margin:14px 0;"></div>`
    }

    // Languages
    if (data.languages && data.languages.some(l => l.name)) {
      sidebarHTML += `<div style="font-size:${fontSize - 3}px;font-weight:600;color:${accentLight};letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">Languages</div>`
      data.languages.forEach(lang => {
        if (!lang.name) return
        sidebarHTML += `<div style="font-size:${fontSize - 2}px;color:#ccc;margin-bottom:4px;">
          <span style="color:#fff;font-weight:500;">${lang.name}</span>${lang.level ? ` <span style="color:#999;font-size:${fontSize - 3}px;">(${lang.level})</span>` : ''}
        </div>`
      })
      sidebarHTML += `<div style="height:1px;background:rgba(255,255,255,0.15);margin:14px 0;"></div>`
    }

    // Contact
    sidebarHTML += `<div style="font-size:${fontSize - 3}px;font-weight:600;color:${accentLight};letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">Contact</div>`
    if (data.email)    sidebarHTML += `<div style="font-size:${fontSize - 2.5}px;color:#ccc;margin-bottom:4px;word-break:break-all;">📧 ${data.email}</div>`
    if (data.phone)    sidebarHTML += `<div style="font-size:${fontSize - 2.5}px;color:#ccc;margin-bottom:4px;">📞 ${data.phone}</div>`
    if (data.location) sidebarHTML += `<div style="font-size:${fontSize - 2.5}px;color:#ccc;margin-bottom:4px;">📍 ${data.location}</div>`

    // Custom sections in sidebar
    if (data.customSections && data.customSections.length) {
      data.customSections.forEach(sec => {
        const items = (sec.entries || []).filter(e => e && e.trim())
        if (!items.length) return
        sidebarHTML += `<div style="height:1px;background:rgba(255,255,255,0.15);margin:14px 0;"></div>`
        sidebarHTML += `<div style="font-size:${fontSize - 3}px;font-weight:600;color:${accentLight};letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">${sec.name}</div>`
        items.forEach(item => {
          sidebarHTML += `<div style="font-size:${fontSize - 2}px;color:#ccc;margin-bottom:4px;line-height:1.5;">• ${item}</div>`
        })
      })
    }

    sidebarHTML += `</div></div>`
    buildHtmlElement({ left: 0, top: 0, width: SIDEBAR_W, html: sidebarHTML })

    // MAIN CONTENT
    buildTextElement({
      left: MAIN_L, top: 30, width: MAIN_W,
      text: (data.name || 'Your Name').toUpperCase(),
      fontSize: '28px', fontFamily: "'DM Serif Display', serif", color: '#1A1A18'
    })
    buildTextElement({
      left: MAIN_L, top: 80, width: MAIN_W,
      text: data.jobtitle || '',
      fontSize: `${fontSize}px`, color: '#7A776E', fontFamily: fontFamily
    })

    buildHtmlElement({
      left: MAIN_L, top: 105, width: MAIN_W,
      html: `<div style="height:1px;background:#D4CFC4;margin:0;"></div>`
    })

    function sectionHead(title) {
      return `<div style="font-size:${fontSize - 1}px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${accentDark};border-bottom:2px solid ${accentDark};padding-bottom:3px;margin-bottom:8px;">${title}</div>`
    }

    let mainHTML = `<div style="font-family:${fontFamily};font-size:${fontSize}px;color:#1A1A18;line-height:1.55;box-sizing:border-box;">`

    if (data.summary && data.summary.trim()) {
      mainHTML += sectionHead('Profile Info')
      mainHTML += `<div style="font-size:${fontSize - 0.5}px;color:#333;line-height:1.6;margin-bottom:14px;">${data.summary}</div>`
    }

    if (data.work && data.work.some(j => j.title || j.company)) {
      mainHTML += sectionHead('Experience')
      data.work.forEach(job => {
        if (!job.title && !job.company) return
        mainHTML += `<div style="display:flex;gap:10px;margin-bottom:12px;align-items:flex-start;">
          <div style="flex-shrink:0;width:10px;height:10px;border-radius:50%;background:${accentDark};border:2px solid ${accentLight};margin-top:4px;"></div>
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;">
              <div style="font-weight:700;font-size:${fontSize}px;color:#1A1A18;">${job.title || ''}</div>
              ${job.duration ? `<div style="font-size:${fontSize - 2}px;color:#7A776E;white-space:nowrap;">${job.duration}</div>` : ''}
            </div>
            ${job.company ? `<div style="font-size:${fontSize - 1}px;color:#555;font-style:italic;margin-bottom:3px;">${job.company}</div>` : ''}
            ${job.desc    ? `<div style="font-size:${fontSize - 1}px;color:#444;line-height:1.5;">${job.desc}</div>` : ''}
          </div>
        </div>`
      })
    }

    if (data.certifications && data.certifications.some(c => c.name || c.org)) {
      mainHTML += sectionHead('Certifications')
      data.certifications.forEach(cert => {
        if (!cert.name && !cert.org) return
        mainHTML += `<div style="margin-bottom:6px;">
          <div style="font-weight:600;font-size:${fontSize - 0.5}px;">${cert.name || ''}</div>
          ${cert.org  ? `<div style="font-size:${fontSize - 1}px;color:#555;">${cert.org}</div>`  : ''}
          ${cert.date ? `<div style="font-size:${fontSize - 2}px;color:#7A776E;">${cert.date}</div>` : ''}
        </div>`
      })
    }

    if (data.awards && data.awards.some(a => a.name || a.issuer)) {
      mainHTML += sectionHead('Achievement')
      mainHTML += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">`
      data.awards.forEach(award => {
        if (!award.name && !award.issuer) return
        mainHTML += `<div style="background:#F7F5F0;padding:8px 10px;border-left:3px solid ${accentLight};">
          ${award.year   ? `<div style="font-size:${fontSize - 3}px;color:#7A776E;">${award.year}</div>`   : ''}
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
    buildHtmlElement({ left: MAIN_L, top: 118, width: MAIN_W, classes: ['main-body'], html: mainHTML })
  }
})