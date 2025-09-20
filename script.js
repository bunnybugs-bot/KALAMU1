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
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (!mobileMenuToggle || !mobileMenu) return;
    
    // Toggle mobile menu
        mobileMenuToggle.addEventListener('click', () => {
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
            mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
        mobileMenu.classList.toggle('active');
            document.body.style.overflow = !isExpanded ? 'hidden' : '';
        });

        // Close mobile menu when clicking on a link
    const navLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            mobileMenu.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });

        // Close mobile menu on escape key
        document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
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

// Global functions for header navigation
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        // Close mobile menu if open
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileMenu && mobileToggle) {
            mobileMenu.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');
        }
    }
}

function goToPage(path) {
    if (path === '/') {
        window.location.href = 'index.html';
    } else {
        window.location.href = path;
    }
}

// Image Modal Functions
function openImageModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    
    if (modal && modalImage) {
        modalImage.src = imageSrc;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Add escape key listener
        document.addEventListener('keydown', handleModalEscape);
    }
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        
        // Remove escape key listener
        document.removeEventListener('keydown', handleModalEscape);
    }
}

function handleModalEscape(e) {
    if (e.key === 'Escape') {
        closeImageModal();
    }
}

// Download image function
function downloadImage(imageSrc) {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = imageSrc.split('/').pop() || 'image.jpg';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadModalImage() {
    const modalImage = document.getElementById('modalImage');
    if (modalImage && modalImage.src) {
        downloadImage(modalImage.src);
    }
}

// Close modal when clicking outside the image
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeImageModal();
            }
        });
    }
});

// Members Carousel Functions
let currentCardIndex = 0;
const totalMembers = 11; // Total number of members
const cardsToShow = 3; // Number of cards visible at once

function moveCarousel(direction) {
    const track = document.querySelector('.members-track');
    if (!track) {
        console.log('Track not found');
        return;
    }
    
    currentCardIndex += direction;
    
    // Calculate max index based on visible cards
    const maxIndex = totalMembers - cardsToShow;
    
    if (currentCardIndex < 0) {
        currentCardIndex = maxIndex;
    } else if (currentCardIndex > maxIndex) {
        currentCardIndex = 0;
    }
    
    const translateX = -currentCardIndex * 320; /* Move by card width + gap (300px + 20px) */
    track.style.transform = `translateX(${translateX}px)`;
    
    console.log('Moving to card:', currentCardIndex, 'translateX:', translateX);
    updateDots();
}

