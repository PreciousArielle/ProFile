initResumeEditor({
  templateNum: 2,
  storageKey: 'profile_canvas_state_t2',
  renderFromFormData({ data, buildTextElement, buildHtmlElement, buildImageElement }) {

    const HDR_H   = 180
    const COL_L   = 260
    const COL_R_L = 280
    const COL_R_W = 514
    const BODY_T  = HDR_H + 20

    const fontFamily = data.fontFamily || "'DM Sans', sans-serif"
    const fontSize   = parseFloat(data.fontSize) || 12

    // Accent colors from saved data
    const accentDark  = data.accentDark  || '#4A5568'
    const accentLight = data.accentLight || '#7EB5D6'

    // HEADER
    buildHtmlElement({
      left: 0, top: 0, width: 794,
      html: `<div style="width:794px;height:135px;background:${accentDark};"></div>`
    })
    buildHtmlElement({
      left: 0, top: 0, width: 794,
      html: `<div style="width:900px;height:180px;background:${accentDark};clip-path:polygon(0 0,100% 0,100% 75%,0 100%);"></div>`
    })

    // PHOTO
    if (data.photo) {
      buildImageElement({ src: data.photo, left: 670, top: 20, width: 100, height: 100, borderRadius: '6px' })
    }

    // Name + Job Title
    buildTextElement({
      left: 20, top: 30, width: 580,
      text: data.name || 'Your Name',
      fontSize: '32px', fontFamily: "'DM Serif Display', serif", color: '#ffffff'
    })
    buildTextElement({
      left: 20, top: 90, width: 560,
      text: data.jobtitle || 'Job Title',
      fontSize: `${fontSize}px`, color: 'rgba(255,255,255,0.75)', fontFamily: fontFamily
    })

    // LEFT COLUMN
    function leftSection(title, content) {
      if (!content) return ''
      return `<div style="margin-bottom:14px;">
        <div style="font-size:${fontSize - 3}px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;
          color:${accentDark};border-left:3px solid ${accentDark};padding-left:6px;margin-bottom:7px;">${title}</div>
        ${content}
      </div>`
    }

    let leftHTML = `<div style="font-family:${fontFamily};font-size:${fontSize - 1}px;color:#333;line-height:1.6;box-sizing:border-box;">`

    if (data.summary && data.summary.trim()) {
      leftHTML += leftSection('Personal Profile',
        `<div style="font-size:${fontSize - 1}px;color:#444;line-height:1.6;">${data.summary}</div>`)
    }

    let contactHTML = ''
    if (data.email)    contactHTML += `<div style="margin-bottom:3px;display:flex;gap:5px;align-items:center;"><span style="color:${accentDark};">✉</span> <span style="word-break:break-all;">${data.email}</span></div>`
    if (data.phone)    contactHTML += `<div style="margin-bottom:3px;display:flex;gap:5px;"><span style="color:${accentDark};">📞</span> ${data.phone}</div>`
    if (data.location) contactHTML += `<div style="margin-bottom:3px;display:flex;gap:5px;"><span style="color:${accentDark};">📍</span> ${data.location}</div>`
    if (contactHTML) leftHTML += leftSection('Contact', contactHTML)

    if (data.edu && data.edu.some(e => e.school || e.course)) {
      let eduHTML = ''
      data.edu.forEach(edu => {
        if (!edu.school && !edu.course) return
        eduHTML += `<div style="margin-bottom:8px;">
          ${edu.school ? `<div style="font-weight:600;font-size:${fontSize - 1}px;">${edu.school}</div>` : ''}
          ${edu.course ? `<div style="font-size:${fontSize - 1}px;color:#555;">${edu.course}</div>` : ''}
          ${edu.year   ? `<div style="font-size:${fontSize - 2}px;color:#7A776E;">${edu.year}</div>` : ''}
        </div>`
      })
      leftHTML += leftSection('Education', eduHTML)
    }

    if (data.languages && data.languages.some(l => l.name)) {
      let langHTML = ''
      data.languages.forEach(lang => {
        if (!lang.name) return
        langHTML += `<div style="margin-bottom:3px;"><span style="font-weight:600;">${lang.name}</span>${lang.level ? ` <span style="color:#7A776E;font-size:${fontSize - 2}px;">(${lang.level})</span>` : ''}</div>`
      })
      leftHTML += leftSection('Languages', langHTML)
    }

    if (data.customSections && data.customSections.length) {
      data.customSections.forEach(sec => {
        const items = (sec.entries || []).filter(e => e && e.trim())
        if (!items.length) return
        let customHTML = ''
        items.forEach(item => {
          customHTML += `<div style="font-size:${fontSize - 1}px;color:#444;margin-bottom:3px;line-height:1.5;">• ${item}</div>`
        })
        leftHTML += leftSection(sec.name, customHTML)
      })
    }

    leftHTML += `</div>`
    buildHtmlElement({ left: 14, top: BODY_T, width: COL_L - 20, html: leftHTML })

    // Divider
    buildHtmlElement({
      left: COL_L, top: BODY_T, width: 1,
      html: `<div style="width:1px;height:900px;background:#D4CFC4;"></div>`
    })

    // RIGHT COLUMN
    function rightSection(title, content) {
      if (!content) return ''
      return `<div style="margin-bottom:14px;">
        <div style="font-size:${fontSize - 3}px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;
          color:${accentDark};border-bottom:1px solid #D4CFC4;padding-bottom:4px;margin-bottom:8px;">${title}</div>
        ${content}
      </div>`
    }

    let rightHTML = `<div style="font-family:${fontFamily};font-size:${fontSize - 0.5}px;color:#1A1A18;line-height:1.55;box-sizing:border-box;padding-right:20px;">`

    if (data.skills && data.skills.trim()) {
      const skillList = data.skills.split(',').map(s => s.trim()).filter(Boolean)
      let skillsHTML = '<ul style="list-style:none;padding:0;margin:0;columns:2;gap:10px;">'
      skillList.forEach(s => {
        skillsHTML += `<li style="margin-bottom:4px;display:flex;gap:5px;align-items:flex-start;break-inside:avoid;">
          <span style="color:${accentDark};flex-shrink:0;">•</span> ${s}
        </li>`
      })
      skillsHTML += '</ul>'
      rightHTML += rightSection('Skills', skillsHTML)
    }

    if (data.work && data.work.some(j => j.title || j.company)) {
      let workHTML = ''
      data.work.forEach(job => {
        if (!job.title && !job.company) return
        workHTML += `<div style="margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <div style="font-weight:700;font-size:${fontSize}px;">${job.title || ''}</div>
            ${job.duration ? `<div style="font-size:${fontSize - 2}px;color:#7A776E;white-space:nowrap;">${job.duration}</div>` : ''}
          </div>
          ${job.company ? `<div style="font-size:${fontSize - 1}px;color:${accentDark};font-style:italic;margin-bottom:4px;">${job.company}</div>` : ''}
          ${job.desc ? `<ul style="list-style:disc;padding-left:16px;font-size:${fontSize - 1}px;color:#444;line-height:1.5;">
            ${job.desc.split('\n').filter(Boolean).map(l => `<li>${l}</li>`).join('') || `<li>${job.desc}</li>`}
          </ul>` : ''}
        </div>`
      })
      rightHTML += rightSection('Work Experience', workHTML)
    }

    if (data.certifications && data.certifications.some(c => c.name || c.org)) {
      let certHTML = ''
      data.certifications.forEach(cert => {
        if (!cert.name && !cert.org) return
        certHTML += `<div style="margin-bottom:6px;">
          <div style="font-weight:600;font-size:${fontSize}px;">${cert.name || ''}</div>
          ${cert.org  ? `<div style="font-size:${fontSize - 1}px;color:#555;">${cert.org}</div>`  : ''}
          ${cert.date ? `<div style="font-size:${fontSize - 2}px;color:#7A776E;">${cert.date}</div>` : ''}
        </div>`
      })
      rightHTML += rightSection('Certifications', certHTML)
    }

    if (data.awards && data.awards.some(a => a.name || a.issuer)) {
      let awardHTML = ''
      data.awards.forEach(award => {
        if (!award.name && !award.issuer) return
        awardHTML += `<div style="margin-bottom:6px;">
          <div style="font-weight:600;font-size:${fontSize}px;">${award.name || ''}</div>
          ${award.issuer ? `<div style="font-size:${fontSize - 1}px;color:#555;">${award.issuer}</div>` : ''}
          ${award.year   ? `<div style="font-size:${fontSize - 2}px;color:#7A776E;">${award.year}</div>` : ''}
        </div>`
      })
      rightHTML += rightSection('Awards & Achievements', awardHTML)
    }

    rightHTML += `</div>`
    buildHtmlElement({ left: COL_R_L, top: BODY_T, width: COL_R_W, classes: ['main-body'], html: rightHTML })
  }
})