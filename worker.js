import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { html } from 'hono/html';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = new Hono();
app.use(cors());

// --- HTML Template (for the Hono web interface) ---

  

const renderPage = () => { 

return html`
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>جستجوی برداری و چت</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/dist/markdown-it.min.js"></script> <!-- Markdown-it is still needed! -->
    <link href="https://fonts.cdnfonts.com/css/iranian-sans" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&display=swap" rel="stylesheet">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lateef:wght@200;300;400;500;600;700;800&family=Vazirmatn:wght@100..900&display=swap" rel="stylesheet">
        <style>
        body {
            font-family: "Vazirmatn", sans-serif;
            font-weight: 400;
            font-style: normal;
            background-color: #121212;
            color: #e0e0e0;
        }
        
        .vazirmatn {
            font-family: "Vazirmatn", sans-serif;
            font-optical-sizing: auto;
            font-style: normal;
        }
        
        .lateef-regular {
            font-family: "Lateef", serif;
            font-weight: 400;
            font-style: normal;
        }
        
        .text-red-500 {
            color: #ef4444;
        }
        
        .bg-red-50 {
            background-color: #924040;
        }
        
        .max-w-2xl {
            margin-left: auto;
            margin-right: auto;
        }

        /* Chat Messages */
        .chat-messages {
            font-family: "Lateef", serif;
            height: 700px;
            background-color: #1e1e1e; 
            border: 1px solid #333;
            overflow-y: auto;
            padding: 0.5rem;
        }

        /* User Messages */
        .chat-messages > div.user-message {
            margin-left: auto;
            margin-right: 0 !important;
            text-align: right;
            background-color: #2d4263; /* Changed to blue tone */
            color: #ffffff; /* White text for better contrast */
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            margin-bottom: 0.75rem;
        }

        /* Bot Messages */
        .chat-messages > div.bot-message {
            margin-right: auto;
            margin-left: 0 !important;
            text-align: right;
            background-color: #383838; /* Dark gray background */
            color: #ffffff; /* White text for better contrast */
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            margin-bottom: 0.75rem;
        }
        
        /* Error Messages */
        .chat-messages > div.error-message {
            margin-left: auto;
            margin-right: 0 !important;
            text-align: right;
            background-color: #924040;
            color: #ffffff; /* White text for better contrast */
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            margin-bottom: 0.75rem;
        }

        /* Input and Buttons */
        input[type="text"], button {
            font-family: "Vazirmatn", sans-serif;
        }

        input[type="text"] {
            background-color: #2d2d2d;
            color: #e0e0e0;
            border: 1px solid #444;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
        }
        
        input[type="text"]:focus {
            outline: none;
            box-shadow: 0 0 0 2px #3b82f6;
        }

        /* Chat Send Button */
        #chat-send-button {
            background-color: #3b82f6;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
        }
        
        #chat-send-button:hover {
            background-color: #2563eb;
        }

        /* Search Button */
        #searchButton {
            background-color: #3b82f6;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
        }
        
        #searchButton:hover {
            background-color: #2563eb;
        }

        /* Loading Spinner */
        .loading {
            animation: spin 1s linear infinite;
            color: #3b82f6;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        /* Header Navigation */
        .header-nav {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            padding: 1rem;
            justify-content: center;
            width: 100%;
            box-sizing: border-box;
            position: relative;
            margin-bottom: 1rem;
            background-color: #1e1e1e;
            border-bottom: 1px solid #333;
        }

        .nav-button {
            background-color: #333;
            color: #e0e0e0;
            padding: 8px 16px;
            border: 2px solid #444;
            border-radius: 8px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            white-space: nowrap;
            display: inline-block;
        }

        .nav-button:hover {
            background-color: #444;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
        }

        /* Specific Nav Button Overrides */
        a[href*="list.aihoore"] {
            background-color: #1e40af;
            border-color: #60a5fa;
            color: #93c5fd;
        }
        
        a[href*="list.aihoore"]:hover {
            background-color: #1e4620;
            box-shadow: 0 0 15px rgba(96, 165, 250, 0.5);
        }

        a[href*="stahl.aihoore"] {
            background-color: #404040;
            border-color: #a3a3a3;
            color: #e5e5e5;
        }

        a[href*="stahl.aihoore"]:hover {
            background-color: #525252;
            box-shadow: 0 0 15px rgba(163, 163, 163, 0.5);
        }

        a[href*="we.aihoore"] {
            background-color: #0369a1;
            border-color: #7dd3fc;
            color: #bae6fd;
        }

        a[href*="we.aihoore"]:hover {
            background-color: #0c4a6e;
            box-shadow: 0 0 15px rgba(125, 211, 252, 0.5);
        }

        a[href*="sachat"] {
            background-color: #4c1d95;
            border-color: #c4b5fd;
            color: #ddd6fe;
        }

        a[href*="sachat"]:hover {
            background-color: #5b21b6;
            box-shadow: 0 0 15px rgba(196, 181, 253, 0.5);
        }

        a[href$="sabaat.ir/"] {
            background-color: #831843;
            border-color: #fbcfe8;
            color: #fce7f3;
        }

        a[href$="sabaat.ir/"]:hover {
            background-color: #9d174d;
            box-shadow: 0 0 15px rgba(251, 207, 232, 0.5);
        }
        
        a[href*="philo.aihoore"] {
            background-color: #404040;
            border-color: #a3a3a3;
            color: #e5e5e5;
        }

        a[href*="philo.aihoore"]:hover {
            background-color: #525252;
            box-shadow: 0 0 15px rgba(163, 163, 163, 0.5);
        }

        a[href*="astro.aihoore"] {
            background-color: #000033;
            border-color: #ffc107;
            color: #ffc107;
        }

        a[href*="astro.aihoore"]:hover {
            background-color: #000044;
            box-shadow: 0 0 15px rgba(255, 193, 7, 0.5);
        }
        
        a[href*="planets.aihoore"] {
            background-color: #000033;
            border-color: #ffc107;
            color: #ffc107;
        }

        a[href*="planets.aihoore"]:hover {
            background-color: #000044;
            box-shadow: 0 0 15px rgba(255, 193, 7, 0.5);
        }

        a[href*="nse.aihoore"] {
            background-color: #1e40af;
            border-color: #60a5fa;
            color: #93c5fd;
        }

        a[href*="nse.aihoore"]:hover {
            background-color: #1e4620;
            box-shadow: 0 0 15px rgba(96, 165, 250, 0.5);
        }

        /* Main Content Containers */
        .max-w-2xl {
            background-color: #1e1e1e;
            border: 1px solid #333;
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin-top: 1.5rem;
        }
        
        .max-w-2xl > h2 {
            color: #e0e0e0;
            text-align: right;
            margin-bottom: 1rem;
        }
        
        .max-w-2xl > h1 {
            text-align: right;
        }

        /* Book List Styles */
        #existing-books {
            width: 100%;
            margin-top: 20px;
            border: 1px solid #444;
            padding: 15px;
            border-radius: 8px;
            background-color: #2d2d2d;
            overflow-y: auto;
            max-height: 300px;
            direction: rtl;
        }

        #existing-books h2 {
            font-size: 1.25rem;
            margin-bottom: 1rem;
            color: #e0e0e0;
            text-align: right;
        }

        #book-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .book-item {
            background-color: #383838;
            border: 1px solid #444;
            padding: 10px 15px;
            border-radius: 6px;
            transition: background-color 0.2s ease-in-out;
            position: relative;
            text-align: right;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .book-item:hover {
            background-color: #444;
        }

        .book-title {
            font-size: 1rem;
            color: #60a5fa;
            text-decoration: none;
            display: block;
            margin-bottom: 4px;
        }

        .book-count {
            font-size: 0.8rem;
            color: #9ca3af;
            position: absolute;
            top: 5px;
            left: 5px;
            background-color: #444;
            padding: 2px 5px;
            border-radius: 4px;
            direction: ltr;
        }

        .book-item:hover .book-details {
            display: block;
        }

        .book-details {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: #444;
            border: 1px solid #555;
            padding: 10px;
            z-index: 10;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
            text-align: left;
            direction: ltr;
        }

        .book-details p {
            margin: 0 0 5px 0;
            font-size: 0.9rem;
            color: #e0e0e0;
        }

        .book-details strong {
            font-weight: bold;
            color: #c0c0c0;
        }

        /* Search Results */
        #results .result-card {
            background-color: #292929;
            color: #e0e0e0;
            border: 1px solid #444;
            padding: 1rem;
            border-radius: 0.375rem;
            margin-bottom: 1rem;
        }
        
        #results .result-card > div > h3 {
            text-align: right;
        }
        
        /* Responsive Adjustments */
        @media (max-width: 768px) {
            .header-nav {
                padding-top: 4rem;
                gap: 0.4rem;
            }

            .nav-button {
                font-size: 12px;
                padding: 6px 12px;
            }
        }
            .chat-messages > div.user-message {
    margin-left: auto;
    margin-right: 0 !important;
    text-align: right;
    background-color: #2d4263; /* Changed to blue tone */
    color: #ffffff; /* White text for better contrast */
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    margin-bottom: 0.75rem;
}
    .chat-messages > div.bot-message {
    margin-right: auto;
    margin-left: 0 !important;
    text-align: right;
    background-color: #383838; /* Dark gray background */
    color: #ffffff; /* White text for better contrast */
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    margin-bottom: 0.75rem;
}
    /* Search Results */
#results .result-card {
    background-color: #292929;
    color: #e0e0e0;
    border: 1px solid #444;
    padding: 1rem;
    border-radius: 0.375rem;
    margin-bottom: 1rem;
}

#results .result-card > div > h3 {
    text-align: right;
}
    </style>
</head>
<body class="bg-gray-900 min-h-screen p-8">
<div class="header-nav">
    <a href="https://nse.aihoore.ir/" class="nav-button">جستجوگر ثبات</a>
    <a href="https://list.aihoore.ir/" class="nav-button">\u0644\u06CC\u0633\u062A \u0648\u06CC\u200C\u067E\u06CC\u200C\u0627\u0646</a>
    <a href="https://stahl.aihoore.ir/" class="nav-button">\u062C\u062F\u0627\u0648\u0644 \u0627\u0634\u062A\u0627\u0644</a>
    <a href="https://we.aihoore.ir/" class="nav-button">\u0627\u062E\u0628\u0627\u0631 \u0622\u0628 \u0648 \u0647\u0648\u0627</a>
    <a href="https://sabaat.ir/sachat/" class="nav-button">\u0686\u062A\u200C\u0628\u0627\u062A \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06cc</a>
    <a href="https://sabaat.ir/" class="nav-button">\u0686\u062A\u200C\u0628\u0627\u062A \u0641\u0644\u0633\u0641\u06cc</a>
    <a href="https://astro.aihoore.ir/" class="nav-button">\u0646\u0642\u0634\u0647 \u0622\u0633\u0645\u0627\u0646 \u0634\u0628</a>
    </div>
     <div class="max-w-2xl mx-auto rounded-lg shadow-md p-6 mt-6">
        <h2 class="text-xl font-bold mb-4">گفتگو با هوش مصنوعی</h2>
        <div id="chat-messages" class="border rounded p-3 h-96 overflow-y-auto mb-4">
            <!-- Chat messages will be added here -->
        </div>
        <div class="flex gap-2">
            <input id="chat-input" type="text" placeholder="پیام خود را اینجا بنویسید..." class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <button id="chat-send-button" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                ارسال
            </button>
        </div>
        <div id="chat-error" class="hidden text-red-500 text-sm p-2 bg-red-50 rounded mt-2"></div>
        <div id="chat-loading" class="hidden text-center mt-2">
            <svg class="loading inline-block w-6 h-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="ml-2">در حال ارسال...</span>
        </div>
    </div>
    <div class="max-w-2xl mx-auto rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold mb-6">جستجوی برداری</h1>
        <div class="space-y-4">
            <div class="flex gap-2">
                <input id="searchInput" type="text" placeholder="عبارت جستجوی خود را وارد کنید..." class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                <button id="searchButton" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    جستجو
                </button>
            </div>
            <div id="error" class="hidden text-red-500 text-sm p-2 bg-red-50 rounded"></div>
            <div id="loading" class="hidden text-center">
                <svg class="loading inline-block w-6 h-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="ml-2">در حال جستجو...</span>
            </div>
            <div id="results" class="space-y-4"></div>
        </div>
    </div>

   <div id="existing-books" class="mb-6">
        <h2 class="text-lg font-semibold mb-2">کتاب‌های موجود:</h2>
       <ul id="book-list">
  <li class="book-item">
    <span class="book-title">Georg Wilhelm Friedrich Hegel, Rolf-Peter Horstmann - Jenaer Systementwürfe III_ Naturphilosophie und Philosophie des Geistes (Philosophische Bibliothek)-F. Meiner (1986)</span>
    <span class="book-count">1</span>
    <div class="book-details">
      <p><strong>References:</strong> 3-7873-0684-6</p>
      <p><strong>Keywords:</strong> N/A</p>
      <p><strong>Summary:</strong> کریستال الماس به عنوان جوهر بنیادی، "الماس لبه" یا "وحدت بیرونی" در هسته خود توصیف می‌شود. این جوهر، پیوندی از سادگی، شفافیت و جوهر در دو حد نهایی است، با دو جنبه: از یک سو، به جدایی محض بیرونی، تجرید و Sự kenogeneit اشاره دارد. از سوی دیگر، به تجرید، تقلیل و تامل اشاره دارد که محض و تقسیم‌ناپذیر هستند. کریستال الماس، در مرکز این دوگانگی، هم واحدی خودبسنده و منفجر شده و همه‌جانبه از هستی است، تکینگی‌ای که با کمبود به پایان می‌رسد.</p>
      <p><strong>Chunk Number:</strong> 50</p>
    </div>
  </li>
  <li class="book-item">
    <span class="book-title">Georg Wilhelm Friedrich Hegel - Vorlesungen uber die Geschichte der Philosophie - 1. Griechische Philosophie-Digitale Bibliothek (1836) (1)</span>
    <span class="book-count">2</span>
    <div class="book-details">
      <p><strong>References:</strong> N/A</p>
      <p><strong>Keywords:</strong> N/A</p>
      <p><strong>Summary:</strong> متن به مفهوم ایده خودآگاه می‌پردازد که موضوعی برجسته در فلسفه ارسطو است. این ایده که همه چیز باید به عنوان یک مفهوم خودآگاه در نظر گرفته شود، "verfahren" نامیده می‌شود. این مفهوم توسط فیلسوفان یونانی مانند ارسطو توصیف شده و به اهمیت درک چیزهای فردی مستقل از ذات و دلالت آنها پی می‌برد. با این حال، تحقق این مفهوم خارج از تفکر سنتی حاصل نمی‌شود، بلکه یک سری طولانی از اصطلاحات خاص است. گام بعدی در تفکر فلسفی، ایجاد یک مفهوم کلی است که همه چیز را در بر می‌گیرد و سازماندهی آن به شیوه‌ای واحد است. یک فلسفه موفق دارای الگویی از وحدت خواهد بود، جایی که تنوع چیزها به عنوان بخشی از واقعیت فراگیر دیده می‌شود و در درون این وحدت درک می‌شود.</p>
      <p><strong>Chunk Number:</strong> 289</p>
    </div>
  </li>
  <li class="book-item">
    <span class="book-title">(Philosophische Bibliothek_ 171b-d) Hegel, Georg Wilhelm Friedrich - Vorlesungen über die Philosophie der Weltgeschichte. Band II–IV_ Die orientalische Welt. Die griechische und die römische Welt. Die</span>
    <span class="book-count">3</span>
    <div class="book-details">
      <p><strong>References:</strong> 78-3-7873-0774</p>
      <p><strong>Keywords:</strong> N/A</p>
      <p><strong>Summary:</strong> جهان در این ذوق کاملاً معنوی می‌یابد. فلسفه اصیل ارسطویی جایگزین فلسفه مدرسی می‌شود. ابالارد، مدرسی مشهور پاریسی، اولین کسی بود که در مجموعه‌ای تیزبینانه، تضادهای حل‌نشده آموزه کلیسا را بیان کرد. دانشمندان از یونان می‌آیند و شکوفایی مطالعه ادبیات یونانی آغاز می‌شود.</p>
      <p><strong>Chunk Number:</strong> 304</p>
    </div>
  </li>
  <li class="book-item">
    <span class="book-title">(Klassiker Auslegen_ 40) Birgit Sandkaulen (editor) - G. W. F. Hegel_ Vorlesungen über die Ästhetik-De Gruyter (A) (2018)</span>
    <span class="book-count">4</span>
    <div class="book-details">
      <p><strong>References:</strong> 978-3-05-004471</p>
      <p><strong>Keywords:</strong> knowledge, imagination</p>
      <p><strong>Summary:</strong> خلاصه‌ای موجود نیست.</p>
      <p><strong>Chunk Number:</strong> 161</p>
    </div>
  </li>
  <li class="book-item">
    <span class="book-title">G.W.F Hegel - Werke, Band 08 - Enzyklopädie I. 8-Suhrkamp (1989)</span>
    <span class="book-count">5</span>
    <div class="book-details">
      <p><strong>References:</strong> 3-518-09718-0</p>
      <p><strong>Keywords:</strong> N/A</p>
      <p><strong>Summary:</strong> در زندگی معمولی هم به این کار قضاوت می‌گویند. به هیچ انسانی قدرت قضاوت نسبت داده نمی‌شود که مثلاً بگوید این سیب ترش است یا این دیوار سبز است. فاعل، ۱. S ۱۷۹ قضیه اخباری در فاعل بی‌واسطه خود، رابطه خاص و عام را که در محمول بیان شده، ندارد.</p>
      <p><strong>Chunk Number:</strong> 162</p>
    </div>
  </li>
  <li class="book-item">
    <span class="book-title">(Philosophische Bibliothek 385) Georg Wilhelm Friedrich Hegel-Wissenschaft der Logik-Meiner (2008)</span>
    <span class="book-count">6</span>
    <div class="book-details">
      <p><strong>References:</strong> N/A</p>
      <p><strong>Keywords:</strong> N/A</p>
      <p><strong>Summary:</strong> نتیجه، بی‌واسطگی‌ای است که از طریق رفع میانجی‌گری پدید آمده، هستی‌ای که به همان اندازه با میانجی‌گری یکسان است و مفهومی است که از هستی خود و در هستی خود، خود را بازسازی کرده است. اگرچه ممکن است به نظر برسد که گذار مفهوم به عینیت چیزی متفاوت از گذار از مفهوم خدا به هستی او باشد، اما از یک سو باید در نظر داشت که محتوای معین، یعنی خدا، تفاوتی در سیر منطقی ایجاد نمی‌کند و برهان هستی‌شناختی تنها کاربرد این سیر منطقی بر آن محتوای خاص است.</p>
      <p><strong>Chunk Number:</strong> 377</p>
    </div>
  </li>
  <li class="book-item">
    <span class="book-title">Georg Wilhelm Friedrich Hegel, Dieter Henrich (Hrsg.) - Philosophie des Rechts_ Die Vorlesung von 1819_20 in einer Nachschrift-Suhrkamp Verlag (1983)</span>
    <span class="book-count">7</span>
    <div class="book-details">
      <p><strong>References:</strong> 3-518-07595-0</p>
      <p><strong>Keywords:</strong> N/A</p>
      <p><strong>Summary:</strong> گئورگ ویلهلم فردریش هگل استدلال می‌کند که حقیقت از طریق خرد حاصل می‌شود و نمی‌توان تنها با خرد بر آن غلبه کرد. او از قیاس طبقه‌بندی‌شده‌ای استفاده می‌کند تا نشان دهد که حقیقت در برابر خرد مقاوم نیست، زیرا خود را شرط لازم تعیین خود می‌داند. او در آثار خود می‌پذیرد که ایده‌هایش مشروط هستند و حقیقت نیز «در استنتاج و استدلال مطابق با ذات خود» صادق است. او همچنین به طور مستقل بر حقیقت هستی تأکید می‌کند؛ «جوهر باید باشد و فرد باید باشد».</p>
      <p><strong>Chunk Number:</strong> 160</p>
    </div>
  </li>
  <li class="book-item">
    <span class="book-title">G. W. F. Hegel, Dietmar Köhler, Otto Pöggeler - Phänomenologie des Geistes-Akademie-Verlag (1998)</span>
    <span class="book-count">8</span>
    <div class="book-details">
      <p><strong>References:</strong> N/A</p>
      <p><strong>Keywords:</strong> N/A</p>
      <p><strong>Summary:</strong> این متن به مفهوم خودتعیینی می‌پردازد، که به حالت ذهنی‌ای اشاره دارد که در آن فرد انتخاب می‌کند که خواسته‌ها، نیات و تجربیات خود را با خودِ خود همسو کند، نه اینکه تحت تأثیر عوامل یا شرایط بیرونی قرار گیرد. خودتعیینی به عنوان جنبه‌ای جدایی‌ناپذیر از دانش دیده می‌شود، زیرا شامل درک شخصی از باورها و خاطرات موجودات شبح‌مانند در آگاهی فرد است. این درک معمولاً از طریق سازماندهی تجربیات در روایت فردیت از طریق وقوع رویدادهای تصادفی و درک انسان از طبیعت به عنوان نوعی جریان تصادفی حاصل می‌شود.</p>
      <p><strong>Chunk Number:</strong> 266</p>
    </div>
  </li>
  <li class="book-item">
    <span class="book-title">Georg Wilhelm Friedrich Hegel - Vorlesungen uber die Geschichte der Philosophie - 1. Griechische Philosophie-Digitale Bibliothek (1836)</span>
    <span class="book-count">9</span>
    <div class="book-details">
      <p><strong>References:</strong> N/A</p>
      <p><strong>Keywords:</strong> N/A</p>
      <p><strong>Summary:</strong> به گفته هگل، نظام‌های فلسفی چیزی بیش از دیدگاه‌های فردی عقل سلیم هستند، بلکه تلاشی برای حقیقت مطلق هستند که توسط عقل تعریف می‌شود. در مقابل، سنت‌های فلسفی پیشین (کلبی‌گری و کورنایی‌گری) بر محدودیت‌های فهم بشری تأکید داشتند و معتقد بودند که باید جهان طبیعی را در نظر گرفت. در مقابل، رواقیون بر ثبات و جهان‌شمولی عقل (لوگوس) تأکید داشتند. حتی فیلسوف رواقی، اپیکور، که در حدود ۳۴۲ پیش از میلاد می‌زیست، رقبای خود را به خاطر مسائل کوچک‌تر و بی‌اهمیت‌تر مورد انتقاد قرار می‌داد، نه اینکه به خاستگاه‌ها و ادعاهای اساسی بپردازد.</p>
      <p><strong>Chunk Number:</strong> 312</p>
    </div>
  </li>
  <li class="book-item">
    <span class="book-title">G.W.F Hegel - Werke, Band 10 - Enzyklopädie der philosophischen Wissenschaften im Grundrisse III. 10-Suhrkamp (1986)</span>
    <span class="book-count">10</span>
    <div class="book-details">
      <p><strong>References:</strong> N/A</p>
      <p><strong>Keywords:</strong> N/A</p>
      <p><strong>Summary:</strong> شرح مفصل این ارواح، هم به تاریخ طبیعی انسان تعلق دارد و هم به فلسفه تاریخ جهان. بنابراین، ما در اینجا فقط به خصلت متفاوت درونی ملت‌های اروپایی می‌پردازیم و در میان آنها نیز آن دسته از اقوامی را که عمدتاً از طریق نقش جهانی-تاریخی خود از یکدیگر متمایز می‌شوند - یعنی یونانیان، رومیان و ژرمن‌ها - نه در رابطه متقابل آنها، بلکه به این کار می‌پردازیم؛ این وظیفه را به فلسفه تاریخ واگذار کرده‌ایم. در میان لاکدمونی‌ها، زندگی یکپارچه و بدون تمایز در جوهر اخلاقی غالب است؛ از این رو، در میان آنها، اصل فردیت تابع، که در آتن به شکوفایی رسید، هنوز توسعه نیافته است. در میان رومی‌ها، فردیت انتزاعی حقوقی به رسمیت شناخته می‌شود، اما این فردیت انتزاعی هنوز با جوهر انضمامی دولت پیوند نخورده است. در میان ژرمن‌ها، اصل فردیت انضمامی به عنوان اصل اساسی دولت حاکم است. این اصل، وحدت آزادی فردی و کلیت عینی است.
</p>
      <p><strong>Chunk Number:</strong> 32</p>
    </div>
  </li>
  <li class="book-item">
    <span class="book-title">Georg Wilhelm Friedrich Hegel_ Walter Jaeschke (editor) - Gesammelte Werke 18. Vorlesungsmanuskripte _ 2. (1816-1831).-Meiner (1995)</span>
    <span class="book-count">11</span>
    <div class="book-details">
      <p><strong>References:</strong> 3-7873-0910-1</p>
      <p><strong>Keywords:</strong> N/A</p>
      <p><strong>Summary:</strong> سنت‌ها علاقه‌ای در درون خانواده و قبیله دارند؛ روند یکنواخت وضعیت آنها موضوعی برای یادآوری نیست. اما اعمال متمایز یا چرخش‌های سرنوشت ممکن است منموسین (Mnemosyne) را تحریک کند تا چنین تصاویری را ضبط کند. همان‌طور که عشق و احساس مذهبی، تخیل را برمی‌انگیزانند تا چنین اشتیاق بی‌شکلی را شکل دهد. تاریخ‌نگاری تنها زمانی آغاز می‌شود که یک اجتماع سیاسی در وضعیتی قرار گیرد که در آن منافع مشترک، افراد را به سمت اقداماتی سوق دهد که در حافظه جمعی ثبت می‌شوند.</p>
      <p><strong>Chunk Number:</strong> 57</p>
    </div>
  </li>
  <li class="book-item">
    <span class="book-title">(Hegel Gesammelte Werke 8) G. W. F. Hegel - Jenaer Systementwürfe III (-Felix Meiner (1976)</span>
    <span class="book-count">12</span>
    <div class="book-details">
      <p><strong>References:</strong> 3-7873-0301-4</p>
      <p><strong>Keywords:</strong> fire, motion, electromagnetism, light</p>
      <p><strong>Summary:</strong> متن به بررسی مفاهیم شیمی و مکانیک در ارتباط با نور و آتش می‌پردازد. در شیمی، نیتروژن و الماس (گوگرد-نیتروژن-تری‌اکسید) به عنوان عناصر کلیدی مورد بحث قرار می‌گیرند. شعله به عنوان نقطه پایانی یک فرآیند کلی و کربن به عنوان آغازگر فرآیند در نظر گرفته می‌شود. در مکانیک، آتش به عنوان حرکت و ویژگی‌های فیزیکی نور مورد بررسی قرار می‌گیرند. همچنین به فرآیندهای شیمیایی کیفی و نور به عنوان یک واسطه اشاره می‌شود.</p>
      <p><strong>Chunk Number:</strong> 49</p>
    </div>
  </li>
  <li class="book-item">
    <span class="book-title">Georg Wilhelm Friedrich Hegel - Gesammelte Werke 10-2. Nürnberger Gymnasialkurse und Gymnasialreden (1808–1816)-Meiner,  F (2006)</span>
    <span class="book-count">13</span>
    <div class="book-details">
      <p><strong>References:</strong> 3-7873-0903-9</p>
      <p><strong>Keywords:</strong> N/A</p>
      <p><strong>Summary:</strong>  متن حاضر گزارشی از ویرایشگر دربارهٔ یکی از دانش‌آموزان به نام یولیوس فریدریش هاینریش آبگ است که در نورنبرگ تحصیل می‌کرده و পরে در هایدلبرگ و برلین نزد هگل به تحصیل فلسفه پرداخته است. آبگ تحت تأثیر فلسفه هگل قرار گرفته و بعداً با او در تماس بوده است.</p>
      <p><strong>Chunk Number:</strong> 292</p>
    </div>
  </li>
  <li class="book-item">
    <span class="book-title">Hegel by Martin Heidegger</span>
    <span class="book-count">14</span>
    <div class="book-details">
      <p><strong>References:</strong> 978-0-253-01757</p>
      <p><strong>Keywords:</strong> N/A</p>
      <p><strong>Summary:</strong> این متن به بررسی مفهوم "تجربه" در فلسفه هگل می‌پردازد و آن را با مفهوم سنتی "تجربه" مقایسه می‌کند. مفهوم "تجربه" در نزد هگل، حرکتی دیالکتیکی است که آگاهی در رابطه با دانش و ابژه خود انجام می‌دهد. این "تجربه" همان چیزی است که "علم پدیدارشناسی روح" نامیده می‌شود. هگل "نگاه محض" را به عنوان یکی از ویژگی‌های اساسی این "تجربه" معرفی می‌کند.</p>
      <p><strong>Chunk Number:</strong> 50</p>
    </div>
  </li>
  <li class="book-item">
    <span class="book-title">arash-abazari-hegel-s-ontology-of-power-the-structure-2020</span>
    <span class="book-count">15</span>
    <div class="book-details">
      <p><strong>References:</strong> 978-1-108-83486</p>
      <p><strong>Keywords:</strong> N/A</p>
      <p><strong>Summary:</strong> این متن به معرفی آثار و اندیشمندان مختلفی می‌پردازد که به بررسی آرای هگل، به ویژه در زمینه هستی‌شناسی قدرت، پرداخته‌اند. از جمله این آثار می‌توان به "علم ارزش" اثر میشائیل هاینریش، "نظریه مارکس" اثر کلاوس هارتمان، و "منطق هگل" اثر کلاوس هارتمان اشاره کرد.</p>
      <p><strong>Chunk Number:</strong> 145</p>
    </div>
  </li>
  <li class="book-item">
    <span class="book-title">G.W.F Hegel - Werke, Band 09 - Enzyklopädie der philosophischen Wissenschaften im Grundrisse II. 9-Suhrkamp (1986)</span>
    <span class="book-count">16</span>
    <div class="book-details">
      <p><strong>References:</strong> 3-518-09718-0</p>
      <p><strong>Keywords:</strong> candlelight, moonlight</p>
      <p><strong>Summary:</strong> متن به بررسی شیوه تفکر نیوتن در فیزیک می‌پردازد و آن را ساده و تجربی توصیف می‌کند. نیوتن با پدیده‌ها آغاز می‌کند و از طریق آزمایش‌هایی مانند آزمایش با منشور شیشه‌ای در اتاق تاریک، به استدلال می‌پردازد. این متن همچنین به قیاس این روش با زمینه‌های دیگر اشاره می‌کند.</p>
      <p><strong>Chunk Number:</strong> 136</p>
    </div>
  </li>
  <li class="book-item">
    <span class="book-title">Georg Wilhelm Friedrich Hegel, Walter Jaeschke - Vorlesungen über die Philosophie der Religion. Teil 1_ Der Begriff der Religion (Philosophische Bibliothek)-F. Meiner (1993)</span>
    <span class="book-count">17</span>
    <div class="book-details">
      <p><strong>References:</strong> 3-7873-1116-5</p>
      <p><strong>Keywords:</strong> N/A</p>
      <p><strong>Summary:</strong>  این متن به بررسی جایگاه دین در اندیشه هگل می‌پردازد. هگل معتقد است که دین از سویی بالاترین مرتبه را دارد و مورد احترام است، اما از سوی دیگر، در عمل به گونه‌ای دیگر با آن رفتار می‌شود. تفاوت میان این دو جنبه، از سوی دنیوی ناشی می‌شود و به نظر می‌رسد که در ابتدا تأثیری بر دین ندارد، اما این جدایی و تباهی به تدریج به دین نیز سرایت می‌کند.
</p>
      <p><strong>Chunk Number:</strong> 25</p>
    </div>
  </li>
  <li class="book-item">
    <span class="book-title">Hegel, Georg Wilhelm Friedrich_ Hölderlin, Friedrich_ Rathgeb, Eberhard - Zwei Hälften des Lebens. Hegel und Hölderlin. Eine Freundschaft-München Blessing (2019)</span>
    <span class="book-count">18</span>
    <div class="book-details">
      <p><strong>References:</strong> 978-3-641-20775</p>
      <p><strong>Keywords:</strong> N/A</p>
      <p><strong>Summary:</strong> این متن به دورانی از زندگی ژان پل، نویسنده آلمانی، و ناپلئون بناپارت، امپراتور فرانسه، می‌پردازد. ژان پل در این دوران به جمع‌آوری دانش و تجربیات خود از طریق مشاهده می‌پردازد و بعداً این دانش را در رمان‌های خود به کار می‌گیرد. ناپلئون نیز در مدرسه نظامی بریین تحصیل می‌کند و با نمره‌ای متوسط فارغ‌التحصیل می‌شود.</p>
      <p><strong>Chunk Number:</strong> 30</p>
    </div>
  </li>
</ul>


    </div>
    <script>
        const md = new markdownit(); // Create a markdown-it instance - keep this!

        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('searchButton');
        const errorDiv = document.getElementById('error');
        const loadingDiv = document.getElementById('loading');
        const resultsDiv = document.getElementById('results');

        // ... (Your performSearch function remains unchanged) ...
        async function performSearch() {
            const query = searchInput.value.trim();
            if (!query) return;

            try {
                errorDiv.classList.add('hidden');
                loadingDiv.classList.remove('hidden');
                resultsDiv.innerHTML = '';
                searchButton.disabled = true;

                // Get embedding
                const embeddingResponse = await fetch('/api/embed', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: query })
                });

                if (!embeddingResponse.ok) {
                    const errorData = await embeddingResponse.json();
                    throw new Error(errorData.error || 'Failed to generate embedding');
                }

                const { embedding } = await embeddingResponse.json();

                // Search with embedding
                const searchResponse = await fetch('/api/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ vector: embedding })
                });

                if (!searchResponse.ok) {
                    const errorData = await searchResponse.json();
                    throw new Error(errorData.error || 'Search failed');
                }

                const results = await searchResponse.json();

                if (!results || results.length === 0) {
                    errorDiv.textContent = 'No results found';
                    errorDiv.classList.remove('hidden');
                    return;
                }

                // Display results
                results.forEach(result => {
    const resultCard = document.createElement('div');
    resultCard.className = 'result-card';
    resultCard.innerHTML = \`
    <div class="flex justify-between items-start mb-3">
        <h3 class="font-medium text-lg">Content:</h3>
        <div class="text-sm text-gray-500">
            Similarity: \${(result.$similarity * 100).toFixed(2)}%
        </div>
    </div>

    <div class="mb-4">
        <p>\${result.content || 'No text available'}</p>
    </div>

    <div class="flex justify-between items-start mb-3">
        <h3 class="font-medium text-lg">Metadata:</h3>
    </div>

    <div class="grid grid-cols-2 gap-2 text-sm">
        <div>
            <p class="font-semibold">Document Name:</p>
            <p>\${result.metadata?.doc_name || 'N/A'}</p>
        </div>
        <div>
            <p class="font-semibold">References:</p>
            <p>\${result.metadata?.references || 'N/A'}</p>
        </div>
        <div>
            <p class="font-semibold">Keywords:</p>
            <p>\${result.metadata?.keywords || 'N/A'}</p>
        </div>
        <div>
            <p class="font-semibold">Summary:</p>
            <p>\${result.metadata?.summary || 'N/A'}</p>
        </div>
        <div>
            <p class="font-semibold">Chunk Number:</p>
            <p>\${result.metadata?.chunk_number || 'N/A'}</p>
        </div>
    </div>
    \`;
    resultsDiv.appendChild(resultCard);
});

            } catch (err) {
                errorDiv.textContent = err.message;
                errorDiv.classList.remove('hidden');
            } finally {
                loadingDiv.classList.add('hidden');
                searchButton.disabled = false;
            }
        }

        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });

        const chatInput = document.getElementById('chat-input');
        const chatSendButton = document.getElementById('chat-send-button');
        const chatMessagesDiv = document.getElementById('chat-messages');
        const chatErrorDiv = document.getElementById('chat-error');
        const chatLoadingDiv = document.getElementById('chat-loading');

        let chatProcessing = false;

        // --- (1)  REVERTED addChatMessage ---
        function addChatMessage(sender, message) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('p-2', 'rounded', 'mb-2');

            if (sender === 'user') {
                messageDiv.classList.add('user-message');
                messageDiv.textContent = message; // Directly use textContent
            } else if (sender === 'bot') {
                messageDiv.classList.add('bot-message');
                //messageDiv.innerHTML = \`<div dir="rtl" style="text-align: right; font-family: 'Vazirmatn', sans-serif;">\${message}</div>\`; //Reverted
                messageDiv.innerHTML = message;
            } else if (sender === 'error') {
                messageDiv.classList.add('bg-red-100', 'mr-auto', 'text-left');
                messageDiv.innerHTML = \`<div dir="rtl" style="text-align: right; font-family: 'Vazirmatn', sans-serif;">\${message}</div>\`;
            }

            chatMessagesDiv.appendChild(messageDiv);
            chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
        }

        // --- (2) NEW: formatBotResponse ---
        function formatBotResponse(botResponse, astraResults) {
            const container = document.createElement('div');
            container.dir = "rtl";
            container.style.textAlign = "right";
            container.style.fontFamily = "'Vazirmatn', sans-serif";

            // Format the main bot response (using markdown-it)
            const formattedBotResponse = document.createElement('div');
            formattedBotResponse.innerHTML = md.render(botResponse); // Markdown conversion here!
            container.appendChild(formattedBotResponse);


            // Format Astra results (if any) -  APPEND, don't overwrite
            if (astraResults && astraResults.length > 0) {
                const astraDiv = formatAstraResultsWeb(astraResults); //Returns a div now
                container.appendChild(astraDiv);
            }

            return container.outerHTML; // Return as HTML string
        }

        // --- (3) MODIFIED: formatAstraResultsWeb (returns a DOM element) ---
       function formatAstraResultsWeb(results) {
          const container = document.createElement('div');
          container.dir = 'rtl';
          container.style.textAlign = 'right';

          if (!results || results.length === 0) {
            container.innerHTML = "📚 <strong>منابع یافت شده</strong>: هیچ منبع مرتبطی در پایگاه داده یافت نشد.";
            return container; // Return the div element
          }

          const header = document.createElement('div');
          header.innerHTML = "📚 <strong>منابع استفاده شده از پایگاه داده</strong>:<br>";
          container.appendChild(header);

          results.forEach((doc, index) => {
            const docDiv = document.createElement('div');
            docDiv.innerHTML = \`\${index + 1}. <strong>کتاب</strong>: \${doc.metadata?.doc_name || 'نامشخص'}<br>\` +
              \`   <strong>بخش</strong>: \${doc.metadata?.references || 'نامشخص'}<br>\` +
              \`   <strong>شباهت</strong>: \${(doc.$similarity * 100).toFixed(2)}%<br>\`;
            container.appendChild(docDiv);
          });

          return container; // Return the div element
        }

        async function sendChatMessage() {
            const message = chatInput.value.trim();
            if (!message || chatProcessing) return;

            chatProcessing = true;
            addChatMessage('user', message);
            chatInput.value = '';

            try {
                chatErrorDiv.classList.add('hidden');
                chatLoadingDiv.classList.remove('hidden');
                chatSendButton.disabled = true;

                const response = await fetch('/api/webchat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: message })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Chat failed');
                }

                const { response: botResponse, astraResults } = await response.json();

                // --- Use the formatting function ---
                const formattedMessage = formatBotResponse(botResponse, astraResults);
                addChatMessage('bot', formattedMessage);


            } catch (err) {
                console.error("Chat error:", err);
                addChatMessage('error', 'Error: ' + err.message);
                chatErrorDiv.textContent = err.message;
                chatErrorDiv.classList.remove('hidden');
            } finally {
                chatLoadingDiv.classList.add('hidden');
                chatSendButton.disabled = false;
                chatProcessing = false;
            }
        }

        chatSendButton.addEventListener('click', sendChatMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChatMessage();
        });

         async function getBookList() {
            try {
                const response = await fetch('/api/books'); // NEW API ENDPOINT
                if (!response.ok) {
                    throw new Error(\`Failed to fetch book list: \${response.status}\`);
                }
                return await response.json(); // Expecting an array of book objects
            } catch (error) {
                console.error("Error fetching book list:", error);
                // Handle the error appropriately.  Maybe show a message on the page.
                return []; // Return an empty array on error
            }
        }


        
    </script>
</body>
</html>

`;
};
// --- Helper function outside of renderPage, for formatting Astra results ---
function formatAstraResults(results) {
    if (!results || results.length === 0) {
        return "📚 *منابع یافت شده*: هیچ منبع مرتبطی در پایگاه داده یافت نشد.";
    }

    const header = "📚 *منابع استفاده شده از پایگاه داده*:\n\n";
    const formattedResults = results.map((doc, index) => {
        return `${index + 1}. *کتاب*: ${doc.metadata?.doc_name || 'نامشخص'}\n` +
               `   *بخش*: ${doc.metadata?.references || 'نامشخص'}\n` +
               `   *شباهت*: ${(doc.$similarity * 100).toFixed(2)}%\n`;
    }).join('\n');

    return header + formattedResults;
  }

