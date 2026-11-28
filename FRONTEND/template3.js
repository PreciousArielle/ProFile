initResumeEditor({
  templateNum: 3,
  storageKey: 'profile_canvas_state_t3',
  renderFromFormData({ data, buildTextElement, buildHtmlElement, buildImageElement }) {
    const fontFamily = data.fontFamily || "'DM Sans', sans-serif";
    const fontSize = Math.max(9, parseFloat(data.fontSize) || 12);
    const esc = value => String(value ?? '').replace(/[&<>\"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));

    function section(title, body) {
      if (!body) return '';
      return `<section style="margin:0 0 12px;break-inside:avoid;">
        <div style="color:#2B3A2E;font-size:${Math.max(8, fontSize - 1)}px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;border-bottom:1px solid #D4CFC4;padding-bottom:3px;margin-bottom:6px;">${esc(title)}</div>
        ${body}
      </section>`;
    }

    function renderEntries(items, renderer) {
      return Array.isArray(items) ? items.map(renderer).filter(Boolean).join('') : '';
    }

    const skillsHTML = data.skills && String(data.skills).trim()
      ? `<div style="margin-bottom:8px;color:#1A1A18;font-size:${fontSize}px;">${String(data.skills).split(',').map(s => s.trim()).filter(Boolean).map(esc).join(' &bull; ')}</div>` : '';

    const workHTML = renderEntries(data.work, job => {
      if (!job || (!job.title && !job.company)) return '';
      return `<div style="margin-bottom:7px;font-size:${fontSize}px;"><div style="font-weight:bold;">${esc(job.title || '')}${job.company ? ' — ' + esc(job.company) : ''}</div>${job.duration ? `<div style="font-size:${fontSize - 1}px;color:#7A776E;">${esc(job.duration)}</div>` : ''}${job.desc ? `<div style="margin-top:2px;font-size:${fontSize - 1}px;">${esc(job.desc)}</div>` : ''}</div>`;
    });
    const eduHTML = renderEntries(data.edu, edu => {
      if (!edu || (!edu.school && !edu.course)) return '';
      return `<div style="margin-bottom:6px;font-size:${fontSize}px;">${edu.school ? `<div style="font-weight:bold;">${esc(edu.school)}</div>` : ''}${edu.course ? `<div>${esc(edu.course)}</div>` : ''}${edu.year ? `<div style="font-size:${fontSize - 1}px;color:#7A776E;">${esc(edu.year)}</div>` : ''}</div>`;
    });
    const certHTML = renderEntries(data.certifications, cert => {
      if (!cert || (!cert.name && !cert.org)) return '';
      return `<div style="margin-bottom:6px;font-size:${fontSize}px;">${cert.name ? `<div style="font-weight:bold;">${esc(cert.name)}</div>` : ''}${cert.org ? `<div>${esc(cert.org)}</div>` : ''}${cert.date ? `<div style="font-size:${fontSize - 1}px;color:#7A776E;">${esc(cert.date)}</div>` : ''}</div>`;
    });
    const awardHTML = renderEntries(data.awards, award => {
      if (!award || (!award.name && !award.issuer)) return '';
      return `<div style="margin-bottom:6px;font-size:${fontSize}px;">${award.name ? `<div style="font-weight:bold;">${esc(award.name)}</div>` : ''}${award.issuer ? `<div>${esc(award.issuer)}</div>` : ''}${award.year ? `<div style="font-size:${fontSize - 1}px;color:#7A776E;">${esc(award.year)}</div>` : ''}</div>`;
    });
    const langHTML = renderEntries(data.languages, lang => {
      if (!lang || !lang.name) return '';
      return `<div style="margin-bottom:5px;font-size:${fontSize}px;"><strong>${esc(lang.name)}</strong>${lang.level ? ` — ${esc(lang.level)}` : ''}</div>`;
    });

    const contactParts = [];
    if (data.email) contactParts.push(`Email: ${esc(data.email)}`);
    if (data.phone) contactParts.push(`Phone: ${esc(data.phone)}`);
    if (data.location) contactParts.push(`Location: ${esc(data.location)}`);
    const personalHTML = contactParts.length
      ? `<div style="font-size:${fontSize - 1}px;color:#7A776E;line-height:1.6;">${contactParts.join('<br>')}</div>` : '';

    const customHTML = renderEntries(data.customSections, custom => {
      if (!custom) return '';
      const entries = Array.isArray(custom.entries) ? custom.entries.filter(v => v && String(v).trim()) : [];
      if (!entries.length) return '';
      return section(custom.name || 'Additional Information', entries.map(v => `<div style="font-size:${fontSize}px;color:#444;margin-bottom:3px;">&bull; ${esc(v)}</div>`).join(''));
    });

    // Preserve Template 3's original identity header and exact anchor positions.
    // Use nowrap so long names do not wrap into the job-title line or photo.
    const nameWidth = data.photo ? 600 : 714;
    buildHtmlElement({
      classes: ['name'], left: 40, top: 22, width: nameWidth,
      html: `<div style="font-family:'DM Serif Display',serif;font-size:${Math.round(fontSize * 34 / 12)}px;color:#1A1A18;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(data.name || 'Your Name')}</div>`
    });
    buildTextElement({
      classes: ['jobtitle'], text: (data.jobtitle || 'Job Title') + (data.location ? ' · ' + data.location : ''),
      left: 40, top: 75, width: data.photo ? 600 : 714,
      fontSize: `${fontSize}px`, color: '#7A776E'
    });
    if (data.photo) buildImageElement({ src: data.photo, left: 670, top: 20, width: 100, height: 100, borderRadius: '6px' });
    buildHtmlElement({ left: 40, top: 148, width: 714, html: '<div style="height:1px;background:#D4CFC4;"></div>' });

    // Summary stays fixed. All other sections use the saved order and column settings.
    const summaryHTML = data.summary && String(data.summary).trim()
      ? `<div style="font-size:${fontSize}px;margin:0 0 13px;color:#1A1A18;line-height:1.6;">${esc(data.summary)}</div>` : '';
    const renderers = {
      'sec-personal': () => section('Contact', personalHTML),
      'sec-work': () => section('Work Experience', workHTML),
      'sec-edu': () => section('Education', eduHTML),
      'sec-cert': () => section('Certifications', certHTML),
      'sec-awards': () => section('Awards & Achievements', awardHTML),
      'sec-languages': () => section('Languages', langHTML),
      'sec-skills': () => section('Skills', skillsHTML),
      'sec-custom': () => customHTML
    };
    const defaultOrder = ['sec-personal', 'sec-work', 'sec-edu', 'sec-cert', 'sec-awards', 'sec-languages', 'sec-skills', 'sec-custom'];
    const saved = Array.isArray(data.sectionOrder) ? data.sectionOrder : defaultOrder;
    const order = [...new Set(saved.filter(id => defaultOrder.includes(id)))];
    defaultOrder.forEach(id => { if (!order.includes(id)) order.push(id); });

    // Template 3 remains full-width by default; sidebar placement is opt-in.
    const defaultColumns = Object.fromEntries(defaultOrder.map(id => [id, 'main']));
    const columns = { ...defaultColumns, ...(data.sectionColumns || {}) };
    const side = [], main = [];
    order.forEach(id => {
      const html = renderers[id]();
      if (html) (columns[id] === 'side' ? side : main).push(html);
    });
    const hasSidebar = side.length > 0;
    const bodyHTML = `<div style="font-family:${fontFamily};font-size:${fontSize}px;color:#1A1A18;line-height:1.6;box-sizing:border-box;width:100%;">
      ${summaryHTML}
      <div style="display:grid;grid-template-columns:${hasSidebar ? '220px minmax(0,1fr)' : 'minmax(0,1fr)'};gap:${hasSidebar ? '24px' : '0'};align-items:start;">
        <div class="resume-side-column">${side.join('')}</div>
        <div class="resume-main-column">${main.join('')}</div>
      </div>
    </div>`;
    buildHtmlElement({ left: 40, top: 158, width: 714, classes: ['main-body'], html: bodyHTML });
  }
});