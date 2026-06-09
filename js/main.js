/**
 * APEX Performance & Wellness - Main Application Script
 * Developer Grade - 5 Years Experience Vanilla JS implementation
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Application Modules
  initNavigation();
  initScrollAnimations();
  initTestimonialSlider();
  initClassFilter();
  initFaqAccordion();
  initCalculators();
  initContactForm();
});

/* ==========================================================================
   NAVIGATION MODULE
   ========================================================================== */
function initNavigation() {
  const header = document.querySelector('.header');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky header class trigger on scroll
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Trigger immediately to check initial load scroll state

  // Mobile navigation hamburger toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close mobile nav when clicking on a link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // Auto-highlight active navigation link matching current filename
  const currentPath = window.location.pathname;
  const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === pageName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ==========================================================================
   ANIMATE ON SCROLL (REVEAL ENGINE)
   ========================================================================== */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null, // viewport
      threshold: 0.15, // trigger when 15% of element is visible
      rootMargin: '0px 0px -50px 0px' // offset bottom trigger point
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target); // Stop observing once animated
        }
      });
    }, observerOptions);

    revealElements.forEach(element => {
      observer.observe(element);
    });
  } else {
    // Fallback for older browsers
    revealElements.forEach(element => {
      element.classList.add('reveal-visible');
    });
  }
}

/* ==========================================================================
   TESTIMONIALS SLIDER MODULE (VANILLA CAROUSEL)
   ========================================================================== */
function initTestimonialSlider() {
  const slider = document.querySelector('.testimonial-slider');
  const slides = document.querySelectorAll('.testimonial-slide');
  const dotsContainer = document.querySelector('.slider-dots');
  
  if (!slider || slides.length === 0) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  const slideCount = slides.length;

  // Generate indicator dots dynamically
  slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      goToSlide(index);
      resetAutoplay();
    });
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.slider-dots .dot');

  function goToSlide(index) {
    currentIndex = index;
    // Shift the slider container horizontally
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    // Update active dot classes
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
  }

  function startAutoplay() {
    autoplayTimer = setInterval(() => {
      let nextIndex = (currentIndex + 1) % slideCount;
      goToSlide(nextIndex);
    }, 5000); // 5 seconds interval
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  // Hover pauses slides
  const container = document.querySelector('.testimonial-section');
  if (container) {
    container.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
    container.addEventListener('mouseleave', startAutoplay);
  }

  startAutoplay();
}

/* ==========================================================================
   CLASS SCHEDULE FILTERING MODULE
   ========================================================================== */
function initClassFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const scheduleRows = document.querySelectorAll('.schedule-row');

  if (filterButtons.length === 0 || scheduleRows.length === 0) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Manage active class on tabs
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      // Filter rows
      scheduleRows.forEach(row => {
        const rowType = row.getAttribute('data-category');
        if (filterValue === 'all' || rowType === filterValue) {
          row.style.display = 'table-row';
          // Force a subtle opacity fade-in transition
          row.style.opacity = '0';
          setTimeout(() => {
            row.style.opacity = '1';
            row.style.transition = 'opacity 0.3s ease';
          }, 50);
        } else {
          row.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   FAQ ACCORDION MODULE
   ========================================================================== */
function initFaqAccordion() {
  const faqHeaders = document.querySelectorAll('.faq-header');

  faqHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const body = header.nextElementSibling;
      const isActive = item.classList.contains('active');

      // Close all open FAQs
      document.querySelectorAll('.faq-item').forEach(faqItem => {
        faqItem.classList.remove('active');
        faqItem.querySelector('.faq-body').style.maxHeight = null;
      });

      // Toggle current FAQ
      if (!isActive) {
        item.classList.add('active');
        // Calculate scrollHeight dynamically to ensure smooth transitions
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
}

/* ==========================================================================
   FITNESS CALCULATOR MODULE (BMI & BMR MATH)
   ========================================================================== */
function initCalculators() {
  const bmiTab = document.getElementById('tab-bmi');
  const calorieTab = document.getElementById('tab-calorie');
  const bmiInputs = document.getElementById('inputs-bmi');
  const calorieInputs = document.getElementById('inputs-calorie');
  
  if (!bmiTab) return; // Only execute if calculator wrappers exist in DOM

  // Toggle calculator modes
  bmiTab.addEventListener('click', () => {
    bmiTab.classList.add('active');
    calorieTab.classList.remove('active');
    bmiInputs.style.display = 'block';
    calorieInputs.style.display = 'none';
    clearResults();
  });

  calorieTab.addEventListener('click', () => {
    calorieTab.classList.add('active');
    bmiTab.classList.remove('active');
    calorieInputs.style.display = 'block';
    bmiInputs.style.display = 'none';
    clearResults();
  });

  // Calculate triggers
  const btnCalculate = document.getElementById('btn-calculate');
  const resultCircle = document.querySelector('.result-circle');
  const resultVal = document.querySelector('.result-val');
  const resultUnit = document.querySelector('.result-unit');
  const resultStatus = document.querySelector('.result-status');
  const resultAdvice = document.querySelector('.result-advice');

  function clearResults() {
    resultCircle.classList.remove('active');
    resultVal.textContent = '--.-';
    resultUnit.textContent = '';
    resultStatus.textContent = 'Ready';
    resultAdvice.textContent = 'Fill in your details and click calculate to view results.';
  }

  btnCalculate.addEventListener('click', () => {
    const isBmiActive = bmiTab.classList.contains('active');

    if (isBmiActive) {
      // Get BMI Inputs
      const weight = parseFloat(document.getElementById('bmi-weight').value);
      const heightVal = parseFloat(document.getElementById('bmi-height').value);
      const unit = document.getElementById('bmi-unit').value;

      if (!weight || !heightVal || weight <= 0 || heightVal <= 0) {
        showToast('Calculator Error', 'Please enter valid weight and height inputs.', 'error');
        return;
      }

      let bmi = 0;
      if (unit === 'metric') {
        // height in cm -> convert to meters
        const heightMeters = heightVal / 100;
        bmi = weight / (heightMeters * heightMeters);
      } else {
        // imperial: weight in lbs, height in inches
        bmi = (weight / (heightVal * heightVal)) * 703;
      }

      const bmiFinal = bmi.toFixed(1);
      resultVal.textContent = bmiFinal;
      resultUnit.textContent = 'BMI';
      resultCircle.classList.add('active');

      // Determine category advice
      let status = '';
      let advice = '';
      if (bmi < 18.5) {
        status = 'Underweight';
        advice = 'Focus on nutrient-dense foods and structured strength training to build lean muscle.';
      } else if (bmi >= 18.5 && bmi < 24.9) {
        status = 'Normal';
        advice = 'Perfect! Continue maintaining your current active routine and clean nutritional balance.';
      } else if (bmi >= 25 && bmi < 29.9) {
        status = 'Overweight';
        advice = 'Incorporate resistance workouts and structure a modest caloric deficit for fat loss.';
      } else {
        status = 'Obese';
        advice = 'Prioritize cardio, functional movement, and a structured diet plan. Consult a personal coach.';
      }

      resultStatus.textContent = status;
      resultAdvice.textContent = advice;
    } else {
      // Get Calorie Inputs
      const age = parseInt(document.getElementById('cal-age').value);
      const gender = document.getElementById('cal-gender').value;
      const weight = parseFloat(document.getElementById('cal-weight').value);
      const heightVal = parseFloat(document.getElementById('cal-height').value);
      const activity = parseFloat(document.getElementById('cal-activity').value);
      const unit = document.getElementById('cal-unit').value;

      if (!age || !weight || !heightVal || age <= 0 || weight <= 0 || heightVal <= 0) {
        showToast('Calculator Error', 'Please complete all fields with positive numerical values.', 'error');
        return;
      }

      // Calculate BMR using Mifflin-St Jeor Equation
      let bmr = 0;
      let wKg = weight;
      let hCm = heightVal;

      if (unit === 'imperial') {
        wKg = weight * 0.453592; // lbs to kg
        hCm = heightVal * 2.54;   // inches to cm
      }

      if (gender === 'male') {
        bmr = 10 * wKg + 6.25 * hCm - 5 * age + 5;
      } else {
        bmr = 10 * wKg + 6.25 * hCm - 5 * age - 161;
      }

      // Calculate Daily Caloric Needs (TDEE)
      const tdee = Math.round(bmr * activity);

      resultVal.textContent = tdee;
      resultUnit.textContent = 'KCAL/DAY';
      resultCircle.classList.add('active');
      resultStatus.textContent = 'TDEE calculated';
      resultAdvice.textContent = `Based on your metrics, this represents your daily maintenance calories. To lose weight, consume ~${tdee - 400} kcal. To build muscle, target ~${tdee + 300} kcal.`;
    }
  });
}

/* ==========================================================================
   FORM VALIDATION & TOAST NOTIFICATION MODULE
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const phone = document.getElementById('form-phone').value.trim();
    const message = document.getElementById('form-message').value.trim();
    const btnSubmit = form.querySelector('button[type="submit"]');

    // Validation patterns
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Simple digits check for phone
    const phonePattern = /^\+?[0-9\s\-]{7,15}$/;

    if (!name) {
      showToast('Validation Error', 'Full Name is a required field.', 'error');
      return;
    }
    if (!email || !emailPattern.test(email)) {
      showToast('Validation Error', 'Please enter a valid email address.', 'error');
      return;
    }
    if (phone && !phonePattern.test(phone)) {
      showToast('Validation Error', 'Please enter a valid contact phone number.', 'error');
      return;
    }
    if (!message) {
      showToast('Validation Error', 'Message content is required.', 'error');
      return;
    }

    // Form inputs verified - trigger simulated loading state
    const originalText = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = 'Sending details...';

    setTimeout(() => {
      // Reset form on success
      form.reset();
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = originalText;
      
      showToast('Success!', 'Your membership enquiry has been sent. Our team will contact you shortly.', 'success');
    }, 1500); // 1.5s simulation
  });
}

/**
 * Global Custom Toast System
 */
function showToast(title, message, type = 'success') {
  // Check if target container exists, create if not
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.classList.add('toast-container');
    document.body.appendChild(container);
  }

  // Create toast card elements
  const toast = document.createElement('div');
  toast.classList.add('toast');
  if (type === 'success') toast.classList.add('success');

  // Inline SVGs for Toast Icons
  const successIconSvg = `
    <svg viewBox="0 0 24 24" fill="none" stroke="#a1ff00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  `;

  const errorIconSvg = `
    <svg viewBox="0 0 24 24" fill="none" stroke="#ff3e3e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
  `;

  toast.innerHTML = `
    <div class="toast-icon">
      ${type === 'success' ? successIconSvg : errorIconSvg}
    </div>
    <div class="toast-text">
      <h4>${title}</h4>
      <p>${message}</p>
    </div>
  `;

  container.appendChild(toast);

  // Trigger animation frame trigger to animate sliding in
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto remove toast after 4.5 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    // Delete from DOM once slide animation finishes
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 4500);
}