// --- Hono API Routes ---

// Main page route
app.get('/', (c) => {
    return c.html(renderPage());
});

// Embedding API route (for vector search)
app.post('/api/embed', async (c) => {
    try {
        const { text } = await c.req.json();
        console.log('Generating embedding for:', text);
        const genAI = new GoogleGenerativeAI(c.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" }); // Use embedding model

        const result = await model.embedContent(text);
        const embedding = result.embedding.values;
        console.log('Embedding generated with dimension:', embedding.length);

        return c.json({ embedding });
    } catch (error) {
        console.error('Embedding error:', error);
        return c.json({ error: `Embedding generation failed: ${error.message}` }, 500);
    }
});

// Search API route (for vector search)
app.post('/api/search', async (c) => {
    try {
        const { vector } = await c.req.json();
        console.log('Search request with vector length:', vector ? vector.length : 'no vector');
        if (!vector || !Array.isArray(vector) || !vector.every(v => typeof v === 'number')) {
            return c.json({ error: 'Invalid vector format: must be an array of numbers' }, 400);
        }

        const baseUrl = c.env.ASTRA_DB_ENDPOINT.replace(/\/$/, '');
        const searchUrl = `${baseUrl}/api/json/v1/${c.env.ASTRA_KEYSPACE}/${c.env.ASTRA_COLLECTION_NAME}`;

        const requestBody = {
            find: {
                sort: {
                    "$vector": vector // Use "sort" for vector search
                },
                options: {
                    limit: 10,
                    includeSimilarity: true
                }
            }
        };

        const response = await fetch(searchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Cassandra-Token': c.env.ASTRA_DB_TOKEN
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const responseText = await response.text();
            return c.json({
                error: `Search failed: ${response.status}`,
                details: responseText
            }, 500);
        }
        console.log('AstraDB raw response:', JSON.stringify(response.status));
        const results = await response.json();
        console.log('AstraDB results:', JSON.stringify(results));
        console.log('Results data:', results.data ? 'Has data' : 'No data');
        console.log('Documents count:', results.data?.documents?.length || 0);
        if (!results.data?.documents || results.data.documents.length === 0) {
          console.log('No documents found in AstraDB response');
      }
        return c.json(results.data?.documents || []);

    } catch (error) {
        console.error('Search error:', error);
        
        return c.json({ error: `Search failed: ${error.message}` }, 500);
    }
});

// --- Telegram Bot Logic (within the same Worker) ---

const BOT_COMMANDS = {
  start: 'شروع',
  help: 'راهنما',
  search: 'جستجو',
  chat: 'چت',
};

// DuckDuckGo Search (preferred for privacy)
async function ddgSearch(query) {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;
    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
                "Accept": "text/html",
                "Accept-Language": "en-US,en;q=0.9",
                "Referer": "https://duckduckgo.com/"
            },
            redirect: "follow"
        });
        const html = await response.text();
        const results = [];
        const regex = /<a rel="nofollow" class="result__a" href="(.*?)">(.*?)<\/a>/g;
        let match;
        while ((match = regex.exec(html)) !== null && results.length < 5) { // Limit to 5 results
            try {
                const encodedUrl = match[1];
                const redirectUrl = new URL(encodedUrl, "https://html.duckduckgo.com");
                const actualUrl = redirectUrl.searchParams.get("uddg") || encodedUrl;
                const title = match[2].replace(/<[^>]+>/g, ''); // Remove HTML tags from title
                results.push({
                    title: title,
                    link: actualUrl,
                    description: "" // DuckDuckGo HTML doesn't provide snippets easily
                });
            } catch (urlError) {
                console.warn("Invalid URL encountered:", urlError);
            }
        }
        return results;
    } catch (error) {
        console.error("DDG Search Error:", error);
        return [];
    }
}

