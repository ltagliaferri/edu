// Top Navigation Bar Interactions
// Handles dropdown behavior, keyboard navigation, and accessibility

(function() {
  'use strict';

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    const topNav = document.querySelector('.top-nav-bar');
    if (!topNav) return;

    const navItems = topNav.querySelectorAll('.top-nav-item');
    const mobileToggle = topNav.querySelector('.top-nav-mobile-toggle');
    const navLinks = topNav.querySelector('.top-nav-links');
    let currentOpenDropdown = null;

    // Mobile menu toggle
    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', function() {
        const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true';

        if (isOpen) {
          mobileToggle.setAttribute('aria-expanded', 'false');
          navLinks.classList.remove('mobile-menu-open');
          document.body.style.overflow = '';
        } else {
          mobileToggle.setAttribute('aria-expanded', 'true');
          navLinks.classList.add('mobile-menu-open');
          document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
        }
      });

      // Close mobile menu when clicking outside
      document.addEventListener('click', function(e) {
        if (window.innerWidth < 992) {
          if (!topNav.contains(e.target)) {
            mobileToggle.setAttribute('aria-expanded', 'false');
            navLinks.classList.remove('mobile-menu-open');
            document.body.style.overflow = '';
          }
        }
      });

      // Close mobile menu on window resize to desktop
      window.addEventListener('resize', function() {
        if (window.innerWidth >= 992) {
          mobileToggle.setAttribute('aria-expanded', 'false');
          navLinks.classList.remove('mobile-menu-open');
          document.body.style.overflow = '';
        }
      });
    }

    // Handle dropdown interactions
    navItems.forEach(item => {
      const button = item.querySelector('.top-nav-link');
      const dropdown = item.querySelector('.top-nav-dropdown');

      if (!button || !dropdown) return;

      // Click handler for mobile/tablet
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const isOpen = button.getAttribute('aria-expanded') === 'true';

        // On mobile, toggle dropdown visibility
        if (window.innerWidth < 992) {
          if (isOpen) {
            closeDropdown(item);
            dropdown.classList.remove('mobile-dropdown-open');
          } else {
            // Close any other open dropdown
            navItems.forEach(otherItem => {
              if (otherItem !== item) {
                closeDropdown(otherItem);
                const otherDropdown = otherItem.querySelector('.top-nav-dropdown');
                if (otherDropdown) {
                  otherDropdown.classList.remove('mobile-dropdown-open');
                }
              }
            });
            openDropdown(item);
            dropdown.classList.add('mobile-dropdown-open');
          }
        } else {
          // Desktop behavior
          if (currentOpenDropdown && currentOpenDropdown !== item) {
            closeDropdown(currentOpenDropdown);
          }

          if (isOpen) {
            closeDropdown(item);
          } else {
            openDropdown(item);
          }
        }
      });

      // Keyboard navigation
      button.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          button.click();
        } else if (e.key === 'Escape') {
          closeDropdown(item);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          openDropdown(item);
          // Focus first link in dropdown
          const firstLink = dropdown.querySelector('a');
          if (firstLink) firstLink.focus();
        }
      });

      // Dropdown keyboard navigation
      const dropdownLinks = dropdown.querySelectorAll('a');
      dropdownLinks.forEach((link, index) => {
        link.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') {
            closeDropdown(item);
            button.focus();
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextLink = dropdownLinks[index + 1];
            if (nextLink) nextLink.focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (index === 0) {
              button.focus();
            } else {
              dropdownLinks[index - 1].focus();
            }
          }
        });
      });

      // Desktop hover behavior (992px and up)
      if (window.innerWidth >= 992) {
        item.addEventListener('mouseenter', function() {
          openDropdown(item);
        });

        item.addEventListener('mouseleave', function() {
          closeDropdown(item);
        });
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!topNav.contains(e.target)) {
        navItems.forEach(item => closeDropdown(item));
      }
    });

    // Close all dropdowns on escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        navItems.forEach(item => closeDropdown(item));
      }
    });

    // Helper functions
    function openDropdown(item) {
      const button = item.querySelector('.top-nav-link');
      if (button) {
        button.setAttribute('aria-expanded', 'true');
      }
      currentOpenDropdown = item;
    }

    function closeDropdown(item) {
      const button = item.querySelector('.top-nav-link');
      if (button) {
        button.setAttribute('aria-expanded', 'false');
      }
      if (currentOpenDropdown === item) {
        currentOpenDropdown = null;
      }
    }

    // Handle window resize - switch between mobile and desktop behavior
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        // Close all dropdowns on resize
        navItems.forEach(item => closeDropdown(item));
      }, 250);
    });

    // Smooth scroll behavior for anchor links
    const allLinks = topNav.querySelectorAll('a[href^="#"]');
    allLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') {
          e.preventDefault();
          return;
        }

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });

          // Close dropdowns after navigation
          navItems.forEach(item => closeDropdown(item));
        }
      });
    });
  });
})();
