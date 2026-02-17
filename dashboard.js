// Dashboard Logic
document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initQuotes();
    initDailyBrief();
    initStockWidget();
    initTechNews();
    initSlideshow();
});

/* -------------------------------------------------------------------------- */
/*                                 Clock & Date                               */
/* -------------------------------------------------------------------------- */
function initClock() {
    // In sample.html, date is in a specific <p> and time isn't explicitly shown large, 
    // but let's add time to the 'Systems Optimal' span or similar, 
    // and date to the date text.
    const dateEl = document.getElementById('header-date');
    const statusEl = document.getElementById('header-status'); // We'll put time here

    function update() {
        const now = new Date();
        if (dateEl) {
            // Format: Monday, Oct 23
            dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        }
        if (statusEl) {
            // Format: 10:42 AM
            statusEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
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

    if (!quoteEl || !authorEl) return;

    // Random Quote for now
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

    quoteEl.innerHTML = `"${randomQuote.text}"`; // Added quotes in string
    authorEl.textContent = `— ${randomQuote.author}`;
}

/* -------------------------------------------------------------------------- */
/*                            Stock Analyst Widget                            */
/* -------------------------------------------------------------------------- */
const MY_TICKERS = [
    { symbol: "NASDAQ:AAPL", label: "Apple" },
    { symbol: "NASDAQ:NVDA", label: "NVIDIA" },
    { symbol: "NASDAQ:TSLA", label: "Tesla" },
    { symbol: "NASDAQ:MSFT", label: "Microsoft" },
    { symbol: "NASDAQ:AMZN", label: "Amazon" },
    { symbol: "NASDAQ:GOOGL", label: "Google" },
    { symbol: "CRYPTO:BTCUSD", label: "Bitcoin" }
];

function initStockWidget() {
    const select = document.getElementById('ticker-select');
    const container = document.getElementById('analyst-widget-container');

    if (!select || !container) return;

    // Populate Dropdown
    MY_TICKERS.forEach(t => {
        const option = document.createElement('option');
        option.value = t.symbol;
        option.textContent = t.label;
        select.appendChild(option);
    });

    // Function to inject widget
    function loadWidget(symbol) {
        container.innerHTML = ''; // Clear previous

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
        script.async = true;
        // Adjusted height/width for the card - transparent background
        script.innerHTML = JSON.stringify({
            "interval": "1D",
            "width": "100%",
            "isTransparent": true,
            "height": "100%", // Fit container
            "symbol": symbol,
            "showIntervalTabs": false, // Cleaner look
            "locale": "en",
            "colorTheme": "dark"
        });

        container.appendChild(script);

        // Update Label
        const labelEl = document.getElementById('stock-symbol-label');
        if (labelEl) {
            const ticker = MY_TICKERS.find(x => x.symbol === symbol);
            labelEl.textContent = ticker ? ticker.symbol : symbol;
        }
    }

    // Initial Load
    loadWidget(MY_TICKERS[0].symbol);

    // Change Listener
    select.addEventListener('change', (e) => {
        loadWidget(e.target.value);
    });
}

/* -------------------------------------------------------------------------- */
/*                                Daily Brief                                 */
/* -------------------------------------------------------------------------- */
async function initDailyBrief() {
    const container = document.getElementById('daily-brief-container');
    const dateEl = document.getElementById('brief-date');

    if (!container || !dateEl) return;

    try {
        // Add cache busting to ensure we get the latest brief
        const response = await fetch('data/daily_brief.json?t=' + new Date().getTime());

        if (!response.ok) {
            throw new Error("Brief not found");
        }

        const data = await response.json();

        // Update Date
        if (data.date) {
            dateEl.textContent = data.date;
        } else {
            dateEl.textContent = "Unknown Date";
        }

        // Render Segments
        container.innerHTML = '';

        if (data.brief_segments && data.brief_segments.length > 0) {
            data.brief_segments.forEach(segment => {
                const p = document.createElement('p');
                // Check if segment is a markdown-style header or bullet
                // Simple formatting: 
                // If line starts with "Market Update:", make it bold?
                // Let's just render text for now, maybe handle newlines.

                // Convert newlines to <br> if needed, or just let CSS handle whitespace
                // dashboard.css likely doesn't have whitespace-pre-line by default for p.

                p.innerHTML = segment.replace(/\n/g, '<br>');
                p.className = "mb-2 last:mb-0";
                container.appendChild(p);
            });
        } else {
            container.innerHTML = '<p class="text-white/50 italic">No brief content available.</p>';
        }

    } catch (e) {
        console.error("Daily Brief Error", e);
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-white/30">
                <span class="material-symbols-outlined text-4xl mb-2">sentiment_dissatisfied</span>
                <p>No brief available currently.</p>
            </div>
        `;
        dateEl.textContent = "Offline";
    }
}

/* -------------------------------------------------------------------------- */
/*                                 Tech News                                  */
/* -------------------------------------------------------------------------- */
const TECH_RSS_URL = "https://techcrunch.com/feed/";
const TECH_RSS_API = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(TECH_RSS_URL)}`;

async function initTechNews() {
    const listEl = document.getElementById('tech-news-list');
    if (!listEl) return;

    try {
        const response = await fetch(TECH_RSS_API);
        const data = await response.json();

        if (data.status === 'ok') {
            listEl.innerHTML = '';

            data.items.slice(0, 4).forEach(item => { // Limit to fit logic
                const div = document.createElement('div');
                div.className = "flex gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group";

                // Image or Placeholder
                let imgUrl = item.thumbnail || item.enclosure?.link;
                // Fallback to random Abstract if no image
                if (!imgUrl) imgUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuA2-5nZm0Dr-ArrtsiVUzLdVFjlxItgsP2-tsYlD3x7RPjiq0yer-D25bMli6agnRA4B_boMitScTaBL-PuLoKugQL7gqOHrsMvA-yFym-iw2Q4Et004RLg3GVBJoOefuGdM2o4PiBb1HFEKwfH9K_PmXSvTpGTusiRdl_BbXpX8ZhaF158fCuqHn56vCG95xpSMi9ssPq6RrodkGaHMDWEsC86sN12k9uYdRqRhh6_4myzkMm-A44vJJouwkwgLGSy17kVseYFkPAr";

                const date = new Date(item.pubDate);
                const timeDiff = Math.round((new Date() - date) / 3600000); // hours
                const timeStr = timeDiff + " hours ago";

                div.innerHTML = `
                    <div class="size-16 rounded-lg bg-cover bg-center shrink-0"
                        style="background-image: url('${imgUrl}')">
                    </div>
                    <div class="flex flex-col justify-center w-full">
                        <p class="text-[10px] text-primary font-bold uppercase mb-1">Tech</p>
                        <a href="${item.link}" target="_blank" class="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                            ${item.title}</a>
                        <p class="text-[10px] text-white/30 mt-1">${timeStr}</p>
                    </div>
                `;

                listEl.appendChild(div);
            });
        }
    } catch (e) {
        console.error("Tech RSS Error", e);
    }
}

/* -------------------------------------------------------------------------- */
/*                             Slideshow (Cycled)                             */
/* -------------------------------------------------------------------------- */
const DEFAULT_IMAGES = [
    "slideshow/IMG_1474.png",
    "slideshow/IMG_1494.png",
    "slideshow/IMG_2003.png",
    "slideshow/IMG_2005.png",
    "slideshow/IMG_7223.png"
];

async function initSlideshow() {
    const bgContainer = document.getElementById('slideshow-bg');
    if (!bgContainer) return;

    let images = [];

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

    // Shuffle
    for (let i = images.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [images[i], images[j]] = [images[j], images[i]];
    }

    let currentIndex = 0;

    // Initial
    bgContainer.style.backgroundImage = `url('${images[0]}')`;

    // Interval
    setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        // Fade effect is handled by CSS transition on bg-image? 
        // CSS bg-image transition isn't standard in all browsers, 
        // but the sample uses specific div. Let's just swap for now.
        // For smoother transition, we might need double buffer, but sticky to strict reqs first.
        bgContainer.style.backgroundImage = `url('${images[currentIndex]}')`;
    }, 5000);
}
