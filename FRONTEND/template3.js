initResumeEditor({
  templateNum: 3,
  storageKey: 'profile_canvas_state_t3',
  renderFromFormData({ data, buildTextElement, buildHtmlElement, buildImageElement }) {

    const fontFamily = data.fontFamily || "'DM Sans', sans-serif"
    const fontSize   = parseFloat(data.fontSize) || 12

    function section(title, body) {
      if (!body) return ''
      return `<div style="color:#2B3A2E;font-size:${fontSize - 1}px;font-weight:bold;letter-spacing:0.08em;
        text-transform:uppercase;border-bottom:1px solid #D4CFC4;padding-bottom:3px;margin-bottom:6px;">${title}</div>${body}`
    }

    function renderEntries(items, renderer) {
      if (!items || !items.length) return ''
      return items.map(renderer).filter(Boolean).join('')
    }

    const skillsHTML = data.skills && data.skills.trim()
      ? `<div style="margin-bottom:8px;color:#1A1A18;font-size:${fontSize}px;">${data.skills.split(',').map(s => s.trim()).filter(Boolean).join(' • ')}</div>`
      : ''

    const workHTML = renderEntries(data.work || [], job => {
      if (!job.title && !job.company) return ''
      return `<div style="margin-bottom:5px;font-size:${fontSize}px;">
        <div style="font-weight:bold;">${job.title || ''}${job.company ? ' — ' + job.company : ''}</div>
        ${job.duration ? `<div style="font-size:${fontSize - 1}px;color:#7A776E;">${job.duration}</div>` : ''}
        ${job.desc     ? `<div style="margin-top:2px;font-size:${fontSize - 1}px;">${job.desc}</div>` : ''}
      </div>`
    })

    const eduHTML = renderEntries(data.edu || [], edu => {
      if (!edu.school && !edu.course) return ''
      return `<div style="margin-bottom:6px;font-size:${fontSize}px;">
        ${edu.school ? `<div style="font-weight:bold;">${edu.school}</div>` : ''}
        ${edu.course ? `<div>${edu.course}</div>` : ''}
        ${edu.year   ? `<div style="font-size:${fontSize - 1}px;color:#7A776E;">${edu.year}</div>` : ''}
      </div>`
    })

    const certHTML = renderEntries(data.certifications || [], cert => {
      if (!cert.name && !cert.org) return ''
      return `<div style="margin-bottom:6px;font-size:${fontSize}px;">
        ${cert.name ? `<div style="font-weight:bold;">${cert.name}</div>` : ''}
        ${cert.org  ? `<div>${cert.org}</div>` : ''}
        ${cert.date ? `<div style="font-size:${fontSize - 1}px;color:#7A776E;">${cert.date}</div>` : ''}
      </div>`
    })

    const awardHTML = renderEntries(data.awards || [], award => {
      if (!award.name && !award.issuer) return ''
      return `<div style="margin-bottom:6px;font-size:${fontSize}px;">
        ${award.name   ? `<div style="font-weight:bold;">${award.name}</div>` : ''}
        ${award.issuer ? `<div>${award.issuer}</div>` : ''}
        ${award.year   ? `<div style="font-size:${fontSize - 1}px;color:#7A776E;">${award.year}</div>` : ''}
      </div>`
    })

    const langHTML = renderEntries(data.languages || [], lang => {
      if (!lang.name) return ''
      return `<div style="margin-bottom:5px;font-size:${fontSize}px;">
        <span style="font-weight:bold;">${lang.name}</span>${lang.level ? ` — ${lang.level}` : ''}
      </div>`
    })

    // Name
    buildTextElement({
      classes: ['name'],
      text: data.name || 'Your Name',
      left: 40, top: 22, width: 540,
      fontSize: '34px', fontFamily: "'DM Serif Display', serif", color: '#1A1A18'
    })

    // Job title + location
    buildTextElement({
      classes: ['jobtitle'],
      text: (data.jobtitle || 'Job Title') + (data.location ? ' · ' + data.location : ''),
      left: 40, top: 75, width: 500,
      fontSize: `${fontSize}px`, color: '#7A776E', fontFamily: fontFamily
    })

    // Contact line
    const contactParts = []
    if (data.email)    contactParts.push(`Email: ${data.email}`)
    if (data.phone)    contactParts.push(`Phone: ${data.phone}`)
    if (data.location) contactParts.push(`Location: ${data.location}`)
    buildTextElement({
      classes: ['contact-line'],
      text: contactParts.join('  |  ') || 'Email | Phone | Location',
      left: 40, top: 120, width: 714,
      fontSize: `${fontSize - 1}px`, color: '#7A776E', fontFamily: fontFamily
    })

    // Photo
    if (data.photo) {
      buildImageElement({ src: data.photo, left: 670, top: 20, width: 100, height: 100, borderRadius: '6px' })
    }

    // Divider line
    buildHtmlElement({
      left: 40, top: 148, width: 714,
      html: `<div style="height:1px;background:#D4CFC4;"></div>`
    })

    let mainHTML = `<div style="font-family:${fontFamily};font-size:${fontSize}px;color:#1A1A18;line-height:1.6;box-sizing:border-box;">`

    if (data.summary && data.summary.trim()) mainHTML += `<div style="margin-bottom:6px;font-size:${fontSize}px;">${data.summary}</div>`
    mainHTML += section('Skills', skillsHTML)
    mainHTML += section('Work Experience', workHTML)
    mainHTML += section('Education', eduHTML)
    mainHTML += section('Certifications', certHTML)
    mainHTML += section('Awards & Achievements', awardHTML)
    mainHTML += section('Languages', langHTML)

    // Custom sections
    if (data.customSections && data.customSections.length) {
      data.customSections.forEach(sec => {
        const items = (sec.entries || []).filter(e => e && e.trim())
        if (!items.length) return
        const customBody = items.map(item =>
          `<div style="font-size:${fontSize}px;color:#444;margin-bottom:3px;line-height:1.5;">• ${item}</div>`
        ).join('')
        mainHTML += section(sec.name, customBody)
      })
    }

    mainHTML += `</div>`

    buildHtmlElement({
      left: 40, top: 158, width: 714,
      classes: ['main-body'],
      html: mainHTML
    })
  }
})