document.addEventListener('DOMContentLoaded', () => {
  // Navbar transparency on scroll
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (nav) {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
  });

  // Global Modal Logic
  const modal = document.getElementById('applyModal');
  const openBtns = document.querySelectorAll('.open-modal');
  const closeBtn = document.querySelector('.close-modal');
  const globalForm = document.getElementById('global-apply-form');

  // Open Apply Modal
  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) modal.style.display = 'flex';
    });
  });



  // Helper to handle modal close and trigger second popup
  const handleModalClose = () => {
    if (modal) modal.style.display = 'none';
    let popupCount = parseInt(sessionStorage.getItem('quickApplyPopupCount') || '0');
    if (popupCount === 1) {
      schedulePopup();
    }
  };

  // Close Modals
  if (closeBtn) closeBtn.addEventListener('click', handleModalClose);

  // Close on outside click
  window.addEventListener('click', (e) => {
    if (e.target === modal) handleModalClose();
  });

  // Connect to Web3Forms Backend (Highly stable, no redirects/popups)
  const WEB3FORMS_ACCESS_KEY = "3c468695-9bb3-4f27-b321-5f2d5e06aa5c";

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
    data.access_key = WEB3FORMS_ACCESS_KEY;
    data.subject = `New Lead: ${data.name} for ${data.destination}`;

    // If key is not set, simulate success for testing
    if (WEB3FORMS_ACCESS_KEY === "YOUR_ACCESS_KEY_HERE") {
      setTimeout(() => {
        showNotification(successMsg, 'success');
        form.reset();
        sessionStorage.setItem('formSubmitted', 'true');
        if (modalToClose) modalToClose.style.display = 'none';
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        submitBtn.style.opacity = "1";
      }, 1000);
      return;
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showNotification(successMsg, 'success');
        form.reset();
        sessionStorage.setItem('formSubmitted', 'true');
        if (modalToClose) modalToClose.style.display = 'none';
        const successModal = document.getElementById('success-modal');
        if (successModal) successModal.style.display = 'flex';
      } else {
        throw new Error(result.message || "Failed to submit lead");
      }

    } catch (error) {
      console.error("Submission Error:", error);
      showNotification("Submission failed. Please try again.", 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      submitBtn.style.opacity = "1";
    }
  }

  // Handle Global Form
  if (globalForm) {
    globalForm.addEventListener('submit', (e) => {
      const name = document.getElementById('global-name').value.trim();
      const phone = document.getElementById('global-phone').value.trim();
      const email = document.getElementById('global-email').value.trim();
      const destination = document.getElementById('global-destination').value;
      const submitBtn = globalForm.querySelector('button[type="submit"]');

      // Validation
      if (!/^[a-zA-Z\s]{2,}$/.test(name)) {
        e.preventDefault();
        showNotification('Please enter a valid name (letters only).', 'error');
        return;
      }
      if (!/^[0-9]{10}$/.test(phone)) {
        e.preventDefault();
        showNotification('Please enter a valid 10-digit phone number.', 'error');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        e.preventDefault();
        showNotification('Please enter a valid email address.', 'error');
        return;
      }

      const leadData = { name, phone, email, destination };
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
      const name = document.getElementById('student-name').value.trim();
      const phone = document.getElementById('student-phone').value.trim();
      const email = document.getElementById('student-email').value.trim();
      const submitBtn = detailsForm.querySelector('button[type="submit"]');

      // Validation
      if (!/^[a-zA-Z\s]{2,}$/.test(name)) {
        e.preventDefault();
        showNotification('Please enter a valid name (letters only).', 'error');
        return;
      }
      if (!/^[0-9]{10}$/.test(phone)) {
        e.preventDefault();
        showNotification('Please enter a valid 10-digit phone number.', 'error');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        e.preventDefault();
        showNotification('Please enter a valid email address.', 'error');
        return;
      }

      // Get current country dynamically from URL query parameters (e.g., details.html?country=Russia)
      const urlParams = new URLSearchParams(window.location.search);
      const destination = urlParams.get('country') || "General Inquiry";

      const leadData = { name, phone, email, destination };
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

  // Automatic Premium Popup Logic (Max 2 times)
  function schedulePopup() {
    let popupCount = parseInt(sessionStorage.getItem('quickApplyPopupCount') || '0');
    if (popupCount < 2 && !sessionStorage.getItem('formSubmitted')) {
      setTimeout(() => {
        let currentCount = parseInt(sessionStorage.getItem('quickApplyPopupCount') || '0');
        if (currentCount < 2 && !sessionStorage.getItem('formSubmitted') && modal && modal.style.display !== 'flex') {
          modal.style.display = 'flex';
          sessionStorage.setItem('quickApplyPopupCount', (currentCount + 1).toString());
        }
      }, 30000);
    }
  }

  // Start the schedule
  schedulePopup();
});
