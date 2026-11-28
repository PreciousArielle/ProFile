initResumeEditor({
  templateNum: 1,
  storageKey: 'profile_canvas_state',
  renderFromFormData({ data, buildHtmlElement }) {
    const fontSize = parseFloat(data.fontSize) || 12;
    const K = +(1.4 * fontSize / 12).toFixed(3);
    const Z = `zoom:${K};`;
    const accentDark = data.accentDark || localStorage.getItem('profile_accent_dark') || '#2C2C2C';
    const accentLight = data.accentLight || localStorage.getItem('profile_accent_light') || '#8FB89A';
    const esc = v => String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const sideHead = t => `<div style="font-size:8px;font-weight:600;color:${accentLight};letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;">${esc(t)}</div>`;
    const mainHead = (t, extra = '') => `<div style="font-size:8px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#2C2C2C;border-bottom:1.5px solid #2C2C2C;padding-bottom:2px;margin-bottom:6px;${extra}">${esc(t)}</div>`;

    const eduList = (data.edu || data.education || []).filter(e => e.school || e.course);
    const skillList = String(data.skills || '').split(',').map(s => s.trim()).filter(Boolean);
    const langList = (data.languages || []).filter(l => l.name);
    const jobs = (data.work || []).filter(j => j.title || j.company || j.desc);
    const certs = (data.certifications || []).filter(c => c.name || c.org);
    const awards = (data.awards || []).filter(a => a.name || a.issuer);
    const customSections = (data.customSections || []).filter(sec => (sec.entries || []).some(e => e && String(e).trim()));

    // Each movable section has its own renderer for each column. Contact remains part of Personal Info;
    // the name/job title and summary are deliberately fixed in the main header area.
    const renderers = {
      'sec-personal': {
        side: () => {
          let contact = '';
          if (data.email) contact += `<div style="margin-bottom:3px;">📧 ${esc(data.email)}</div>`;
          if (data.phone) contact += `<div style="margin-bottom:3px;">📞 ${esc(data.phone)}</div>`;
          if (data.location) contact += `<div style="margin-bottom:3px;">📍 ${esc(data.location)}</div>`;
          return contact ? `<div style="${Z}margin-bottom:12px;">${sideHead('Contact')}<div style="font-size:8px;color:#ccc;line-height:1.7;overflow-wrap:anywhere;word-break:break-word;">${contact}</div><div style="height:1px;background:#444;margin:12px 0;"></div></div>` : '';
        },
        main: () => {
          const lines = [];
          if (data.email) lines.push(`<div>📧 ${esc(data.email)}</div>`);
          if (data.phone) lines.push(`<div>📞 ${esc(data.phone)}</div>`);
          if (data.location) lines.push(`<div>📍 ${esc(data.location)}</div>`);
          return lines.length ? `<div style="${Z}margin-bottom:12px;">${mainHead('Contact')}<div style="font-size:8px;color:#555;line-height:1.7;">${lines.join('')}</div></div>` : '';
        }
      },
      'sec-edu': {
        side: () => eduList.length ? `<div style="${Z}margin-bottom:12px;">${sideHead('Education')}${eduList.map(e => `<div style="margin-bottom:8px;">${e.year ? `<div style="font-size:7px;color:#999;margin-bottom:1px;">${esc(e.year)}</div>` : ''}${e.course ? `<div style="font-size:8px;font-weight:600;color:#fff;text-transform:uppercase;line-height:1.3;">${esc(e.course)}</div>` : ''}${e.school ? `<div style="font-size:8px;color:#ccc;font-style:italic;">${esc(e.school)}</div>` : ''}</div>`).join('')}<div style="height:1px;background:#444;margin:12px 0;"></div></div>` : '',
        main: () => eduList.length ? `<div style="${Z}margin-bottom:12px;">${mainHead('Education')}${eduList.map(e => `<div style="margin-bottom:8px;">${e.year ? `<div style="font-size:7px;color:#7A776E;">${esc(e.year)}</div>` : ''}${e.course ? `<div style="font-size:9px;font-weight:600;color:#1A1A18;">${esc(e.course)}</div>` : ''}${e.school ? `<div style="font-size:8px;color:#555;font-style:italic;">${esc(e.school)}</div>` : ''}</div>`).join('')}</div>` : ''
      },
      'sec-skills': {
        side: () => skillList.length ? `<div style="${Z}margin-bottom:12px;">${sideHead('Skills')}${skillList.map(s => `<div style="font-size:8px;color:#ccc;margin-bottom:3px;display:flex;align-items:center;gap:5px;"><span style="color:${accentLight};">•</span>${esc(s)}</div>`).join('')}<div style="height:1px;background:#444;margin:12px 0;"></div></div>` : '',
        main: () => skillList.length ? `<div style="${Z}margin-bottom:12px;">${mainHead('Skills')}<div style="display:flex;flex-wrap:wrap;gap:5px;">${skillList.map(s => `<span style="font-size:8px;color:#444;background:#F1F0EC;padding:4px 7px;border-radius:2px;">${esc(s)}</span>`).join('')}</div></div>` : ''
      },
      'sec-languages': {
        side: () => langList.length ? `<div style="${Z}margin-bottom:12px;">${sideHead('Languages')}${langList.map(l => `<div style="font-size:8px;color:#ccc;margin-bottom:3px;"><span style="color:#fff;font-weight:500;">${esc(l.name)}</span>${l.level ? ` <span style="color:#999;font-size:7px;">(${esc(l.level)})</span>` : ''}</div>`).join('')}<div style="height:1px;background:#444;margin:12px 0;"></div></div>` : '',
        main: () => langList.length ? `<div style="${Z}margin-bottom:12px;">${mainHead('Languages')}${langList.map(l => `<div style="font-size:8px;color:#444;margin-bottom:3px;"><b>${esc(l.name)}</b>${l.level ? ` <span style="font-size:7px;color:#777;">(${esc(l.level)})</span>` : ''}</div>`).join('')}</div>` : ''
      },
      'sec-work': {
        side: () => jobs.length ? `<div style="${Z}margin-bottom:12px;">${sideHead('Experience')}${jobs.map(j => `<div style="margin-bottom:8px;"><div style="font-size:8px;font-weight:600;color:#fff;">${esc(j.title)}</div>${j.company ? `<div style="font-size:8px;color:#ccc;font-style:italic;">${esc(j.company)}</div>` : ''}${j.duration ? `<div style="font-size:7px;color:#999;">${esc(j.duration)}</div>` : ''}${j.desc ? `<div style="font-size:7px;color:#ccc;line-height:1.4;margin-top:2px;">${esc(j.desc)}</div>` : ''}</div>`).join('')}<div style="height:1px;background:#444;margin:12px 0;"></div></div>` : '',
        main: () => jobs.length ? `<div style="${Z}margin-bottom:12px;">${mainHead('Experience')}<div style="font-size:9px;color:#1A1A18;">${jobs.map(j => `<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start;"><div style="flex-shrink:0;width:8px;height:8px;border-radius:50%;background:#2C2C2C;border:2px solid ${accentLight};margin-top:3px;"></div><div style="flex:1;"><div style="display:flex;justify-content:space-between;align-items:baseline;"><b style="font-size:9px;color:#1A1A18;">${esc(j.title)}</b>${j.duration ? `<span style="font-size:7px;color:#7A776E;white-space:nowrap;">${esc(j.duration)}</span>` : ''}</div>${j.company ? `<div style="font-size:8px;color:#555;font-style:italic;margin-bottom:1px;">${esc(j.company)}</div>` : ''}${j.desc ? `<div style="font-size:8px;color:#444;line-height:1.4;">${esc(j.desc)}</div>` : ''}</div></div>`).join('')}</div></div>` : ''
      },
      'sec-cert': {
        side: () => certs.length ? `<div style="${Z}margin-bottom:12px;">${sideHead('Certifications')}${certs.map(c => `<div style="margin-bottom:6px;"><div style="font-size:8px;font-weight:600;color:#fff;">${esc(c.name)}</div>${c.org ? `<div style="font-size:7px;color:#ccc;">${esc(c.org)}</div>` : ''}${c.date ? `<div style="font-size:7px;color:#999;">${esc(c.date)}</div>` : ''}</div>`).join('')}<div style="height:1px;background:#444;margin:12px 0;"></div></div>` : '',
        main: () => certs.length ? `<div style="${Z}margin-bottom:12px;">${mainHead('Certifications', 'margin-top:8px;')}${certs.map(c => `<div style="margin-bottom:5px;"><div style="font-weight:600;font-size:9px;">${esc(c.name)}</div>${c.org ? `<div style="font-size:8px;color:#555;">${esc(c.org)}</div>` : ''}${c.date ? `<div style="font-size:7px;color:#7A776E;">${esc(c.date)}</div>` : ''}</div>`).join('')}</div>` : ''
      },
      'sec-awards': {
        side: () => awards.length ? `<div style="${Z}margin-bottom:12px;">${sideHead('Achievements')}${awards.map(a => `<div style="margin-bottom:6px;"><div style="font-size:7px;color:#999;">${esc(a.year || '')}</div><div style="font-size:8px;font-weight:600;color:#fff;">${esc(a.name)}</div>${a.issuer ? `<div style="font-size:7px;color:#ccc;">${esc(a.issuer)}</div>` : ''}</div>`).join('')}<div style="height:1px;background:#444;margin:12px 0;"></div></div>` : '',
        main: () => awards.length ? `<div style="${Z}margin-bottom:12px;">${mainHead('Achievement', 'margin-top:8px;')}<div style="font-size:9px;color:#1A1A18;display:grid;grid-template-columns:1fr 1fr;gap:6px;">${awards.map(a => `<div style="background:#F7F5F0;padding:6px 8px;border-left:2.5px solid ${accentLight};">${a.year ? `<div style="font-size:7px;color:#7A776E;">${esc(a.year)}</div>` : ''}<div style="font-weight:600;font-size:8px;">${esc(a.name)}</div>${a.issuer ? `<div style="font-size:7px;color:#555;">${esc(a.issuer)}</div>` : ''}</div>`).join('')}</div></div>` : ''
      },
      'sec-custom': {
        side: () => customSections.map(sec => `<div style="${Z}margin-bottom:12px;">${sideHead(sec.name || 'Additional Information')}${(sec.entries || []).filter(e => e && String(e).trim()).map(e => `<div style="font-size:8px;color:#ccc;margin-bottom:3px;line-height:1.5;">• ${esc(e)}</div>`).join('')}<div style="height:1px;background:#444;margin:12px 0;"></div></div>`).join(''),
        main: () => customSections.map(sec => `<div style="${Z}margin-bottom:12px;"><div style="font-size:8px;font-weight:600;color:#2B3A2E;letter-spacing:0.12em;text-transform:uppercase;border-bottom:1px solid #D4CFC4;padding-bottom:2px;margin-bottom:6px;">${esc(sec.name)}</div>${(sec.entries || []).filter(e => e && String(e).trim()).map(e => `<div style="font-size:8px;color:#555;margin-bottom:3px;line-height:1.5;">• ${esc(e)}</div>`).join('')}</div>`).join('')
      }
    };

    const defaultColumns = {
      'sec-personal':'side', 'sec-work':'main', 'sec-edu':'side', 'sec-cert':'main',
      'sec-awards':'main', 'sec-languages':'side', 'sec-skills':'side', 'sec-custom':'main'
    };
    const columns = { ...defaultColumns, ...(data.sectionColumns || {}) };
    const defaultOrder = ['sec-personal','sec-work','sec-edu','sec-cert','sec-awards','sec-languages','sec-skills','sec-custom'];
    const order = Array.isArray(data.sectionOrder) ? data.sectionOrder : defaultOrder;
    const validOrder = [...new Set([...order.filter(id => defaultOrder.includes(id)), ...defaultOrder])];

    let side = `<div style="width:220px;height:1123px;overflow:hidden;background:${accentDark};font-family:'DM Sans',sans-serif;box-sizing:border-box;"><div style="width:220px;height:200px;display:flex;align-items:center;justify-content:center;flex-shrink:0;${data.photo ? '' : 'background:#3A3A3A;'}">${data.photo ? `<img src="${esc(data.photo)}" style="width:180px;height:180px;object-fit:cover;border-radius:2px;display:block;">` : ''}</div><div style="padding:16px 14px;">`;
    validOrder.forEach(id => { if (columns[id] === 'side' && renderers[id]) side += renderers[id].side(); });
    side += `</div></div>`;
    buildHtmlElement({ left: 0, top: 0, width: 220, html: side });

    let main = `<div style="font-family:'DM Sans',sans-serif;box-sizing:border-box;width:518px;">`;
    main += `<div style="font-family:'DM Serif Display',serif;font-size:${fontSize * 2}px;color:#1A1A18;line-height:1.2;margin-bottom:4px;">${esc((data.name || 'YOUR NAME').toUpperCase())}</div>`;
    main += `<div style="font-size:${fontSize + 2}px;color:#7A776E;margin-bottom:8px;">${esc(data.jobtitle || 'Job Title')}</div>`;
    main += `<div style="height:1px;background:#D4CFC4;margin-bottom:10px;"></div>`;
    // Summary/description stays fixed; it is intentionally not part of sectionColumn.
    if (data.summary && String(data.summary).trim()) main += `<div style="${Z}">${mainHead('Profile Info')}<div style="font-size:9px;color:#333;line-height:1.6;margin-bottom:10px;">${esc(data.summary)}</div></div>`;
    validOrder.forEach(id => { if (columns[id] !== 'side' && renderers[id]) main += renderers[id].main(); });
    main += `</div>`;
    buildHtmlElement({ left: 258, top: 28, width: 518, classes: ['main-body'], html: main });
  }
});
