# DocuSage
A RAG Agant. DocuSage is a project that combines a web interface (built with Hono) and a Telegram bot to provide access to a knowledge base built from your documents. It leverages the power of Large Language Models (LLMs) for both information retrieval and generation.
## A Completely Free RAG Agent for Building a Chatbot that Converses with Your Documents, Using a Vector Database (AstraDB)

This repository provides a Retrieval-Augmented Generation (RAG) agent that allows you to set up a chatbot that can converse with your documents. This chatbot uses documents uploaded to a vector database to answer questions.  This project utilizes AstraDB due to its ease of use, ability to bypass sanctions, and, most importantly, its free tier.  In fact, this repository offers a solution that is 100% free, requiring no additional costs for servers, databases, tokens, etc.
# DocuSage: A Retrieval-Augmented Generation (RAG) Agent

## Overview

DocuSage is a project that combines a web interface (built with Hono) and a Telegram bot to provide access to a knowledge base built from your documents. It leverages the power of Large Language Models (LLMs) for both information retrieval and generation.

**Key Technologies:**

*   **Hono:**  A fast, lightweight web framework for Cloudflare Workers.
*   **Google Gemini:** Used for:
    *   Text Embeddings (creating vector representations of text chunks).
    *   Chatbot responses (generating natural language answers).
    *   (Optional, in Colab) Text summarization and keyword extraction (fallback option).
*   **AstraDB:**  A serverless vector database (based on Apache Cassandra) that stores the document embeddings and metadata, enabling fast similarity search.
*   **Cloudflare Workers AI:** Used as a fallback for text summarization, and keyword extraction, if Gemini fails, providing resilience.  This is a key addition for robustness.
*   **DuckDuckGo & Google Search:**  The Telegram bot uses DuckDuckGo (with Google as a fallback) for general web searches.
*   **Tailwind CSS:** Provides a modern and responsive UI for the web interface.
*   **`markdown-it`:**  A JavaScript library to render Markdown-formatted text from the LLM into proper HTML.
*   **Colab (for Data Ingestion):** A provided Colab notebook enables easy uploading of documents to AstraDB.

## Features

