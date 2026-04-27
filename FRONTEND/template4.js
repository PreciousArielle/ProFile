initResumeEditor({
  templateNum: 4,
  storageKey: 'profile_canvas_state_t4',
  renderFromFormData({ data, buildTextElement, buildHtmlElement }) {
    function section(title, body) {
      if (!body) return ''
      return `<div style="color:#2B3A2E;font-size:11px;font-weight:bold;letter-spacing:0.08em;
        text-transform:uppercase;border-bottom:1px solid #8FB89A;padding-bottom:3px;margin-bottom:6px;">${title}</div>${body}`
    }

    function renderEntries(items, renderer) {
      if (!items || !items.length) return ''
      return items.map(renderer).filter(Boolean).join('')
    }

    const workHTML = renderEntries(data.work || [], job => {
      if (!job.title && !job.company) return ''
      return `<div style="margin-bottom:5px;">
        <div style="font-weight:bold;">${job.title || ''}${job.company ? ' — ' + job.company : ''}</div>
        ${job.duration ? `<div style="font-size:11px;color:#7A776E;">${job.duration}</div>` : ''}
        ${job.desc ? `<div style="margin-top:2px;">${job.desc}</div>` : ''}
      </div>`
    })

    const eduHTML = renderEntries(data.edu || [], edu => {
      if (!edu.school && !edu.course) return ''
      return `<div style="margin-bottom:6px;">
        ${edu.school ? `<div style="font-weight:bold;">${edu.school}</div>` : ''}
        ${edu.course ? `<div>${edu.course}</div>` : ''}
        ${edu.year ? `<div style="font-size:11px;color:#7A776E;">${edu.year}</div>` : ''}
      </div>`
    })

    const certHTML = renderEntries(data.certifications || [], cert => {
      if (!cert.name && !cert.org) return ''
      return `<div style="margin-bottom:6px;">
        ${cert.name ? `<div style="font-weight:bold;">${cert.name}</div>` : ''}
        ${cert.org ? `<div>${cert.org}</div>` : ''}
        ${cert.date ? `<div style="font-size:11px;color:#7A776E;">${cert.date}</div>` : ''}
      </div>`
    })

    const awardHTML = renderEntries(data.awards || [], award => {
      if (!award.name && !award.issuer) return ''
      return `<div style="margin-bottom:6px;">
        ${award.name ? `<div style="font-weight:bold;">${award.name}</div>` : ''}
        ${award.issuer ? `<div>${award.issuer}</div>` : ''}
        ${award.year ? `<div style="font-size:11px;color:#7A776E;">${award.year}</div>` : ''}
      </div>`
    })

    const langHTML = renderEntries(data.languages || [], lang => {
      if (!lang.name) return ''
      return `<div style="margin-bottom:5px;"><div><span style="font-weight:bold;">${lang.name}</span>${lang.level ? ` — ${lang.level}` : ''}</div></div>`
    })

    buildTextElement({
      classes: ['name'],
      text: data.name || 'Your Name',
      left: 22,
      top: 26,
      width: 260,
      fontSize: '24px',
      fontFamily: "'DM Serif Display', serif",
      color: '#2B3A2E'
    })

    buildTextElement({
      classes: ['jobtitle'],
      text: data.jobtitle || 'Job Title',
      left: 22,
      top: 80,
      width: 260,
      fontSize: '11px',
      color: '#8FB89A',
      fontFamily: "'DM Sans', sans-serif"
    })

    let leftHTML = `<div style="font-family:'DM Sans',sans-serif;font-size:11px;color:#7A776E;line-height:1.5;box-sizing:border-box;">`
    if (data.photo) {
  buildImageElement({
    src: data.photo,
    left: 20, 
    top: 20,
    width: 220, // Full width of the left sidebar accent
    height: 180,
    borderRadius: '0px' // Clean, professional look
  });
}
    leftHTML += `<div style="color:#2B3A2E;font-size:10px;font-weight:bold;letter-spacing:0.1em;
      text-transform:uppercase;border-bottom:1px solid #D4CFC4;padding-bottom:3px;margin-bottom:6px;">Contact</div>`
    if (data.email) leftHTML += `<div style="margin-bottom:3px;">Email: ${data.email}</div>`
    if (data.phone) leftHTML += `<div style="margin-bottom:3px;">Phone: ${data.phone}</div>`
    if (data.location) leftHTML += `<div style="margin-bottom:3px;">Location: ${data.location}</div>`

    if (data.skills && data.skills.trim()) {
      const skillList = data.skills.split(',').map(s => s.trim()).filter(Boolean)
      leftHTML += `<div style="color:#2B3A2E;font-size:10px;font-weight:bold;letter-spacing:0.1em;
        text-transform:uppercase;border-bottom:1px solid #D4CFC4;padding-bottom:3px;margin:10px 0 6px;">Skills</div>`
      skillList.forEach(skill => {
        leftHTML += `<div style="margin-bottom:3px;">${skill}</div>`
      })
    }
    leftHTML += `</div>`

    buildHtmlElement({
      left: 22,
      top: 120,
      width: 262,
      classes: ['left-body'],
      html: leftHTML
    })

    let mainHTML = `<div style="font-family:'DM Sans',sans-serif;font-size:12px;color:#1A1A18;line-height:1.55;box-sizing:border-box;">`
    if (data.summary && data.summary.trim()) mainHTML += `<div style="margin-bottom:6px;color:#7A776E;font-style:italic;">${data.summary}</div>`
    mainHTML += section('Work Experience', workHTML)
    if (workHTML && eduHTML) mainHTML += `<div style="margin-bottom:4px;"></div>`
    mainHTML += section('Education', eduHTML)
    if (eduHTML && certHTML) mainHTML += `<div style="margin-bottom:4px;"></div>`
    mainHTML += section('Certifications', certHTML)
    if (certHTML && awardHTML) mainHTML += `<div style="margin-bottom:4px;"></div>`
    mainHTML += section('Awards & Achievements', awardHTML)
    if (awardHTML && langHTML) mainHTML += `<div style="margin-bottom:4px;"></div>`
    mainHTML += section('Languages', langHTML)
    mainHTML += `</div>`

    buildHtmlElement({
      left: 330,
      top: 26,
      width: 440,
      classes: ['main-body'],
      html: mainHTML
    })
  }
})