// Google Search (fallback)
async function googleSearch(query, env) {
  const url = `https://www.googleapis.com/customsearch/v1?key=${env.GOOGLE_API_KEY}&cx=${env.GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}&num=5`; // Limit to 5
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.items?.map((item) => ({
      title: item.title,
      link: item.link,
      description: item.snippet
    })) || [];
  } catch (error) {
    console.error("Google Search Error:", error);
    return [];
  }
}

// SEP Search
async function sepSearch(query) {
    const encodedQuery = encodeURIComponent(`site:plato.stanford.edu ${query}`);
    const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`; // Use DDG for SEP
    try {
      const response = await fetch(url, {
          headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
              "Accept": "text/html",
              "Accept-Language": "en-US,en;q=0.9",
              "Referer": "https://duckduckgo.com/" // Referrer for DDG
          },
          redirect: "follow"
      });
        const html = await response.text();
        const results = [];
        const regex = /<a rel="nofollow" class="result__a" href="(.*?)">(.*?)<\/a>/g;
        let match;
        while ((match = regex.exec(html)) !== null && results.length < 5) { // Limit results
             try {
                const encodedUrl = match[1];
                const redirectUrl = new URL(encodedUrl, "https://html.duckduckgo.com");
                const actualUrl = redirectUrl.searchParams.get("uddg") || encodedUrl;

                if (actualUrl.includes("plato.stanford.edu")) {
                  const title = match[2].replace(/<[^>]+>/g, ''); // Remove HTML tags
                    results.push({
                        title: title,
                        link: actualUrl,
                        description: ""
                    });
                }
            } catch (urlError) {
                console.warn("Invalid URL encountered:", urlError);
            }
        }
        return results;
    } catch (error) {
        console.error("SEP Search Error:", error);
        return [];
    }
}
app.post('/api/webchat', async (c) => {
  try {
      const { text } = await c.req.json();
      if (!text) {
          return c.json({ error: 'Please provide a message' }, 400);
      }

      const translatedQuery = await translateText(text, "German", c.env); // Assuming you still need translation
      const searchResults = {
          ddg: await ddgSearch(text),
          sep: await sepSearch(text),
      };
       if (searchResults.ddg.length === 0) {
        searchResults.google = await googleSearch(text, c.env);
      }

      // Call queryGeminiChatWeb (the web-specific version)
      const { response, astraResults } = await queryGeminiChatWeb(translatedQuery, searchResults, c.env, text);
      return c.json({ response, astraResults });

  } catch (error) {
      console.error('Web Chat Error:', error);
      return c.json({ error: `Chat failed: ${error.message}` }, 500);
  }
});


// Gemini Chat (Philosophical Focus)
// ... (previous code in queryGeminiChat) ...
async function sendTemporaryMessage(chatId, text, env) {
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
  };

  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
      });
      const responseData = await response.json();
      
      if (response.ok && responseData.result && responseData.result.message_id) {
          console.log('Temporary message sent with ID:', responseData.result.message_id);
          return responseData.result.message_id; // Return the message ID for later deletion
      } else {
          console.error('Failed to send temporary message:', responseData);
          return null;
      }
  } catch (error) {
      console.error('Error sending temporary message:', error);
      return null;
  }
}

// Function to delete a message
async function deleteMessage(chatId, messageId, env) {
  if (!messageId) return false;
  
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/deleteMessage`;
  const body = {
      chat_id: chatId,
      message_id: messageId
  };

  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
      });
      const responseData = await response.json();
      
      if (response.ok) {
          console.log('Message deleted successfully');
          return true;
      } else {
          console.error('Failed to delete message:', responseData);
          return false;
      }
  } catch (error) {
      console.error('Error deleting message:', error);
      return false;
  }
}

