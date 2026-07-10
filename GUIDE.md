# DocuSage — Setup & Usage Guide

*A practical, no-nonsense walkthrough for getting DocuSage running end to end — the chatbot, the general ingestion notebook, and the newer OCR/SQL pipeline.*

[← Back to README](./README.md) · [فارسی](./README.fa.md)

---

## Before you start: what you'll need accounts for

Everything here is free-tier friendly, but you do need accounts on a handful of services. Grab these first so you're not context-switching halfway through:

| Service | What it's for | Free tier? |
|---|---|---|
| [Cloudflare](https://dash.cloudflare.com/sign-up) | Hosts the Worker (web UI + Telegram bot + API) | Yes |
| [Google AI Studio](https://aistudio.google.com/) | Gemini API keys (embeddings, chat, metadata) | Yes |
| [DataStax Astra](https://astra.datastax.com/) | AstraDB — your vector database | Yes |
| [Telegram BotFather](https://t.me/BotFather) | Creates your bot and gives you a token | Free |
| [Google Custom Search](https://programmablesearchengine.google.com/) | Fallback web search if DuckDuckGo fails | Yes (limited) |
| [Mistral AI](https://console.mistral.ai/) | Only needed for the OCR pipeline | Yes (limited) |

---

## Part 1 — Getting the chatbot running

### 1.1 Clone and install

```bash
git clone https://github.com/mehdihoore/DocuSage
cd DocuSage
npm install
```

### 1.2 Create your local secrets file

Make a file called `.dev.vars` in the project root:

```
GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_KEY_WEB=your_gemini_web_api_key
GEMINI_API_KEYTR=your_gemini_translate_api_key
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CSE_ID=your_google_cse_id
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
ASTRA_DB_ENDPOINT=your_astra_db_endpoint
ASTRA_KEYSPACE=your_astra_keyspace
ASTRA_COLLECTION_NAME=your_astra_collection_name
ASTRA_DB_TOKEN=your_astra_db_token
```

A couple of things worth knowing:

- `GEMINI_API_KEY` and `GEMINI_API_KEY_WEB` are separate on purpose — it keeps your Telegram bot's usage and your web app's usage from fighting over the same rate limit.
- `.dev.vars` is **local only**. Double-check it's in `.gitignore` before your first commit — it should be already, but it's worth a glance.
- If you ever paste one of these keys somewhere public by accident (a chat, a gist, a screenshot), treat it as burned: go regenerate it immediately rather than hoping no one noticed.

### 1.3 Set up AstraDB

1. Create a database in Astra (any region close to you is fine — the free tier works well).
2. Note down the **API endpoint** and generate an **application token** — these become `ASTRA_DB_ENDPOINT` and `ASTRA_DB_TOKEN`.
3. You don't need to manually create a collection — the ingestion notebook does this for you the first time it runs (`get_or_create_collection`).

### 1.4 Set up your Telegram bot

1. Message [@BotFather](https://t.me/BotFather), run `/newbot`, follow the prompts.
2. Copy the token it gives you into `TELEGRAM_BOT_TOKEN`.

### 1.5 Try it locally

```bash
npx wrangler dev
```

Open `http://localhost:8787` — you should see the web interface. At this point search and chat will work as soon as AstraDB has *something* in it (see Part 2 or Part 3 to populate it).

### 1.6 Deploy

```bash
npx wrangler deploy
```

Then go into the **Cloudflare dashboard → your worker → Settings → Variables**, and add every single key from your `.dev.vars` file as an environment variable. This is the step people forget — `wrangler deploy` does *not* upload your local `.dev.vars` file for you.

### 1.7 Connect the Telegram webhook

Replace the placeholders and run:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_WORKER_URL>/webhook"
```

Verify it worked:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

If `getWebhookInfo` shows your URL and no `last_error_message`, you're live. Message your bot `/start` and see what happens.

---

## Part 2 — Populating AstraDB with the general ingestion notebook

Use `DocuSage_Data_Ingestion.ipynb` when your source material is a normal mix of PDFs, DOCX, or TXT files that don't need OCR — text-based PDFs, exported docs, etc.

1. **Upload your documents** to a folder in Google Drive.
2. **Open the notebook in Colab.**
3. **Add secrets** via the key icon in Colab's left sidebar:
   - `PHILO_API` — your AstraDB application token
   - `PHILO_END` — your AstraDB API endpoint
   - `GOOGLE_API_KEY_BHR1` — your Gemini API key
4. **Point it at your files** — edit the `file_paths` variable in the `if __name__ == "__main__":` block so it matches your Drive folder.
5. **Runtime → Run all.**

What happens under the hood: documents get loaded, split into overlapping chunks (so context isn't lost at chunk boundaries), each chunk gets an embedding plus a short summary and extracted keywords, and everything lands in your AstraDB collection along with a CSV backup for your own records.

---

## Part 3 — The OCR + SQL pipeline, for scanned books

This is for a different situation: you've got a folder of **scanned or image-heavy PDF books** — the kind where a normal text extractor gives you garbage — and you want clean Markdown, a matching Word doc, and a SQL-ready books database out the other end, without manually re-checking whether you already processed a book last week.

### 3.1 What you need before running it

- A Mistral API key (for OCR) — `console.mistral.ai`
- One or more Gemini API keys — more keys means more resilience against rate limits, since the script rotates through them automatically
- Your books, as PDFs, sitting in a Google Drive folder

### 3.2 Set up Colab secrets

Click the key icon in Colab's sidebar and add:

| Secret name | What it is |
|---|---|
| `MistralHo` | Your Mistral API key |
| `GOOGLE_API_KEY1` | A Gemini API key |
| `GOOGLE_API_KEY_1` … `GOOGLE_API_KEY_4` | More Gemini keys (optional but recommended) |
| `GOOGLE_API_KEY_BHR`, `GOOGLE_API_KEY_BHR1` | More Gemini keys (optional) |
| `GOOGLE_SUMMARY_API_KEY` | Another Gemini key, if you have one spare |
| `GEMINI_API_KEY` | One more fallback key |

You don't need all of these filled in — the script just skips any secret that comes back empty, and uses whatever's left. If you only have one Gemini key, that's fine; you'll just have less runway before it needs to fall back to Mistral for metadata/dedup calls too.

### 3.3 Point it at your folders

Near the top of `docusage_ocr_sql_pipeline.py`:

```python
INPUT_BOOKS_DIR = r"/content/drive/MyDrive/Philosophy/Unsorted_Books"
OUTPUT_DIR = r"/content/drive/MyDrive/Philosophy/Processed"
```

Change these to match your own Drive folder structure. `INPUT_BOOKS_DIR` should be full of `.pdf` files; `OUTPUT_DIR` will end up with language subfolders (`Persian/`, `German/`, `English/`, `Other/`) plus the SQL dump and a hidden fingerprint database.

### 3.4 Run it

In Colab: mount your Drive, then run the script (or wrap `main()` in a cell and execute it). It will:

1. Load whatever fingerprint database already exists from previous runs (so it remembers what it's already processed).
2. Loop through every PDF in `INPUT_BOOKS_DIR`.
3. For each one, do a **fast pre-check** — filename, file hash, content fingerprint — before spending a single API call, so already-known books are skipped instantly.
4. Detect the book's language from a single midpoint page.
5. OCR the whole book through Mistral, chunking automatically if it's large (over ~95MB or ~1000 pages).
6. Build the Markdown (with anchors and a table of contents) and the matching `.docx`.
7. Extract metadata with an LLM — title, author, translator, publisher, description, tags, category.
8. Run a **second**, smarter duplicate check now that it actually has metadata — this is what catches things like the same book under a slightly different title or a translator name written two different ways.
9. If it's genuinely new: append `INSERT` statements to `docusage_insert_dump.sql` and register the book in the fingerprint database.
10. If it turns out to be a duplicate after all (caught by the metadata-aware check), it deletes the `.md`/`.docx` it just generated and moves on — no wasted disk space, no orphaned files.

### 3.5 What you get at the end

- `OUTPUT_DIR/Persian/<book>.md`, `.../German/<book>.md`, etc. — one folder per detected language
- Matching `.docx` files next to each `.md`
- `OUTPUT_DIR/docusage_insert_dump.sql` — ready to run against your books database (`books`, `book_contents`, `wp_sync` tables)
- `OUTPUT_DIR/.processed_fingerprints.json` — the memory that makes re-runs safe and fast

### 3.6 Importing the SQL

The dump uses `INSERT IGNORE`, so re-importing it won't create duplicate rows if you run the script again later and append more entries. Just make sure your database already has `books`, `book_contents`, and `wp_sync` tables with columns matching what the script writes (see `append_to_sql_dump_file` in the script if you need the exact schema).

### 3.7 If something goes wrong mid-run

That's genuinely fine — this was built with that in mind. If the script crashes partway through a book (network blip, quota exhaustion, Colab timing out), it doesn't delete or corrupt anything. On your next run:

- If the `.md`/`.docx` were already written but the book never made it into the fingerprint database, the "Layer 5" disk check catches it and skips reprocessing.
- If nothing was written yet, it just tries again from scratch for that book.

Either way, you won't burn API calls twice on the same book, and you won't get duplicate rows in your SQL dump.

---

## Common issues

**"All Gemini API keys exhausted"** — you've hit rate limits on every key you provided. Either add more keys, wait for quota to reset (usually daily), or let it fall through to Mistral automatically (it will, for metadata/dedup calls).

**Telegram bot doesn't respond** — check `getWebhookInfo`; if `last_error_message` is populated, your worker is throwing an error on incoming messages. Check the Cloudflare Worker logs (`wrangler tail`) for the actual exception.

**Web UI loads but search returns nothing** — your AstraDB collection is probably empty. Run the ingestion notebook or the OCR pipeline first.

**OCR pipeline reprocesses a book it already did** — check that `OUTPUT_DIR` points to the *same* folder across runs. The fingerprint database (`.processed_fingerprints.json`) lives inside `OUTPUT_DIR`, so if that path changes, it looks like a fresh start every time.

---

## A closing note

None of this is trying to be a polished SaaS product — it's a working setup built to solve a real, specific problem (searchable access to a personal library, in Persian and other languages, without paying for infrastructure). Expect to poke at the code a bit to fit your own use case, and feel free to open an issue if you get stuck.
