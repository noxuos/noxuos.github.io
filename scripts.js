// Cache DOM elements
let collapsibles;
let sections;
let sidebarNav;
let searchInput;
let mobileMenuToggle;
let navLinks;
let sidebarToggle;
let sidebar;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeElements();
        initializeSidebar();
        initializeEventListeners();
        initializeMobileMenu();
        updateCopyright();
        initializeNavigation();
        initializeMainContent();
        handleInitialHash();
        initializeSearch();
    } catch (error) {
        console.error('Initialization error:', error);
    }
});

// Initialize DOM element references
function initializeElements() {
    collapsibles = document.querySelectorAll('.collapsible');
    sections = document.querySelectorAll('.docs-section');
    sidebarNav = document.getElementById('sidebar-nav');
    searchInput = document.getElementById('searchInput');
    mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    navLinks = document.querySelector('.nav-links');
    sidebarToggle = document.querySelector('.sidebar-toggle');
    sidebar = document.querySelector('.docs-sidebar');
}

// Initialize mobile menu with improved touch handling
function initializeMobileMenu() {
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.classList.toggle('active');
            const isExpanded = navLinks.classList.contains('active');
            mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
            mobileMenuToggle.setAttribute('aria-label', 
                isExpanded ? 'Close menu' : 'Open menu');
        });
    }

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', (e) => {
            e.preventDefault();
            sidebar.classList.toggle('active');
            const isExpanded = sidebar.classList.contains('active');
            sidebarToggle.setAttribute('aria-expanded', isExpanded);
            sidebarToggle.setAttribute('aria-label', 
                isExpanded ? 'Close sidebar' : 'Open sidebar');
        });

        // Close sidebar when clicking outside or on escape key
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('active') && 
                !sidebar.contains(e.target) && 
                !sidebarToggle.contains(e.target)) {
                closeSidebar();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('active')) {
                closeSidebar();
            }
        });
    }
}

// Helper function to close sidebar
function closeSidebar() {
    if (sidebar && sidebarToggle) {
        sidebar.classList.remove('active');
        sidebarToggle.setAttribute('aria-expanded', 'false');
        sidebarToggle.setAttribute('aria-label', 'Open sidebar');
    }
}

// Initialize sidebar with ARIA attributes
function initializeSidebar() {
    if (!sidebarNav) return;
    
    sections.forEach(section => {
        const button = section.querySelector('.collapsible');
        if (!button) return;

        const link = document.createElement('a');
        link.href = `#${section.id}`;
        link.className = 'docs-nav-link';
        link.setAttribute('data-section', section.id);
        link.setAttribute('role', 'button');
        link.setAttribute('aria-controls', section.id);
        link.textContent = button.textContent.trim();
        sidebarNav.appendChild(link);
    });
}

// Improved debounce function
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

// Enhanced search functionality with highlighting
function performSearch() {
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    let hasResults = false;

    sections.forEach((section) => {
        const content = section.textContent.toLowerCase();
        const sidebarLink = document.querySelector(`.docs-nav-link[data-section="${section.id}"]`);
        const isMatch = content.includes(searchTerm);
        
        section.style.display = isMatch ? 'block' : 'none';
        if (sidebarLink) {
            sidebarLink.style.display = isMatch ? 'block' : 'none';
        }
        
        if (isMatch) {
            hasResults = true;
            highlightSearchTerm(section, searchTerm);
        }
    });

    // Show no results message
    const noResultsMsg = document.getElementById('no-results-message');
    if (noResultsMsg) {
        noResultsMsg.style.display = hasResults ? 'none' : 'block';
    }
}