*   **Web Interface:**
    *   **Vector Search:**  Perform semantic searches against the knowledge base.  Find documents/chunks that are *meaningfully* related to your query, not just those with exact keyword matches.
    *   **Chatbot:**  Interact with a knowledgeable chatbot powered by Google Gemini.  The chatbot uses both the AstraDB vector store *and* web search (via the Telegram bot's search functions) to provide comprehensive, context-aware answers. This is the *Retrieval-Augmented Generation (RAG)* aspect.
    *   **RTL Support:**  The interface is designed for Right-to-Left (RTL) languages, specifically Persian, but can be adapted.
    *   **Markdown Formatting:**  Chatbot responses are displayed with proper Markdown formatting (headings, bold text, lists, etc.).
    *   **AstraDB Context:** Displays relevant excerpts from AstraDB search results, showing the source document, section, and similarity score.
     *   **Book List Display:** Shows a list of books currently indexed in the AstraDB database, along with some basic metadata.

*   **Telegram Bot:**
    *   **Commands:**
        *   `/start`: Initializes the bot and provides a welcome message.
        *   `/help`:  Shows available commands and usage instructions.
        *   `/search [query]`:  Performs a general web search using DuckDuckGo (and Google if DuckDuckGo fails).
        *   `/chat [query]`:  Initiates a conversation with the Gemini-powered chatbot, using the RAG approach.
    *   **RAG-Powered Chat:** The bot leverages the AstraDB knowledge base *and* web search to provide informed and relevant answers, making it a true RAG agent.
    *   **Long Message Handling:**  Automatically splits long responses into multiple Telegram messages, handling Telegram's message length limitations.
    *   **"Processing" Message:**  Displays a temporary "processing" message to the user while waiting for the LLM response, improving the user experience.

## Project Structure

The project consists of a single main file (the Cloudflare Worker code) and a Colab notebook for data ingestion.

**Cloudflare Worker (`index.js` or similar):**

*   **Imports:**  Brings in necessary libraries like `hono`, `@google/generative-ai`, etc.
*   **`renderPage` (HTML Template):**  Defines the structure and styling of the web interface using `hono/html`.  This includes:
    *   Tailwind CSS classes for styling.
    *   The `markdown-it` library for Markdown rendering.
    *   JavaScript code for handling user interactions (search, chat, and displaying results).
*   **API Routes (Hono):**
    *   `/`:  Serves the main HTML page.
    *   `/api/embed`:  Generates text embeddings using Gemini's `text-embedding-004` model.  This is used by the web interface's search functionality.
    *   `/api/search`:  Performs vector searches against the AstraDB database, returning relevant document chunks.
    *   `/api/webchat`:  Handles chat requests from the web interface.  It uses Gemini, AstraDB, and web search (via the Telegram bot functions) to generate responses.
*   **Telegram Bot Logic:**
    *   `BOT_COMMANDS`: Defines the commands the Telegram bot understands.
    *   `ddgSearch`, `googleSearch`, `sepSearch`:  Functions to perform web searches using different search engines.
    *   `handleTelegramMessage`:  The main function that processes incoming messages from Telegram.  It routes commands and plain text messages appropriately.
    *   `handleSearch`, `handleChat`:  Handle specific Telegram commands.
    *   `sendLongTelegramMessage`, `sendTelegramMessage`, `sendTemporaryMessage`, `deleteMessage`:  Utilities for sending and managing Telegram messages.
    *   `translateText`: Uses the Gemini API to translate text (primarily used for translating user queries to German before searching the German-language knowledge base).
    *   `queryGeminiChat`, `queryGeminiChatWeb`:  These functions are the core of the RAG implementation. They construct prompts for Gemini, including:
        *   The user's (potentially translated) query.
        *   Relevant document excerpts retrieved from AstraDB.
        *   Results from web searches.
        *   Instructions for Gemini to act as a knowledgeable expert.
    *  `formatAstraResultsWeb`: Formats AstraDB query results into a user-friendly HTML for the web interface.
     *   `formatAstraResults`: Formats AstraDB query results into a user-friendly message for the Telegram bot.
*   **Webhook Route (`/webhook`):**  Handles incoming updates from the Telegram API. This is how the bot receives messages.
*   **`/test` Route:** A simple route to check if the basic webhook setup is correct.

**Colab Notebook (`DocuSage_Data_Ingestion.ipynb` - suggested name):**

*   **Installations (`!pip install ...`):** Installs all necessary Python libraries, including:
    *   `astrapy`:  For interacting with AstraDB.
    *   `langchain-community`:  Provides document loaders (for PDF, DOCX, TXT) and text splitters.
    *   `openai` (though you are using Gemini, some LangChain components might still use this).
    *   `pypdf`:  For PDF parsing.
    *   `python-dotenv`:  For loading environment variables (optional in Colab, but good practice).
    *   `docx2txt`:  For DOCX parsing.
    *   `tiktoken`:  For tokenization (used by LangChain's text splitter).
    *   `nltk`, `sentence-transformers`, `transformers`, `torch`: For text processing, embeddings and language models.
    *    `hazm`: This is crucial for Persian text processing, providing functionalities like stemming, lemmatization, and normalization that are necessary to improve the search and retrieval quality for Persian documents.
*   **Imports:**  Imports the required Python modules.
*   **Constants and Configurations:** Defines constants like file types, API keys, model names, and AstraDB connection details. *Crucially*, it uses `google.colab.userdata` to securely access secrets stored in Colab.
*   **Error Handling:** Defines custom exception classes for various error types (embedding, AstraDB, file processing, etc.). This makes error handling more robust.
*   **`PDFLoader` Class:** Uses `PyPDFLoader` from LangChain to load and split PDF files.
*   **`Data` Class:** Defines data using `dataclass` that will contain document content
*   **`DocumentProcessor` Class:**
    *   Handles loading documents of different types (PDF, DOCX, TXT).
    *   Uses LangChain loaders for each file type.
    *   Combines the content of multiple pages/chunks from a single document into a single string.
*   **`RecursiveCharacterTextSplitterComponent` Class:**
    *   Uses LangChain's `RecursiveCharacterTextSplitter` to split long text into smaller chunks.  This is *essential* for vector databases, as they have limits on the size of text they can index.  The chunk size and overlap are configurable.
*   **`GeminiEmbeddingsComponent` Class:**
    *   Handles generating text embeddings using Google Gemini's `text-embedding-004` model.
    *   Includes *retry logic with exponential backoff* to handle rate limits and temporary errors from the Gemini API. This is very important for reliability.
    *   Includes *model rotation* to use Cloudflare Workers AI as a fallback for text summarization and keyword extraction.
     * Added methods for:
      *   `extract_keywords`: Extracts keywords from a text chunk.
      *   `generate_chunk_summary`: Generates a summary of a text chunk.
      *   `_extract_keywords_gemini`: Helper function to extract keyword using Gemini API.
      *   `_extract_keywords_cloudflare`: Helper function to extract keyword using Cloudflare Workers AI API.
      *   `_generate_gemini_summary`: Helper function to generate summaries using Gemini API.
      *   `_generate_cloudflare_summary`: Helper function to generate summaries using Cloudflare Workers AI API.
*   **`AstraDBManager` Class:**
    *   Manages interactions with the AstraDB database.
    *   `get_or_create_collection`:  Gets an existing collection or creates a new one if it doesn't exist.  This handles the database setup.
    *   `add_documents`:  Adds multiple documents (chunks) to the AstraDB collection, including:
        *   The text chunk itself.
        *   The generated embedding (vector).
        *   Metadata (document name, references, keywords, summary, chunk number).
    *   `save_to_csv` : save proccessed file information to a csv file as backup.
*   **`extract_references` Function:** Uses a regular expression to extract references from the text.
*   **`main` Function:**  This is the main processing pipeline:
    1.  Takes a list of file paths as input.
    2.  Initializes the text splitter, embeddings component, and AstraDB manager.
    3.  Iterates through each file path:
        *   Loads the document.
        *   Splits the document into chunks.
        *   Generates embeddings for each chunk.
        *  Extract keywords for each chunk.
         *   Generate summaries for each chunk.
        *   Extracts references from original text.
        *   Adds the chunks (with embeddings and metadata) to AstraDB.
        *   Handles errors gracefully.

**To run the Colab notebook:**

1.  **Create Secrets in Colab:**
    *   In the Colab sidebar, click the key icon ("Secrets").
    *   Create the following secrets, pasting in your actual API keys and AstraDB credentials:
        *   `PHILO_API` (your AstraDB application token)
        *   `PHILO_END` (your AstraDB API endpoint)
        *   `GOOGLE_API_KEY_BHR1` (your Gemini API key)
2.  **Mount Google Drive:**
    *   The notebook assumes your documents are stored in Google Drive, in a folder named `/content/drive/MyDrive/your-folder-name`.  Adjust the `file_paths` in the `if __name__ == "__main__":` block to match your actual file locations.
3.  **Run All Cells:**
    *   Click "Runtime" -> "Run all".
    *   The notebook will install dependencies, process your documents, generate embeddings, and upload the data to your AstraDB collection.
4. Run the Couldflare Worker codes.

## Setup and Deployment (Cloudflare Worker)

**Prerequisites:**

*   A Cloudflare account.
*   A Google Cloud Platform (GCP) project with the Generative Language API enabled.
*   API keys for:
    *   Google Gemini (two keys: one for general use, `GEMINI_API_KEY`, and one for the web interface, `GEMINI_API_KEY_WEB`).
    *   Google Custom Search Engine (`GOOGLE_API_KEY` and `GOOGLE_CSE_ID`).  This is used as a fallback if DuckDuckGo search fails.
    *   Telegram Bot Token (obtained from BotFather).
    *   AstraDB:
        *   Database endpoint (`ASTRA_DB_ENDPOINT`).
        *   Keyspace (`ASTRA_KEYSPACE`).
        *   Collection name (`ASTRA_COLLECTION_NAME`).
        *   Database token (`ASTRA_DB_TOKEN`).
        *   You should have already created the AstraDB database and collection using the Colab notebook.
     * A separate Google Gemini API key for the Translate API(`GEMINI_API_KEYTR`)

**Steps:**

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/mehdihoore/DocuSage
    cd DocuSage
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Create `.dev.vars`:**

    Create a file named `.dev.vars` in the root of your project directory.  Add your API keys and AstraDB credentials to this file:

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

    **Important:**  `.dev.vars` is for *local development only*.  It should be included in your `.gitignore` file to prevent accidentally committing your secrets.  For deployment, you'll set these as environment variables in the Cloudflare dashboard.

4.  **Local Development (Optional):**

    You can test the application locally using `wrangler`:

    ```bash
    npx wrangler dev
    ```

    This will start a local development server.  You can access the web interface in your browser (usually at `http://localhost:8787`).

5.  **Deploy to Cloudflare:**

    ```bash
    npx wrangler deploy
    ```

    This command builds and deploys your worker to Cloudflare.

6.  **Set Environment Variables (Cloudflare Dashboard):**

    *   Go to your Cloudflare dashboard.
    *   Select your worker.
    *   Go to **Settings** -> **Variables**.
    *   Add *each* of the variables from your `.dev.vars` file as environment variables.  This is how your deployed worker will access your secrets.

7.  **Set up Telegram Webhook:**

    After deploying, you need to tell Telegram where to send updates.  Replace `<YOUR_BOT_TOKEN>` and `<YOUR_WORKER_URL>` with your actual bot token and worker URL:

    ```bash
    curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_WORKER_URL>/webhook"
    ```

    You can find your worker URL in the Cloudflare dashboard.  It will look something like `https://docusage.your-worker-name.workers.dev`.  The `/webhook` part is important.
    You can verify the webhook is set up correctly using:
    ```bash
    curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
    ```

8.  **Populate AstraDB:** You've already done this using the provided Colab notebook.

9.  **Access the Web Interface:**

    Once deployed, you can access the web interface through your Cloudflare worker's URL.

## Setup and Deployment (Persian)
## یک RAG ایجنت برای راه‌اندازی یک چت‌بات گفتگو با اسناد، بر اساس اسناد بارگذاری شده در یک وکتور دیتابیس (AstraDB) - کاملاً رایگان

این ریپازیتوری یک RAG (Retrieval-Augmented Generation) ایجنت را ارائه می‌دهد که به شما امکان می‌دهد یک چت‌بات گفتگو با اسناد خود را راه‌اندازی کنید. این چت‌بات از اسناد بارگذاری شده در یک پایگاه‌داده برداری (Vector Database) برای پاسخ‌دهی به سوالات استفاده می‌کند. در این پروژه، از AstraDB به دلیل سادگی استفاده، امکان دور زدن تحریم‌ها، و مهم‌تر از همه، رایگان بودن، بهره گرفته شده است. در واقع، این ریپازیتوری روشی را پیشنهاد می‌کند که %100 رایگان است و برای راه‌اندازی آن به هیچ‌گونه هزینه اضافی، از جمله هزینه سرور، دیتابیس، توکن و غیره، نیازی نخواهید داشت.
1.  **پیش‌نیازها:**
    *   یک حساب کاربری Cloudflare.
    *   یک پروژه Google Cloud Platform (GCP) با API Generative Language فعال شده.
    *   کلیدهای API برای:
        *   Google Gemini (دو کلید: یکی برای استفاده عمومی، `GEMINI_API_KEY`، و یکی برای رابط وب، `GEMINI_API_KEY_WEB`).
        *    Google Custom Search Engine (`GOOGLE_API_KEY` and `GOOGLE_CSE_ID`).
        *   توکن ربات تلگرام (دریافت شده از BotFather).
        *   AstraDB:
            *   نقطه پایانی پایگاه داده (`ASTRA_DB_ENDPOINT`).
            *   فضای کلید (`ASTRA_KEYSPACE`).
            *   نام مجموعه (`ASTRA_COLLECTION_NAME`).
            *   توکن پایگاه داده (`ASTRA_DB_TOKEN`).
            *   شما باید قبلاً پایگاه داده و مجموعه AstraDB را با استفاده از نوت بوک Colab ایجاد کرده باشید.
      * یک کلید API Google Gemini جداگانه برای Translate API (`GEMINI_API_KEYTR`)

2.  **کلون کردن مخزن:**

    ```bash
    git clone https://github.com/)mehdihoore/DocuSage
    cd DocuSage
    ```

3.  **نصب وابستگی‌ها:**

    ```bash
    npm install
    ```

4.  **ایجاد `.dev.vars`:**

    یک فایل به نام `.dev.vars` در ریشه دایرکتوری پروژه خود ایجاد کنید و کلیدهای API و اعتبارنامه‌های AstraDB خود را به این فایل اضافه کنید:

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

    **مهم:** `.dev.vars` *فقط* برای توسعه محلی است و باید در فایل `.gitignore` شما باشد.  برای استقرار، این متغیرها را در داشبورد Cloudflare تنظیم می‌کنید.

5.  **توسعه محلی (اختیاری):**

    ```bash
    npx wrangler dev
    ```

6.  **استقرار در Cloudflare:**

    ```bash
    npx wrangler deploy
    ```

7.  **تنظیم متغیرهای محیطی (داشبورد Cloudflare):**

    *   به داشبورد Cloudflare خود بروید.
    *   worker خود را انتخاب کنید.
    *   به **Settings** -> **Variables** بروید.
    *   *هر یک* از متغیرهای فایل `.dev.vars` را به عنوان متغیر محیطی اضافه کنید.

8.  **راه‌اندازی Webhook تلگرام:**

    ```bash
    curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_WORKER_URL>/webhook"
    ```
    می توانید بررسی کنید که webhook به درستی تنظیم شده است:
     ```bash
    curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
    ```

9.  **پر کردن AstraDB:**  شما قبلاً این کار را با استفاده از نوت بوک Colab ارائه شده انجام داده‌اید.

10. **دسترسی به رابط وب:** از طریق URL worker Cloudflare.

## Colab Notebook Instructions (English)

The Colab notebook (`DocuSage_Data_Ingestion.ipynb` - suggested name) provides a convenient way to upload and process your documents, generate embeddings, and store them in your AstraDB vector database.

1.  **Open in Colab:** Open the notebook in Google Colab.
2.  **Set Secrets:**
    *   Click the key icon in the left sidebar (Secrets).
    *   Add the following secrets:
        *   `PHILO_API`: Your AstraDB application token.
        *   `PHILO_END`: Your AstraDB API endpoint.
        *   `GOOGLE_API_KEY_BHR1`: Your Google Gemini API key.
3.  **Mount Google Drive:**  The notebook is set up to read files from Google Drive.  Make sure your documents are uploaded to a folder in your Google Drive.  Modify the `file_paths` variable in the `if __name__ == "__main__":` block to point to your document locations.
4.  **Run All Cells:** Click "Runtime" -> "Run all" to execute the entire notebook.  This will:
    *   Install the necessary Python libraries.
    *   Load your documents.
    *   Split the documents into smaller chunks.
    *   Generate embeddings for each chunk using the Gemini `text-embedding-004` model.
    *   Extract keywords from each chunk.
    *   Generate a short summary of each chunk.
    *   Store the chunks, embeddings, keywords, summaries, and other metadata in your AstraDB collection.
    *   Create a CSV file as a backup.

## Colab Notebook Instructions (Persian)

نوت بوک Colab (`DocuSage_Data_Ingestion.ipynb` ) راهی آسان برای آپلود و پردازش اسناد، تولید تعبیه‌ها (embeddings) و ذخیره آن‌ها در پایگاه داده برداری AstraDB فراهم می‌کند.

1.  **باز کردن در Colab:** نوت بوک را در Google Colab باز کنید.
2.  **تنظیم سکرتها (Secrets):**
    *   روی نماد کلید در نوار کناری سمت چپ (Secrets) کلیک کنید.
    *   سکرتهای زیر را اضافه کنید:
        *   `PHILO_API`: توکن برنامه AstraDB شما.
        *   `PHILO_END`: نقطه پایانی API AstraDB شما.
        *   `GOOGLE_API_KEY_BHR1`: کلید API Google Gemini شما.
3.  **اتصال Google Drive:** نوت بوک طوری تنظیم شده است که فایل‌ها را از Google Drive بخواند. اطمینان حاصل کنید که اسناد شما در پوشه‌ای در Google Drive آپلود شده‌اند. متغیر `file_paths` را در بلوک `if __name__ == "__main__":` تغییر دهید تا به مکان‌های سند شما اشاره کند.
4.  **اجرای همه سلول‌ها:** روی "Runtime" -> "Run all" کلیک کنید تا کل نوت بوک اجرا شود. این کار:
    *   کتابخانه‌های Python لازم را نصب می‌کند.
    *   اسناد شما را بارگیری می‌کند.
    *   اسناد را به قطعات کوچکتر تقسیم می‌کند.
    *   برای هر قطعه با استفاده از مدل `text-embedding-004` جِمِنای، تعبیه (embedding) تولید می‌کند.
    *    استخراج کلمات کلیدی از هر بخش.
    *    یک خلاصه کوتاه از هر بخش تولید کنید.
    *   قطعات، تعبیه‌ها, کلمات کلیدی, خلاصه ها و سایر ابرداده‌ها را در مجموعه AstraDB شما ذخیره می‌کند.
     *   یک فایل CSV به عنوان پشتیبان ایجاد می کند.
