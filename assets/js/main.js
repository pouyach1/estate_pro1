/* ==============================================
   ASTORIA ELITE ESTATES — Main JavaScript
   نسخه: 1.0.0
   ============================================== */

(function () {
  'use strict';

  /* ========== DOM READY ========== */
  document.addEventListener('DOMContentLoaded', function () {

    // ===== ELEMENT REFERENCES =====
    const navbar = document.querySelector('.astoria-nav');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const allNavLinks = document.querySelectorAll('.nav-links a');
    const propertyCards = document.querySelectorAll('.property-card');
    const whyItems = document.querySelectorAll('.why-item');
    const searchButton = document.querySelector('.btn-search-gold');
    const searchFields = document.querySelectorAll('.search-field');
    const body = document.body;

    /* ========== NAVBAR SCROLL EFFECT ========== */
    function handleScroll() {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run on load


    /* ========== MOBILE MENU TOGGLE ========== */
    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', function () {
        const isOpen = navLinks.classList.contains('active');
        
        if (isOpen) {
          navLinks.classList.remove('active');
          mobileToggle.setAttribute('aria-expanded', 'false');
          body.classList.remove('no-scroll');
        } else {
          navLinks.classList.add('active');
          mobileToggle.setAttribute('aria-expanded', 'true');
          body.classList.add('no-scroll');
        }
      });

      // Close menu when a link is clicked
      allNavLinks.forEach(function (link) {
        link.addEventListener('click', function () {
          navLinks.classList.remove('active');
          mobileToggle.setAttribute('aria-expanded', 'false');
          body.classList.remove('no-scroll');
        });
      });
    }


    /* ========== ACTIVE NAV LINK ON SCROLL ========== */
    const sections = document.querySelectorAll('section[id]');

    function setActiveLink() {
      let scrollY = window.scrollY + 100;

      sections.forEach(function (section) {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          allNavLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + sectionId) {
              link.classList.add('active');
            }
          });
        }
      });
    }

    window.addEventListener('scroll', setActiveLink, { passive: true });


    /* ========== SMOOTH SCROLL FOR NAV LINKS ========== */
    allNavLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        if (href && href.startsWith('#') && href.length > 1) {
          e.preventDefault();
          const target = document.querySelector(href);
          
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });


    /* ========== SEARCH BUTTON ========== */
    if (searchButton) {
      searchButton.addEventListener('click', function () {
        const locationEl = document.querySelector('.search-field:nth-child(1) .search-value');
        const typeEl = document.querySelector('.search-field:nth-child(2) .search-value');
        const budgetEl = document.querySelector('.search-field:nth-child(3) .search-value');

        const location = locationEl ? locationEl.textContent.trim() : 'Not selected';
        const type = typeEl ? typeEl.textContent.trim() : 'Not selected';
        const budget = budgetEl ? budgetEl.textContent.trim() : 'Not selected';

        // In production, this would call an API
        console.log('Search Query:', { location, type, budget });
        
        // Temporary feedback
        const resultMessage = 'Searching: ' + location + ' | ' + type + ' | ' + budget;
        console.log(resultMessage);
      });
    }


    /* ========== SCROLL REVEAL ANIMATION ========== */
    const revealOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    };

    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          revealObserver.unobserve(entry.target);
        }
      });
    }, revealOptions);

    // Apply to property cards
    propertyCards.forEach(function (card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      revealObserver.observe(card);
    });

    // Apply to why-us items
    whyItems.forEach(function (item, index) {
      item.style.opacity = '0';
      item.style.transform = 'translateY(25px)';
      item.style.transition = 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1) ' + (index * 0.1) + 's, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) ' + (index * 0.1) + 's';
      revealObserver.observe(item);
    });


    /* ========== PARALLAX HERO ON MOUSE MOVE (Desktop only) ========== */
    const heroBg = document.querySelector('.hero-bg');

    if (heroBg && window.innerWidth > 768) {
      document.addEventListener('mousemove', function (e) {
        const xAxis = (window.innerWidth / 2 - e.clientX) / 80;
        const yAxis = (window.innerHeight / 2 - e.clientY) / 80;
        
        heroBg.style.transform = 'scale(1.05) translate(' + xAxis + 'px, ' + yAxis + 'px)';
      }, { passive: true });
    }


    /* ========== KEYBOARD ACCESSIBILITY ========== */
    // Close mobile menu on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        body.classList.remove('no-scroll');
        mobileToggle.focus();
      }
    });


    /* ========== LOG ========== */
    console.log('%c ASTORIA ELITE ESTATES %c Pro v1.0 ',
      'background:#c9a227;color:#0a0a0a;padding:4px 8px;font-weight:bold;border-radius:4px 0 0 4px;',
      'background:#0a0a0a;color:#c9a227;padding:4px 8px;border-radius:0 4px 4px 0;');
    console.log('Ready for presentation.');

  });

})();