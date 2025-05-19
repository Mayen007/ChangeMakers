// Existing counter code
const counters = document.querySelectorAll('.counter');

// Function to update the counter
const updateCounter = (counter) => {
  const target = +counter.getAttribute('data-target');
  const current = +counter.innerText;
  const increment = target / 100;

  if (current < target) {
    counter.innerText = `${Math.ceil(current + increment)}`;
    setTimeout(() => updateCounter(counter), 20);
  } else {
    counter.innerText = target;
  }
};

// Create a unique observer for counters
const counterObserver = new IntersectionObserver((entries, counterObserverInstance) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const counter = entry.target;
      counter.innerText = '0'; // Reset counter text to 0
      updateCounter(counter);
      counterObserverInstance.unobserve(counter); // Stop observing after it starts counting
    }
  });
}, { threshold: 0.5 }); // Trigger when 50% of the element is visible

// Observe each counter element
counters.forEach(counter => {
  counterObserver.observe(counter);
});

// Function to trigger the animation
const addAnimation = (element, animationClass, delay = '') => {
  if (delay) {
    element.classList.add('animate__animated', animationClass, delay);
  } else {
    element.classList.add('animate__animated', animationClass);
  }

  // Remove animation classes after it's done, so it can re-trigger next time
  element.addEventListener('animationend', () => {
    element.classList.remove('animate__animated', animationClass);
    if (delay) element.classList.remove(delay);
  }, { once: true }); // Ensure this runs only once after each animation
};

// Create an observer for animations
const animationObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const targetElement = entry.target;
      const animationType = targetElement.dataset.animation || 'fadeIn';
      const animationDelay = targetElement.dataset.delay || '';

      addAnimation(targetElement, `animate__${animationType}`, animationDelay);
    }
  });
}, { threshold: 0.3 }); // Adjust threshold as needed

// Enhanced animation system - expand beyond just mission/vision
document.addEventListener('DOMContentLoaded', function () {
  // Find all elements with data-animation attribute
  const animatedElements = document.querySelectorAll('[data-animation]');

  // Observe all animated elements
  animatedElements.forEach(el => {
    animationObserver.observe(el);
  });

  // Also observe the original elements
  const originalElements = [
    document.getElementById('mission-title'),
    document.getElementById('mission-description'),
    document.getElementById('mission-content'),
    document.getElementById('vision-content')
  ];

  originalElements.forEach(el => {
    if (el) animationObserver.observe(el);
  });

  // Initialize tooltips if Bootstrap 5
  if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Adjust for navbar height
          behavior: 'smooth'
        });
      }
    });
  });
});

// Navbar background change on scroll
window.addEventListener('scroll', function () {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('navbar-scrolled', 'shadow-sm');
  } else {
    navbar.classList.remove('navbar-scrolled', 'shadow-sm');
  }
});