// Configuration
const WUD_API_URL = "/api/containers";
const REFRESH_INTERVAL = 300000; // 5 minutes in milliseconds

// Apply dark mode immediately before content loads
(function() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (savedTheme === null && prefersDark)) {
        document.documentElement.classList.add('dark-mode');
    }
})();

// Main function to fetch containers from WUD API
async function fetchContainers() {
    showLoading();

    try {
        const response = await fetch(WUD_API_URL, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(
                `Server returned ${response.status}: ${response.statusText}`
            );
        }

        const data = await response.json();
        displayContainers(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        showError(error);
    }
}

function showLoading() {
    const grid = document.getElementById("containerGrid");
    grid.innerHTML = `
        <div class="loading-card">
            <div>Loading container information...</div>
        </div>
    `;
}

function showError(error) {
    const grid = document.getElementById("containerGrid");
    grid.innerHTML = `
        <div class="error-card">
            Error fetching data from WUD API: ${error.message}
            <br>
            <small>Please check if the WUD service is running and accessible.</small>
        </div>
    `;
}

function displayContainers(containers) {
    const grid = document.getElementById("containerGrid");
    grid.innerHTML = "";

    if (!Array.isArray(containers) || containers.length === 0) {
        grid.innerHTML = `
            <div class="loading-card">
                No containers found
            </div>
        `;
        return;
    }

    // Sort containers by name (case-insensitive)
    containers
        .sort((a, b) =>
            (a.displayName || a.name).toLowerCase().localeCompare(
                (b.displayName || b.name).toLowerCase()
            )
        )
        .forEach((container) => {
            const card = document.createElement("div");
            const name = container.displayName || container.name;
            const currentVersion = container.image.tag.value;
            const updateAvailable = container.updateAvailable;

            card.className = `container-card${updateAvailable ? ' update-available' : ''}`;
            
            card.innerHTML = `
                <div class="container-name">${escapeHtml(name)}</div>
                <div class="container-info">
                    <span class="info-label">Version:</span>
                    <span class="info-value">${escapeHtml(currentVersion)}</span>
                    <span class="info-label">Update:</span>
                    <span class="info-value ${updateAvailable ? 'status-update-available' : 'status-up-to-date'}">
                        ${updateAvailable ? "Available" : "Up to date"}
                    </span>
                </div>
            `;

            grid.appendChild(card);
        });

    updateLastCheckedTime();
}

// Helper function to escape HTML special characters
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Update the last checked timestamp
function updateLastCheckedTime() {
    const updateTimeDisplay = document.getElementById("updateTimeDisplay");
    const now = new Date();
    
    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    };
    
    updateTimeDisplay.textContent = `Last checked: ${now.toLocaleString(
        undefined,
        options
    )}`;
}

// Enhanced dark mode toggle functionality
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;
    
    // Check for saved preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Update button state without changing theme (already applied)
    if (savedTheme === 'dark' || (savedTheme === null && prefersDark)) {
        updateDarkModeButton(true);
    } else {
        updateDarkModeButton(false);
    }

    // Toggle button handler
    darkModeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark-mode');
        const isDark = document.documentElement.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateDarkModeButton(isDark);
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('theme') === null) {
            const shouldBeDark = e.matches;
            document.documentElement.classList.toggle('dark-mode', shouldBeDark);
            updateDarkModeButton(shouldBeDark);
        }
    });
}

// Update dark mode button appearance
function updateDarkModeButton(isDark) {
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.innerHTML = `
        <span class="mode-icon">${isDark ? '☀️' : '🌙'}</span>
        <span class="mode-text">${isDark ? 'Light Mode' : 'Dark Mode'}</span>
    `;
}

// Function to initialize the application
function initializeApp() {
    // Load logo with fade effect
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.opacity = '0';
        logo.style.transition = 'opacity 0.3s ease';
        
        logo.addEventListener('load', () => {
            requestAnimationFrame(() => {
                logo.style.opacity = '1';
            });
        });
        
        logo.addEventListener('error', () => {
            logo.style.display = 'none';
        });
    }

    // Initialize dark mode before first render
    initDarkMode();

    // Perform initial fetch
    fetchContainers();

    // Set up periodic refresh
    setInterval(fetchContainers, REFRESH_INTERVAL);

    // Handle pull-to-refresh on mobile
    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].clientY;
        if (touchEndY - touchStartY > 100 && window.scrollY === 0) {
            // Pull-to-refresh gesture detected
            fetchContainers();
        }
    }, { passive: true });
}

// Start the application when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", initializeApp);

// Add error handling for unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
    showError(event.reason);
});

// Add keyboard shortcuts
document.addEventListener("keydown", (event) => {
    // Manual refresh (Ctrl/Cmd + R)
    if ((event.ctrlKey || event.metaKey) && event.key === "r") {
        event.preventDefault();
        fetchContainers();
    }
    
    // Toggle dark mode (Ctrl/Cmd + D)
    if ((event.ctrlKey || event.metaKey) && event.key === "d") {
        event.preventDefault();
        document.getElementById('darkModeToggle').click();
    }
});

// Register service worker for better mobile experience
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}