// Gemini Chat for Web (using a separate API key)
async function queryGeminiChatWeb(text, searchResults, env, originalQuery = null) {
  const API_KEY = env.GEMINI_API_KEY_WEB; // Use the web-specific API key
  const MODEL_NAME = "gemini-2.0-pro-exp-02-05";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
  const MAX_RETRIES = 3; // Maximum number of retries
  const RETRY_DELAY = 1000; // Delay between retries in milliseconds (1 second)


    // Format Search Results
    const formattedSearchResults = Object.entries(searchResults)
    .flatMap(([source, results]) => results.map(result => ({ source, ...result })))
    .map((result, index) => `${index + 1}. **${result.title}** (${result.source}): ${result.description || ""} [Link](${result.link})`)
    .join("\n");

    // Fetch Relevant Documents from AstraDB
  let astraDocs = "اطلاعاتی از دیتابیس آسترا در دسترس نیست.";
  let astraResults = [];

  try {
    // Generate embedding for the translated query
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY_WEB); // Use WEB API key
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const embeddingResult = await embeddingModel.embedContent(text);
    const queryVector = embeddingResult.embedding.values;

    // Search AstraDB using the embedding
    const baseUrl = env.ASTRA_DB_ENDPOINT.replace(/\/$/, '');
    const searchUrl = `${baseUrl}/api/json/v1/${env.ASTRA_KEYSPACE}/${env.ASTRA_COLLECTION_NAME}`;
    const astraRequestBody = {
      find: {
        sort: { "$vector": queryVector },
        options: { limit: 5, includeSimilarity: true },
        projection: {
          "content": 1,
          "metadata.doc_name": 1,
          "metadata.references": 1
        }
      }
    };

    const astraResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Cassandra-Token': env.ASTRA_DB_TOKEN },
      body: JSON.stringify(astraRequestBody)
    });

    if (!astraResponse.ok) {
      const astraErrorText = await astraResponse.text();
      console.error("AstraDB Search Error:", astraErrorText);
    } else {
      const results = await astraResponse.json();
      console.log("AstraDB Search Results:", JSON.stringify(results));
      if (results.data?.documents && results.data.documents.length > 0) {
        astraResults = results.data.documents;
        console.log(`Found ${astraResults.length} AstraDB results`);

        astraDocs = results.data.documents.map(doc => {
          return `
- **کتاب:** ${doc.metadata?.doc_name || 'نامشخص'}
- **بخش/رفرنس:** ${doc.metadata?.references || 'نامشخص'}
- **متن (آلمانی):** ${doc.content || 'محتوایی یافت نشد'}
- **شباهت:** ${(doc.$similarity * 100).toFixed(2)}%
`;
        }).join('\n');
      }
    }
  } catch (astraError) {
    console.error("Error fetching from AstraDB:", astraError);
  }
    // Use original query for prompt if available
    const queryForPrompt = originalQuery || text;
     const userInfo = "کاربر گرامی";

  // Build the Final Prompt
  const prompt = `
با سلام ${userInfo}
تو یک فیلسوف و متخصص فلسفه هگل هستی.
پاسخ هایت را راجع به فلسفه کامل و دقیق و با توجه به نتایج آمده در دیتا بیس بده.
توجه کن که در دیتا بیس مجموعه کتابهای هگل به آلمانی در یک وکتور دیتابیس آمده و بهتر است از روی آن پاسخ دهی.
پاسخ‌ها حتما به زبان فارسی باشد و با کلمات تخصصی و مناسب فلسفی.
این نتایج جستجو در دیتا بیس است:
Astra DB Documents: ${astraDocs}
حتما نام کتاب و بخش رفرنس داده شده در منابع را بیاور.
از نتایج جستجوی وب هم میتوانی برای تکمیل کردن پاسخ هایت استفاده کنی.
Query: ${queryForPrompt}
Search Results:
${formattedSearchResults}
`;

  // Make the Gemini API Call
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  };

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorText = await response.text();
                const errorMessage = `Gemini API Error: HTTP Status: ${response.status}, Message: ${errorText}`;
                console.error(errorMessage);

                if (response.status === 503 && attempt < MAX_RETRIES) {
                    console.log(`Attempt ${attempt} failed. Retrying in ${RETRY_DELAY}ms...`);
                    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
                    continue; // Retry
                }

                return { response: errorMessage, astraResults: [] };
            }

            const data = await response.json();
            const responseText =
                data.candidates?.[0]?.content?.parts?.[0]?.text || "متاسفانه پاسخی یافت نشد.";
            console.log(`Returning response with ${astraResults.length} AstraDB results`);

            return { response: responseText, astraResults: astraResults };
        } catch (error) {
            console.error("Gemini Chat Error:", error);

            if (attempt < MAX_RETRIES) {
                console.log(`Attempt ${attempt} failed. Retrying in ${RETRY_DELAY}ms...`);
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
            } else {
                return { response: "خطا در پردازش درخواست.", astraResults: [] };
            }
        }
    }
    // If all retries fail:
    return { response: "متاسفانه پس از چندین تلاش، پاسخی دریافت نشد.", astraResults: [] };
}

