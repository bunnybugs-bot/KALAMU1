// Consolidated and optimized JavaScript for Kalamu Association Website
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initSmoothScrolling();
    initMobileMenu();
    initTeamCarousel();
    initScrollAnimations();
    initPageLoadAnimation();
    initCounterAnimations();
});

// Smooth scrolling for navigation links - consolidated
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update active link
                updateActiveNavLink(targetId);
                
                // Close mobile menu if open
                closeMobileMenu();
            }
        });
    });
    
    // Update active navigation link on scroll - optimized with throttling
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(updateActiveNavOnScroll, 100);
    });
}

// Update active navigation link based on scroll position
function updateActiveNavOnScroll() {
    const scrollPosition = window.scrollY + 150; // Increased offset for better detection
    let currentSection = '';
    
    document.querySelectorAll('section[id]').forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = `#${sectionId}`;
        }
    });
    
    // If we found a section, update the active link
    if (currentSection) {
        updateActiveNavLink(currentSection);
    }
}

// Update active navigation link
function updateActiveNavLink(targetId) {
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === targetId) {
            link.classList.add('active');
        }
    });
}

// Mobile menu functionality - consolidated
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (!mobileMenuToggle || !mainNav) return;
    
    // Toggle mobile menu
    mobileMenuToggle.addEventListener('click', () => {
        const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
        mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
        mainNav.classList.toggle('active');
        document.body.style.overflow = !isExpanded ? 'hidden' : '';
    });


    // Close mobile menu when clicking on a link
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mainNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mainNav.classList.contains('active')) {
            closeMobileMenu();
        }
    });
}

// Close mobile menu helper function
function closeMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mainNav.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Team carousel functionality - enhanced
function initTeamCarousel() {
    const track = document.querySelector('.team-track');
    const cards = document.querySelectorAll('.team-card');
    const prevBtn = document.querySelector('.team-prev');
    const nextBtn = document.querySelector('.team-next');
    const dotsContainer = document.querySelector('.team-dots');
    
    if (!track || cards.length === 0) return;
    
    let currentIndex = 0;
    const cardsPerView = 3; // Number of cards visible at once
    const totalSlides = Math.ceil(cards.length / cardsPerView);
    
    // Adjust totalSlides to avoid empty slides
    const actualSlides = Math.min(totalSlides, Math.ceil(cards.length / cardsPerView));
    
    // Create dots dynamically
    createTeamDots();
    
    function createTeamDots() {
        if (!dotsContainer) return;
        
        // Clear existing dots
        dotsContainer.innerHTML = '';
        
        // Create exactly 3 dots
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('button');
            dot.className = 'team-dot';
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }
    
    function updateDots() {
        const dots = document.querySelectorAll('.team-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
    
    function updateButtons() {
        if (prevBtn) prevBtn.disabled = currentIndex === 0;
        if (nextBtn) nextBtn.disabled = currentIndex >= 2; // Only 3 slides (0, 1, 2)
    }
    
    function updateActiveCards() {
        cards.forEach((card, index) => {
            const startIndex = currentIndex * cardsPerView;
            const endIndex = startIndex + cardsPerView;
            card.classList.toggle('active', index >= startIndex && index < endIndex);
        });
    }
    
    function goToSlide(slideIndex) {
        currentIndex = slideIndex;
        const translateX = -currentIndex * 100;
        track.style.transform = `translateX(${translateX}%)`;
        updateDots();
        updateButtons();
        updateActiveCards();
    }
    
    // Event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                goToSlide(currentIndex - 1);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentIndex < 2) { // Only 3 slides (0, 1, 2)
                goToSlide(currentIndex + 1);
            }
        });
    }
    
    // Auto-play functionality
    let autoPlayInterval;
    
    function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
            if (currentIndex < 2) { // Only 3 slides (0, 1, 2)
                goToSlide(currentIndex + 1);
            } else {
                goToSlide(0); // Loop back to start
            }
        }, 5000); // Change slide every 5 seconds
    }
    
    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }
    
    // Pause auto-play on hover
    const carousel = document.querySelector('.team-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);
    }
    
    // Initialize
    updateButtons();
    updateActiveCards();
    startAutoPlay();
}

// Scroll-triggered animations - optimized with IntersectionObserver
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Unobserve after animation to improve performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with animation classes
    document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .animate').forEach(el => {
        observer.observe(el);
    });
}

// Page load animation
function initPageLoadAnimation() {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
    }, 100);
}

// Utility function to check if element exists
function elementExists(selector) {
    return document.querySelector(selector) !== null;
}

// Counter animation function for hero stats
function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number');
    if (counters.length === 0) return;
    
    const speed = 200;

    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const inc = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 1);
            } else {
                counter.innerText = target;
            }
        };

        // Start animation when element is in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCount();
                    observer.unobserve(entry.target);
                }
            });
        });

        observer.observe(counter);
    });
}