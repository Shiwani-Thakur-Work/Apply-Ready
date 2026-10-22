const btn = document.getElementById('analyzeBtn');
const statusEl = document.getElementById('status');
const statusMessageEl = document.getElementById('statusMessage');
const errorEl = document.getElementById('error');
const resultsEl = document.getElementById('results');
const jdTextarea = document.getElementById('jd');
const resumeTextarea = document.getElementById('resume');
const jdCountEl = document.getElementById('jdCount');
const resumeCountEl = document.getElementById('resumeCount');
const sampleDataBtn = document.getElementById('sampleDataBtn');
const clearBtn = document.getElementById('clearBtn');
const toastEl = document.getElementById('toast');

let currentJd = '';
let currentResume = '';
let currentAnalysis = null;
let statusInterval = null;

// --- Toast Notification Helper ---
let toastTimeout = null;
function showToast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2200);
}

// --- Clipboard Copy Helper ---
async function copyText(text, successMsg = 'Copied to clipboard!') {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const tempArea = document.createElement('textarea');
      tempArea.value = text;
      tempArea.style.position = 'fixed';
      tempArea.style.left = '-9999px';
      document.body.appendChild(tempArea);
      tempArea.select();
      document.execCommand('copy');
      document.body.removeChild(tempArea);
    }
    showToast(successMsg);
  } catch (err) {
    showToast('Failed to copy');
  }
}

// --- Word / Char Counter ---
function countWords(str) {
  const trimmed = str.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function updateCounts() {
  const jdWords = countWords(jdTextarea.value);
  const resumeWords = countWords(resumeTextarea.value);
  jdCountEl.textContent = `${jdWords} word${jdWords === 1 ? '' : 's'}`;
  resumeCountEl.textContent = `${resumeWords} word${resumeWords === 1 ? '' : 's'}`;

  if (jdTextarea.value || resumeTextarea.value) {
    clearBtn.style.display = 'inline-flex';
  } else {
    clearBtn.style.display = 'none';
  }
}

jdTextarea.addEventListener('input', updateCounts);
resumeTextarea.addEventListener('input', updateCounts);

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

// --- Sample Data Loader ---
const SAMPLE_JD = `Senior Product Manager — AI & Developer Platform
CloudScale Systems · New York, NY (Hybrid / Remote)

About the Role:
We are seeking a Senior Product Manager to lead our developer platform, AI workflow integrations, and enterprise API ecosystems. You will define the roadmap for our developer APIs and partner closely with engineering to build low-latency ML tooling.

Responsibilities:
• Define product vision and deliver high-impact APIs, SDKs, and developer workflows.
• Collaborate with ML engineering, research, and design to ship enterprise LLM workflows.
• Drive customer discovery and conduct user interviews with engineering leaders.
• Define north star metrics, adoption funnels, and monitor SLA performance (99.99%).

Qualifications:
• 4+ years of Product Management experience in SaaS, developer tooling, or AI platforms.
• Proven track record launching API-first products from 0 to 1 with cross-functional technical teams.
• Strong analytical chops: SQL, Amplitude/Mixpanel, and A/B experimentation frameworks.
• Experience managing agile sprints, writing clear technical PRDs, and developer documentation.
• Outstanding stakeholder management and communication skills.`;

const SAMPLE_RESUME = `Alex Morgan
alex.morgan@email.com · (555) 019-2834 · New York, NY · linkedin.com/in/alexmorgan-pm

SUMMARY
Product Manager with 4 years of experience shipping B2B SaaS software and workflow automations. Passionate about developer workflows, data-driven prioritization, and cross-functional leadership.

EXPERIENCE
Product Manager | NexaTech Solutions | 2022 – Present
• Managed product backlog and roadmap for internal workflow software.
• Worked with developers and designers to release updates on a bi-weekly cadence.
• Looked at customer feedback to decide what features we should build next.
• Increased user engagement by launching a redesigned dashboard experience.

Associate Product Manager | DataFlow Systems | 2020 – 2022
• Authored PRDs and user stories for reporting dashboard used by 15,000 monthly active users.
• Collaborated with QA team to test features and reduce production bugs.
• Helped organize sprint planning meetings and daily standups.

SKILLS & EDUCATION
Skills: Product Strategy, Agile / Scrum, User Stories, PRDs, Jira, Confluence, Figma, SQL basics, User Interviews, Cross-Functional Team Leadership.
Education: B.S. in Information Systems, State University.`;

sampleDataBtn.addEventListener('click', () => {
  jdTextarea.value = SAMPLE_JD;
  resumeTextarea.value = SAMPLE_RESUME;
  fileNameEl.textContent = '';
  parseStatusEl.style.display = 'none';
  errorEl.style.display = 'none';
  updateCounts();
  showToast('Loaded sample job description & resume!');
});

clearBtn.addEventListener('click', () => {
  jdTextarea.value = '';
  resumeTextarea.value = '';
  fileNameEl.textContent = '';
  parseStatusEl.style.display = 'none';
  errorEl.style.display = 'none';
  resultsEl.style.display = 'none';
  document.getElementById('rewriteSection').style.display = 'none';
  updateCounts();
  showToast('Cleared fields');
});

// --- Resume file parsing (PDF, DOCX, TXT) ---
if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const fileNameEl = document.getElementById('fileName');
const parseStatusEl = document.getElementById('parseStatus');
const dropZone = document.getElementById('dropZone');

uploadBtn.addEventListener('click', () => fileInput.click());

async function handleFile(file) {
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
    updateCounts();
    showToast(`Loaded ${file.name}`);
  } catch (err) {
    parseStatusEl.style.display = 'none';
    errorEl.textContent = 'Could not read file: ' + err.message;
    errorEl.style.display = 'block';
    fileNameEl.textContent = '';
  }
}

