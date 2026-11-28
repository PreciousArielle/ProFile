
initResumeEditor({
  templateNum: 1,
  storageKey: 'profile_canvas_state',
  renderFromFormData({ data, buildHtmlElement }) {
    const fontSize = parseFloat(data.fontSize) || 12;
    const K = +(1.4 * fontSize / 12).toFixed(3);
    const Z = `zoom:${K};`;

    const accentDark = data.accentDark || localStorage.getItem('profile_accent_dark') || '#2C2C2C';
    const accentLight = data.accentLight || localStorage.getItem('profile_accent_light') || '#8FB89A';
    const esc = value => String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const mainHead = (title, extra = '') =>
      `<div style="font-size:8px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#2C2C2C;border-bottom:1.5px solid #2C2C2C;padding-bottom:2px;margin-bottom:6px;${extra}">${esc(title)}</div>`;

    // Fixed visual identity/sidebar area
    let sidebar = `<div style="width:220px;height:1123px;overflow:hidden;background:${esc(accentDark)};font-family:'DM Sans',sans-serif;box-sizing:border-box;">`;

    if (data.photo) {
      sidebar += `<div style="width:220px;height:200px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><img src="${esc(data.photo)}" style="width:180px;height:180px;object-fit:cover;border-radius:2px;display:block;"></div>`;
    } else {
      sidebar += `<div style="width:220px;height:200px;background:#3A3A3A;flex-shrink:0;"></div>`;
    }

    sidebar += `</div>`;
    buildHtmlElement({ left: 0, top: 0, width: 220, html: sidebar });

    const jobs = (data.work || []).filter(item => item.title || item.company || item.desc);
    const education = (data.edu || data.education || []).filter(item => item.school || item.course);
    const certifications = (data.certifications || []).filter(item => item.name || item.org);
    const awards = (data.awards || []).filter(item => item.name || item.issuer);
    const languages = (data.languages || []).filter(item => item.name);
    const skills = String(data.skills || '').split(',').map(item => item.trim()).filter(Boolean);
    const customSections = (data.customSections || []).filter(section =>
      section && ((section.entries || []).some(entry => String(entry || '').trim()))
    );

    const renderContact = () => {
      const lines = [];
      if (data.email) lines.push(`<div style="margin-bottom:3px;">📧 ${esc(data.email)}</div>`);
      if (data.phone) lines.push(`<div style="margin-bottom:3px;">📞 ${esc(data.phone)}</div>`);
      if (data.location) lines.push(`<div style="margin-bottom:3px;">📍 ${esc(data.location)}</div>`);

      return lines.length
        ? `<section style="${Z}margin-bottom:12px;">${mainHead('Contact')}<div style="font-size:8px;color:#444;line-height:1.7;overflow-wrap:anywhere;">${lines.join('')}</div></section>`
        : '';
    };

    const renderWork = () => jobs.length
      ? `<section style="${Z}margin-bottom:12px;">${mainHead('Experience')}${jobs.map(job => `
          <div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start;">
            <div style="flex-shrink:0;width:8px;height:8px;border-radius:50%;background:#2C2C2C;border:2px solid ${esc(accentLight)};margin-top:3px;"></div>
            <div style="flex:1;min-width:0;">
              <div style="display:flex;justify-content:space-between;align-items:baseline;gap:6px;">
                <b style="font-size:9px;color:#1A1A18;">${esc(job.title)}</b>
                ${job.duration ? `<span style="font-size:7px;color:#7A776E;white-space:nowrap;">${esc(job.duration)}</span>` : ''}
              </div>
              ${job.company ? `<div style="font-size:8px;color:#555;font-style:italic;margin-bottom:1px;">${esc(job.company)}</div>` : ''}
              ${job.desc ? `<div style="font-size:8px;color:#444;line-height:1.4;">${esc(job.desc)}</div>` : ''}
            </div>
          </div>`).join('')}</section>`
      : '';

    const renderEducation = () => education.length
      ? `<section style="${Z}margin-bottom:12px;">${mainHead('Education')}${education.map(item => `
          <div style="margin-bottom:8px;">
            ${item.year ? `<div style="font-size:7px;color:#7A776E;margin-bottom:1px;">${esc(item.year)}</div>` : ''}
            ${item.course ? `<div style="font-size:9px;font-weight:600;color:#1A1A18;line-height:1.3;">${esc(item.course)}</div>` : ''}
            ${item.school ? `<div style="font-size:8px;color:#555;font-style:italic;">${esc(item.school)}</div>` : ''}
          </div>`).join('')}</section>`
      : '';

    const renderCertifications = () => certifications.length
      ? `<section style="${Z}margin-bottom:12px;">${mainHead('Certifications')}${certifications.map(item => `
          <div style="margin-bottom:5px;">
            <div style="font-weight:600;font-size:9px;">${esc(item.name)}</div>
            ${item.org ? `<div style="font-size:8px;color:#555;">${esc(item.org)}</div>` : ''}
            ${item.date ? `<div style="font-size:7px;color:#7A776E;">${esc(item.date)}</div>` : ''}
          </div>`).join('')}</section>`
      : '';

    const renderAwards = () => awards.length
      ? `<section style="${Z}margin-bottom:12px;">${mainHead('Achievement')}<div style="font-size:9px;color:#1A1A18;display:grid;grid-template-columns:1fr 1fr;gap:6px;">${awards.map(item => `
          <div style="background:#F7F5F0;padding:6px 8px;border-left:2.5px solid ${esc(accentLight)};">
            ${item.year ? `<div style="font-size:7px;color:#7A776E;">${esc(item.year)}</div>` : ''}
            <div style="font-weight:600;font-size:8px;">${esc(item.name)}</div>
            ${item.issuer ? `<div style="font-size:7px;color:#555;">${esc(item.issuer)}</div>` : ''}
          </div>`).join('')}</div></section>`
      : '';

    const renderLanguages = () => languages.length
      ? `<section style="${Z}margin-bottom:12px;">${mainHead('Languages')}${languages.map(item => `
          <div style="font-size:8px;color:#444;margin-bottom:3px;">
            <span style="font-weight:600;color:#1A1A18;">${esc(item.name)}</span>
            ${item.level ? `<span style="font-size:7px;color:#777;"> (${esc(item.level)})</span>` : ''}
          </div>`).join('')}</section>`
      : '';

    const renderSkills = () => skills.length
      ? `<section style="${Z}margin-bottom:12px;">${mainHead('Skills')}<div style="display:flex;flex-wrap:wrap;gap:5px;">${skills.map(skill => `<span style="font-size:8px;color:#444;background:#F1F0EC;padding:4px 7px;border-radius:2px;">${esc(skill)}</span>`).join('')}</div></section>`
      : '';

    const renderCustom = () => customSections.map(section => {
      const entries = (section.entries || []).map(entry => String(entry || '').trim()).filter(Boolean);
      if (!entries.length) return '';

      return `<section style="${Z}margin-bottom:12px;">
        ${mainHead(section.name || 'Additional Information')}
        ${entries.map(entry => `<div style="font-size:8px;color:#555;margin-bottom:3px;line-height:1.5;">• ${esc(entry)}</div>`).join('')}
      </section>`;
    }).join('');

    const sectionRenderers = {
      'sec-personal': renderContact,
      'sec-work': renderWork,
      'sec-edu': renderEducation,
      'sec-cert': renderCertifications,
      'sec-awards': renderAwards,
      'sec-languages': renderLanguages,
      'sec-skills': renderSkills,
      'sec-custom': renderCustom
    };

    const defaultOrder = [
      'sec-personal',
      'sec-work',
      'sec-edu',
      'sec-cert',
      'sec-awards',
      'sec-languages',
      'sec-skills',
      'sec-custom'
    ];

    const savedOrder = Array.isArray(data.sectionOrder)
      ? data.sectionOrder
      : defaultOrder;

    const movableOrder = savedOrder.filter(id =>
      Object.prototype.hasOwnProperty.call(sectionRenderers, id)
    );

    defaultOrder.forEach(id => {
      if (!movableOrder.includes(id)) {
        movableOrder.push(id);
      }
    });

    let main = `<div style="font-family:'DM Sans',sans-serif;box-sizing:border-box;width:518px;">
      <div style="font-family:'DM Serif Display',serif;font-size:${fontSize * 2}px;color:#1A1A18;line-height:1.2;margin-bottom:4px;">${esc((data.name || 'YOUR NAME').toUpperCase())}</div>
      <div style="font-size:${fontSize + 2}px;color:#7A776E;margin-bottom:8px;">${esc(data.jobtitle || 'Job Title')}</div>
      <div style="height:1px;background:#D4CFC4;margin-bottom:10px;"></div>`;

    // Summary/description stays fixed beneath the identity header.
    if (data.summary && String(data.summary).trim()) {
      main += `<section style="${Z}margin-bottom:12px;">${mainHead('Profile Info')}<div style="font-size:9px;color:#333;line-height:1.6;">${esc(data.summary)}</div></section>`;
    }

    // Render every movable section in the user's saved order.
    movableOrder.forEach(id => {
      main += sectionRenderers[id]();
    });

    main += `</div>`;

    buildHtmlElement({
      left: 258,
      top: 28,
      width: 518,
      classes: ['main-body'],
      html: main
    });
  }
});
