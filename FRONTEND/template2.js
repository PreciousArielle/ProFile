initResumeEditor({
  templateNum: 2,
  storageKey: 'profile_canvas_state_t2',
  renderFromFormData({ data, buildTextElement, buildHtmlElement, buildImageElement }) {
    const HDR_H = 180;
    const COL_L = 260;
    const COL_R_L = 280;
    const COL_R_W = 514;
    const BODY_T = HDR_H + 20;
    const fontFamily = data.fontFamily || "'DM Sans', sans-serif";
    const fontSize = parseFloat(data.fontSize) || 12;
    const accentDark = data.accentDark || localStorage.getItem('profile_accent_dark') || '#4A5568';
    const accentLight = data.accentLight || localStorage.getItem('profile_accent_light') || '#7EB5D6';
    const esc = value => String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    // Fixed header: name, job title and photo never participate in section sorting.
    buildHtmlElement({ left: 0, top: 0, width: 794, html: `<div style="width:794px;height:135px;background:${esc(accentDark)};"></div>` });
    buildHtmlElement({ left: 0, top: 0, width: 794, html: `<div style="width:900px;height:180px;background:${esc(accentDark)};clip-path:polygon(0 0,100% 0,100% 75%,0 100%);"></div>` });
    if (data.photo) buildImageElement({ src: data.photo, left: 670, top: 20, width: 100, height: 100, borderRadius: '6px' });
    buildTextElement({ left: 20, top: 30, width: 580, text: data.name || 'Your Name', fontSize: `${Math.round(fontSize * 32 / 12)}px`, fontFamily: "'DM Serif Display', serif", color: '#ffffff' });
    buildTextElement({ left: 20, top: 90, width: 560, text: data.jobtitle || 'Job Title', fontSize: `${fontSize}px`, color: 'rgba(255,255,255,0.75)', fontFamily });

    const leftSection = (title, content) => content ? `<div style="margin-bottom:14px;"><div style="font-size:${fontSize - 3}px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${esc(accentDark)};border-left:3px solid ${esc(accentDark)};padding-left:6px;margin-bottom:7px;">${esc(title)}</div>${content}</div>` : '';
    const rightSection = (title, content) => content ? `<div style="margin-bottom:14px;"><div style="font-size:${fontSize - 3}px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${esc(accentDark)};border-bottom:1px solid #D4CFC4;padding-bottom:4px;margin-bottom:8px;">${esc(title)}</div>${content}</div>` : '';

    const contacts = [];
    if (data.email) contacts.push(`<div style="margin-bottom:3px;display:flex;gap:5px;align-items:center;"><span style="color:${esc(accentDark)};">✉</span><span style="word-break:break-all;">${esc(data.email)}</span></div>`);
    if (data.phone) contacts.push(`<div style="margin-bottom:3px;display:flex;gap:5px;"><span style="color:${esc(accentDark)};">📞</span>${esc(data.phone)}</div>`);
    if (data.location) contacts.push(`<div style="margin-bottom:3px;display:flex;gap:5px;"><span style="color:${esc(accentDark)};">📍</span>${esc(data.location)}</div>`);

    const education = (data.edu || data.education || []).filter(e => e.school || e.course);
    const languages = (data.languages || []).filter(l => l.name);
    const jobs = (data.work || []).filter(j => j.title || j.company || j.desc);
    const certifications = (data.certifications || []).filter(c => c.name || c.org);
    const awards = (data.awards || []).filter(a => a.name || a.issuer);
    const skills = String(data.skills || '').split(',').map(s => s.trim()).filter(Boolean);
    const customs = (data.customSections || []).filter(sec => (sec.entries || []).some(e => e && String(e).trim()));

    const renderers = {
      'sec-personal': {
        side: () => leftSection('Contact', contacts.join('')),
        main: () => rightSection('Contact', contacts.join(''))
      },
      'sec-edu': {
        side: () => leftSection('Education', education.map(e => `<div style="margin-bottom:8px;">${e.school ? `<div style="font-weight:600;font-size:${fontSize - 1}px;">${esc(e.school)}</div>` : ''}${e.course ? `<div style="font-size:${fontSize - 1}px;color:#555;">${esc(e.course)}</div>` : ''}${e.year ? `<div style="font-size:${fontSize - 2}px;color:#7A776E;">${esc(e.year)}</div>` : ''}</div>`).join('')),
        main: () => rightSection('Education', education.map(e => `<div style="margin-bottom:8px;">${e.school ? `<div style="font-weight:600;font-size:${fontSize}px;">${esc(e.school)}</div>` : ''}${e.course ? `<div style="font-size:${fontSize - 1}px;color:#555;">${esc(e.course)}</div>` : ''}${e.year ? `<div style="font-size:${fontSize - 2}px;color:#7A776E;">${esc(e.year)}</div>` : ''}</div>`).join(''))
      },
      'sec-languages': {
        side: () => leftSection('Languages', languages.map(l => `<div style="margin-bottom:3px;"><span style="font-weight:600;">${esc(l.name)}</span>${l.level ? ` <span style="color:#7A776E;font-size:${fontSize - 2}px;">(${esc(l.level)})</span>` : ''}</div>`).join('')),
        main: () => rightSection('Languages', languages.map(l => `<div style="margin-bottom:3px;"><b>${esc(l.name)}</b>${l.level ? ` <span style="color:#7A776E;font-size:${fontSize - 2}px;">(${esc(l.level)})</span>` : ''}</div>`).join(''))
      },
      'sec-skills': {
        side: () => leftSection('Skills', skills.map(s => `<div style="margin-bottom:4px;"><span style="color:${esc(accentDark)};">•</span> ${esc(s)}</div>`).join('')),
        main: () => { const body = skills.length ? `<ul style="list-style:none;padding:0;margin:0;columns:2;gap:10px;">${skills.map(s => `<li style="margin-bottom:4px;display:flex;gap:5px;align-items:flex-start;break-inside:avoid;"><span style="color:${esc(accentDark)};flex-shrink:0;">•</span>${esc(s)}</li>`).join('')}</ul>` : ''; return rightSection('Skills', body); }
      },
      'sec-work': {
        side: () => leftSection('Work Experience', jobs.map(j => `<div style="margin-bottom:9px;"><div style="font-weight:700;font-size:${fontSize - 1}px;">${esc(j.title)}</div>${j.company ? `<div style="font-size:${fontSize - 1}px;color:${esc(accentDark)};font-style:italic;">${esc(j.company)}</div>` : ''}${j.duration ? `<div style="font-size:${fontSize - 2}px;color:#7A776E;">${esc(j.duration)}</div>` : ''}${j.desc ? `<div style="font-size:${fontSize - 2}px;color:#444;line-height:1.45;">${esc(j.desc)}</div>` : ''}</div>`).join('')),
        main: () => rightSection('Work Experience', jobs.map(j => `<div style="margin-bottom:10px;"><div style="display:flex;justify-content:space-between;align-items:baseline;"><div style="font-weight:700;font-size:${fontSize}px;">${esc(j.title)}</div>${j.duration ? `<div style="font-size:${fontSize - 2}px;color:#7A776E;white-space:nowrap;">${esc(j.duration)}</div>` : ''}</div>${j.company ? `<div style="font-size:${fontSize - 1}px;color:${esc(accentDark)};font-style:italic;margin-bottom:4px;">${esc(j.company)}</div>` : ''}${j.desc ? `<ul style="list-style:disc;padding-left:16px;font-size:${fontSize - 1}px;color:#444;line-height:1.5;">${esc(j.desc).split('\n').filter(Boolean).map(line => `<li>${line}</li>`).join('')}</ul>` : ''}</div>`).join(''))
      },
      'sec-cert': {
        side: () => leftSection('Certifications', certifications.map(c => `<div style="margin-bottom:6px;"><div style="font-weight:600;font-size:${fontSize - 1}px;">${esc(c.name)}</div>${c.org ? `<div style="font-size:${fontSize - 2}px;color:#555;">${esc(c.org)}</div>` : ''}${c.date ? `<div style="font-size:${fontSize - 2}px;color:#7A776E;">${esc(c.date)}</div>` : ''}</div>`).join('')),
        main: () => rightSection('Certifications', certifications.map(c => `<div style="margin-bottom:6px;"><div style="font-weight:600;font-size:${fontSize}px;">${esc(c.name)}</div>${c.org ? `<div style="font-size:${fontSize - 1}px;color:#555;">${esc(c.org)}</div>` : ''}${c.date ? `<div style="font-size:${fontSize - 2}px;color:#7A776E;">${esc(c.date)}</div>` : ''}</div>`).join(''))
      },
      'sec-awards': {
        side: () => leftSection('Awards & Achievements', awards.map(a => `<div style="margin-bottom:6px;"><div style="font-weight:600;font-size:${fontSize - 1}px;">${esc(a.name)}</div>${a.issuer ? `<div style="font-size:${fontSize - 2}px;color:#555;">${esc(a.issuer)}</div>` : ''}${a.year ? `<div style="font-size:${fontSize - 2}px;color:#7A776E;">${esc(a.year)}</div>` : ''}</div>`).join('')),
        main: () => rightSection('Awards & Achievements', awards.map(a => `<div style="margin-bottom:6px;"><div style="font-weight:600;font-size:${fontSize}px;">${esc(a.name)}</div>${a.issuer ? `<div style="font-size:${fontSize - 1}px;color:#555;">${esc(a.issuer)}</div>` : ''}${a.year ? `<div style="font-size:${fontSize - 2}px;color:#7A776E;">${esc(a.year)}</div>` : ''}</div>`).join(''))
      },
      'sec-custom': {
        side: () => customs.map(sec => leftSection(sec.name || 'Additional Information', (sec.entries || []).filter(e => e && String(e).trim()).map(e => `<div style="font-size:${fontSize - 1}px;color:#444;margin-bottom:3px;line-height:1.5;">• ${esc(e)}</div>`).join(''))).join(''),
        main: () => customs.map(sec => rightSection(sec.name || 'Additional Information', (sec.entries || []).filter(e => e && String(e).trim()).map(e => `<div style="font-size:${fontSize - 1}px;color:#444;margin-bottom:3px;line-height:1.5;">• ${esc(e)}</div>`).join(''))).join('')
      }
    };

    // Preserve Template 2's original column assignments unless the user changes them.
    const defaultColumns = {
      'sec-personal': 'side', 'sec-edu': 'side', 'sec-languages': 'side',
      'sec-skills': 'main', 'sec-work': 'main', 'sec-cert': 'main',
      'sec-awards': 'main', 'sec-custom': 'side'
    };
    const columns = { ...defaultColumns, ...(data.sectionColumns || {}) };
    const defaultOrder = ['sec-personal', 'sec-work', 'sec-edu', 'sec-cert', 'sec-awards', 'sec-languages', 'sec-skills', 'sec-custom'];
    const savedOrder = Array.isArray(data.sectionOrder) ? data.sectionOrder : defaultOrder;
    const order = savedOrder.filter(id => Object.prototype.hasOwnProperty.call(renderers, id));
    defaultOrder.forEach(id => { if (!order.includes(id)) order.push(id); });

    // Personal Profile/summary is deliberately fixed and remains above movable sidebar content.
    let leftHTML = `<div style="font-family:${fontFamily};font-size:${fontSize - 1}px;color:#333;line-height:1.6;box-sizing:border-box;">`;
    if (data.summary && String(data.summary).trim()) {
      leftHTML += leftSection('Personal Profile', `<div style="font-size:${fontSize - 1}px;color:#444;line-height:1.6;">${esc(data.summary)}</div>`);
    }
    let rightHTML = `<div style="font-family:${fontFamily};font-size:${fontSize - 0.5}px;color:#1A1A18;line-height:1.55;box-sizing:border-box;padding-right:20px;">`;
    order.forEach(id => {
      const column = columns[id] === 'main' ? 'main' : 'side';
      const html = renderers[id][column]();
      if (column === 'side') leftHTML += html;
      else rightHTML += html;
    });
    leftHTML += '</div>';
    rightHTML += '</div>';

    buildHtmlElement({ left: 14, top: BODY_T, width: COL_L - 20, html: leftHTML });
    buildHtmlElement({ left: COL_L, top: BODY_T, width: 1, html: `<div style="width:1px;height:900px;background:#D4CFC4;"></div>` });
    buildHtmlElement({ left: COL_R_L, top: BODY_T, width: COL_R_W, classes: ['main-body'], html: rightHTML });
  }
});