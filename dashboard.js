document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initQuotes();
    initGlobalNews();
    initStockWidget(); // AddedStock Widget
    initTechNews();
    initSlideshow();
});

/* -------------------------------------------------------------------------- */
/*                                 Clock & Date                               */
/* -------------------------------------------------------------------------- */
function initClock() {
    const timeEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');

    function update() {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
        dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    setInterval(update, 1000);
    update();
}

/* -------------------------------------------------------------------------- */
/*                                   Quotes                                   */
/* -------------------------------------------------------------------------- */
const QUOTES = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "It always seems impossible until it is done.", author: "Nelson Mandela" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
    { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
    { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
    { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
    { text: "Stay hungry, stay foolish.", author: "Steve Jobs" }
];

function initQuotes() {
    const quoteEl = document.getElementById('daily-quote');
    const authorEl = document.getElementById('quote-author');

    // Random Quote for now
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

    quoteEl.textContent = randomQuote.text;
    authorEl.textContent = "- " + randomQuote.author;
}

/* -------------------------------------------------------------------------- */
/*                            Stock Analyst Widget                            */
/* -------------------------------------------------------------------------- */
// USER: Add your tickers here!
const MY_TICKERS = [
    { symbol: "NASDAQ:AAPL", label: "Apple Inc." },
    { symbol: "NASDAQ:NVDA", label: "NVIDIA Corp." },
    { symbol: "NASDAQ:TSLA", label: "Tesla Inc." },
    { symbol: "NASDAQ:MSFT", label: "Microsoft" },
    { symbol: "NASDAQ:AMZN", label: "Amazon" },
    { symbol: "NASDAQ:GOOGL", label: "Google" },
    { symbol: "CRYPTO:BTCUSD", label: "Bitcoin" }
];

function initStockWidget() {
    const select = document.getElementById('ticker-select');
    const container = document.getElementById('analyst-widget-container');

    if (!select || !container) return; // Guard clause

    // Populate Dropdown
    MY_TICKERS.forEach(t => {
        const option = document.createElement('option');
        option.value = t.symbol;
        option.textContent = `${t.label} [${t.symbol.split(':')[1]}]`;
        select.appendChild(option);
    });

    // Function to inject widget
    function loadWidget(symbol) {
        container.innerHTML = ''; // Clear previous

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
            "interval": "1D",
            "width": "100%",
            "isTransparent": true,
            "height": "100%",
            "symbol": symbol,
            "showIntervalTabs": true,
            "locale": "en",
            "colorTheme": "dark"
        });

        container.appendChild(script);
    }

    // Initial Load
    loadWidget(MY_TICKERS[0].symbol);

    // Change Listener
    select.addEventListener('change', (e) => {
        loadWidget(e.target.value);
    });
}


/* -------------------------------------------------------------------------- */
/*                                 Global News                                */
/* -------------------------------------------------------------------------- */
// Using NYT Top Stories
const GLOBAL_RSS_URL = "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml";
// Alternative: BBC: http://feeds.bbci.co.uk/news/rss.xml
const GLOBAL_RSS_API = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(GLOBAL_RSS_URL)}`;

async function initGlobalNews() {
    const listEl = document.getElementById('global-news-list');

    try {
        const response = await fetch(GLOBAL_RSS_API);
        const data = await response.json();

        if (data.status === 'ok') {
            listEl.innerHTML = ''; // Clear loading text

            // Show more items for Global News since it's a big panel
            data.items.slice(0, 15).forEach(item => {
                const div = document.createElement('div');
                div.className = 'news-item';

                // Format Date nicely
                const date = new Date(item.pubDate);
                const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                div.innerHTML = `
                    <a href="${item.link}" target="_blank" class="news-title">${item.title}</a>
                    <div class="news-meta">
                        <span style="color:var(--neon-yellow)">[${timeString}]</span> 
                        ${item.content ? item.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : ''}
                    </div>
                `;

                listEl.appendChild(div);
            });
        } else {
            listEl.innerHTML = '<div class="news-item">ERR: FEED_OFFLINE</div>';
        }
    } catch (e) {
        console.error("Global RSS Fetch Error", e);
        listEl.innerHTML = '<div class="news-item">ERR: NETWORK_FAILURE</div>';
    }
}

/* -------------------------------------------------------------------------- */
/*                                 Tech News                                  */
/* -------------------------------------------------------------------------- */
// Using RSS2JSON to get TechCrunch or The Verge
const RSS_FEED_URL = "https://techcrunch.com/feed/";
const RSS_API = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_FEED_URL)}`;

async function initTechNews() {
    const listEl = document.getElementById('tech-news-list');

    try {
        const response = await fetch(RSS_API);
        const data = await response.json();

        if (data.status === 'ok') {
            listEl.innerHTML = ''; // Clear loading text

            data.items.slice(0, 8).forEach(item => {
                const div = document.createElement('div');
                div.className = 'news-item';

                div.innerHTML = `
                    <a href="${item.link}" target="_blank" class="news-title">${item.title}</a>
                `;

                listEl.appendChild(div);
            });
        } else {
            listEl.innerHTML = '<div class="news-item">ERR: DATA_CORRUPT</div>';
        }
    } catch (e) {
        console.error("RSS Fetch Error", e);
        listEl.innerHTML = '<div class="news-item">ERR: SIGNAL_LOST</div>';
    }
}

/* -------------------------------------------------------------------------- */
/*                             Slideshow (Lazy)                               */
/* -------------------------------------------------------------------------- */
// Default fallbacks if no JSON found
const DEFAULT_IMAGES = [
    "slideshow/IMG_1474.png",
    "slideshow/IMG_1494.png",
    "slideshow/IMG_2003.png",
    "slideshow/IMG_2005.png",
    "slideshow/IMG_2693.png",
    "slideshow/IMG_2841.png",
    "slideshow/IMG_2878.png",
    "slideshow/IMG_3246.jpg",
    "slideshow/IMG_7223.png"
];

async function initSlideshow() {
    const slide1 = document.getElementById('dashboard-slide-1');
    const slide2 = document.getElementById('dashboard-slide-2');

    if (!slide1 || !slide2) return;

    let images = [];

    // Try to fetch generated list first
    try {
        const res = await fetch('slideshow/photos.json');
        if (res.ok) {
            images = await res.json();
        } else {
            throw new Error("No photos.json");
        }
    } catch (e) {
        console.log("Using default images");
        images = DEFAULT_IMAGES;
    }

    if (images.length === 0) return;

    // Shuffle Array
    for (let i = images.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [images[i], images[j]] = [images[j], images[i]];
    }

    let currentIndex = 0;
    let activeSlide = 1;

    // Initialize first image
    slide1.src = images[0];
    slide1.style.opacity = 1;

    // Transition Loop
    setInterval(() => {
        const nextIndex = (currentIndex + 1) % images.length;
        const nextImage = images[nextIndex];

        const nextSlideEl = activeSlide === 1 ? slide2 : slide1;
        const currentSlideEl = activeSlide === 1 ? slide1 : slide2;

        // Load next image
        nextSlideEl.src = nextImage;

        // Swap Opacity
        nextSlideEl.style.opacity = 1;
        currentSlideEl.style.opacity = 0;

        // Update State
        currentIndex = nextIndex;
        activeSlide = activeSlide === 1 ? 2 : 1;

    }, 5000); // 5 Seconds
}
