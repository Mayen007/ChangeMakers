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
const addAnimation = (element, animationClass) => {
  element.classList.add('animate__animated', animationClass);

  // Remove animation classes after it's done, so it can re-trigger next time
  element.addEventListener('animationend', () => {
    element.classList.remove('animate__animated', animationClass);
  }, { once: true }); // Ensure this runs only once after each animation
};

// Create an observer for animations
const animationObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const targetElement = entry.target;

      // Add specific animations based on element ID or class
      if (targetElement.id === 'mission-title') {
        addAnimation(targetElement, 'animate__fadeInDown');
      } else if (targetElement.id === 'mission-description') {
        addAnimation(targetElement, 'animate__fadeInDown', 'animate__delay-1s');
      } else if (targetElement.id === 'mission-content') {
        addAnimation(targetElement, 'animate__fadeInLeft');
      } else if (targetElement.id === 'vision-content') {
        addAnimation(targetElement, 'animate__fadeInRight');
      }
    }
  });
}, { threshold: 0.3 }); // Adjust threshold as needed

// Selecting the elements to observe
const elementsToAnimate = [
  document.getElementById('mission-title'),
  document.getElementById('mission-description'),
  document.getElementById('mission-content'),
  document.getElementById('vision-content')
];

// Observing each element
elementsToAnimate.forEach(el => {
  animationObserver.observe(el);
});
