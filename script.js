
// Configuration
const ACCESS_NAME = "chelsea kim"; // Placeholder name
const VALENTINES_DATE = new Date("2026-02-14T00:00:00"); // Target Date

document.addEventListener('DOMContentLoaded', () => {
    // Page Identification
    const path = window.location.pathname;
    const page = path.split("/").pop();

    // Floating Hearts Animation
    createHearts();

    if (page === "" || page === "index.html") {
        setupLandingPage();
    } else if (page === "proposal.html") {
        setupProposalPage();
    } else if (page === "celebration.html") {
        setupCelebrationPage();
    }
});

function createHearts() {
    const bg = document.createElement('div');
    bg.className = 'bg-hearts';
    document.body.appendChild(bg);

    for (let i = 0; i < 20; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.style.left = Math.random() * 100 + "vw";
        heart.style.animationDuration = (Math.random() * 10 + 10) + "s";
        heart.style.animationDelay = (Math.random() * 10) + "s";
        bg.appendChild(heart);
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
        noBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Do nothing, or maybe show a funny tooltip
            console.log("No clicked - nothing happens");
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
