# File Agent

A small Next.js app: upload a PDF, Word, Excel, CSV or text file and ask Claude questions about it.

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Name | Required | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | yes | Claude API key |
| `BLOB_READ_WRITE_TOKEN` | no | If set, uploaded files are also stored in Vercel Blob |

## Deploy

Import the repo in Vercel and add the environment variables above.

## Notes

- Max upload size is 4 MB (Vercel request body limit).
- Supported types: `.pdf`, `.docx`, `.xlsx`, `.xls`, `.csv`, `.txt`, `.md`, `.json`.
