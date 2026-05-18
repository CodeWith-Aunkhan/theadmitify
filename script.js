document.addEventListener('DOMContentLoaded', () => {
  // Navbar transparency on scroll
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (nav) {
      if (window.scrollY > 50) {
        nav.style.padding = '1rem 5%';
        nav.style.background = 'rgba(15, 23, 42, 0.95)';
      } else {
        nav.style.padding = '1.5rem 5%';
        nav.style.background = 'rgba(15, 23, 42, 0.8)';
      }
    }
  });

  // Global Modal Logic
  const modal = document.getElementById('applyModal');
  const loginModal = document.getElementById('loginModal');
  const openBtns = document.querySelectorAll('.open-modal');
  const openLoginBtns = document.querySelectorAll('.open-login');
  const closeBtn = document.querySelector('.close-modal');
  const closeLoginBtn = document.getElementById('closeLogin');
  const globalForm = document.getElementById('global-apply-form');
  const loginForm = document.getElementById('login-form');

  // Open Apply Modal
  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) modal.style.display = 'flex';
    });
  });

  // Open Login Modal
  openLoginBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (loginModal) loginModal.style.display = 'flex';
    });
  });

  // Close Modals
  if (closeBtn) closeBtn.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });
  if (closeLoginBtn) closeLoginBtn.addEventListener('click', () => { if (loginModal) loginModal.style.display = 'none'; });

  // Close on outside click
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
    if (e.target === loginModal) loginModal.style.display = 'none';
  });

  // Configurable Google Sheets Web App URL
  // Setup instructions are provided in google_sheets_setup.md
  const GOOGLE_SHEETS_URL = "YOUR_GOOGLE_SCRIPT_URL_HERE";

  // Reusable Toast Notification Generator
  function showNotification(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✓' : '✗';
    toast.innerHTML = `
      <div class="toast-icon" style="font-weight: bold; font-size: 1.2rem; color: ${type === 'success' ? 'var(--gold)' : '#ef4444'}">${icon}</div>
      <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    // Trigger visual slide-in
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // Auto remove after 4 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, 4000);
  }

  // Form Submission Handler Helper
  async function handleFormSubmit(e, form, submitBtn, data, successMsg, modalToClose) {
    e.preventDefault();
    
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Processing Application...";
    submitBtn.style.opacity = "0.7";

    // Dynamic Source page info
    data.sourcePage = window.location.pathname.split("/").pop() || "index.html";

    // 1. Check if the URL is configured
    if (!GOOGLE_SHEETS_URL || GOOGLE_SHEETS_URL.includes("YOUR_GOOGLE_SCRIPT_URL")) {
      // Simulate success for pristine local deployment/testing
      setTimeout(() => {
        showNotification(successMsg, 'success');
        form.reset();
        if (modalToClose) modalToClose.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        submitBtn.style.opacity = "1";
      }, 1200);
      return;
    }

    // 2. Real Submission to Google Sheets
    try {
      await fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        mode: "no-cors", // Essential for Google Apps Script redirects without CORS issues
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      showNotification(successMsg, 'success');
      form.reset();
      if (modalToClose) modalToClose.style.display = 'none';
    } catch (error) {
      console.error("Submission Error:", error);
      showNotification("Submission failed. Please check connection or try again.", 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      submitBtn.style.opacity = "1";
    }
  }

  // Handle Global Form
  if (globalForm) {
    globalForm.addEventListener('submit', (e) => {
      const name = document.getElementById('global-name').value;
      const phone = document.getElementById('global-phone').value;
      const destination = document.getElementById('global-destination').value;
      const intake = document.getElementById('global-intake').value;
      const submitBtn = globalForm.querySelector('button[type="submit"]');

      const leadData = { name, phone, destination, intake };
      handleFormSubmit(
        e, 
        globalForm, 
        submitBtn, 
        leadData, 
        "Thank you! Your application has been successfully saved to our student sheet. We will contact you soon.", 
        modal
      );
    });
  }

  // Handle Details Form
  const detailsForm = document.getElementById('details-form');
  if (detailsForm) {
    detailsForm.addEventListener('submit', (e) => {
      const name = document.getElementById('student-name').value;
      const phone = document.getElementById('student-phone').value;
      const intake = document.getElementById('intake').value;
      const submitBtn = detailsForm.querySelector('button[type="submit"]');

      // Get current country dynamically from URL query parameters (e.g., details.html?country=Russia)
      const urlParams = new URLSearchParams(window.location.search);
      const destination = urlParams.get('country') || "General Inquiry";

      const leadData = { name, phone, destination, intake };
      handleFormSubmit(
        e, 
        detailsForm, 
        submitBtn, 
        leadData, 
        `Inquiry for MBBS in ${destination} received! Details successfully saved to our student sheet.`, 
        null
      );
    });
  }

  // Handle Login Form (Demo)
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showNotification('Login Successful! Redirecting to Student Dashboard (Demo)...', 'success');
      loginModal.style.display = 'none';
    });
  }

  // Scroll Progress Bar Logic
  window.addEventListener('scroll', () => {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + "%";
    }
  });

  // Mobile Menu Logic
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const closeMobile = document.getElementById('closeMobile');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (mobileBtn && mobileOverlay) {
    mobileBtn.addEventListener('click', () => {
      mobileOverlay.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Disable scroll
    });

    const closeMenu = () => {
      mobileOverlay.style.display = 'none';
      document.body.style.overflow = 'auto'; // Enable scroll
    };

    if (closeMobile) closeMobile.addEventListener('click', closeMenu);
    
    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // Active Link Highlighting on Scroll
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= (sectionTop - 150)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') && link.getAttribute('href').includes(current)) {
        link.classList.add('active');
      }
    });
  });

  // Animated Counter Logic
  const stats = document.querySelectorAll('.stat-number');
  const speed = 200;

  const observerOptions = {
    threshold: 0.5
  };

  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        target.innerText = "0"; // Reset before start
        const updateCount = () => {
          const targetValue = +target.getAttribute('data-target');
          const count = +target.innerText;
          const inc = targetValue / speed;

          if (count < targetValue) {
            target.innerText = Math.ceil(count + inc);
            setTimeout(updateCount, 1);
          } else {
            target.innerText = targetValue + (targetValue === 100 ? '%' : '+');
          }
        };
        updateCount();
      } else {
        // Reset to 0 when scrolled out so it can animate again
        entry.target.innerText = "0";
      }
    });
  }, observerOptions);

  stats.forEach(stat => statsObserver.observe(stat));

  // Video Card Interactions
  const videoCards = document.querySelectorAll('.video-card');
  videoCards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.querySelector('h4').innerText;
      alert(`Playing: ${title}\n(In production, this would open a YouTube/Vimeo lightbox)`);
    });
  });

  // Preloader Logic (Premium Entry Only)
  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      // Show animation ONLY if it's a fresh entry or refresh
      // We use a small delay only on the very first visit
      const isFirstLoad = !sessionStorage.getItem('theadmitify_visited');
      
      if (isFirstLoad) {
        setTimeout(() => {
          preloader.classList.add('loaded');
          sessionStorage.setItem('theadmitify_visited', 'true');
        }, 1500);
      } else {
        // If already visited, remove it instantly without any animation
        preloader.style.display = 'none';
        preloader.classList.add('loaded');
      }
    }
  });

  // Re-initialize Lucide icons for new content
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
