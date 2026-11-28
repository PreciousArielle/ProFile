initResumeEditor({
  templateNum: 4,
  storageKey: 'profile_canvas_state_t4',
  renderFromFormData({ data, buildHtmlElement }) {
    const fontSize = parseFloat(data.fontSize) || 12
    const K = +(1.4 * fontSize / 12).toFixed(3)
    const Z = `zoom:${K};`

    const accentDark = data.accentDark || localStorage.getItem('profile_accent_dark') || '#EDEAE3'
    const accentLight = data.accentLight || localStorage.getItem('profile_accent_light') || '#8FB89A'
    const isLight = accentDark === '#EDEAE3' || accentDark === '#F0EDE5'
    const cText = isLight ? '#7A776E' : '#ccc'
    const cLabel = isLight ? '#2B3A2E' : '#fff'
    const cStrong = isLight ? '#1A1A18' : '#fff'
    const cBorder = isLight ? '#D4CFC4' : '#555'

    const esc = v => String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    const sideHead = (t, top = true) => `<div style="font-size:7px;font-weight:700;color:${cLabel};letter-spacing:0.12em;text-transform:uppercase;border-bottom:1px solid ${cBorder};padding-bottom:2px;margin-bottom:6px;${top ? 'margin-top:8px;' : ''}">${t}</div>`
    const mainHead = t => `<div style="font-size:8px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#2B3A2E;border-bottom:1.5px solid ${accentLight};padding-bottom:2px;margin-bottom:6px;margin-top:10px;">${t}</div>`

    // Section content is rendered independently so each movable section can
    // be placed in either column without changing Template 4's visual design.
    const sectionHtml = {}

    const contact = []
    if (data.email) contact.push(`<div style="margin-bottom:3px;">📧 ${esc(data.email)}</div>`)
    if (data.phone) contact.push(`<div style="margin-bottom:3px;">📞 ${esc(data.phone)}</div>`)
    if (data.location) contact.push(`<div style="margin-bottom:3px;">📍 ${esc(data.location)}</div>`)
    if (contact.length) {
      sectionHtml['sec-personal'] = `<div style="${Z}">${sideHead('Contact')}<div style="font-size:8px;color:${cText};line-height:1.7;overflow-wrap:anywhere;word-break:break-word;">${contact.join('')}</div></div>`
    }

    const eduList = (data.edu || []).filter(e => e.school || e.course)
    if (eduList.length) {
      const items = eduList.map(e => `${e.year ? `<div style="font-size:7px;color:${cText};margin-bottom:1px;">${esc(e.year)}</div>` : ''}${e.course ? `<div style="font-weight:600;color:${cStrong};">${esc(e.course)}</div>` : ''}${e.school ? `<div style="font-style:italic;">${esc(e.school)}</div>` : ''}<div style="margin-bottom:6px;"></div>`).join('')
      sectionHtml['sec-edu'] = `<div style="${Z}">${sideHead('Education', false)}<div style="font-size:8px;color:${cText};margin-bottom:8px;">${items}</div></div>`
    }

    const skillList = (data.skills || '').split(',').map(s => s.trim()).filter(Boolean)
    if (skillList.length) {
      const items = skillList.map(s => `<div style="display:flex;align-items:center;gap:4px;margin-bottom:3px;"><span style="color:${accentLight};">•</span>${esc(s)}</div>`).join('')
      sectionHtml['sec-skills'] = `<div style="${Z}">${sideHead('Skills')}<div style="font-size:8px;color:${cText};line-height:1.6;">${items}</div></div>`
    }

    const langList = (data.languages || []).filter(l => l.name)
    if (langList.length) {
      const items = langList.map(l => `<div style="margin-bottom:3px;"><span style="color:${cStrong};font-weight:600;">${esc(l.name)}</span>${l.level ? ` <span style="font-size:7px;">(${esc(l.level)})</span>` : ''}</div>`).join('')
      sectionHtml['sec-languages'] = `<div style="${Z}">${sideHead('Languages')}<div style="font-size:8px;color:${cText};">${items}</div></div>`
    }

    const certList = (data.certifications || []).filter(c => c.name || c.org)
    if (certList.length) {
      const items = certList.map(c => `<div style="margin-bottom:5px;">${c.name ? `<div style="font-weight:600;color:${cStrong};">${esc(c.name)}</div>` : ''}${c.org ? `<div style="font-style:italic;">${esc(c.org)}</div>` : ''}${c.date ? `<div style="font-size:7px;">${esc(c.date)}</div>` : ''}</div>`).join('')
      sectionHtml['sec-cert'] = `<div style="${Z}">${sideHead('Certifications')}<div style="font-size:8px;color:${cText};">${items}</div></div>`
    }

    const jobs = (data.work || []).filter(j => j.title || j.company)
    if (jobs.length) {
      const items = jobs.map(j => `<div style="display:flex;gap:6px;margin-bottom:8px;align-items:flex-start;"><div style="flex-shrink:0;width:7px;height:7px;border-radius:50%;background:#2B3A2E;border:1.5px solid ${accentLight};margin-top:3px;"></div><div style="flex:1;"><div style="display:flex;justify-content:space-between;align-items:baseline;"><b style="font-size:9px;">${esc(j.title)}</b>${j.duration ? `<span style="font-size:7px;color:#7A776E;white-space:nowrap;">${esc(j.duration)}</span>` : ''}</div>${j.company ? `<div style="font-size:8px;color:#555;font-style:italic;margin-bottom:1px;">${esc(j.company)}</div>` : ''}${j.desc ? `<div style="font-size:8px;color:#444;line-height:1.4;">${esc(j.desc)}</div>` : ''}</div></div>`).join('')
      sectionHtml['sec-work'] = `<div style="${Z}">${mainHead('Work Experience')}<div style="font-size:9px;color:#1A1A18;">${items}</div></div>`
    }

    const awards = (data.awards || []).filter(a => a.name || a.issuer)
    if (awards.length) {
      const items = awards.map(a => `<div style="background:#F7F5F0;padding:6px 8px;border-left:2.5px solid ${accentLight};">${a.year ? `<div style="font-size:7px;color:#7A776E;">${esc(a.year)}</div>` : ''}<div style="font-weight:600;font-size:8px;">${esc(a.name)}</div>${a.issuer ? `<div style="font-size:7px;color:#555;">${esc(a.issuer)}</div>` : ''}</div>`).join('')
      sectionHtml['sec-awards'] = `<div style="${Z}">${mainHead('Awards &amp; Achievements')}<div style="font-size:9px;color:#1A1A18;display:grid;grid-template-columns:1fr 1fr;gap:6px;">${items}</div></div>`
    }

    const customs = (data.customSections || []).map(sec => {
      const items = (sec.entries || []).filter(e => e && e.trim())
      if (!items.length) return ''
      return `<div style="margin-top:10px;"><div style="font-size:8px;font-weight:600;color:#2B3A2E;letter-spacing:0.12em;text-transform:uppercase;border-bottom:1px solid #D4CFC4;padding-bottom:2px;margin-bottom:6px;">${esc(sec.name)}</div>${items.map(i => `<div style="font-size:8px;color:#555;margin-bottom:3px;line-height:1.5;">• ${esc(i)}</div>`).join('')}</div>`
    }).join('')
    if (customs) sectionHtml['sec-custom'] = `<div style="margin-top:8px;font-size:9px;color:#1A1A18;${Z}">${customs}</div>`

    // Name/job title and Profile remain fixed in the main column.
    const orderDefaults = ['sec-personal', 'sec-work', 'sec-edu', 'sec-cert', 'sec-awards', 'sec-languages', 'sec-skills', 'sec-summary', 'sec-custom']
    const order = Array.isArray(data.sectionOrder)
      ? [...new Set([...data.sectionOrder.filter(id => orderDefaults.includes(id)), ...orderDefaults])]
      : orderDefaults
    const defaultColumns = {
      'sec-personal': 'side', 'sec-work': 'main', 'sec-edu': 'side',
      'sec-cert': 'side', 'sec-awards': 'main', 'sec-languages': 'side',
      'sec-skills': 'side', 'sec-custom': 'main'
    }
    const columns = { ...defaultColumns, ...(data.sectionColumns || {}) }
    const sideSections = order.filter(id => id !== 'sec-summary' && columns[id] === 'side' && sectionHtml[id]).map(id => sectionHtml[id]).join('')
    const mainSections = order.filter(id => id !== 'sec-summary' && columns[id] !== 'side' && sectionHtml[id]).map(id => sectionHtml[id]).join('')

    let side = `<div style="width:260px;height:1123px;overflow:hidden;background:${accentDark};font-family:'DM Sans',sans-serif;box-sizing:border-box;">`
    if (data.photo) {
      side += `<div style="width:100%;padding:14px 0 10px;text-align:center;"><img src="${data.photo}" style="width:120px;height:120px;object-fit:cover;border-radius:4px;display:inline-block;"></div>`
    } else {
      side += `<div style="width:100%;height:130px;background:#D4CFC4;"></div>`
    }
    side += `<div style="padding:8px 14px 16px;">${sideSections}</div></div>`
    buildHtmlElement({ left: 0, top: 0, width: 260, html: side })

    let main = `<div style="width:534px;height:1123px;overflow:hidden;background:#FFFFFF;font-family:'DM Sans',sans-serif;box-sizing:border-box;"><div style="padding:22px 16px 16px;">`
    main += `<div style="font-family:'DM Serif Display',serif;font-size:${fontSize * 2}px;color:#1A1A18;letter-spacing:0.01em;line-height:1.2;margin-bottom:4px;">${esc((data.name || 'YOUR NAME').toUpperCase())}</div>`
    main += `<div style="font-size:${fontSize + 2}px;color:${accentLight};margin-bottom:10px;">${esc(data.jobtitle || 'Job Title')}</div>`
    main += `<div style="width:100%;height:1px;background:#D4CFC4;margin-bottom:8px;"></div>`
    if (data.summary && data.summary.trim()) {
      main += `<div style="${Z}">${mainHead('Profile')}<div style="font-size:9px;color:#555;line-height:1.55;margin-bottom:8px;">${esc(data.summary)}</div></div>`
    }
    main += mainSections
    main += `</div></div>`
    buildHtmlElement({ left: 260, top: 0, width: 534, classes: ['main-body'], html: main })
  }
})