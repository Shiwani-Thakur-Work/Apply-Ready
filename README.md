# JD-to-Resume Gap Analyzer

A web tool that compares a job description against a resume, surfaces the gaps, and generates an improved, downloadable version of the resume.

**Live demo:** [jd-to-resume-gap-analyzer.vercel.app](https://jd-to-resume-gap-analyzer.vercel.app)

## Project Evolution

This started as a small, focused v1 and grew based on actually using it:

**v1 — Diagnose**
Paste a job description and resume, get back missing keywords, weak bullet points, and a fit score. The goal was a fast, honest diagnostic — not just a generic match percentage.

**v2 — Diagnose + Fix + Export**
Using v1 surfaced an obvious next question: "okay, so now what do I do about it?" v2 closes that loop:
- Upload a resume file directly (PDF/DOCX/TXT), not just paste
- Generate a full improved resume based on the diagnosis, with an editable review step
- Download the result as PDF or Word
- Basic usage analytics to see if the tool is actually being used, not just visited

See **Next Steps** below for where this goes from here.

## Why

Most resume-JD comparisons are done manually, which means missed keywords and vague bullet points slip through unnoticed. This tool automates the comparison, flags specific gaps, and closes the loop by generating a rewritten resume — rather than stopping at a generic match score.

## Features

**Analysis**
- Upload a resume (PDF, DOCX, or TXT) or paste it directly
- Instant gap analysis against a pasted job description
- Missing keywords/skills relevant to the role
- Weak bullet points flagged with specific rewrite suggestions
- Overall fit score with a short summary

**Resume rewrite**
- One-click generation of a full improved resume based on the gap analysis
- Editable review step before export — AI output is meant to be checked, not blindly trusted
- Download as PDF (ready to send) or Word (for further manual edits)

## Tech Stack

- **Frontend:** HTML, CSS, vanilla JavaScript
- **Backend:** Vercel serverless functions (Node.js)
- **AI:** Google Gemini API (`gemini-3.6-flash`)
- **File parsing:** pdf.js (PDF), mammoth.js (DOCX)
- **Export:** jsPDF (PDF), html-docx-js (Word)
- **Analytics:** Vercel Web Analytics
- **Hosting:** Vercel

## Setup

1. Clone the repo
   ```
   git clone <your-repo-url>
   cd gap-analyzer
   ```

2. Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

3. Deploy to Vercel and add the API key as an environment variable (enable it for Production, Preview, and Development):
   - Variable name: `GEMINI_API_KEY`
   - Value: your key from step 2

4. Or run locally with the Vercel CLI:
   ```
   npm install -g vercel
   vercel dev
   ```

## Project Structure

```
├── index.html          # Frontend UI
├── api/
│   ├── analyze.js      # Gap analysis — calls the Gemini API
│   └── rewrite.js       # Resume rewrite — calls the Gemini API
└── package.json
```

## Roadmap / Known Limitations

- Single resume/JD comparison per run — no saved history across sessions
- Resume rewrite is a full-document regeneration, not a targeted diff
- PDF export uses plain text formatting rather than a styled resume template
- Free-tier Gemini quota is limited to 20 requests/day per project

## Next Steps (Future Scope)

- **Rename** — the tool has grown past "gap analysis" into diagnose + rewrite + export, so a name change (candidates under consideration: Resume Fit Analyzer, JD Match & Rewrite, ApplyReady, FitCheck) better reflects the full flow
- Persistent history so users can revisit past analyses
- Styled PDF export using an actual resume template instead of plain text
- Targeted bullet-level rewrite diffs instead of full-resume regeneration, to reduce unintended changes elsewhere in the document
- UI polish: light/dark mode toggle, smoother loading states, mobile layout refinement
- Side-by-side before/after resume view instead of a single editable textarea