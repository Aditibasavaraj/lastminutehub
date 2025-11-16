// Login Script with USN Support (No Password)

// Mock user database with USN (in production, this would be backend validation)
const registeredUsers = [
  { name: 'Demo Student', usn: '1SI24IS099', email: 'demo@lastminutehub.com' },
  { name: 'Test User', usn: '1SI23CS045', email: 'test@lastminutehub.com' }
];

// Tab Switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const tabName = this.getAttribute('data-tab');
    switchTab(tabName);
  });
});

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Update forms
  document.querySelectorAll('.login-form, .signup-form').forEach(form => {
    form.classList.remove('active-tab');
  });

  if (tabName === 'login') {
    document.getElementById('login-form').classList.add('active-tab');
  } else {
    document.getElementById('signup-form').classList.add('active-tab');
  }

  // Clear any previous error messages
  document.querySelectorAll('.message').forEach(msg => msg.remove());
}

// Handle login form submission
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const usn = document.getElementById('usn').value.trim().toUpperCase();
  
  // Basic validation
  if (!usn) {
    showMessage('Please enter your USN', 'error', 'login-form');
    return;
  }
  
  // USN format validation (example: 1SI24IS099)
  if (!isValidUSN(usn)) {
    showMessage('Invalid USN format. Example: 1SI24IS099', 'error', 'login-form');
    return;
  }
  
  // Simulate login process
  simulateLogin(usn);
});

// Handle sign up form submission
document.getElementById('signup-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const fullname = document.getElementById('signup-name').value.trim();
  const usn = document.getElementById('signup-usn').value.trim().toUpperCase();
  const terms = document.getElementById('terms').checked;
  
  // Basic validation
  if (!fullname || !usn) {
    showMessage('Please fill in all fields', 'error', 'signup-form');
    return;
  }
  
  // USN format validation
  if (!isValidUSN(usn)) {
    showMessage('Invalid USN format. Example: 1SI24IS099', 'error', 'signup-form');
    return;
  }
  
  // Terms validation
  if (!terms) {
    showMessage('Please agree to the Terms & Conditions', 'error', 'signup-form');
    return;
  }
  
  // Check if USN already exists
  if (registeredUsers.some(u => u.usn === usn)) {
    showMessage('This USN is already registered. Please sign in instead.', 'error', 'signup-form');
    return;
  }
  
  // Create new account
  simulateSignup(fullname, usn);
});

// Handle guest login
document.getElementById('guest-btn').addEventListener('click', function() {
  if (confirm('Continue as guest? You will have limited access to features.')) {
    // Set guest session
    localStorage.setItem('userType', 'guest');
    localStorage.setItem('loginTime', new Date().toISOString());
    
    showMessage('Logging in as guest...', 'success', 'login-form');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  }
});

// Validate USN format (e.g., 1SI24IS099)
function isValidUSN(usn) {
  // Format: 1 digit (year) + 2 letters (branch) + 2 digits (semester) + 2 letters (course) + 3 digits (roll)
  const usnRegex = /^[1-4][A-Z]{2}\d{2}[A-Z]{2}\d{3}$/;
  return usnRegex.test(usn);
}

// Validate email format
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Simulate login (in production, this would call your backend API)
function simulateLogin(usn) {
  // Check against registered users
  const user = registeredUsers.find(u => u.usn === usn);
  
  if (user) {
    // Store user session
    localStorage.setItem('userType', 'authenticated');
    localStorage.setItem('userName', user.name);
    localStorage.setItem('userUSN', user.usn);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('loginTime', new Date().toISOString());
    
    showMessage('Login successful! Redirecting...', 'success', 'login-form');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  } else {
    showMessage('USN not found. Please sign up first or check your USN.', 'error', 'login-form');
  }
}

// Simulate sign up
function simulateSignup(fullname, usn) {
  // Add new user to database
  const newUser = { name: fullname, usn: usn, email: '' };
  registeredUsers.push(newUser);
  
  // Store user session
  localStorage.setItem('userType', 'authenticated');
  localStorage.setItem('userName', fullname);
  localStorage.setItem('userUSN', usn);
  localStorage.setItem('userEmail', '');
  localStorage.setItem('loginTime', new Date().toISOString());
  
  showMessage('Account created successfully! Redirecting...', 'success', 'signup-form');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1500);
}

// Show message feedback
function showMessage(message, type, formId) {
  const form = document.getElementById(formId);
  
  // Remove existing message if any
  const existing = form.querySelector('.message');
  if (existing) existing.remove();
  
  // Create message element
  const msgEl = document.createElement('div');
  msgEl.className = `message message-${type}`;
  msgEl.textContent = message;
  msgEl.style.cssText = `
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 10px;
    font-size: 14px;
    text-align: center;
    font-weight: 500;
    animation: slideIn 0.3s ease;
  `;
  
  if (type === 'error') {
    msgEl.style.background = '#f8d7da';
    msgEl.style.color = '#721c24';
    msgEl.style.border = '1px solid #f5c6cb';
  } else {
    msgEl.style.background = '#d4edda';
    msgEl.style.color = '#155724';
    msgEl.style.border = '1px solid #c3e6cb';
  }
  
  form.insertBefore(msgEl, form.firstChild);
  
  // Auto remove error messages after 4 seconds
  if (type === 'error') {
    setTimeout(() => msgEl.remove(), 4000);
  }
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

// Pre-fill USN if previously used
window.addEventListener('DOMContentLoaded', function() {
  const lastUSN = localStorage.getItem('lastUSN');
  if (lastUSN) {
    document.getElementById('usn').value = lastUSN;
    document.getElementById('usn').focus();
  }
});

// Demo credentials notice
console.log('Demo USNs:\n1SI24IS099\n1SI23CS045');