fileInput.addEventListener('change', (e) => {
  handleFile(e.target.files[0]);
});

// Drag & Drop Handling on Resume Area
['dragenter', 'dragover'].forEach(evt => {
  resumeTextarea.addEventListener(evt, (e) => {
    e.preventDefault();
    e.stopPropagation();
    resumeTextarea.classList.add('drag-active');
  });
});

['dragleave', 'drop'].forEach(evt => {
  resumeTextarea.addEventListener(evt, (e) => {
    e.preventDefault();
    e.stopPropagation();
    resumeTextarea.classList.remove('drag-active');
  });
});

resumeTextarea.addEventListener('drop', (e) => {
  const dt = e.dataTransfer;
  if (dt && dt.files && dt.files.length) {
    handleFile(dt.files[0]);
  }
});

// --- Dynamic Status Text Cycler ---
const STATUS_STEPS = [
  'Extracting requirements from job description...',
  'Evaluating resume qualifications & impact...',
  'Calculating keyword match & identifying gaps...',
  'Generating bullet rewrite suggestions...'
];

function startStatusCycle() {
  let step = 0;
  if (statusMessageEl) statusMessageEl.textContent = STATUS_STEPS[0];
  statusEl.style.display = 'flex';

  clearInterval(statusInterval);
  statusInterval = setInterval(() => {
    step = (step + 1) % STATUS_STEPS.length;
    if (statusMessageEl) statusMessageEl.textContent = STATUS_STEPS[step];
  }, 2000);
}

function stopStatusCycle() {
  clearInterval(statusInterval);
  statusEl.style.display = 'none';
}

// --- Analyze Button Click ---
btn.addEventListener('click', async () => {
  const jd = jdTextarea.value.trim();
  const resume = resumeTextarea.value.trim();

  errorEl.style.display = 'none';
  resultsEl.style.display = 'none';
  document.getElementById('rewriteSection').style.display = 'none';

  if (!jd || !resume) {
    errorEl.textContent = 'Please paste both a job description and a resume.';
    errorEl.style.display = 'block';
    return;
  }

  btn.disabled = true;
  startStatusCycle();

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
    stopStatusCycle();
  }
});