async function queryGeminiChat(text, searchResults, env, originalQuery = null) {
  const API_KEY = env.GEMINI_API_KEY;
  const MODEL_NAME = "gemini-2.0-pro-exp-02-05";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

  // Format Search Results
  const formattedSearchResults = Object.entries(searchResults)
    .flatMap(([source, results]) => results.map(result => ({ source, ...result })))
    .map((result, index) => `${index + 1}. **${result.title}** (${result.source}): ${result.description || ""} [Link](${result.link})`)
    .join("\n");

  // Fetch Relevant Documents from AstraDB using the translated query
  let astraDocs = "اطلاعاتی از دیتابیس آسترا در دسترس نیست.";
  let astraResults = [];

  try {
    // Generate embedding for the translated query
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const embeddingResult = await embeddingModel.embedContent(text);
    const queryVector = embeddingResult.embedding.values;

    // Search AstraDB using the embedding
    const baseUrl = env.ASTRA_DB_ENDPOINT.replace(/\/$/, '');
    const searchUrl = `${baseUrl}/api/json/v1/${env.ASTRA_KEYSPACE}/${env.ASTRA_COLLECTION_NAME}`;
    const astraRequestBody = {
      find: {
        sort: { "$vector": queryVector },
        options: { limit: 5, includeSimilarity: true },
        projection: {
          "content": 1,
          "metadata.doc_name": 1,
          "metadata.references": 1
        }
      }
    };

    const astraResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Cassandra-Token': env.ASTRA_DB_TOKEN },
      body: JSON.stringify(astraRequestBody)
    });

    if (!astraResponse.ok) {
      const astraErrorText = await astraResponse.text();
      console.error("AstraDB Search Error:", astraErrorText);
    } else {
      const results = await astraResponse.json();
      console.log("AstraDB Search Results:", JSON.stringify(results));
      if (results.data?.documents && results.data.documents.length > 0) {
        astraResults = results.data.documents;
        console.log(`Found ${astraResults.length} AstraDB results`);
        
        astraDocs = results.data.documents.map(doc => {
          return `
- **کتاب:** ${doc.metadata?.doc_name || 'نامشخص'}
- **بخش/رفرنس:** ${doc.metadata?.references || 'نامشخص'}
- **متن (آلمانی):** ${doc.content || 'محتوایی یافت نشد'}
- **شباهت:** ${(doc.$similarity * 100).toFixed(2)}%
`;
        }).join('\n');
      }
    }
  } catch (astraError) {
    console.error("Error fetching from AstraDB:", astraError);
  }

  // Use original query for the prompt if provided
  const queryForPrompt = originalQuery || text;
  const userInfo = "کاربر گرامی";

  // Build the Final Prompt
  const prompt = `
با سلام ${userInfo}
تو یک فیلسوف و متخصص فلسفه هگل هستی.
پاسخ هایت را راجع به فلسفه کامل و دقیق و با توجه به نتایج آمده در دیتا بیس بده.
توجه کن که در دیتا بیس مجموعه کتابهای هگل به آلمانی در یک وکتور دیتابیس آمده و بهتر است از روی آن پاسخ دهی.
پاسخ‌ها حتما به زبان فارسی باشد و با کلمات تخصصی و مناسب فلسفی.
نکته: لطفا توجه کن که پیامها از طریق تلگرام ارسال می شوند پس تلاش کن متن را زیبا و دسته بندی شده و با شکل و ui مناسب تلگرام بفرستی 
این دیتا بیس است:
Astra DB Documents: ${astraDocs}
حتما نام کتاب و بخش رفرنس داده شده در منابع را بیاور.
از نتایج جستجوی وب هم میتوانی برای تکمیل کردن پاسخ هایت استفاده کنی.
Query: ${queryForPrompt}
Search Results:
${formattedSearchResults}
`;

  // Make the Gemini API Call
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = `Gemini API Error: HTTP Status: ${response.status}, Message: ${errorText}`;
      console.error(errorMessage);
      return { response: errorMessage, astraResults: [] };
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "متاسفانه پاسخی یافت نشد.";
    console.log(`Returning response with ${astraResults.length} AstraDB results`);
    return { response: responseText, astraResults: astraResults };
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return { response: "خطا در پردازش درخواست.", astraResults: [] };
  }
}


