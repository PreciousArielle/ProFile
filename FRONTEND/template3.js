initResumeEditor({
  templateNum: 3,
  storageKey: 'profile_canvas_state_t3',
  renderFromFormData({ data, buildTextElement, buildHtmlElement, buildImageElement }) {
    const fontFamily = data.fontFamily || "'DM Sans', sans-serif";
    const fontSize = parseFloat(data.fontSize) || 12;

    const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));

    function section(title, body) {
      if (!body) return '';
      return `<section style="margin:0 0 13px;break-inside:avoid;">
        <div style="color:#2B3A2E;font-size:${Math.max(8, fontSize - 1)}px;font-weight:bold;letter-spacing:0.08em;
          text-transform:uppercase;border-bottom:1px solid #D4CFC4;padding-bottom:3px;margin-bottom:6px;">${esc(title)}</div>
        ${body}
      </section>`;
    }

    function renderEntries(items, renderer) {
      if (!Array.isArray(items) || !items.length) return '';
      return items.map(renderer).filter(Boolean).join('');
    }

    const skillsHTML = data.skills && String(data.skills).trim()
      ? `<div style="margin-bottom:8px;color:#1A1A18;font-size:${fontSize}px;">${String(data.skills).split(',').map(s => s.trim()).filter(Boolean).map(esc).join(' &bull; ')}</div>`
      : '';

    const workHTML = renderEntries(data.work || [], job => {
      if (!job || (!job.title && !job.company)) return '';
      return `<div style="margin-bottom:8px;font-size:${fontSize}px;">
        <div style="font-weight:bold;">${esc(job.title || '')}${job.company ? ' — ' + esc(job.company) : ''}</div>
        ${job.duration ? `<div style="font-size:${Math.max(8, fontSize - 1)}px;color:#7A776E;">${esc(job.duration)}</div>` : ''}
        ${job.desc ? `<div style="margin-top:2px;font-size:${Math.max(8, fontSize - 1)}px;">${esc(job.desc)}</div>` : ''}
      </div>`;
    });

    const eduHTML = renderEntries(data.edu || [], edu => {
      if (!edu || (!edu.school && !edu.course)) return '';
      return `<div style="margin-bottom:7px;font-size:${fontSize}px;">
        ${edu.school ? `<div style="font-weight:bold;">${esc(edu.school)}</div>` : ''}
        ${edu.course ? `<div>${esc(edu.course)}</div>` : ''}
        ${edu.year ? `<div style="font-size:${Math.max(8, fontSize - 1)}px;color:#7A776E;">${esc(edu.year)}</div>` : ''}
      </div>`;
    });

    const certHTML = renderEntries(data.certifications || [], cert => {
      if (!cert || (!cert.name && !cert.org)) return '';
      return `<div style="margin-bottom:7px;font-size:${fontSize}px;">
        ${cert.name ? `<div style="font-weight:bold;">${esc(cert.name)}</div>` : ''}
        ${cert.org ? `<div>${esc(cert.org)}</div>` : ''}
        ${cert.date ? `<div style="font-size:${Math.max(8, fontSize - 1)}px;color:#7A776E;">${esc(cert.date)}</div>` : ''}
      </div>`;
    });

    const awardHTML = renderEntries(data.awards || [], award => {
      if (!award || (!award.name && !award.issuer)) return '';
      return `<div style="margin-bottom:7px;font-size:${fontSize}px;">
        ${award.name ? `<div style="font-weight:bold;">${esc(award.name)}</div>` : ''}
        ${award.issuer ? `<div>${esc(award.issuer)}</div>` : ''}
        ${award.year ? `<div style="font-size:${Math.max(8, fontSize - 1)}px;color:#7A776E;">${esc(award.year)}</div>` : ''}
      </div>`;
    });

    const langHTML = renderEntries(data.languages || [], lang => {
      if (!lang || !lang.name) return '';
      return `<div style="margin-bottom:5px;font-size:${fontSize}px;">
        <span style="font-weight:bold;">${esc(lang.name)}</span>${lang.level ? ` — ${esc(lang.level)}` : ''}
      </div>`;
    });

    const contactParts = [];
    if (data.email) contactParts.push(`Email: ${esc(data.email)}`);
    if (data.phone) contactParts.push(`Phone: ${esc(data.phone)}`);
    if (data.location) contactParts.push(`Location: ${esc(data.location)}`);
    const personalHTML = contactParts.length
      ? `<div style="font-size:${Math.max(8, fontSize - 1)}px;color:#7A776E;line-height:1.6;">${contactParts.join('<br>')}</div>`
      : '';

    const customSectionsHTML = renderEntries(data.customSections || [], custom => {
      if (!custom) return '';
      const items = (custom.entries || []).filter(item => item && String(item).trim());
      if (!items.length) return '';
      const body = items.map(item => `<div style="font-size:${fontSize}px;color:#444;margin-bottom:3px;line-height:1.5;">&bull; ${esc(item)}</div>`).join('');
      return section(custom.name || 'Additional Information', body);
    });

    // Fixed identity header: name, job title, and photo are not movable sections.
    buildTextElement({
      classes: ['name'], text: data.name || 'Your Name',
      left: 40, top: 22, width: 540,
      fontSize: `${Math.round(fontSize * 34 / 12)}px`,
      fontFamily: "'DM Serif Display', serif", color: '#1A1A18'
    });

    buildTextElement({
      classes: ['jobtitle'],
      text: (data.jobtitle || 'Job Title') + (data.location ? ' · ' + data.location : ''),
      left: 40, top: 75, width: 500,
      fontSize: `${fontSize}px`, color: '#7A776E', fontFamily
    });

    if (data.photo) {
      buildImageElement({ src: data.photo, left: 670, top: 20, width: 100, height: 100, borderRadius: '6px' });
    }

    buildHtmlElement({
      left: 40, top: 120, width: 714,
      html: '<div style="height:1px;background:#D4CFC4;"></div>'
    });

    // Summary remains fixed above the movable two-column section area.
    const summaryHTML = data.summary && String(data.summary).trim()
      ? `<div style="font-size:${fontSize}px;margin:0 0 13px;color:#1A1A18;line-height:1.6;">${esc(data.summary)}</div>`
      : '';

    const sectionRenderers = {
      'sec-personal': () => section('Contact', personalHTML),
      'sec-work': () => section('Work Experience', workHTML),
      'sec-edu': () => section('Education', eduHTML),
      'sec-cert': () => section('Certifications', certHTML),
      'sec-awards': () => section('Awards & Achievements', awardHTML),
      'sec-languages': () => section('Languages', langHTML),
      'sec-skills': () => section('Skills', skillsHTML),
      'sec-custom': () => customSectionsHTML
    };

    const defaultOrder = [
      'sec-personal', 'sec-work', 'sec-edu', 'sec-cert',
      'sec-awards', 'sec-languages', 'sec-skills', 'sec-custom'
    ];
    const savedOrder = Array.isArray(data.sectionOrder) ? data.sectionOrder : defaultOrder;
    const order = [...new Set(savedOrder.filter(id => defaultOrder.includes(id)))];
    defaultOrder.forEach(id => { if (!order.includes(id)) order.push(id); });

    // Template 3 keeps its original full-width look by default. If the user
    // assigns any section to the sidebar, the content becomes two columns.
    const defaultColumns = {
      'sec-personal': 'main', 'sec-work': 'main', 'sec-edu': 'main',
      'sec-cert': 'main', 'sec-awards': 'main', 'sec-languages': 'main',
      'sec-skills': 'main', 'sec-custom': 'main'
    };
    const columns = { ...defaultColumns, ...(data.sectionColumns || {}) };
    const sideParts = [];
    const mainParts = [];

    order.forEach(id => {
      const renderer = sectionRenderers[id];
      if (!renderer) return;
      const html = renderer();
      if (!html) return;
      (columns[id] === 'side' ? sideParts : mainParts).push(html);
    });

    const hasSidebar = sideParts.length > 0;
    const contentHTML = `<div style="font-family:${fontFamily};font-size:${fontSize}px;color:#1A1A18;line-height:1.6;box-sizing:border-box;width:100%;">
      ${summaryHTML}
      <div style="display:grid;grid-template-columns:${hasSidebar ? '220px minmax(0,1fr)' : 'minmax(0,1fr)'};gap:${hasSidebar ? '24px' : '0'};align-items:start;">
        <div class="resume-side-column">${sideParts.join('')}</div>
        <div class="resume-main-column">${mainParts.join('')}</div>
      </div>
    </div>`;

    buildHtmlElement({
      left: 40, top: 132, width: 714,
      classes: ['main-body'],
      html: contentHTML
    });
  }
});