// Optimized Animation and Counter System
class ChangeMakersAnimations {
  constructor() {
    this.counters = document.querySelectorAll('.counter');
    this.animatedElements = document.querySelectorAll('[data-animation]');
    this.observers = new Map();
    this.init();
  }

  // Counter animation with RAF for better performance
  updateCounter(counter, target, duration = 2000) {
    const start = performance.now();
    const startValue = 0;

    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (target - startValue) * easeOutCubic);

      counter.textContent = currentValue;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        counter.textContent = target;
      }
    };

    requestAnimationFrame(animate);
  }

  // Unified intersection observer for all animations
  createObserver(type, options = {}) {
    if (this.observers.has(type)) return this.observers.get(type);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.handleIntersection(entry.target, type);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3, ...options });

    this.observers.set(type, observer);
    return observer;
  }

  handleIntersection(element, type) {
    switch (type) {
      case 'counter':
        const target = +element.getAttribute('data-target');
        element.textContent = '0';
        this.updateCounter(element, target);
        break;

      case 'animation':
        this.triggerAnimation(element);
        break;
    }
  }

  triggerAnimation(element) {
    const animationType = element.dataset.animation || 'fadeIn';
    const delay = element.dataset.delay || '';
    const classes = ['animate__animated', `animate__${animationType}`];

    if (delay) classes.push(delay);
    element.classList.add(...classes);

    // Handle animation end
    element.addEventListener('animationend', () => {
      const isTestimonial = element.closest('#testimonials');

      element.classList.remove(`animate__${animationType}`);
      if (delay) element.classList.remove(delay);

      if (isTestimonial) {
        // Keep testimonials visible with inline styles
        Object.assign(element.style, {
          opacity: '1',
          transform: 'translateY(0)'
        });
      } else {
        // Use CSS class for other sections
        element.classList.remove('animate__animated');
        element.classList.add('animation-completed');
      }
    }, { once: true });
  }

  init() {
    // Initialize counter observer
    if (this.counters.length) {
      const counterObserver = this.createObserver('counter', { threshold: 0.5 });
      this.counters.forEach(counter => counterObserver.observe(counter));
    }

    // Initialize animation observer
    if (this.animatedElements.length) {
      const animationObserver = this.createObserver('animation');
      this.animatedElements.forEach(element => animationObserver.observe(element));
    }

    // Legacy support for mission/vision elements
    const legacyElements = [
      'mission-title', 'mission-description',
      'mission-content', 'vision-content'
    ].map(id => document.getElementById(id)).filter(Boolean);

    if (legacyElements.length) {
      const animationObserver = this.createObserver('animation');
      legacyElements.forEach(element => animationObserver.observe(element));
    }
  }
}

// Utility Functions
const Utils = {
  // Throttle function for scroll events
  throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Initialize Bootstrap components
  initBootstrap() {
    if (typeof bootstrap === 'undefined') return;

    // Initialize tooltips
    const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipElements.forEach(el => new bootstrap.Tooltip(el));
  },

  // Smooth scrolling for anchor links
  initSmoothScrolling() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      e.preventDefault();
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  },

  // Navbar scroll effect
  initNavbarScrollEffect() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const handleScroll = this.throttle(() => {
      navbar.classList.toggle('navbar-scrolled', window.scrollY > 50);
      navbar.classList.toggle('shadow-sm', window.scrollY > 50);
    }, 100);

    window.addEventListener('scroll', handleScroll);
  }
};

// Optimized Donation Modal System
class DonationModal {
  constructor() {
    this.state = {
      amount: 25,
      frequency: 'one-time',
      paymentMethod: null
    };

    this.elements = {};
    this.impactDescriptions = {
      25: 'Provides school supplies for 1 child',
      50: 'Feeds a family for 1 week',
      100: 'Healthcare for 5 people',
      250: 'Clean water access for 1 month',
      500: 'Education for 2 children for 1 year',
      1000: 'Complete healthcare package for a community'
    };

    this.init();
  }

  init() {
    // Cache DOM elements
    this.cacheElements();

    // Only proceed if modal exists
    if (!this.elements.modal) return;

    // Bind events
    this.bindEvents();

    // Initial update
    this.updateSummary();
  }

  cacheElements() {
    const selectors = {
      modal: '#staticBackdrop',
      presetBtns: '.preset-amount-btn',
      customInput: '#custom-donation-input',
      paymentBtns: '.payment-method-btn',
      frequencyInputs: 'input[name="frequency"]',
      summaryAmount: '#summary-amount',
      summaryFrequency: '#summary-frequency',
      summaryImpact: '#summary-impact',
      donateBtn: '.donate-now-btn',
      legacyBtns: '.donate-amount-btn'
    };

    Object.entries(selectors).forEach(([key, selector]) => {
      if (key.includes('Btns') || key.includes('Inputs')) {
        this.elements[key] = document.querySelectorAll(selector);
      } else {
        this.elements[key] = document.querySelector(selector);
      }
    });
  }

  bindEvents() {
    // Preset amount buttons
    this.elements.presetBtns?.forEach(btn => {
      btn.addEventListener('click', () => this.handlePresetAmount(btn));
    });

    // Custom amount input
    this.elements.customInput?.addEventListener('input', (e) => {
      this.handleCustomAmount(e.target.value);
    });

    // Payment method buttons
    this.elements.paymentBtns?.forEach(btn => {
      btn.addEventListener('click', () => this.handlePaymentMethod(btn));
    });

    // Frequency inputs
    this.elements.frequencyInputs?.forEach(input => {
      input.addEventListener('change', () => this.handleFrequency(input.value));
    });

    // Donate button
    this.elements.donateBtn?.addEventListener('click', () => this.handleDonate());

    // Legacy buttons (backward compatibility)
    this.elements.legacyBtns?.forEach(btn => {
      btn.addEventListener('click', () => this.handleLegacyAmount(btn));
    });
  }