function updateDots() {
    const dots = document.querySelectorAll('.dot');
    const currentSlide = Math.floor(currentCardIndex / cardsToShow);
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function goToSlide(slideIndex) {
    currentCardIndex = (slideIndex - 1) * cardsToShow;
    const track = document.querySelector('.members-track');
    if (!track) {
        console.log('Track not found in goToSlide');
        return;
    }
    
    const translateX = -currentCardIndex * 320; /* Move by card width + gap (300px + 20px) */
    track.style.transform = `translateX(${translateX}px)`;
    
    console.log('Going to slide:', slideIndex, 'card index:', currentCardIndex, 'translateX:', translateX);
    updateDots();
}

// Auto-play carousel
let carouselInterval;

function startCarousel() {
    carouselInterval = setInterval(() => {
        moveCarousel(1);
    }, 5000);
}

function stopCarousel() {
    clearInterval(carouselInterval);
}

// Newsletter Subscription
function subscribeNewsletter(event) {
    event.preventDefault();
    
    const emailInput = event.target.querySelector('.newsletter-input');
    const email = emailInput.value.trim();
    
    if (!email) {
        alert('Veuillez entrer une adresse email valide.');
        return;
    }
    
    // Simulate newsletter subscription
    // In a real application, you would send this to your backend
    console.log('Newsletter subscription:', email);
    
    // Show success message
    alert('Merci ! Vous êtes maintenant inscrit à notre newsletter.');
    
    // Clear the form
    emailInput.value = '';
}

// Objectives Carousel Functions
let currentObjectivesIndex = 0;
const totalObjectives = 5;
const objectivesToShow = 1; // 1 card visible on mobile

function moveObjectivesCarousel(direction) {
    const track = document.querySelector('.objectives-track');
    if (!track) {
        console.log('Objectives track not found');
        return;
    }
    
    currentObjectivesIndex += direction;
    
    // Calculate max index based on visible cards
    const maxIndex = totalObjectives - objectivesToShow;
    
    if (currentObjectivesIndex < 0) {
        currentObjectivesIndex = maxIndex;
    } else if (currentObjectivesIndex > maxIndex) {
        currentObjectivesIndex = 0;
    }
    
    const translateX = -currentObjectivesIndex * 300; /* Move by card width (300px) */
    track.style.transform = `translateX(${translateX}px)`;
    
    console.log('Moving objectives to index:', currentObjectivesIndex, 'translateX:', translateX);
    updateObjectivesDots();
}

function updateObjectivesDots() {
    const dots = document.querySelectorAll('.objectives-dot');
    const currentSlide = Math.floor(currentObjectivesIndex / objectivesToShow);
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function goToObjectivesSlide(slideIndex) {
    currentObjectivesIndex = (slideIndex - 1) * objectivesToShow;
    const track = document.querySelector('.objectives-track');
    if (!track) return;
    
    const translateX = -currentObjectivesIndex * 300; /* Move by card width (300px) */
    track.style.transform = `translateX(${translateX}px)`;
    updateObjectivesDots();
}

// Activities Carousel Functions
let currentActivitiesIndex = 0;
const totalActivities = 7;
const activitiesToShow = 1; // 1 card visible on mobile

function moveActivitiesCarousel(direction) {
    const track = document.querySelector('.activities-track');
    if (!track) {
        console.log('Activities track not found');
        return;
    }
    
    currentActivitiesIndex += direction;
    
    // Calculate max index based on visible cards
    const maxIndex = totalActivities - activitiesToShow;
    
    if (currentActivitiesIndex < 0) {
        currentActivitiesIndex = maxIndex;
    } else if (currentActivitiesIndex > maxIndex) {
        currentActivitiesIndex = 0;
    }
    
    const translateX = -currentActivitiesIndex * 300; /* Move by card width (300px) */
    track.style.transform = `translateX(${translateX}px)`;
    
    console.log('Moving activities to index:', currentActivitiesIndex, 'translateX:', translateX);
    updateActivitiesDots();
}

function updateActivitiesDots() {
    const dots = document.querySelectorAll('.activities-dot');
    const currentSlide = Math.floor(currentActivitiesIndex / activitiesToShow);
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function goToActivitiesSlide(slideIndex) {
    currentActivitiesIndex = (slideIndex - 1) * activitiesToShow;
    const track = document.querySelector('.activities-track');
    if (!track) return;
    
    const translateX = -currentActivitiesIndex * 300; /* Move by card width (300px) */
    track.style.transform = `translateX(${translateX}px)`;
    updateActivitiesDots();
}

// Partners Carousel Functions
let currentPartnersIndex = 0;
const totalPartners = 5;
const partnersToShow = 1; // 1 card visible on mobile

function movePartnersCarousel(direction) {
    const track = document.querySelector('.partners-track');
    if (!track) {
        console.log('Partners track not found');
        return;
    }
    
    currentPartnersIndex += direction;
    
    // Calculate max index based on visible cards
    const maxIndex = totalPartners - partnersToShow;
    
    if (currentPartnersIndex < 0) {
        currentPartnersIndex = maxIndex;
    } else if (currentPartnersIndex > maxIndex) {
        currentPartnersIndex = 0;
    }
    
    const translateX = -currentPartnersIndex * 300; /* Move by card width (300px) */
    track.style.transform = `translateX(${translateX}px)`;
    
    console.log('Moving partners to index:', currentPartnersIndex, 'translateX:', translateX);
    updatePartnersDots();
}

function updatePartnersDots() {
    const dots = document.querySelectorAll('.partners-dot');
    const currentSlide = Math.floor(currentPartnersIndex / partnersToShow);
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function goToPartnersSlide(slideIndex) {
    currentPartnersIndex = (slideIndex - 1) * partnersToShow;
    const track = document.querySelector('.partners-track');
    if (!track) return;
    
    const translateX = -currentPartnersIndex * 300; /* Move by card width (300px) */
    track.style.transform = `translateX(${translateX}px)`;
    updatePartnersDots();
}

// Initialize carousel when page loads
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.members-carousel');
    const track = document.querySelector('.members-track');
    const dots = document.querySelectorAll('.dot');
    const memberCards = document.querySelectorAll('.member-card');
    
    console.log('Carousel elements found:', {
        carousel: !!carousel,
        track: !!track,
        dots: dots.length,
        memberCards: memberCards.length
    });
    
    if (carousel) {
        startCarousel();
        
        // Pause on hover
        carousel.addEventListener('mouseenter', stopCarousel);
        carousel.addEventListener('mouseleave', startCarousel);
    }

    // Test objectives carousel
    const objectivesTrack = document.querySelector('.objectives-track');
    const objectivesDots = document.querySelectorAll('.objectives-dot');
    const objectivesCards = document.querySelectorAll('.objectives-track .objective-card');
    
    console.log('Objectives carousel elements found:', {
        objectivesTrack: !!objectivesTrack,
        objectivesDots: objectivesDots.length,
        objectivesCards: objectivesCards.length
    });

    // Test activities carousel
    const activitiesTrack = document.querySelector('.activities-track');
    const activitiesDots = document.querySelectorAll('.activities-dot');
    const activitiesCards = document.querySelectorAll('.activities-track .activity-card');
    
    console.log('Activities carousel elements found:', {
        activitiesTrack: !!activitiesTrack,
        activitiesDots: activitiesDots.length,
        activitiesCards: activitiesCards.length
    });

    // Test partners carousel
    const partnersTrack = document.querySelector('.partners-track');
    const partnersDots = document.querySelectorAll('.partners-dot');
    const partnersCards = document.querySelectorAll('.partners-track .partner-card');
    
    console.log('Partners carousel elements found:', {
        partnersTrack: !!partnersTrack,
        partnersDots: partnersDots.length,
        partnersCards: partnersCards.length
    });

    // Test books carousels
    const classicsSection = document.querySelector('.books-category:first-of-type');
    const classicsTrack = classicsSection ? classicsSection.querySelector('.books-track') : null;
    const classicsDots = classicsSection ? classicsSection.querySelectorAll('.books-dot') : [];
    const classicsCards = classicsSection ? classicsSection.querySelectorAll('.book-card') : [];
    
    console.log('Classics carousel elements found:', {
        classicsSection: !!classicsSection,
        classicsTrack: !!classicsTrack,
        classicsDots: classicsDots.length,
        classicsCards: classicsCards.length
    });

    const contemporarySection = document.querySelector('.books-category:nth-of-type(2)');
    const contemporaryTrack = contemporarySection ? contemporarySection.querySelector('.books-track') : null;
    const contemporaryDots = contemporarySection ? contemporarySection.querySelectorAll('.books-dot') : [];
    const contemporaryCards = contemporarySection ? contemporarySection.querySelectorAll('.book-card') : [];
    
    console.log('Contemporary carousel elements found:', {
        contemporarySection: !!contemporarySection,
        contemporaryTrack: !!contemporaryTrack,
        contemporaryDots: contemporaryDots.length,
        contemporaryCards: contemporaryCards.length
    });

    const youthSection = document.querySelector('.books-category:nth-of-type(3)');
    const youthTrack = youthSection ? youthSection.querySelector('.books-track') : null;
    const youthDots = youthSection ? youthSection.querySelectorAll('.books-dot') : [];
    const youthCards = youthSection ? youthSection.querySelectorAll('.book-card') : [];
    
    console.log('Youth carousel elements found:', {
        youthSection: !!youthSection,
        youthTrack: !!youthTrack,
        youthDots: youthDots.length,
        youthCards: youthCards.length
    });

    // Test function to manually test carousel
    window.testClassicsCarousel = function() {
        console.log('Testing Classics Carousel...');
        moveClassicsCarousel(1);
    };

    // Initialize hero carousel
    initHeroCarousel();
});

// Hero Carousel Functions
function initHeroCarousel() {
    const heroCarousel = document.querySelector('.hero-carousel');
    const heroTrack = document.querySelector('.hero-carousel-track');
    
    if (!heroCarousel || !heroTrack) {
        console.log('Hero carousel elements not found');
        return;
    }
    
    console.log('Hero carousel initialized');
    
    // Pause animation on hover
    heroCarousel.addEventListener('mouseenter', function() {
        heroTrack.style.animationPlayState = 'paused';
    });
    
    // Resume animation on mouse leave
    heroCarousel.addEventListener('mouseleave', function() {
        heroTrack.style.animationPlayState = 'running';
    });
}

// Books Carousel Functions - Classics
let currentClassicsIndex = 0;
const totalClassics = 4;
const classicsToShow = 1;

function moveClassicsCarousel(direction) {
    console.log('moveClassicsCarousel called with direction:', direction);
    
    // Find the first books-carousel (Classics section)
    const classicsSection = document.querySelector('.books-category:first-of-type');
    console.log('Classics section found:', !!classicsSection);
    
    const track = classicsSection ? classicsSection.querySelector('.books-track') : null;
    console.log('Classics track found:', !!track);
    
    const dots = classicsSection ? classicsSection.querySelectorAll('.books-dot') : [];
    console.log('Classics dots found:', dots.length);
    
    if (!track) {
        console.log('Classics track not found - stopping');
        return;
    }
    
    currentClassicsIndex += direction;
    const maxIndex = totalClassics - classicsToShow;
    
    if (currentClassicsIndex < 0) {
        currentClassicsIndex = maxIndex;
    } else if (currentClassicsIndex > maxIndex) {
        currentClassicsIndex = 0;
    }
    
    const translateX = -currentClassicsIndex * 300;
    console.log('Applying transform:', `translateX(${translateX}px)`);
    track.style.transform = `translateX(${translateX}px)`;
    
    updateClassicsDots();
    console.log(`Classics carousel moved to index ${currentClassicsIndex}, translateX: ${translateX}px`);
}

function updateClassicsDots() {
    const classicsSection = document.querySelector('.books-category:first-of-type');
    const dots = classicsSection ? classicsSection.querySelectorAll('.books-dot') : [];
    const currentSlide = Math.floor(currentClassicsIndex / classicsToShow);
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function goToClassicsSlide(slideIndex) {
    currentClassicsIndex = (slideIndex - 1) * classicsToShow;
    const classicsSection = document.querySelector('.books-category:first-of-type');
    const track = classicsSection ? classicsSection.querySelector('.books-track') : null;
    
    if (track) {
        const translateX = -currentClassicsIndex * 300;
        track.style.transform = `translateX(${translateX}px)`;
        updateClassicsDots();
        console.log(`Classics carousel jumped to slide ${slideIndex}, index ${currentClassicsIndex}, translateX: ${translateX}px`);
    }
}

// Books Carousel Functions - Contemporary
let currentContemporaryIndex = 0;
const totalContemporary = 6;
const contemporaryToShow = 1;

function moveContemporaryCarousel(direction) {
    // Find the second books-category (Contemporary section)
    const contemporarySection = document.querySelector('.books-category:nth-of-type(2)');
    const track = contemporarySection ? contemporarySection.querySelector('.books-track') : null;
    const dots = contemporarySection ? contemporarySection.querySelectorAll('.books-dot') : [];
    
    if (!track) {
        console.log('Contemporary track not found');
        return;
    }
    
    currentContemporaryIndex += direction;
    const maxIndex = totalContemporary - contemporaryToShow;
    
    if (currentContemporaryIndex < 0) {
        currentContemporaryIndex = maxIndex;
    } else if (currentContemporaryIndex > maxIndex) {
        currentContemporaryIndex = 0;
    }
    
    const translateX = -currentContemporaryIndex * 300;
    track.style.transform = `translateX(${translateX}px)`;
    
    updateContemporaryDots();
    console.log(`Contemporary carousel moved to index ${currentContemporaryIndex}, translateX: ${translateX}px`);
}

function updateContemporaryDots() {
    const contemporarySection = document.querySelector('.books-category:nth-of-type(2)');
    const dots = contemporarySection ? contemporarySection.querySelectorAll('.books-dot') : [];
    const currentSlide = Math.floor(currentContemporaryIndex / contemporaryToShow);
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function goToContemporarySlide(slideIndex) {
    currentContemporaryIndex = (slideIndex - 1) * contemporaryToShow;
    const contemporarySection = document.querySelector('.books-category:nth-of-type(2)');
    const track = contemporarySection ? contemporarySection.querySelector('.books-track') : null;
    
    if (track) {
        const translateX = -currentContemporaryIndex * 300;
        track.style.transform = `translateX(${translateX}px)`;
        updateContemporaryDots();
        console.log(`Contemporary carousel jumped to slide ${slideIndex}, index ${currentContemporaryIndex}, translateX: ${translateX}px`);
    }
}

// Books Carousel Functions - Youth
let currentYouthIndex = 0;
const totalYouth = 2;
const youthToShow = 1;

function moveYouthCarousel(direction) {
    // Find the third books-category (Youth section)
    const youthSection = document.querySelector('.books-category:nth-of-type(3)');
    const track = youthSection ? youthSection.querySelector('.books-track') : null;
    const dots = youthSection ? youthSection.querySelectorAll('.books-dot') : [];
    
    if (!track) {
        console.log('Youth track not found');
        return;
    }
    
    currentYouthIndex += direction;
    const maxIndex = totalYouth - youthToShow;
    
    if (currentYouthIndex < 0) {
        currentYouthIndex = maxIndex;
    } else if (currentYouthIndex > maxIndex) {
        currentYouthIndex = 0;
    }
    
    const translateX = -currentYouthIndex * 300;
    track.style.transform = `translateX(${translateX}px)`;
    
    updateYouthDots();
    console.log(`Youth carousel moved to index ${currentYouthIndex}, translateX: ${translateX}px`);
}

function updateYouthDots() {
    const youthSection = document.querySelector('.books-category:nth-of-type(3)');
    const dots = youthSection ? youthSection.querySelectorAll('.books-dot') : [];
    const currentSlide = Math.floor(currentYouthIndex / youthToShow);
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function goToYouthSlide(slideIndex) {
    currentYouthIndex = (slideIndex - 1) * youthToShow;
    const youthSection = document.querySelector('.books-category:nth-of-type(3)');
    const track = youthSection ? youthSection.querySelector('.books-track') : null;
    
    if (track) {
        const translateX = -currentYouthIndex * 300;
        track.style.transform = `translateX(${translateX}px)`;
        updateYouthDots();
        console.log(`Youth carousel jumped to slide ${slideIndex}, index ${currentYouthIndex}, translateX: ${translateX}px`);
    }
}
