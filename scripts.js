// Cache DOM elements
let collapsibles;
let sections;
let sidebarNav;
let searchInput;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeSidebar();
    initializeEventListeners();
});

// Initialize DOM element references
function initializeElements() {
    collapsibles = document.querySelectorAll('.collapsible');
    sections = document.querySelectorAll('.docs-section');
    sidebarNav = document.getElementById('sidebar-nav');
    searchInput = document.getElementById('searchInput');
}

// Initialize sidebar
function initializeSidebar() {
    if (!sidebarNav) return;
    
    sections.forEach(section => {
        const button = section.querySelector('.collapsible');
        const link = document.createElement('a');
        link.href = `#${section.id}`;
        link.className = 'docs-nav-link';
        link.setAttribute('data-section', section.id);
        link.textContent = button.textContent;
        sidebarNav.appendChild(link);
    });
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search functionality
function performSearch() {
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    sections.forEach((section) => {
        const content = section.textContent.toLowerCase();
        const sidebarLink = document.querySelector(`.docs-nav-link[data-section="${section.id}"]`);
        
        if (content.includes(searchTerm)) {
            section.style.display = 'block';
            if (sidebarLink) sidebarLink.style.display = 'block';
        } else {
            section.style.display = 'none';
            if (sidebarLink) sidebarLink.style.display = 'none';
        }
    });
}

// Toggle section expansion
function toggleSection(button, content) {
    if (!button || !content) return;

    const isExpanded = content.style.maxHeight;
    
    if (isExpanded) {
        content.style.maxHeight = null;
        button.classList.remove('active');
        button.setAttribute('aria-expanded', 'false');
        
        // Remove active class from sidebar link
        const sidebarLink = document.querySelector(`.docs-nav-link[data-section="${button.closest('.docs-section').id}"]`);
        if (sidebarLink) {
            sidebarLink.classList.remove('active');
        }
    } else {
        content.style.maxHeight = content.scrollHeight + "px";
        button.classList.add('active');
        button.setAttribute('aria-expanded', 'true');
        
        // Add active class to sidebar link
        const sidebarLink = document.querySelector(`.docs-nav-link[data-section="${button.closest('.docs-section').id}"]`);
        if (sidebarLink) {
            sidebarLink.classList.add('active');
        }
    }
}

// Initialize all event listeners
function initializeEventListeners() {
    // Search input listener
    if (searchInput) {
        searchInput.addEventListener('input', debounce(performSearch, 300));
    }

    // Collapsible buttons listeners
    collapsibles.forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            toggleSection(button, content);
        });
    });

    // Sidebar navigation listeners
    document.querySelectorAll('.docs-nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            if (!section) return;

            const button = section.querySelector('.collapsible');
            const content = button.nextElementSibling;
            
            // Toggle the section
            toggleSection(button, content);
            
            // Scroll into view only if expanding
            if (!content.style.maxHeight) {
                section.scrollIntoView({ behavior: 'smooth' });
            }

            // Toggle active class on sidebar link
            document.querySelectorAll('.docs-nav-link').forEach(l => l.classList.remove('active'));
            if (!content.style.maxHeight) {
                this.classList.add('active');
            }
        });
    });
}

// Update copyright year
function updateCopyright() {
    const copyrightYear = document.getElementById('copyright-year');
    if (copyrightYear) {
        copyrightYear.textContent = new Date().getFullYear();
    }
}
