# JD-to-Resume Gap Analyzer

A lightweight web tool that compares a job description against a resume and surfaces the gaps — missing keywords, weak bullet points, and rewrite suggestions — to help candidates tailor their applications more effectively.

## Why

Most resume-JD comparisons are done manually, which means missed keywords and vague bullet points slip through unnoticed. This tool automates that comparison and gives specific, actionable feedback instead of a generic match score.

## Features

- Paste a job description and resume, get instant analysis
- Highlights missing keywords/skills relevant to the role
- Flags weak bullet points with specific rewrite suggestions
- Overall fit score with a short summary

## Tech Stack

- **Frontend:** HTML, CSS, vanilla JavaScript
- **Backend:** Vercel serverless function (Node.js)
- **AI:** Google Gemini API (2.5 Flash)
- **Hosting:** Vercel

## Setup

1. Clone the repo
   ```
   git clone <your-repo-url>
   cd gap-analyzer
   ```

2. Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

3. Deploy to Vercel and add the API key as an environment variable:
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
│   └── analyze.js      # Serverless function calling the Gemini API
└── package.json
```

## Roadmap / Known Limitations

- Paste-only input (no file upload yet)
- No saved history across sessions
- Single resume/JD comparison per run

## License

MIT
