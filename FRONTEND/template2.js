initResumeEditor({
  templateNum: 2,
  storageKey: 'profile_canvas_state_t2',
  renderFromFormData({ data, buildTextElement, buildHtmlElement, buildImageElement }) {

    const HDR_H  = 180   // full header height
    const COL_L  = 260   // left column width
    const COL_R_L = 280  // right column left start
    const COL_R_W = 514 // right column width
    const BODY_T = HDR_H + 20

    // ── HEADER BAR ──
    // Solid rect seals the top-right triangle the clip-path would leave white
    buildHtmlElement({
      left: 0, top: 0, width: 794,
      html: `<div style="width:794px;height:135px;background:#4A5568;"></div>`
    })
    // Diagonal clipped band
    buildHtmlElement({
      left: 0, top: 0, width: 794,
      html: `<div style="width:794px;height:180px;background:#4A5568;clip-path:polygon(0 0,100% 0,100% 75%,0 100%);"></div>`
    })

    // ── PHOTO ──────────────────────────────────────────
    if (data.photo) {
      buildImageElement({
        src: data.photo,
        left: 670, top: 20,
        width: 100, height: 100,
        borderRadius: '6px'
      })
    }

    // Name + title over header
    buildTextElement({
      left: 20, top: 30, width: 580,
      text: data.name || 'Your Name',
      fontSize: '32px', fontFamily: "'DM Serif Display', serif", color: '#ffffff'
    })
    buildTextElement({
      left: 20, top: 90, width: 560,
      text: data.jobtitle || 'Job Title',
      fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontFamily: "'DM Sans', sans-serif"
    })

    // ── LEFT COLUMN ───────────────────────────────
    function leftSection(title, content) {
      if (!content) return ''
      return `<div style="margin-bottom:14px;">
        <div style="font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;
          color:#4A5568;border-left:3px solid #4A5568;padding-left:6px;margin-bottom:7px;">${title}</div>
        ${content}
      </div>`
    }

    let leftHTML = `<div style="font-family:'DM Sans',sans-serif;font-size:11px;color:#333;line-height:1.6;box-sizing:border-box;">`

    // Personal profile
    if (data.summary && data.summary.trim()) {
      leftHTML += leftSection('Personal Profile',
        `<div style="font-size:11px;color:#444;line-height:1.6;">${data.summary}</div>`)
    }

    // Contact
    let contactHTML = ''
    if (data.email)    contactHTML += `<div style="margin-bottom:3px;display:flex;gap:5px;align-items:center;"><span style="color:#4A5568;">✉</span> <span style="word-break:break-all;">${data.email}</span></div>`
    if (data.phone)    contactHTML += `<div style="margin-bottom:3px;display:flex;gap:5px;"><span style="color:#4A5568;">📞</span> ${data.phone}</div>`
    if (data.location) contactHTML += `<div style="margin-bottom:3px;display:flex;gap:5px;"><span style="color:#4A5568;">📍</span> ${data.location}</div>`
    if (contactHTML) leftHTML += leftSection('Contact', contactHTML)

    // Education
    if (data.edu && data.edu.some(e => e.school || e.course)) {
      let eduHTML = ''
      data.edu.forEach(edu => {
        if (!edu.school && !edu.course) return
        eduHTML += `<div style="margin-bottom:8px;">
          ${edu.school ? `<div style="font-weight:600;font-size:11px;">${edu.school}</div>` : ''}
          ${edu.course ? `<div style="font-size:11px;color:#555;">${edu.course}</div>` : ''}
          ${edu.year ? `<div style="font-size:10px;color:#7A776E;">${edu.year}</div>` : ''}
        </div>`
      })
      leftHTML += leftSection('Education', eduHTML)
    }

    // Languages
    if (data.languages && data.languages.some(l => l.name)) {
      let langHTML = ''
      data.languages.forEach(lang => {
        if (!lang.name) return
        langHTML += `<div style="margin-bottom:3px;"><span style="font-weight:600;">${lang.name}</span>${lang.level ? ` <span style="color:#7A776E;font-size:10px;">(${lang.level})</span>` : ''}</div>`
      })
      leftHTML += leftSection('Languages', langHTML)
    }

    leftHTML += `</div>`
    buildHtmlElement({ left: 14, top: BODY_T, width: COL_L - 20, html: leftHTML })

    // Vertical divider
    buildHtmlElement({
      left: COL_L, top: BODY_T, width: 1,
      html: `<div style="width:1px;height:900px;background:#D4CFC4;"></div>`
    })

    // ── RIGHT COLUMN ──────────────────────────────
    function rightSection(title, content) {
      if (!content) return ''
      return `<div style="margin-bottom:14px;">
        <div style="font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;
          color:#4A5568;border-bottom:1px solid #D4CFC4;padding-bottom:4px;margin-bottom:8px;">${title}</div>
        ${content}
      </div>`
    }

    let rightHTML = `<div style="font-family:'DM Sans',sans-serif;font-size:11.5px;color:#1A1A18;line-height:1.55;box-sizing:border-box;padding-right:20px;">`

    // Skills — bullet list
    if (data.skills && data.skills.trim()) {
      const skillList = data.skills.split(',').map(s => s.trim()).filter(Boolean)
      let skillsHTML = '<ul style="list-style:none;padding:0;margin:0;columns:2;gap:10px;">'
      skillList.forEach(s => {
        skillsHTML += `<li style="margin-bottom:4px;display:flex;gap:5px;align-items:flex-start;break-inside:avoid;">
          <span style="color:#4A5568;flex-shrink:0;">•</span> ${s}
        </li>`
      })
      skillsHTML += '</ul>'
      rightHTML += rightSection('Skills', skillsHTML)
    }

    // Work Experience
    if (data.work && data.work.some(j => j.title || j.company)) {
      let workHTML = ''
      data.work.forEach(job => {
        if (!job.title && !job.company) return
        workHTML += `<div style="margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <div style="font-weight:700;font-size:12px;">${job.title || ''}</div>
            ${job.duration ? `<div style="font-size:10px;color:#7A776E;white-space:nowrap;">${job.duration}</div>` : ''}
          </div>
          ${job.company ? `<div style="font-size:11px;color:#4A5568;font-style:italic;margin-bottom:4px;">${job.company}</div>` : ''}
          ${job.desc ? `<ul style="list-style:disc;padding-left:16px;font-size:11px;color:#444;line-height:1.5;">
            ${job.desc.split('\n').filter(Boolean).map(l => `<li>${l}</li>`).join('') || `<li>${job.desc}</li>`}
          </ul>` : ''}
        </div>`
      })
      rightHTML += rightSection('Work Experience', workHTML)
    }

    // Certifications
    if (data.certifications && data.certifications.some(c => c.name || c.org)) {
      let certHTML = ''
      data.certifications.forEach(cert => {
        if (!cert.name && !cert.org) return
        certHTML += `<div style="margin-bottom:6px;">
          <div style="font-weight:600;">${cert.name || ''}</div>
          ${cert.org ? `<div style="font-size:11px;color:#555;">${cert.org}</div>` : ''}
          ${cert.date ? `<div style="font-size:10px;color:#7A776E;">${cert.date}</div>` : ''}
        </div>`
      })
      rightHTML += rightSection('Certifications', certHTML)
    }

    // Awards
    if (data.awards && data.awards.some(a => a.name || a.issuer)) {
      let awardHTML = ''
      data.awards.forEach(award => {
        if (!award.name && !award.issuer) return
        awardHTML += `<div style="margin-bottom:6px;">
          <div style="font-weight:600;">${award.name || ''}</div>
          ${award.issuer ? `<div style="font-size:11px;color:#555;">${award.issuer}</div>` : ''}
          ${award.year ? `<div style="font-size:10px;color:#7A776E;">${award.year}</div>` : ''}
        </div>`
      })
      rightHTML += rightSection('Awards & Achievements', awardHTML)
    }

    rightHTML += `</div>`
    buildHtmlElement({ left: COL_R_L, top: BODY_T, width: COL_R_W, classes: ['main-body'], html: rightHTML })
  }
})