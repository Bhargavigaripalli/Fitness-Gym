/**
 * APEX Performance & Wellness - Authentication & Dashboard Guard Script
 * Core features: Validation, eye mask, session guarding, role redirections, localStorage mock DB
 */

// Mock DB configuration (pre-seeded credentials for immediate demo)
const DEFAULT_USERS = {
  'admin@apex.com': { name: 'Alex Apex', password: 'Password123!', role: 'admin' },
  'trainer@apex.com': { name: 'Coach Marcus', password: 'Password123!', role: 'trainer' },
  'member@apex.com': { name: 'Sarah Miller', password: 'Password123!', role: 'member' }
};

// Initialize Mock database
function initMockDB() {
  if (!localStorage.getItem('apex_users')) {
    localStorage.setItem('apex_users', JSON.stringify(DEFAULT_USERS));
  }
}

// Get user from DB
function getUser(email) {
  const users = JSON.parse(localStorage.getItem('apex_users') || '{}');
  return users[email.toLowerCase().trim()];
}

// Add user to DB
function saveUser(email, name, password, role) {
  const users = JSON.parse(localStorage.getItem('apex_users') || '{}');
  users[email.toLowerCase().trim()] = { name, password, role };
  localStorage.setItem('apex_users', JSON.stringify(users));
}

// Get active session
function getSession() {
  const session = sessionStorage.getItem('apex_session');
  return session ? JSON.parse(session) : null;
}

// Start session
function startSession(user) {
  sessionStorage.setItem('apex_session', JSON.stringify(user));
}

// End session
function endSession() {
  sessionStorage.removeItem('apex_session');
}

