// Login Script with USN Support (No Password)

// Mock user database with USN (in production, this would be backend validation)
const registeredUsers = [
  { name: 'Demo Student', usn: '1SI24IS099', email: 'demo@lastminutehub.com', dob: '2002-05-15' },
  { name: 'Test User', usn: '1SI23CS045', email: 'test@lastminutehub.com', dob: '2001-09-10' }
];

// Populate DOB selects and prepare login form (no signup tab)
function populateDOBSelects() {
  const daySel = document.getElementById('dob-day');
  const monthSel = document.getElementById('dob-month');
  const yearSel = document.getElementById('dob-year');

  // Populate days
  for (let d = 1; d <= 31; d++) {
    const opt = document.createElement('option');
    opt.value = String(d).padStart(2, '0');
    opt.textContent = d;
    daySel.appendChild(opt);
  }

  // Populate months
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  months.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = String(i+1).padStart(2, '0');
    opt.textContent = m;
    monthSel.appendChild(opt);
  });

  // Populate years (1980 - 2010)
  for (let y = 2010; y >= 1980; y--) {
    const opt = document.createElement('option');
    opt.value = String(y);
    opt.textContent = y;
    yearSel.appendChild(opt);
  }
}

// Handle login form submission
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const usn = document.getElementById('usn').value.trim().toUpperCase();
  const day = document.getElementById('dob-day').value;
  const month = document.getElementById('dob-month').value;
  const year = document.getElementById('dob-year').value;

  // Basic DOB validation
  if (!day || !month || !year) {
    showMessage('Please enter your date of birth (day, month, year).', 'error', 'login-form');
    return;
  }

  // Construct ISO date and validate
  const dobIso = `${year}-${month}-${day}`;
  const dobObj = new Date(dobIso);
  if (isNaN(dobObj.getTime())) {
    showMessage('Invalid date of birth. Please check your input.', 'error', 'login-form');
    return;
  }
  
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
  
  // Save last used USN for convenience
  localStorage.setItem('lastUSN', usn);

  // Simulate login process (passing DOB)
  simulateLogin(usn, dobIso);
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
function simulateLogin(usn, dobIso) {
  // Check against registered users
  const user = registeredUsers.find(u => u.usn === usn);
  
  if (user) {
    // If user has a stored DOB, validate it as an authentication factor
    if (user.dob && user.dob !== dobIso) {
      showMessage('Date of birth does not match our records.', 'error', 'login-form');
      return;
    }
    // Store user session
    localStorage.setItem('userType', 'authenticated');
    localStorage.setItem('userName', user.name);
    localStorage.setItem('userUSN', user.usn);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userDOB', dobIso);
    localStorage.setItem('loginTime', new Date().toISOString());
    
    showMessage('Login successful! Redirecting...', 'success', 'login-form');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  } else {
    showMessage('USN not found. Please sign up first or check your USN.', 'error', 'login-form');
  }
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
  // Populate DOB selects
  try { populateDOBSelects(); } catch (e) { /* ignore if elements missing */ }
  const lastUSN = localStorage.getItem('lastUSN');
  if (lastUSN) {
    document.getElementById('usn').value = lastUSN;
    document.getElementById('usn').focus();
  }
});

// Demo credentials notice
console.log('Demo credentials:');
registeredUsers.forEach(u => console.log(`${u.usn}  DOB: ${u.dob || 'N/A'}`));

