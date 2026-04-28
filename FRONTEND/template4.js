initResumeEditor({
  templateNum: 4,
  storageKey: 'profile_canvas_state_t4',
  renderFromFormData({ data, buildTextElement, buildHtmlElement, buildImageElement }) {

    const SIDEBAR_W = 260
    const MAIN_L    = 260
    const MAIN_W    = 495
    const PAGE_H    = 1123

    // ── 1. SIDEBAR BACKGROUND (rendered first) ──
    buildHtmlElement({
      left: 0, top: 0, width: SIDEBAR_W,
      html: `<div style="width:${SIDEBAR_W}px;height:${PAGE_H}px;background:#EDEAE3;"></div>`
    })

    // ── 2. MAIN BACKGROUND (rendered second) ──
    buildHtmlElement({
      left: MAIN_L, top: 0, width: MAIN_W,
      html: `<div style="width:${MAIN_W}px;height:${PAGE_H}px;background:#FFFFFF;"></div>`
    })

    // ── 3. SIDEBAR CONTENT ──
    let sidebarHTML = `<div style="font-family:'DM Sans',sans-serif;box-sizing:border-box;width:${SIDEBAR_W}px;">`

    // Photo
    if (data.photo) {
      sidebarHTML += `
        <div style="width:100%;padding:20px 0 16px;display:flex;align-items:center;justify-content:center;">
          <img src="${data.photo}" style="width:160px;height:160px;object-fit:cover;display:block;border-radius:4px;">
        </div>`
    } else {
      sidebarHTML += `<div style="width:100%;height:180px;background:#D4CFC4;"></div>`
    }

    sidebarHTML += `<div style="padding:10px 18px 20px;">`

    // Education
    const eduData = data.edu || []
    if (eduData.some(e => e.school || e.course)) {
      sidebarHTML += `<div style="font-size:9px;font-weight:700;color:#2B3A2E;letter-spacing:0.12em;text-transform:uppercase;border-bottom:1px solid #D4CFC4;padding-bottom:3px;margin-bottom:8px;">Education</div>`
      eduData.forEach(edu => {
        if (!edu.school && !edu.course) return
        sidebarHTML += `<div style="margin-bottom:10px;">`
        if (edu.year) sidebarHTML += `<div style="font-size:9px;color:#7A776E;margin-bottom:2px;">${edu.year}</div>`
        if (edu.course) sidebarHTML += `<div style="font-size:10px;font-weight:600;color:#1A1A18;line-height:1.3;">${edu.course}</div>`
        if (edu.school) sidebarHTML += `<div style="font-size:10px;color:#7A776E;font-style:italic;">${edu.school}</div>`
        sidebarHTML += `</div>`
      })
    }

    // Skills
    if (data.skills && data.skills.trim()) {
      sidebarHTML += `<div style="font-size:9px;font-weight:700;color:#2B3A2E;letter-spacing:0.12em;text-transform:uppercase;border-bottom:1px solid #D4CFC4;padding-bottom:3px;margin-bottom:8px;margin-top:10px;">Skills</div>`
      data.skills.split(',').map(s => s.trim()).filter(Boolean).forEach(skill => {
        sidebarHTML += `<div style="font-size:10px;color:#7A776E;margin-bottom:4px;display:flex;align-items:center;gap:6px;">
          <span style="color:#8FB89A;font-size:12px;">•</span>${skill}
        </div>`
      })
    }

    // Languages
    if (data.languages && data.languages.some(l => l.name)) {
      sidebarHTML += `<div style="font-size:9px;font-weight:700;color:#2B3A2E;letter-spacing:0.12em;text-transform:uppercase;border-bottom:1px solid #D4CFC4;padding-bottom:3px;margin-bottom:8px;margin-top:10px;">Languages</div>`
      data.languages.forEach(lang => {
        if (!lang.name) return
        sidebarHTML += `<div style="font-size:10px;color:#7A776E;margin-bottom:4px;">
          <span style="color:#1A1A18;font-weight:600;">${lang.name}</span>${lang.level ? ` <span style="color:#7A776E;font-size:9px;">(${lang.level})</span>` : ''}
        </div>`
      })
    }

    // Certifications
    if (data.certifications && data.certifications.some(c => c.name || c.org)) {
      sidebarHTML += `<div style="font-size:9px;font-weight:700;color:#2B3A2E;letter-spacing:0.12em;text-transform:uppercase;border-bottom:1px solid #D4CFC4;padding-bottom:3px;margin-bottom:8px;margin-top:10px;">Certifications</div>`
      data.certifications.forEach(cert => {
        if (!cert.name && !cert.org) return
        sidebarHTML += `<div style="margin-bottom:6px;">
          <div style="font-size:10px;font-weight:600;color:#1A1A18;">${cert.name || ''}</div>
          ${cert.org ? `<div style="font-size:9px;color:#7A776E;">${cert.org}</div>` : ''}
          ${cert.date ? `<div style="font-size:9px;color:#7A776E;">${cert.date}</div>` : ''}
        </div>`
      })
    }

    // Contact
    sidebarHTML += `<div style="font-size:9px;font-weight:700;color:#2B3A2E;letter-spacing:0.12em;text-transform:uppercase;border-bottom:1px solid #D4CFC4;padding-bottom:3px;margin-bottom:8px;margin-top:10px;">Contact</div>`
    if (data.email) sidebarHTML += `<div style="font-size:9.5px;color:#7A776E;margin-bottom:4px;word-break:break-all;">📧 ${data.email}</div>`
    if (data.phone) sidebarHTML += `<div style="font-size:9.5px;color:#7A776E;margin-bottom:4px;">📞 ${data.phone}</div>`
    if (data.location) sidebarHTML += `<div style="font-size:9.5px;color:#7A776E;margin-bottom:4px;">📍 ${data.location}</div>`

    sidebarHTML += `</div></div>`

    buildHtmlElement({ left: 0, top: 0, width: SIDEBAR_W, html: sidebarHTML })

    // ── 4. MAIN CONTENT ──
    buildTextElement({
      left: MAIN_L + 20, top: 30, width: MAIN_W - 40,
      text: (data.name || 'Your Name').toUpperCase(),
      fontSize: '26px', fontFamily: "'DM Serif Display', serif", color: '#1A1A18'
    })

    buildTextElement({
      left: MAIN_L + 20, top: 76, width: MAIN_W - 40,
      text: data.jobtitle || 'Job Title',
      fontSize: '11px', color: '#8FB89A', fontFamily: "'DM Sans', sans-serif"
    })

    buildHtmlElement({
      left: MAIN_L + 20, top: 98, width: MAIN_W - 40,
      html: `<div style="height:1px;background:#D4CFC4;"></div>`
    })

    function sectionHead(title) {
      return `<div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
        color:#2B3A2E;border-bottom:1.5px solid #8FB89A;padding-bottom:3px;margin-bottom:8px;margin-top:14px;">${title}</div>`
    }

    let mainHTML = `<div style="font-family:'DM Sans',sans-serif;font-size:11px;color:#1A1A18;line-height:1.55;box-sizing:border-box;padding:0 20px;">`

    if (data.summary && data.summary.trim()) {
      mainHTML += sectionHead('Profile')
      mainHTML += `<div style="font-size:11px;color:#555;line-height:1.6;margin-bottom:10px;">${data.summary}</div>`
    }

    if (data.work && data.work.some(j => j.title || j.company)) {
      mainHTML += sectionHead('Work Experience')
      data.work.forEach(job => {
        if (!job.title && !job.company) return
        mainHTML += `<div style="display:flex;gap:8px;margin-bottom:10px;align-items:flex-start;">
          <div style="flex-shrink:0;width:8px;height:8px;border-radius:50%;background:#2B3A2E;border:2px solid #8FB89A;margin-top:4px;"></div>
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;">
              <div style="font-weight:700;font-size:11px;">${job.title || ''}</div>
              ${job.duration ? `<div style="font-size:9px;color:#7A776E;white-space:nowrap;">${job.duration}</div>` : ''}
            </div>
            ${job.company ? `<div style="font-size:10px;color:#555;font-style:italic;margin-bottom:2px;">${job.company}</div>` : ''}
            ${job.desc ? `<div style="font-size:10px;color:#444;line-height:1.5;">${job.desc}</div>` : ''}
          </div>
        </div>`
      })
    }

    if (data.certifications && data.certifications.some(c => c.name || c.org)) {
      mainHTML += sectionHead('Certifications')
      data.certifications.forEach(cert => {
        if (!cert.name && !cert.org) return
        mainHTML += `<div style="margin-bottom:6px;">
          <div style="font-weight:600;font-size:11px;">${cert.name || ''}</div>
          ${cert.org ? `<div style="font-size:10px;color:#555;">${cert.org}</div>` : ''}
          ${cert.date ? `<div style="font-size:9px;color:#7A776E;">${cert.date}</div>` : ''}
        </div>`
      })
    }

    if (data.awards && data.awards.some(a => a.name || a.issuer)) {
      mainHTML += sectionHead('Awards & Achievements')
      mainHTML += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">`
      data.awards.forEach(award => {
        if (!award.name && !award.issuer) return
        mainHTML += `<div style="background:#F7F5F0;padding:8px 10px;border-left:3px solid #8FB89A;">
          ${award.year ? `<div style="font-size:9px;color:#7A776E;">${award.year}</div>` : ''}
          <div style="font-weight:600;font-size:10px;">${award.name || ''}</div>
          ${award.issuer ? `<div style="font-size:9px;color:#555;">${award.issuer}</div>` : ''}
        </div>`
      })
      mainHTML += `</div>`
    }

    mainHTML += `</div>`

    buildHtmlElement({ left: MAIN_L, top: 112, width: MAIN_W, classes: ['main-body'], html: mainHTML })
  }
})