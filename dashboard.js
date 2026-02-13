// Dashboard Logic
document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initQuotes();
    initTradingViewWidgets();
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
/*                            TradingView Widgets                             */
/* -------------------------------------------------------------------------- */
function initTradingViewWidgets() {
    // 1. Watchlist (Left)
    new TradingView.widget({
        "container_id": "tradingview_watchlist",
        "width": "100%",
        "height": "100%",
        "symbol": "NASDAQ:AAPL",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "details": true,
        "hotlist": true,
        "calendar": false,
        "news": ["headlines"],
        "show_popup_button": true,
        "popup_width": "1000",
        "popup_height": "650"
    });

    // 2. Chart (Center) - Advanced Chart
    new TradingView.widget({
        "container_id": "tradingview_chart",
        "width": "100%",
        "height": "100%",
        "symbol": "SP:SPX",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "details": true
    });

    // 3. Timeline (Right) - We inject this via script tag creation because it's a different type
    const timelineContainer = document.getElementById('tradingview_timeline');
    if (timelineContainer) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
            "feedMode": "all_symbols",
            "colorTheme": "dark",
            "isTransparent": true,
            "displayMode": "regular",
            "width": "100%",
            "height": "100%",
            "locale": "en"
        });
        timelineContainer.appendChild(script);
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

            data.items.slice(0, 10).forEach(item => {
                const div = document.createElement('div');
                div.className = 'news-item';

                const date = new Date(item.pubDate).toLocaleDateString();

                div.innerHTML = `
                    <a href="${item.link}" target="_blank" class="news-title">${item.title}</a>
                    <div class="news-meta">SOURCE: ${data.feed.title} // ${date}</div>
                `;

                listEl.appendChild(div);
            });
        } else {
            listEl.innerHTML = '<div class="news-item">Error loading feed.</div>';
        }
    } catch (e) {
        console.error("RSS Fetch Error", e);
        listEl.innerHTML = '<div class="news-item">System Offline (Feed Error).</div>';
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

        // Wait for load (in a real robust system we'd use onload, but setInterval feels "hacky-cool" for this dashboard)
        // With 3s interval, we assume it loads fast enough. 
        // For "Hundreds of photos", this lazy src setting is key.

        // Swap Opacity
        nextSlideEl.style.opacity = 1;
        currentSlideEl.style.opacity = 0;

        // Update State
        currentIndex = nextIndex;
        activeSlide = activeSlide === 1 ? 2 : 1;

    }, 5000); // 5 Seconds
}
