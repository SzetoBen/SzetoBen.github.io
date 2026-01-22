
// Configuration
const ACCESS_NAME = "chelsea kim"; // Placeholder name
const VALENTINES_DATE = new Date("2026-02-14T00:00:00"); // Target Date

// Slideshow Configuration
// You need to put images in the 'slideshow' folder and update this list!
const SLIDESHOW_IMAGES = [
    "slideshow/IMG_1474.png",
    "slideshow/IMG_1494.png",
    "slideshow/IMG_2003.png",
    "slideshow/IMG_2005.png",
    "slideshow/IMG_2693.png",
    "slideshow/IMG_2841.png",
    "slideshow/IMG_2878.png",
    "slideshow/IMG_3246.jpg",
    "slideshow/IMG_7223.png",
];
const SLIDE_DURATION = 3000; // 3 seconds per slide

// Background Configuration
const LANDING_PAGE_ICON = "icon/stitch.png"; // Change this to an emoji (e.g. "🌸") or an image path (e.g. "icon.png")

document.addEventListener('DOMContentLoaded', () => {
    // Page Identification
    const path = window.location.pathname;
    const page = path.split("/").pop();

    // Floating Items Animation
    // Check if landing page and if a custom icon is set
    if (page === "" || page === "index.html") {
        createFloatingItems(LANDING_PAGE_ICON);
    } else {
        createFloatingItems("❤️"); // Default for other pages
    }

    if (page === "" || page === "index.html") {
        setupLandingPage();
    } else if (page === "proposal.html") {
        setupProposalPage();
    } else if (page === "celebration.html") {
        document.body.classList.add('celebration'); // Add class for CSS styling
        setupCelebrationPage();
        setupSlideshow();
    }
});

function setupSlideshow() {
    const imgElement = document.getElementById('slideshow-img');
    if (!imgElement) return;

    let currentIndex = 0;

    // Initial Image
    imgElement.src = SLIDESHOW_IMAGES[0];

    setInterval(() => {
        // Fade out
        imgElement.style.opacity = 0;

        setTimeout(() => {
            // Change image
            currentIndex = (currentIndex + 1) % SLIDESHOW_IMAGES.length;
            imgElement.src = SLIDESHOW_IMAGES[currentIndex];

            // Fade in
            imgElement.style.opacity = 1;
        }, 1000); // Wait for fade out to finish (matches CSS transition)

    }, SLIDE_DURATION + 1000); // Duration + transition time
}

function createFloatingItems(content) {
    const bg = document.createElement('div');
    bg.className = 'bg-hearts'; // Keeping class name for positioning, but content changes
    document.body.appendChild(bg);

    const isImage = content.includes(".") && !content.includes(" "); // Simple check for file extension

    for (let i = 0; i < 20; i++) {
        const item = document.createElement('div');
        item.className = 'floating-item';

        if (isImage) {
            const img = document.createElement('img');
            img.src = content;
            item.appendChild(img);
        } else {
            item.textContent = content; // Emoji or Text
        }

        item.style.left = Math.random() * 100 + "vw";
        item.style.animationDuration = (Math.random() * 10 + 10) + "s";
        item.style.animationDelay = (Math.random() * 10) + "s";

        bg.appendChild(item);
    }
}

function setupLandingPage() {
    const loginBtn = document.getElementById('login-btn');
    const nameInput = document.getElementById('name-input');
    const errorMsg = document.getElementById('error-msg');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            validateName(nameInput.value, errorMsg);
        });

        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                validateName(nameInput.value, errorMsg);
            }
        });
    }
}

function validateName(inputName, errorElement) {
    if (inputName.trim().toLowerCase() === ACCESS_NAME.toLowerCase()) {
        window.location.href = "proposal.html";
    } else {
        errorElement.style.display = "block";
        errorElement.textContent = "Access Denied: Try 'Valentine'";
        // Shake animation effect could be added here
    }
}

function setupProposalPage() {
    const yesBtn = document.getElementById('yes-btn');
    const noBtn = document.getElementById('no-btn');

    if (yesBtn) {
        yesBtn.addEventListener('click', () => {
            window.location.href = "celebration.html";
        });
    }

    if (noBtn) {
        const noTexts = [
            "Are you sure?",
            "Think again!",
            "Really?",
            "Try the other one!",
            "You can't say no!",
            "Last chance!",
            "Don't do it!",
            "Wrong button!",
            "Nice try!",
            "Nope!"
        ];

        noBtn.addEventListener('mouseover', () => {
            // Get random position within viewport
            // Subtract button dimensions to keep it visible
            const x = Math.random() * (window.innerWidth - noBtn.offsetWidth);
            const y = Math.random() * (window.innerHeight - noBtn.offsetHeight);

            noBtn.style.left = `${x}px`;
            noBtn.style.top = `${y}px`;

            // Change text
            const randomText = noTexts[Math.floor(Math.random() * noTexts.length)];
            noBtn.innerText = randomText;
        });

        noBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Just in case they somehow click it
        });
    }
}

function setupCelebrationPage() {
    const countdownEl = document.getElementById('countdown');
    const letterEl = document.getElementById('letter');
    const waitMsgEl = document.getElementById('wait-msg');

    function updateCountdown() {
        const now = new Date();
        const diff = VALENTINES_DATE - now;

        if (diff <= 0) {
            // It is time!
            if (countdownEl) countdownEl.style.display = 'none';
            if (waitMsgEl) waitMsgEl.style.display = 'none';
            if (letterEl) letterEl.style.display = 'block';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (countdownEl) {
            countdownEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
    }

    setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial call
}
