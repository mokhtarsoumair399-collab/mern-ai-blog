# AI-MERN-Blog

A full-stack MERN blog application with TypeScript, JWT auth via HttpOnly cookies, Markdown editing, post CRUD, and Google Gemini-powered post generation.

## Structure

```txt
mern-ai-blog/
├── backend/
└── frontend/
```

## Quick Start

1. Install dependencies:

```bash
npm install
npm run install:all
```

2. Copy env files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Update `backend/.env` with MongoDB, JWT, and Gemini values. The default model is `gemini-2.0-flash-lite`; replace it with any model available to your key that supports `generateContent`.

4. Run both apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

## Professional Publishing Features

- Editorial homepage with featured story, topic index, newsletter section, and latest articles.
- Archive page with search, category filters, tag filters, sort by latest/popular/oldest, and article counts.
- Article pages with table of contents, reading time, view counts, share link, author box, tags, and related posts.
- Author dashboard with total posts, published/draft counts, view totals, status filters, and content library actions.
- Editor workspace with Markdown preview, featured-post toggle, image upload, AI draft insertion, and editorial quality checklist.
- Backend metadata endpoints for categories, tags, featured posts, author stats, related posts, and view tracking.

## Gemini Prompt Template

The backend asks Gemini to return strict JSON with `title`, `metaDescription`, `content`, and `tags`. The prompt is in `backend/src/utils/gemini.ts` and includes tone, length, topic, markdown structure, SEO, and table-friendly formatting guidance.

If `AI_DEMO_FALLBACK=true`, quota failures return a structured local draft so the editor remains usable while you configure Gemini billing/quota.