// Telegram Message Handler
async function handleTelegramMessage(message, env) {
    const chatId = message.chat.id;
    const text = message.text || '';

    if (text.startsWith('/')) {
        // Handle commands
        const command = text.split(' ')[0].substring(1);
        const args = text.split(' ').slice(1).join(' ');

        switch (command) {
            case 'start':
                await sendLongTelegramMessage(chatId, 'به ربات خوش آمدید! برای راهنمایی /help را بزنید.', env);
                break;
            case 'help':
                await sendLongTelegramMessage(chatId, getHelpText(), env);
                break;
            case 'search':
               await handleSearch(args, chatId, env);
                break;

            case 'chat':
                await handleChat(args, chatId, env); // Use Gemini for chat
                break;
            default:
                await sendLongTelegramMessage(chatId, 'دستور نامعتبر. برای راهنمایی /help را بزنید.', env);
        }
    } else {
        // Handle plain text as a chat message
       await handleChat(text, chatId, env);
    }
}

//Handles general search
async function handleSearch(query, chatId, env) {
  if (!query) {
     await sendLongTelegramMessage(chatId, 'لطفاً عبارت جستجو را وارد کنید.', env);
     return;
  }

  const results = await ddgSearch(query); // Prioritize DuckDuckGo
  if (results.length === 0) {
      const googleResults = await googleSearch(query, env); // Fallback to Google
       const formattedResults = googleResults
    .map(r => `🔍 ${r.title}\n${r.link}\n${r.description || ''}\n`)
    .join('\n');
  await sendLongTelegramMessage(chatId, formattedResults || 'نتیجه‌ای یافت نشد.', env);
  }
  const formattedResults = results
    .map(r => `🔍 ${r.title}\n${r.link}\n${r.description || ''}\n`)
    .join('\n');

   await sendLongTelegramMessage(chatId, formattedResults || 'نتیجه‌ای یافت نشد.', env);
}


