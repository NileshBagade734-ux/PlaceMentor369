// validationUtils.js

const ValidationUtils = {
  patterns: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    mobile: /^\d{10}$/
  },

  messages: {
    required: "This field is required.",
    email: "Please enter a valid email address.",
    password: "Password must be at least 8 characters long and contain at least 1 uppercase, 1 lowercase letter, and 1 number.",
    cgpa: "CGPA must be a valid number between 0.0 and 10.0.",
    mobile: "Please enter a valid 10-digit mobile number (e.g. 9876543210)."
  },

  showError(inputEl, message) {
    inputEl.classList.add('border-red-500', 'focus:ring-red-500');
    // Remove typical valid classes
    inputEl.classList.remove('border-gray-200', 'border-gray-300', 'focus:ring-blue-500', 'focus:ring-indigo-500');
    
    let errorEl = inputEl.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains('validation-error')) {
      errorEl = document.createElement('p');
      errorEl.classList.add('validation-error', 'text-red-500', 'text-xs', 'mt-1', 'font-medium');
      // Insert right after the input element
      inputEl.parentNode.insertBefore(errorEl, inputEl.nextSibling);
    }
    errorEl.textContent = message;
  },

  clearError(inputEl) {
    inputEl.classList.remove('border-red-500', 'focus:ring-red-500');
    // We add back generic borders so it looks normal
    inputEl.classList.add('focus:ring-indigo-500'); // or blue-500 based on theme, we'll use indigo which is common in this app
    
    const errorEl = inputEl.nextElementSibling;
    if (errorEl && errorEl.classList.contains('validation-error')) {
      errorEl.remove();
    }
  },

  validateField(inputEl, type) {
    const value = inputEl.value.trim();
    
    // Check required
    if (!value && inputEl.hasAttribute('required')) {
      this.showError(inputEl, this.messages.required);
      return false;
    }
    
    if (value) {
      if (type === 'email' && !this.patterns.email.test(value)) {
        this.showError(inputEl, this.messages.email);
        return false;
      }
      if (type === 'password' && !this.patterns.password.test(value)) {
        this.showError(inputEl, this.messages.password);
        return false;
      }
      if (type === 'mobile' && !this.patterns.mobile.test(value)) {
        this.showError(inputEl, this.messages.mobile);
        return false;
      }
      if (type === 'cgpa') {
        const cgpa = parseFloat(value);
        if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
          this.showError(inputEl, this.messages.cgpa);
          return false;
        }
      }
    }
    
    this.clearError(inputEl);
    return true;
  },

  attachRealTimeValidation(inputEl, type) {
    inputEl.addEventListener('input', () => {
      this.validateField(inputEl, type);
    });
  },
  
  validateForm(formEl, fieldConfig) {
    let isValid = true;
    fieldConfig.forEach(config => {
      const inputEl = document.getElementById(config.id);
      if (inputEl) {
        const isFieldValid = this.validateField(inputEl, config.type);
        if (!isFieldValid) isValid = false;
        
        // Attach real-time validation once the user has triggered a form submit
        if (!inputEl.dataset.validationAttached) {
          this.attachRealTimeValidation(inputEl, config.type);
          inputEl.dataset.validationAttached = "true";
        }
      }
    });
    return isValid;
  }
};

window.ValidationUtils = ValidationUtils;
