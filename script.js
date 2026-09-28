const btn = document.getElementById('analyzeBtn');
    const statusEl = document.getElementById('status');
    const errorEl = document.getElementById('error');
    const resultsEl = document.getElementById('results');

    let currentJd = '';
    let currentResume = '';
    let currentAnalysis = null;

    // --- Theme toggle (light/dark) with SVG icons ---
    const themeToggle = document.getElementById('themeToggle');
    const htmlEl = document.documentElement;

    const sunIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
    const moonIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

    function applyTheme(theme) {
      if (theme === 'light') {
        htmlEl.setAttribute('data-theme', 'light');
        themeToggle.innerHTML = moonIcon;
      } else {
        htmlEl.removeAttribute('data-theme');
        themeToggle.innerHTML = sunIcon;
      }
    }

    const savedTheme = localStorage.getItem('applyready-theme') ||
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
      const isLight = htmlEl.getAttribute('data-theme') === 'light';
      const next = isLight ? 'dark' : 'light';
      applyTheme(next);
      localStorage.setItem('applyready-theme', next);
    });

    // --- About modal ---
    const aboutToggle = document.getElementById('aboutToggle');
    const aboutModal = document.getElementById('aboutModal');
    const aboutClose = document.getElementById('aboutClose');

    aboutToggle.addEventListener('click', () => { aboutModal.style.display = 'flex'; });
    aboutClose.addEventListener('click', () => { aboutModal.style.display = 'none'; });
    aboutModal.addEventListener('click', (e) => {
      if (e.target === aboutModal) aboutModal.style.display = 'none';
    });

    // --- Resume file upload (PDF, DOCX, TXT) ---
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    const fileNameEl = document.getElementById('fileName');
    const parseStatusEl = document.getElementById('parseStatus');
    const resumeTextarea = document.getElementById('resume');

    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      fileNameEl.textContent = file.name;
      errorEl.style.display = 'none';
      parseStatusEl.style.display = 'block';
      parseStatusEl.textContent = 'Reading file...';

      try {
        const ext = file.name.split('.').pop().toLowerCase();
        let text = '';

        if (ext === 'txt') {
          text = await file.text();
        } else if (ext === 'docx') {
          const arrayBuffer = await file.arrayBuffer();
          const result = await window.mammoth.extractRawText({ arrayBuffer });
          text = result.value;
        } else if (ext === 'pdf') {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const pageTexts = [];
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(' ');
            pageTexts.push(pageText);
          }
          text = pageTexts.join('\n\n');
        } else {
          throw new Error('Unsupported file type. Please use PDF, DOCX, or TXT.');
        }

        if (!text.trim()) {
          throw new Error('Could not extract any text from this file. Try pasting instead.');
        }

        resumeTextarea.value = text.trim();
        parseStatusEl.textContent = `Loaded from ${file.name} — feel free to edit below.`;
      } catch (err) {
        parseStatusEl.style.display = 'none';
        errorEl.textContent = 'Could not read file: ' + err.message;
        errorEl.style.display = 'block';
        fileNameEl.textContent = '';
      }
    });

    btn.addEventListener('click', async () => {
      const jd = document.getElementById('jd').value.trim();
      const resume = document.getElementById('resume').value.trim();

      errorEl.style.display = 'none';
      resultsEl.style.display = 'none';
      document.getElementById('rewriteSection').style.display = 'none';

      if (!jd || !resume) {
        errorEl.textContent = 'Please paste both a job description and a resume.';
        errorEl.style.display = 'block';
        return;
      }

      btn.disabled = true;
      statusEl.style.display = 'block';

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jd, resume })
        });

        if (!res.ok) throw new Error('Server error: ' + res.status);
        const data = await res.json();

        currentJd = jd;
        currentResume = resume;
        currentAnalysis = data;

        if (window.va) window.va('event', { name: 'analyze_gap_used' });

        renderResults(data);
      } catch (err) {
        errorEl.textContent = 'Something went wrong: ' + err.message;
        errorEl.style.display = 'block';
      } finally {
        btn.disabled = false;
        statusEl.style.display = 'none';
      }
    });

    function renderResults(data) {
      const scoreBadge = document.getElementById('scoreBadge');
      const score = data.fit_score;
      scoreBadge.textContent = score + '/10';
      scoreBadge.className = 'score-badge ' + (score >= 7 ? 'score-good' : score >= 4 ? 'score-mid' : 'score-bad');

      document.getElementById('fitSummary').textContent = data.fit_summary;

      const chipsEl = document.getElementById('keywordChips');
      chipsEl.innerHTML = '';
      (data.missing_keywords || []).forEach(kw => {
        const span = document.createElement('span');
        span.className = 'chip';
        span.textContent = kw;
        chipsEl.appendChild(span);
      });

      const bulletsEl = document.getElementById('bulletsContainer');
      bulletsEl.innerHTML = '';
      (data.weak_bullets || []).forEach(b => {
        const block = document.createElement('div');
        block.className = 'bullet-block';
        block.innerHTML = `
      <div class="bad-line">❌ <span>${escapeHtml(b.original)}</span></div>
      <div class="issue-line">⚠️ ${escapeHtml(b.issue)}</div>
      <div class="good-line">✅ <span>${escapeHtml(b.rewrite)}</span></div>
    `;
        bulletsEl.appendChild(block);
      });

      resultsEl.style.display = 'block';
    }

    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    // --- Resume rewrite ---
    const generateBtn = document.getElementById('generateResumeBtn');
    const rewriteStatus = document.getElementById('rewriteStatus');
    const rewriteSection = document.getElementById('rewriteSection');
    const rewriteTextarea = document.getElementById('rewriteTextarea');

    generateBtn.addEventListener('click', async () => {
      if (!currentAnalysis) return;

      errorEl.style.display = 'none';
      generateBtn.disabled = true;
      rewriteStatus.style.display = 'block';
      rewriteSection.style.display = 'none';

      try {
        const res = await fetch('/api/rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resume: currentResume, jd: currentJd, analysis: currentAnalysis })
        });

        if (!res.ok) throw new Error('Server error: ' + res.status);
        const data = await res.json();

        rewriteTextarea.value = data.rewritten_resume;
        rewriteSection.style.display = 'block';
      } catch (err) {
        errorEl.textContent = 'Could not generate improved resume: ' + err.message;
        errorEl.style.display = 'block';
      } finally {
        generateBtn.disabled = false;
        rewriteStatus.style.display = 'none';
      }
    });

    // --- Download as PDF ---
    document.getElementById('downloadPdfBtn').addEventListener('click', () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: 'pt', format: 'letter' });
      const text = rewriteTextarea.value;
      const margin = 48;
      const maxWidth = 612 - margin * 2;
      const lines = doc.splitTextToSize(text, maxWidth);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);

      let y = margin;
      const lineHeight = 14;
      const pageHeight = 792;

      lines.forEach(line => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });

      doc.save('improved-resume.pdf');
    });

    // --- Download as Word ---
    document.getElementById('downloadWordBtn').addEventListener('click', () => {
      const text = rewriteTextarea.value;
      const htmlLines = text.split('\n').map(line => `<p>${escapeHtml(line) || '&nbsp;'}</p>`).join('');
      const htmlContent = `
    <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Calibri, Arial, sans-serif; font-size: 11pt;">
        ${htmlLines}
      </body>
    </html>`;

      const converted = window.htmlDocx.asBlob(htmlContent);
      const url = URL.createObjectURL(converted);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'improved-resume.doc';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