// Document Ready Setup
document.addEventListener('DOMContentLoaded', () => {
  initMockDB();
  
  // Set up password eye mask toggle
  const toggleButtons = document.querySelectorAll('.password-toggle');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          this.innerHTML = `
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"></path>
            </svg>
          `;
        } else {
          input.type = 'password';
          this.innerHTML = `
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          `;
        }
      }
    });
  });

  // Handle Sign-Up Name dynamic filtration (alphabets only, max 16 letters)
  const nameInput = document.getElementById('signup-name');
  if (nameInput) {
    nameInput.addEventListener('input', function() {
      // Replace non-alphabetic characters
      let filtered = this.value.replace(/[^A-Za-z]/g, '');
      if (filtered.length > 16) {
        filtered = filtered.substring(0, 16);
      }
      if (this.value !== filtered) {
        this.value = filtered;
      }
    });
  }

  // Handle Password Strength Meter (Signup Page)
  const passwordInput = document.getElementById('signup-password');
  if (passwordInput) {
    passwordInput.addEventListener('input', function() {
      const val = this.value;
      const strengthBars = document.querySelectorAll('.strength-bar');
      const strengthText = document.querySelector('.strength-text');
      
      // Reset
      strengthBars.forEach(bar => {
        bar.className = 'strength-bar';
      });
      if (strengthText) {
        strengthText.className = 'strength-text';
        strengthText.innerText = '';
      }

      if (val.length === 0) return;

      let score = 0;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/\d/.test(val)) score++;
      if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)) score++;

      // Render meter
      if (score <= 1) {
        strengthBars[0].classList.add('weak');
        if (strengthText) {
          strengthText.innerText = 'Weak (Needs min 8 chars, 1 capital, 1 number, 1 symbol)';
          strengthText.classList.add('weak');
        }
      } else if (score < 4) {
        strengthBars[0].classList.add('medium');
        strengthBars[1].classList.add('medium');
        if (strengthText) {
          strengthText.innerText = 'Medium (Add capital, number, or symbol)';
          strengthText.classList.add('medium');
        }
      } else {
        strengthBars.forEach(bar => bar.classList.add('strong'));
        if (strengthText) {
          strengthText.innerText = 'Strong Password';
          strengthText.classList.add('strong');
        }
      }
    });
  }

  // Handle Login submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const emailInput = document.getElementById('login-email');
      const passwordInput = document.getElementById('login-password');
      const roleInput = document.getElementById('login-role');
      
      // Clear errors
      clearErrors(loginForm);

      let hasError = false;

      // Email validation
      if (!validateEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email format.');
        hasError = true;
      }

      // Password validation
      if (!passwordInput.value) {
        showError(passwordInput, 'Password is required.');
        hasError = true;
      }

      if (hasError) return;

      // Database check
      const user = getUser(emailInput.value);
      if (!user) {
        showError(emailInput, 'No registered account found with this email.');
        return;
      }

      if (user.password !== passwordInput.value) {
        showError(passwordInput, 'Incorrect password.');
        return;
      }

      // Role check
      if (user.role !== roleInput.value) {
        showError(roleInput, `This account is registered as a ${user.role.toUpperCase()}, not a ${roleInput.value.toUpperCase()}.`);
        return;
      }

      // Start Session & Redirect
      startSession({
        email: emailInput.value,
        name: user.name,
        role: user.role
      });

      // Redirect based on role
      window.location.href = `${user.role}-dashboard.html`;
    });
  }

  // Handle Signup submission
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const nameInput = document.getElementById('signup-name');
      const emailInput = document.getElementById('signup-email');
      const passwordInput = document.getElementById('signup-password');
      const confirmPasswordInput = document.getElementById('signup-confirm-password');
      const roleInput = document.getElementById('signup-role');
      
      // Clear errors
      clearErrors(signupForm);

      let hasError = false;

      // Name check
      if (!nameInput.value || nameInput.value.length < 2) {
        showError(nameInput, 'Name is too short (min 2 letters).');
        hasError = true;
      }

      // Email check
      if (!validateEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email format.');
        hasError = true;
      } else if (getUser(emailInput.value)) {
        showError(emailInput, 'This email is already registered.');
        hasError = true;
      }

      // Password checks
      const passwordVal = passwordInput.value;
      const strengthScore = checkPasswordStrengthScore(passwordVal);
      if (strengthScore < 4) {
        showError(passwordInput, 'Password must be strong (8+ chars, 1 uppercase, 1 number, 1 special symbol).');
        hasError = true;
      }

      // Confirm Password check
      if (passwordVal !== confirmPasswordInput.value) {
        showError(confirmPasswordInput, 'Passwords do not match.');
        hasError = true;
      }

      if (hasError) return;

      // Save user to Mock DB
      saveUser(emailInput.value, nameInput.value, passwordVal, roleInput.value);

      // Redirect to login with success alert
      alert('Registration successful! Please login with your new account.');
      window.location.href = 'login.html';
    });
  }

  // Setup dashboard guard
  const dashboardBody = document.querySelector('[data-dashboard-role]');
  if (dashboardBody) {
    const requiredRole = dashboardBody.getAttribute('data-dashboard-role');
    const session = getSession();

    if (!session) {
      alert('Access Denied. Please log in first.');
      window.location.href = 'login.html';
      return;
    }

    if (session.role !== requiredRole) {
      alert(`Access Denied. You do not have permissions to access the ${requiredRole.toUpperCase()} dashboard.`);
      window.location.href = `${session.role}-dashboard.html`;
      return;
    }

    // Populate user profile info in dashboard UI
    const profileNames = document.querySelectorAll('.session-user-name');
    profileNames.forEach(el => {
      el.innerText = session.name;
    });

    const profileAvatars = document.querySelectorAll('.session-user-avatar');
    profileAvatars.forEach(el => {
      // Get initials
      const parts = session.name.split(' ');
      const initials = parts.map(p => p[0]).join('').substring(0, 2).toUpperCase();
      el.innerText = initials;
    });
  }

  // Attach logout handler
  const logoutButtons = document.querySelectorAll('.logout-trigger');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to log out?')) {
        endSession();
        window.location.href = 'index.html';
      }
    });
  });

  // Handle all other dashboard buttons -> render 404 page
  const dashboard404Buttons = document.querySelectorAll('.dashboard-404-btn, .dashboard-404-link');
  dashboard404Buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '404.html';
    });
  });

  // Mobile sidebar toggle
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('dashboard-sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }
});

// Helper: Email regex validation
function validateEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase().trim());
}

// Helper: Check password strength score (0-4)
function checkPasswordStrengthScore(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  return score;
}

// Helper: Show validation error message next to element
function showError(element, message) {
  element.style.borderColor = 'var(--primary)';
  element.style.boxShadow = '0 0 0 4px rgba(255, 62, 62, 0.2)';
  
  const container = element.closest('.form-group');
  if (container) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-msg';
    errorDiv.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>${message}</span>
    `;
    container.appendChild(errorDiv);
  }
}

// Helper: Clear all error messages from a form
function clearErrors(formElement) {
  const errorMessages = formElement.querySelectorAll('.error-msg');
  errorMessages.forEach(msg => msg.remove());
  
  const formInputs = formElement.querySelectorAll('.form-input, .form-select');
  formInputs.forEach(input => {
    input.style.borderColor = '';
    input.style.boxShadow = '';
  });
}