  handlePresetAmount(btn) {
    this.setActivePreset(btn);
    this.elements.customInput.value = '';
    this.state.amount = parseInt(btn.dataset.amount);
    this.updateSummary();
  }

  handleCustomAmount(value) {
    this.clearActivePresets();
    const amount = parseInt(value) || 0;
    if (amount > 0) {
      this.state.amount = amount;
      this.updateSummary();
    }
  }

  handlePaymentMethod(btn) {
    this.setActivePayment(btn);
    this.state.paymentMethod = btn.dataset.method;
    this.updateDonateButton();
  }

  handleFrequency(frequency) {
    this.state.frequency = frequency;
    this.updateSummary();
  }

  handleLegacyAmount(btn) {
    const amount = parseInt(btn.dataset.amount);
    this.state.amount = amount;
    this.clearActivePresets();
    this.elements.customInput.value = amount;
    this.updateSummary();
  }

  setActivePreset(activeBtn) {
    this.elements.presetBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  clearActivePresets() {
    this.elements.presetBtns.forEach(btn => btn.classList.remove('active'));
  }

  setActivePayment(activeBtn) {
    this.elements.paymentBtns.forEach(btn => {
      btn.classList.remove('selected');
      btn.querySelector('.payment-check i')?.classList.add('d-none');
    });

    activeBtn.classList.add('selected');
    activeBtn.querySelector('.payment-check i')?.classList.remove('d-none');
  }

  updateSummary() {
    if (!this.elements.summaryAmount) return;

    this.elements.summaryAmount.textContent = this.state.amount;
    this.elements.summaryFrequency.textContent = this.getFrequencyText();
    this.elements.summaryImpact.textContent = this.getImpactText();
    this.updateDonateButton();
  }

  getFrequencyText() {
    const frequencies = {
      'one-time': 'One-time',
      'monthly': 'Monthly',
      'yearly': 'Yearly'
    };
    return frequencies[this.state.frequency] || 'One-time';
  }

  getImpactText() {
    let impact = 'Makes a meaningful difference';
    const amounts = Object.keys(this.impactDescriptions).map(Number).sort((a, b) => a - b);

    for (let i = amounts.length - 1; i >= 0; i--) {
      if (this.state.amount >= amounts[i]) {
        impact = this.impactDescriptions[amounts[i]];
        break;
      }
    }

    if (this.state.frequency !== 'one-time') {
      impact += ` every ${this.state.frequency === 'monthly' ? 'month' : 'year'}`;
    }

    return impact;
  }

  updateDonateButton() {
    if (!this.elements.donateBtn) return;

    const isValid = this.state.amount > 0 && this.state.paymentMethod;
    this.elements.donateBtn.disabled = !isValid;

    const content = isValid
      ? `<i class="bi bi-heart-fill me-2"></i><span>Donate $${this.state.amount}</span><i class="bi bi-arrow-right ms-2"></i>`
      : `<i class="bi bi-heart-fill me-2"></i><span>Select Payment Method</span>`;

    this.elements.donateBtn.innerHTML = content;
  }

  async handleDonate() {
    if (!this.isValidDonation()) return;

    this.setProcessingState();

    try {
      // Simulate processing (replace with actual payment processing)
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.showSuccess();
    } catch (error) {
      this.showError(error);
    }
  }

  isValidDonation() {
    return this.state.amount > 0 && this.state.paymentMethod;
  }

  setProcessingState() {
    this.elements.donateBtn.disabled = true;
    this.elements.donateBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2" role="status"></span>
      Processing...
    `;
  }

  showSuccess() {
    // Hide modal
    const modal = bootstrap.Modal.getInstance(this.elements.modal);
    modal?.hide();

    // Show success notification
    this.showNotification('success', `Thank you! Your $${this.state.amount} donation has been processed successfully.`);

    // Reset modal
    this.reset();
  }

  showError(error) {
    this.showNotification('error', 'There was an error processing your donation. Please try again.');
    this.updateDonateButton(); // Reset button state
  }

  showNotification(type, message) {
    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    const icon = type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill';

    const notification = document.createElement('div');
    notification.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="bi bi-${icon} me-2 fs-4"></i>
        <div>${message}</div>
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
  }

  reset() {
    this.state = { amount: 25, frequency: 'one-time', paymentMethod: null };

    // Reset UI elements
    this.elements.presetBtns?.[0]?.classList.add('active');
    this.elements.customInput && (this.elements.customInput.value = '');

    this.elements.paymentBtns?.forEach(btn => {
      btn.classList.remove('selected');
      btn.querySelector('.payment-check i')?.classList.add('d-none');
    });

    document.getElementById('one-time')?.click();

    // Reset form fields
    ['donor-name', 'donor-email'].forEach(id => {
      const field = document.getElementById(id);
      if (field) field.value = '';
    });

    ['anonymous-donation', 'newsletter-signup'].forEach(id => {
      const checkbox = document.getElementById(id);
      if (checkbox) checkbox.checked = false;
    });

    this.updateSummary();
  }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize core systems
  new ChangeMakersAnimations();
  new DonationModal();

  // Initialize utilities
  Utils.initBootstrap();
  Utils.initSmoothScrolling();
  Utils.initNavbarScrollEffect();
});