// Highlight search terms in content
function highlightSearchTerm(section, term) {
    if (!term) return;

    const walker = document.createTreeWalker(
        section,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const nodesToHighlight = [];
    let node;
    while (node = walker.nextNode()) {
        if (node.nodeValue.toLowerCase().includes(term)) {
            nodesToHighlight.push(node);
        }
    }

    nodesToHighlight.forEach(node => {
        const span = document.createElement('span');
        span.className = 'search-highlight';
        const regex = new RegExp(`(${term})`, 'gi');
        span.innerHTML = node.nodeValue.replace(regex, '<mark>$1</mark>');
        node.parentNode.replaceChild(span, node);
    });
}

// Enhanced section toggle with animation
function toggleSection(button, content) {
    if (!button || !content) return;

    const isExpanded = content.style.maxHeight;
    const sidebarLink = document.querySelector(`.docs-nav-link[data-section="${button.closest('.docs-section').id}"]`);
    
    // Close any other open sections
    if (!isExpanded) {
        sections.forEach(section => {
            const otherButton = section.querySelector('.collapsible');
            const otherContent = otherButton?.nextElementSibling;
            if (otherButton !== button && otherContent?.style.maxHeight) {
                otherContent.style.maxHeight = null;
                otherButton.classList.remove('active');
                otherButton.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Toggle current section
    if (isExpanded) {
        content.style.maxHeight = null;
        button.classList.remove('active');
        button.setAttribute('aria-expanded', 'false');
        if (sidebarLink) sidebarLink.classList.remove('active');
    } else {
        content.style.maxHeight = content.scrollHeight + "px";
        button.classList.add('active');
        button.setAttribute('aria-expanded', 'true');
        if (sidebarLink) sidebarLink.classList.add('active');

        // Update max-height when images load
        content.querySelectorAll('img').forEach(img => {
            img.addEventListener('load', () => {
                content.style.maxHeight = content.scrollHeight + "px";
            });
        });
    }
}

// Handle initial hash in URL
function handleInitialHash() {
    if (window.location.hash) {
        const sectionId = window.location.hash.substring(1);
        const section = document.getElementById(sectionId);
        if (section) {
            const button = section.querySelector('.collapsible');
            const content = button?.nextElementSibling;
            if (button && content) {
                setTimeout(() => {
                    toggleSection(button, content);
                    section.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
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

            // Close mobile sidebar if open
            if (window.innerWidth <= 768 && sidebar) {
                sidebar.classList.remove('active');
                sidebarToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

// Initialize navigation
function initializeNavigation() {
    // Hide all nav content initially
    document.querySelectorAll('.nav-group-content, .nav-subgroup-content').forEach(content => {
        content.classList.remove('expanded');
    });

    // Handle main category toggles
    document.querySelectorAll('.nav-group-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const content = toggle.nextElementSibling;
            toggle.classList.toggle('expanded');
            content.classList.toggle('expanded');
        });
    });

    // Handle subcategory toggles
    document.querySelectorAll('.nav-subgroup-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (e.target === toggle || e.target === toggle.querySelector('i')) {
                e.preventDefault();
                const content = toggle.nextElementSibling;
                toggle.classList.toggle('expanded');
                content.classList.toggle('expanded');
            }
        });
    });

    // Handle nav links
    document.querySelectorAll('#sidebar-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            const hash = link.getAttribute('href');
            const section = document.querySelector(hash);
            
            if (!section) {
                e.preventDefault();
                console.warn(`Section ${hash} not found`);
                return;
            }

            // Remove active class from all links
            document.querySelectorAll('#sidebar-nav a').forEach(a => {
                a.parentElement.classList.remove('active');
            });

            // Add active class to clicked link
            link.parentElement.classList.add('active');

            // Expand parent sections
            let parent = link.closest('.nav-group-content');
            while (parent) {
                parent.classList.add('expanded');
                const toggle = parent.previousElementSibling;
                if (toggle) {
                    toggle.classList.add('expanded');
                }
                parent = parent.closest('.nav-group-content');
            }

            // Smooth scroll to section
            section.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// Initialize main content
function initializeMainContent() {
    // Hide all section content initially
    document.querySelectorAll('.section-content, .subsection-content').forEach(content => {
        content.classList.remove('expanded');
    });

    // Handle main section toggles
    document.querySelectorAll('.section-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('expanded');
            const content = toggle.nextElementSibling;
            content.classList.toggle('expanded');
        });
    });

    // Handle subsection toggles
    document.querySelectorAll('.subsection-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('expanded');
            const content = toggle.nextElementSibling;
            content.classList.toggle('expanded');
        });
    });

    // Handle hash links
    if (window.location.hash) {
        const section = document.querySelector(window.location.hash);
        if (section) {
            const toggle = section.querySelector('.section-toggle');
            const content = section.querySelector('.section-content');
            if (toggle && content) {
                toggle.classList.add('expanded');
                content.classList.add('expanded');
            }
        }
    }
}

// Update copyright year
function updateCopyright() {
    const copyrightYear = document.getElementById('copyright-year');
    if (copyrightYear) {
        const startYear = 2024;
        const currentYear = new Date().getFullYear();
        copyrightYear.textContent = startYear === currentYear ? 
            startYear : 
            `${startYear}-${currentYear}`;
    }
}

// Initialize search functionality
function initializeSearch() {
    if (!searchInput) return;

    const clearButton = document.getElementById('clearSearch');
    if (!clearButton) return;

    // Show/hide clear button based on input
    searchInput.addEventListener('input', () => {
        clearButton.style.display = searchInput.value ? 'block' : 'none';
        performSearch();
    });

    // Clear search
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        clearButton.style.display = 'none';
        clearSearch();
    });

    // Clear on escape
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            clearButton.style.display = 'none';
            clearSearch();
            searchInput.blur();
        }
    });
}

// Clear search results
function clearSearch() {
    // Remove highlights
    document.querySelectorAll('.search-highlight').forEach(highlight => {
        const parent = highlight.parentNode;
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
    });

    // Show all sections
    sections.forEach((section) => {
        section.style.display = 'block';
        const sidebarLink = document.querySelector(`.docs-nav-link[data-section="${section.id}"]`);
        if (sidebarLink) {
            sidebarLink.style.display = 'block';
        }
    });

    // Hide no results message
    const noResultsMsg = document.getElementById('no-results-message');
    if (noResultsMsg) {
        noResultsMsg.style.display = 'none';
    }
}