async function translateText(text, targetLanguage, env) {
  try {
    // Using Gemini for translation since you're already using it
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEYTR);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" });
    
    const prompt = `Translate the following text to ${targetLanguage}. Only return the translation without any explanations or additional text:
    
    "${text}"`;
    
    const result = await model.generateContent(prompt);
    const translation = result.response?.text()?.trim() || text;
    console.log(`Translated text from "${text}" to "${translation}"`);
    return translation;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Return original text if translation fails
  }
}

// Handles chat
async function handleChat(text, chatId, env) {
  if (!text) {
      await sendLongTelegramMessage(chatId, 'لطفاً متنی برای چت وارد کنید.', env);
      return;
  }
  
  // Send a temporary "processing" message
  const processingMsgId = await sendTemporaryMessage(chatId, '⏳ در حال پردازش درخواست شما... لطفاً صبر کنید.', env);
  
  try {
    const translatedQuery = await translateText(text, "German", env);
    console.log(`Original query: "${text}"`);
    console.log(`Translated query for search: "${translatedQuery}"`);
      const searchResults = {
          ddg: await ddgSearch(text),
          sep: await sepSearch(text),
      };
      
      if (searchResults.ddg.length === 0) {
          searchResults.google = await googleSearch(text, env);
      }
      
      // Get response and AstraDB results
      const { response, astraResults } = await queryGeminiChat(translatedQuery, searchResults, env, text);
      console.log(`Received response from Gemini with ${astraResults ? astraResults.length : 0} AstraDB results`);

      
      // Delete the processing message
      await deleteMessage(chatId, processingMsgId, env);
      
      // Send the main response
      await sendLongTelegramMessage(chatId, response, env);
      console.log("Main response sent");
      // Send AstraDB results as a separate message
      if (astraResults && astraResults.length > 0) {
        console.log(`Sending ${astraResults.length} AstraDB results`);
        const formattedAstraResults = formatAstraResults(astraResults);
        await sendLongTelegramMessage(chatId, formattedAstraResults, env);
        console.log("AstraDB results sent");

      }
  } catch (error) {
      console.error("Error in handleChat:", error);
      
      
      // Make sure to delete the processing message even on error
      await deleteMessage(chatId, processingMsgId, env);
      
      // Send error message
      await sendLongTelegramMessage(chatId, "متاسفانه خطایی در پردازش درخواست شما رخ داد. لطفاً دوباره تلاش کنید.", env);
  }
}