// --- Render Results ---
function renderResults(data) {
  const scoreBadge = document.getElementById('scoreBadge');
  const scoreBarFill = document.getElementById('scoreBarFill');
  const score = data.fit_score || 0;
  
  scoreBadge.textContent = score + '/10';
  const scoreClass = score >= 7 ? 'score-good' : score >= 4 ? 'score-mid' : 'score-bad';
  scoreBadge.className = 'score-badge ' + scoreClass;

  if (scoreBarFill) {
    scoreBarFill.style.width = `${Math.min(Math.max(score * 10, 5), 100)}%`;
    scoreBarFill.style.background = score >= 7 ? 'var(--good)' : score >= 4 ? 'var(--mid)' : 'var(--bad)';
  }

  document.getElementById('fitSummary').textContent = data.fit_summary || '';

  // Render Missing Keyword Chips
  const chipsEl = document.getElementById('keywordChips');
  chipsEl.innerHTML = '';
  const keywords = data.missing_keywords || [];
  keywords.forEach(kw => {
    const span = document.createElement('span');
    span.className = 'chip';
    span.textContent = kw;
    span.title = 'Click to copy keyword';
    span.addEventListener('click', () => {
      copyText(kw, `Copied "${kw}"!`);
    });
    chipsEl.appendChild(span);
  });

  // Render Weak Bullets with Copy action
  const bulletsEl = document.getElementById('bulletsContainer');
  bulletsEl.innerHTML = '';
  (data.weak_bullets || []).forEach(b => {
    const block = document.createElement('div');
    block.className = 'bullet-block';
    
    const badDiv = document.createElement('div');
    badDiv.className = 'bad-line';
    badDiv.innerHTML = `<span>❌</span> <span>${escapeHtml(b.original)}</span>`;

    const issueDiv = document.createElement('div');
    issueDiv.className = 'issue-line';
    issueDiv.innerHTML = `⚠️ ${escapeHtml(b.issue)}`;

    const goodWrapper = document.createElement('div');
    goodWrapper.className = 'good-line-wrapper';

    const goodDiv = document.createElement('div');
    goodDiv.className = 'good-line';
    goodDiv.innerHTML = `<span>✅</span> <span>${escapeHtml(b.rewrite)}</span>`;

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'copy-bullet-btn';
    copyBtn.textContent = 'Copy rewrite';
    copyBtn.addEventListener('click', () => {
      copyText(b.rewrite, 'Copied bullet rewrite!');
    });

    goodWrapper.appendChild(goodDiv);
    goodWrapper.appendChild(copyBtn);

    block.appendChild(badDiv);
    block.appendChild(issueDiv);
    block.appendChild(goodWrapper);
    bulletsEl.appendChild(block);
  });

  resultsEl.style.display = 'block';
  resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// Copy All Keywords button
const copyKeywordsBtn = document.getElementById('copyKeywordsBtn');
if (copyKeywordsBtn) {
  copyKeywordsBtn.addEventListener('click', () => {
    if (!currentAnalysis || !currentAnalysis.missing_keywords) return;
    const kwText = currentAnalysis.missing_keywords.join(', ');
    copyText(kwText, 'Copied all missing keywords!');
  });
}

// --- Resume rewrite ---
const generateBtn = document.getElementById('generateResumeBtn');
const rewriteStatus = document.getElementById('rewriteStatus');
const rewriteSection = document.getElementById('rewriteSection');
const rewriteTextarea = document.getElementById('rewriteTextarea');
const copyResumeBtn = document.getElementById('copyResumeBtn');
const copyResumeTopBtn = document.getElementById('copyResumeTopBtn');

generateBtn.addEventListener('click', async () => {
  if (!currentAnalysis) return;

  errorEl.style.display = 'none';
  generateBtn.disabled = true;
  rewriteStatus.style.display = 'flex';
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
    rewriteSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (err) {
    errorEl.textContent = 'Could not generate improved resume: ' + err.message;
    errorEl.style.display = 'block';
  } finally {
    generateBtn.disabled = false;
    rewriteStatus.style.display = 'none';
  }
});

// Copy Rewritten Resume Handlers
if (copyResumeBtn) {
  copyResumeBtn.addEventListener('click', () => {
    copyText(rewriteTextarea.value, 'Copied full rewritten resume!');
  });
}

if (copyResumeTopBtn) {
  copyResumeTopBtn.addEventListener('click', () => {
    copyText(rewriteTextarea.value, 'Copied full rewritten resume!');
  });
}

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
  showToast('Downloaded PDF');
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
  showToast('Downloaded Word document');
});

// Initial count update in case browser restored form inputs
updateCounts();
