# DocuSage 📚🤖

*A free, self-hosted RAG agent that lets you chat with your own document library — through a web UI or Telegram.*

[فارسی 🇮🇷](./README.fa.md) · [Setup & Usage Guide](./GUIDE.md)

---

## What is this, really?

DocuSage started as a simple idea: *"I have a pile of books and papers I care about — why can't I just ask them questions?"*

So this repo glues together three things:

1. **A knowledge base** — your documents, chunked and embedded into [AstraDB](https://www.datastax.com/products/datastax-astra) (a free-tier, serverless vector database).
2. **A retrieval-augmented chatbot** — built on [Hono](https://hono.dev/) and running on Cloudflare Workers, available both as a **web app** and a **Telegram bot**, powered by Google Gemini.
3. **An ingestion pipeline** — the part that actually turns raw PDFs into clean, searchable, structured content in the first place.

The whole thing is designed to run on free tiers only. No paid servers, no paid database, no subscription API you forgot to cancel. If you can get a Cloudflare account, a free AstraDB instance, and a Gemini API key, you can run this.

It also has first-class support for **Persian (Farsi)** and right-to-left text, since that's what it was originally built for — but nothing about it is Persian-specific under the hood.

---

## The three pieces

### 1. The chatbot (Cloudflare Worker + Telegram bot)

This is the part people actually talk to.

- **Web interface** — semantic search over your library, plus a chat window that blends vector search results with live web search for grounded, cited-feeling answers. RTL-aware, renders Markdown properly, shows you which document/section an answer came from.
- **Telegram bot** — the same brain, but in your pocket. `/search` for a quick web lookup, `/chat` for a full RAG conversation with your knowledge base.

Both are driven by the same worker file and share the same retrieval + generation logic underneath.

### 2. Data ingestion notebook (`DocuSage_Data_Ingestion.ipynb`)

The original Colab notebook for getting documents *into* AstraDB: loads PDFs/DOCX/TXT, splits them into chunks, embeds them with Gemini, tags and summarizes each chunk, and pushes everything into your vector collection. Good for general-purpose document libraries.

### 3. 🆕 OCR + SQL pipeline (`docusage_ocr_sql_pipeline.py`)

This is the newest addition, and it solves a more specific, more annoying problem: **turning a folder of scanned/PDF books into a clean, de-duplicated, database-ready library** — without you babysitting it or accidentally processing the same book five times because it had a slightly different filename.

In plain terms, for every PDF it finds, it will:

- **Detect the language** by OCR-ing a single midpoint page first (cheap, fast, no wasted API calls on the whole book).
- **Run full OCR** through Mistral's document AI, chunking huge PDFs automatically so it never chokes on a 1,000-page scan.
- **Build a proper Markdown file** — headings get anchors, a Table of Contents is auto-generated, and Persian/Arabic script is preserved correctly in anchor links (a detail most auto-TOC tools get wrong).
- **Export a matching `.docx`**, so there's a human-friendly version too, not just Markdown.
- **Pull out metadata with an LLM** — title (Latin & Persian), author, translator, publisher, date, a short description, and even SEO-style tags/category — all in structured JSON. If a translated philosophy work doesn't credit its translator explicitly, it'll even try to reason out who it likely was, using its background knowledge of major Persian translators.
- **Check for duplicates, five different ways**, before it wastes any real work:
  1. Exact filename already known
  2. Identical file hash (catches renamed copies)
  3. Identical content fingerprint (catches re-scans of the same pages)
  4. An LLM semantic check comparing titles/authors/translators against everything already processed (catches "G.W.F. Hegel" vs. "Georg Wilhelm Friedrich Hegel" type near-duplicates)
  5. A check for leftover `.docx`/`.md` output files already on disk from a previous run
- **Write ready-to-import SQL** — `INSERT` statements for a `books` table, a `book_contents` table (one row per section), and a `wp_sync` table if you're planning to publish to a WordPress site.
- **Survive interruptions and rate limits gracefully** — it rotates through a list of Gemini API keys and falls back through several models before finally falling back to Mistral if every Gemini option is exhausted. If it crashes partway through a book, it won't silently re-process it and duplicate work next run.

This script is meant to run in **Google Colab**, reading PDFs from a Google Drive folder and writing Markdown/DOCX/SQL output back to Drive. See the [Guide](./GUIDE.md) for the full walkthrough.

---

## Key technologies

| Piece | What it's for |
|---|---|
| **Hono** | Lightweight web framework running on Cloudflare Workers |
| **Google Gemini** | Embeddings, chat responses, metadata extraction, translation |
| **Mistral OCR** | Turning scanned/PDF books into structured Markdown |
| **AstraDB** | Serverless vector database for semantic search |
| **Cloudflare Workers AI** | Fallback for summarization/keyword extraction if Gemini is unavailable |
| **DuckDuckGo / Google Search** | General web search inside the Telegram bot |
| **Tailwind CSS + markdown-it** | Web UI styling and Markdown rendering |
| **PyMuPDF (`fitz`), python-docx** | PDF splitting/inspection and `.docx` generation in the pipeline |

---

## Project structure

```
DocuSage/
├── worker.js                          # Cloudflare Worker: web UI + Telegram bot + API routes
├── DocuSage_Data_Ingestion.ipynb       # Colab notebook: general document → AstraDB ingestion
├── docusage_ocr_sql_pipeline.py        # Colab script: PDF → OCR → metadata → dedup → SQL dump
├── README.md                           # You are here
├── README.fa.md                        # فارسی
└── GUIDE.md                            # Step-by-step setup & usage guide
```

---

## Quick start

The short version — for the full version with every environment variable explained, go to the [Guide](./GUIDE.md).

```bash
git clone https://github.com/mehdihoore/DocuSage
cd DocuSage
npm install
```

Create a `.dev.vars` file with your keys (Gemini, AstraDB, Telegram, Google Search) — **never commit this file**, it should already be in `.gitignore`. Then:

```bash
npx wrangler dev      # try it locally
npx wrangler deploy   # ship it to Cloudflare
```

Point your Telegram bot's webhook at the deployed URL, populate AstraDB (via the notebook, or the OCR pipeline if you're working with scanned books), and you're live.

---

## A note on secrets

Every credential this project touches — Gemini keys, AstraDB tokens, Telegram bot tokens, Mistral keys — should live in `.dev.vars` locally and in your Cloudflare dashboard's environment variables in production. Never paste them into commits, issues, or chat logs. If a key is ever exposed, revoke and regenerate it immediately at the relevant provider's dashboard.

---

## Contributing

This is a personal/small project, but issues and pull requests are welcome — especially around better dedup heuristics, more language support, or making the ingestion pipeline runnable outside Colab.

## License

No license file is currently published in this repository — treat the code as "all rights reserved" unless the author adds one, and reach out via GitHub if you want to use it beyond personal reference.
