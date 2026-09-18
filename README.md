# JD-to-Resume Gap Analyzer

A web tool that compares a job description against a resume, surfaces the gaps, and generates an improved, downloadable version of the resume.

**Live demo:** [jd-to-resume-gap-analyzer.vercel.app](https://jd-to-resume-gap-analyzer.vercel.app)

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