async function sendLongTelegramMessage(chatId, text, env) {
  // Maximum length of a Telegram message
  const MAX_MESSAGE_LENGTH = 4000; // Using 4000 to be safe (actual limit is 4096)
  
  // Split the text into chunks
  if (text.length <= MAX_MESSAGE_LENGTH) {
      // If the text is short enough, send it as a single message
      return await sendTelegramMessage(chatId, text, env);
  } else {
      console.log(`Message too long (${text.length} chars), splitting into chunks`);
      
      // Split the text into chunks
      let chunks = [];
      let currentChunk = "";
      
      // Split by paragraphs or sentences to maintain readability
      const paragraphs = text.split('\n\n');
      
      for (const paragraph of paragraphs) {
          // If adding this paragraph would exceed the limit, push current chunk and start a new one
          if (currentChunk.length + paragraph.length + 2 > MAX_MESSAGE_LENGTH) {
              chunks.push(currentChunk);
              currentChunk = paragraph + '\n\n';
          } else {
              currentChunk += paragraph + '\n\n';
          }
      }
      
      // Add the last chunk if it's not empty
      if (currentChunk.trim()) {
          chunks.push(currentChunk);
      }
      
      // Send each chunk with a small delay to avoid rate limiting
      console.log(`Sending message in ${chunks.length} chunks`);
      for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const chunkNumber = chunks.length > 1 ? `(${i+1}/${chunks.length}) ` : '';
          await sendTelegramMessage(chatId, chunkNumber + chunk, env);
          
          // Add a small delay between messages to avoid rate limiting
          if (i < chunks.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000));
          }
      }
      
      return true;
  }
}
// Send Message to Telegram
async function sendTelegramMessage(chatId, text, env) {
  console.log(`Sending message to chat ${chatId} (${text.length} chars)`);
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: false
  };

  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
      });
      const responseData = await response.json();
      if (response.ok) {
          console.log('Message sent successfully');
          return response;
      } else {
          console.error('Telegram API error:', responseData);
          return new Response('Telegram API error', { status: 500 });
      }
  } catch (error) {
      console.error('Error sending message:', error);
      return new Response('Error', { status: 500 });
  }
}

// Help Text for Telegram Bot
function getHelpText() {
  return `
دستورات موجود:

/start - شروع کار با ربات
/help - نمایش این راهنما
/search [متن] - جستجو در منابع مختلف
/chat [متن] - گفتگو با هوش مصنوعی (با تمرکز بر فلسفه)

برای استفاده از قابلیت جستجو، بعد از دستور /search متن مورد نظر خود را وارد کنید.
برای چت، می‌توانید مستقیماً پیام خود را ارسال کنید یا از دستور /chat استفاده کنید.
`;
}

// --- Hono Route for Telegram Webhook ---
app.post('/webhook', async (c) => {
    try {
      console.log('Received webhook request');
        const update = await c.req.json();
        console.log('Webhook payload:', JSON.stringify(update));
        if (update.message) {
          console.log('Processing message from:', update.message.from?.username || 'unknown user');
            await handleTelegramMessage(update.message, c.env);
            console.log('Message processing completed');
        }
        return c.text('OK');
    } catch (err) {
        console.error('Telegram Webhook Error:', err);
        return c.text('Error', { status: 500 });
    }
});

app.get('/test', (c) => c.text('Webhook Test'));

// --- Export the Hono app ---

export default app;
