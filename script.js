
// Configuration
const ACCESS_NAME = "chelsea kim"; // Placeholder name
const VALENTINES_DATE = new Date("2026-02-14T05:00:00"); // Target Date 

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
// You can now put multiple items in this list!
const LANDING_PAGE_ICONS = [
    "icon/stitch.png",
    "icon/hangydon.png"
];

document.addEventListener('DOMContentLoaded', () => {
    // Page Identification
    const path = window.location.pathname;
    const page = path.split("/").pop();

    // Floating Items Animation
    // Check if landing page and if a custom icon (or list) is set
    if (page === "" || page === "index.html") {
        createFloatingItems(LANDING_PAGE_ICONS);
    } else {
        createFloatingItems(["❤️", "💕"]); // Default mix for other pages
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
    const slide1 = document.getElementById('slide-1');
    const slide2 = document.getElementById('slide-2');

    if (!slide1 || !slide2) return;

    let currentIndex = 0;
    let activeSlide = 1; // 1 or 2

    // Determine initial image if we have one
    if (SLIDESHOW_IMAGES.length > 0) {
        slide1.src = SLIDESHOW_IMAGES[0];
    }

    function transitionToNext() {
        // If only 1 image, don't cycle
        if (SLIDESHOW_IMAGES.length <= 1) return;

        const nextIndex = (currentIndex + 1) % SLIDESHOW_IMAGES.length;
        const nextImageSrc = SLIDESHOW_IMAGES[nextIndex];

        // Identify which element is currently hidden (back buffer)
        // If activeSlide is 1 (visible), we want to load into slide2
        const nextSlideEl = activeSlide === 1 ? slide2 : slide1;
        const currentSlideEl = activeSlide === 1 ? slide1 : slide2;

        // Load the next image into the hidden element
        const preloadImg = new Image();
        const startTime = Date.now(); // Start timer when we BEGIN loading

        preloadImg.src = nextImageSrc;

        preloadImg.onload = () => {
            // Once loaded, set the src of the actual hidden DOM element
            nextSlideEl.src = nextImageSrc;

            // Calculate how much time passed while loading
            const elapsed = Date.now() - startTime;
            // Subtract that from the intended duration
            // If loading took 1s and duration is 3s, we wait 2s more.
            // If loading took 5s, we wait 0s (immediate transition).
            const remainingTime = Math.max(0, SLIDE_DURATION - elapsed);

            // Wait for display duration before starting transition
            setTimeout(() => {
                // Standard Crossfade:
                // 1. Ensure nextSlide (back) is z-index 1 and fully opaque
                nextSlideEl.style.zIndex = 1;
                nextSlideEl.style.opacity = 1;

                // 2. Ensure currentSlide (front) is z-index 2
                currentSlideEl.style.zIndex = 2;

                // 3. Fade out currentSlide (revealing nextSlide behind it)
                currentSlideEl.style.opacity = 0;

                // 4. After transition, updating tracking
                setTimeout(() => {
                    activeSlide = activeSlide === 1 ? 2 : 1;
                    currentIndex = nextIndex;
                    transitionToNext();
                }, 1000); // Transition time

            }, remainingTime);
        };

        preloadImg.onerror = () => {
            console.error("Failed to load image:", nextImageSrc);
            currentIndex = nextIndex; // Skip
            transitionToNext();
        };
    }

    // Start the loop
    transitionToNext();
}

function createFloatingItems(contentInput) {
    const bg = document.createElement('div');
    bg.className = 'bg-hearts'; // Keeping class name for positioning
    document.body.appendChild(bg);

    for (let i = 0; i < 20; i++) {
        const item = document.createElement('div');
        item.className = 'floating-item';

        // Determine content for this specific particle
        let content;
        if (Array.isArray(contentInput)) {
            content = contentInput[Math.floor(Math.random() * contentInput.length)];
        } else {
            content = contentInput;
        }

        const isImage = content.includes(".") && !content.includes(" "); // Simple check for file extension

        if (isImage) {
            const img = document.createElement('img');
            img.src = content;
            item.appendChild(img);
        } else {
            item.textContent = content; // Emoji or Text
        }

        item.style.left = Math.random() * 100 + "vw";
        item.style.animationDuration = (Math.random() * 10 + 10) + "s";
        // Negative delay makes it start "mid-animation" so screen is full immediately
        item.style.animationDelay = -(Math.random() * 15) + "s";

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
        errorElement.textContent = "Access Denied: You are not the one for me";
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
            "Seriouslly?",
            "Not Sigma",
            "Try the other one!",
            "진짜?",
            "Don't do it.",
            "Ur so mean",
            "Please?"
        ];

        noBtn.addEventListener('mouseover', () => {
            // Change text FIRST so we update dimensions based on new text length
            const randomText = noTexts[Math.floor(Math.random() * noTexts.length)];
            noBtn.innerText = randomText;

            // Make button absolute so it moves relative to the container
            noBtn.style.position = 'absolute';

            // Get container dimensions
            const container = document.querySelector('.container');
            if (!container) return; // Safety check

            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;

            // Get button dimensions (after text update)
            const btnWidth = noBtn.offsetWidth;
            const btnHeight = noBtn.offsetHeight;

            // Calculate random position with padding inside the container
            const padding = 10;
            const maxX = containerWidth - btnWidth - padding;
            const maxY = containerHeight - btnHeight - padding;

            // Ensure minimums
            const x = Math.max(padding, Math.random() * maxX);
            const y = Math.max(padding, Math.random() * maxY);

            noBtn.style.left = `${x}px`;
            noBtn.style.top = `${y}px`;
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
