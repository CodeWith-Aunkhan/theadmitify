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
  const openBtns = document.querySelectorAll('.open-modal');
  const closeBtn = document.querySelector('.close-modal');
  const globalForm = document.getElementById('global-apply-form');

  // Mobile Menu Overlay Elements
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const closeMobile = document.getElementById('closeMobile');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  // Helper to hide mobile menu
  const hideMobileMenu = () => {
    if (mobileOverlay) {
      mobileOverlay.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  // Open Apply Modal
  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) modal.style.display = 'flex';
      hideMobileMenu(); // Close mobile menu if it was open
    });
  });

  // Mobile Menu Open
  if (mobileMenuBtn && mobileOverlay) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileOverlay.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Stop background scrolling
    });
  }

  // Mobile Menu Close
  if (closeMobile) {
    closeMobile.addEventListener('click', hideMobileMenu);
  }

  // Close mobile menu when clicking any link
  mobileLinks.forEach(link => {
    link.addEventListener('click', hideMobileMenu);
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
      // Show animation every time the page loads/refreshes
      setTimeout(() => {
        preloader.classList.add('loaded');
      }, 1500);
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

  // Mobile Tab Bar active highlighting on click & scroll
  const tabItems = document.querySelectorAll('.tab-item');
  if (tabItems.length > 0) {
    tabItems.forEach(item => {
      item.addEventListener('click', function(e) {
        if (this.classList.contains('open-modal')) return;
        tabItems.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
      });
    });

    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 200;
      const homeSec = document.getElementById('home');
      const countrySec = document.getElementById('countries');
      const serviceSec = document.getElementById('services');

      if (homeSec && countrySec && serviceSec) {
        let activeId = 'home';
        if (scrollPos >= serviceSec.offsetTop) {
          activeId = 'services';
        } else if (scrollPos >= countrySec.offsetTop) {
          activeId = 'countries';
        } else {
          activeId = 'home';
        }

        tabItems.forEach(item => {
          const href = item.getAttribute('href');
          if (href === `#${activeId}`) {
            item.classList.add('active');
          } else if (!item.classList.contains('open-modal')) {
            item.classList.remove('active');
          }
        });
      }
    });
  }

  // Scroll map-wrapper to center on load
  const mapWrapper = document.querySelector('.map-wrapper');
  if (mapWrapper) {
    mapWrapper.scrollLeft = 220;
  }

  // 1. Floating Action Button (FAB) Menu Controls
  const fabMainBtn = document.getElementById('fabMainBtn');
  const fabMenuContainer = document.getElementById('fabMenuContainer');
  const fabOptions = document.querySelector('.fab-options');
  if (fabMainBtn && fabMenuContainer && fabOptions) {
    fabMainBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fabMainBtn.classList.toggle('active');
      fabOptions.classList.toggle('active');
    });
    document.addEventListener('click', () => {
      fabMainBtn.classList.remove('active');
      fabOptions.classList.remove('active');
    });
  }

  // 2. Carousel Indicators Scroll Syncing
  const countryGrid = document.querySelector('.country-grid');
  const countryDots = document.querySelectorAll('#countryIndicators .dot');
  if (countryGrid && countryDots.length > 0) {
    countryGrid.addEventListener('scroll', () => {
      const width = countryGrid.scrollWidth - countryGrid.clientWidth;
      if (width <= 0) return;
      const scrollPos = countryGrid.scrollLeft;
      const activeIndex = Math.round((scrollPos / width) * (countryDots.length - 1));
      countryDots.forEach((dot, idx) => {
        if (idx === activeIndex) dot.classList.add('active');
        else dot.classList.remove('active');
      });
    });
  }

  const videoGrid = document.querySelector('.video-grid');
  const videoDots = document.querySelectorAll('#videoIndicators .dot');
  if (videoGrid && videoDots.length > 0) {
    videoGrid.addEventListener('scroll', () => {
      const width = videoGrid.scrollWidth - videoGrid.clientWidth;
      if (width <= 0) return;
      const scrollPos = videoGrid.scrollLeft;
      const activeIndex = Math.round((scrollPos / width) * (videoDots.length - 1));
      videoDots.forEach((dot, idx) => {
        if (idx === activeIndex) dot.classList.add('active');
        else dot.classList.remove('active');
      });
    });
  }

  // 3. Multi-Step Form Controls
  const nextStepBtn = document.querySelector('.next-step-btn');
  const prevStepBtn = document.querySelector('.prev-step-btn');
  const step1 = document.querySelector('.form-step[data-step="1"]');
  const step2 = document.querySelector('.form-step[data-step="2"]');
  const progressBar = document.getElementById('stepProgressBar');

  if (nextStepBtn && prevStepBtn && step1 && step2 && progressBar) {
    nextStepBtn.addEventListener('click', () => {
      const nameInput = document.getElementById('global-name');
      const emailInput = document.getElementById('global-email');
      
      if (!nameInput.value || !emailInput.value) {
        nameInput.reportValidity();
        emailInput.reportValidity();
        return;
      }
      if (!emailInput.value.includes('@')) {
        emailInput.reportValidity();
        return;
      }

      step1.classList.remove('active');
      step2.classList.add('active');
      progressBar.style.width = '100%';
    });

    prevStepBtn.addEventListener('click', () => {
      step2.classList.remove('active');
      step1.classList.add('active');
      progressBar.style.width = '50%';
    });
    
    const resetFormSteps = () => {
      step2.classList.remove('active');
      step1.classList.add('active');
      progressBar.style.width = '50%';
    };
    
    const modalCloseBtns = document.querySelectorAll('.close-modal');
    modalCloseBtns.forEach(btn => {
      btn.addEventListener('click', resetFormSteps);
    });
  }

  // 4. Mobile Bottom Sheet Details Drawer Controls
  const sheetData = {
    'Russia': {
      title: 'MBBS in Russia',
      image: 'assets/russia.jpg',
      duration: '6 Years',
      medium: 'English Medium',
      eligibility: '50% PCB & NEET Qualified',
      fees: '₹2.5 Lakhs to ₹5 Lakhs / Year',
      desc: 'Russia is home to world-renowned medical universities. Most of them are government-owned and approved by WHO and the National Medical Commission (NMC).',
      hostel: 'Fully furnished hostel with separate mess facility for Indian students.'
    },
    'Georgia': {
      title: 'MBBS in Georgia',
      image: 'assets/georgia.jpg',
      duration: '6 Years',
      medium: 'English Medium',
      eligibility: '50% PCB & NEET Qualified',
      fees: '₹4 Lakhs to ₹6 Lakhs / Year',
      desc: 'Georgia offers high European standard education with top clinical infrastructure. Perfect destination for students aiming to practice in Europe or the US.',
      hostel: 'Excellent hostel options with standard student kitchen facilities.'
    },
    'America': {
      title: 'MBBS in America (Caribbean)',
      image: 'assets/america.jpg',
      duration: '5.5 Years',
      medium: 'English Medium',
      eligibility: '50% PCB & NEET Qualified',
      fees: '₹10 Lakhs to ₹15 Lakhs / Year',
      desc: 'Fastest pathway to residency in the United States. USMLE syllabus integrated from the first day of classes.',
      hostel: 'Modern student dorms, high security, and standard international dining.'
    },
    'Egypt': {
      title: 'MBBS in Egypt',
      image: 'assets/egypt.jpg',
      duration: '5 Years + 2 Years Internship',
      medium: 'English Medium',
      eligibility: '50% PCB & NEET Qualified',
      fees: '₹4 Lakhs to ₹5 Lakhs / Year',
      desc: 'Top-ranked, historic universities like Cairo University. High patient flow in clinical rotations matching Indian climate and disease profiles.',
      hostel: 'Safe university hostels with modern amenities and high-speed internet.'
    },
    'Nepal': {
      title: 'MBBS in Nepal',
      image: 'assets/nepal.jpg',
      duration: '5.5 Years',
      medium: 'English Medium',
      eligibility: '50% PCB & NEET Qualified',
      fees: '₹8 Lakhs to ₹12 Lakhs / Year',
      desc: 'Close proximity to India with no visa requirement. Textbooks, curriculum, and exam patterns are identical to NMC rules.',
      hostel: 'In-campus hostels with Indian food served in separate student mess.'
    },
    'Philippines': {
      title: 'MBBS in Philippines',
      image: 'assets/philippines.jpg',
      duration: '5.5 Years (BS + MD)',
      medium: 'English Medium',
      eligibility: '50% PCB & NEET Qualified',
      fees: '₹3.5 Lakhs to ₹5 Lakhs / Year',
      desc: 'Highest passing rate in FMGE licensing exam. American styled medical curriculum with focus on early clinical rotations.',
      hostel: 'Hostels with air-conditioning, security, and options for Indian food.'
    },
    'Uzbekistan': {
      title: 'MBBS in Uzbekistan',
      image: 'assets/uzbekistan.png',
      duration: '6 Years',
      medium: 'English Medium',
      eligibility: '50% PCB & NEET Qualified',
      fees: '₹2.5 Lakhs to ₹3.5 Lakhs / Year',
      desc: 'Affordable tuition fee government universities. Very safe environment with friendly local culture.',
      hostel: 'Comfortable student rooms with access to central heating and laundry.'
    }
  };

  const bottomSheet = document.getElementById('mobileBottomSheet');
  const bottomSheetBackdrop = document.getElementById('bottomSheetBackdrop');
  const closeBottomSheetBtn = document.getElementById('closeBottomSheetBtn');
  const bottomSheetBodyContent = document.getElementById('bottomSheetBodyContent');

  const openBottomSheet = (countryName) => {
    const data = sheetData[countryName];
    if (!data || !bottomSheet || !bottomSheetBodyContent) return;

    bottomSheetBodyContent.innerHTML = `
      <div class="sheet-hero" style="background-image: linear-gradient(rgba(15,23,42,0.4), rgba(15,23,42,0.95)), url('${data.image}'); height: 180px; background-size: cover; background-position: center; border-radius: 15px; margin-bottom: 20px; display: flex; align-items: flex-end; padding: 15px;">
        <h3 style="color: #fff; font-size: 1.8rem; margin: 0; text-shadow: 0 2px 10px rgba(0,0,0,0.6);">${data.title}</h3>
      </div>
      <div class="sheet-stats" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
        <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
          <span style="display: block; font-size: 0.7rem; color: var(--gold); font-weight: 600; margin-bottom: 4px;">DURATION</span>
          <span style="font-size: 0.8rem; font-weight: bold; color: #fff;">${data.duration}</span>
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
          <span style="display: block; font-size: 0.7rem; color: var(--gold); font-weight: 600; margin-bottom: 4px;">MEDIUM</span>
          <span style="font-size: 0.8rem; font-weight: bold; color: #fff;">${data.medium}</span>
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
          <span style="display: block; font-size: 0.7rem; color: var(--gold); font-weight: 600; margin-bottom: 4px;">ELIGIBILITY</span>
          <span style="font-size: 0.75rem; font-weight: bold; color: #fff;">${data.eligibility}</span>
        </div>
      </div>
      <div class="sheet-info" style="margin-bottom: 20px;">
        <h4 style="color: var(--gold); font-size: 1rem; margin-bottom: 8px;">About ${countryName}</h4>
        <p style="font-size: 0.85rem; line-height: 1.5; color: var(--text-dim); margin-bottom: 15px;">${data.desc}</p>
        <h4 style="color: var(--gold); font-size: 1rem; margin-bottom: 8px;">Estimated Fees</h4>
        <p style="font-size: 0.9rem; font-weight: bold; color: #fff; margin-bottom: 15px;">${data.fees}</p>
        <h4 style="color: var(--gold); font-size: 1rem; margin-bottom: 8px;">Accommodation Facility</h4>
        <p style="font-size: 0.85rem; line-height: 1.5; color: var(--text-dim); margin-bottom: 20px;">${data.hostel}</p>
      </div>
      <button class="cta-button sheet-apply-btn" style="width: 100%;">Apply Now</button>
    `;
    
    bottomSheetBodyContent.querySelector('.sheet-apply-btn').addEventListener('click', (e) => {
      e.preventDefault();
      bottomSheet.classList.remove('active');
      const modal = document.getElementById('applyModal');
      if (modal) {
        modal.style.display = 'flex';
        const destSelect = document.getElementById('global-destination');
        if (destSelect) destSelect.value = countryName;
      }
    });

    bottomSheet.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeBottomSheet = () => {
    bottomSheet.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (bottomSheetBackdrop && closeBottomSheetBtn) {
    bottomSheetBackdrop.addEventListener('click', closeBottomSheet);
    closeBottomSheetBtn.addEventListener('click', closeBottomSheet);
  }

  const countryCards = document.querySelectorAll('.country-card');
  countryCards.forEach(card => {
    card.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const hrefVal = this.getAttribute('href');
        const url = new URL(hrefVal, window.location.href);
        const countryName = url.searchParams.get('country');
        openBottomSheet(countryName);
      }
    });
  });

  // 5. Scroll Reveal Animation Logic
  const revealElements = document.querySelectorAll('.country-card, .college-card, .team-card, .video-card, .stat-item, .feature-box, .section-header');
  revealElements.forEach(el => el.classList.add('reveal-hidden'));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  // 6. 3D Tilt Effect on Cards (Desktop Only)
  if (window.innerWidth > 768) {
    const tiltCards = document.querySelectorAll('.country-card, .college-card, .team-card');
    tiltCards.forEach(card => {
      card.classList.add('tilt-card');
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg tilt
        const rotateY = ((x - centerX) / centerX) * 10;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      });
    });
  }

  // 7. Hero Search Bar Logic (Auto-Scroll)
  const heroSearchInput = document.getElementById('heroSearchInput');
  const heroSearchBtn = document.getElementById('heroSearchBtn');

  if (heroSearchInput && heroSearchBtn) {
    // Helper function for fuzzy matching (Levenshtein distance)
    const getEditDistance = (a, b) => {
      if (a.length === 0) return b.length;
      if (b.length === 0) return a.length;
      const matrix = [];
      for (let i = 0; i <= b.length; i++) matrix[i] = [i];
      for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
          }
        }
      }
      return matrix[b.length][a.length];
    };

    const showCustomAlert = (title, message) => {
      const existing = document.getElementById('custom-toast');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.id = 'custom-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(99, 102, 241, 0.3);
        box-shadow: 0 15px 40px rgba(99, 102, 241, 0.15);
        padding: 20px 25px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 10000;
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        width: 90%;
        max-width: 400px;
      `;

      toast.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.1); color: #ef4444; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <div>
          <h4 style="margin: 0 0 5px 0; color: var(--text-main); font-size: 1.05rem;">${title}</h4>
          <p style="margin: 0; color: var(--text-dim); font-size: 0.85rem; line-height: 1.4;">${message}</p>
        </div>
      `;

      document.body.appendChild(toast);

      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
        toast.style.opacity = '1';
      });

      setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
      }, 4000);
    };

    const handleSearch = () => {
      const query = heroSearchInput.value.trim().toLowerCase();
      if (!query) return;

      const countriesSection = document.getElementById('countries');
      if (!countriesSection) return;

      // Scroll to the countries section
      const offsetTop = countriesSection.offsetTop - 100; // Account for fixed header
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });

      // Find the specific card
      const searchCountryCards = document.querySelectorAll('#countries .country-card');
      let found = false;

      searchCountryCards.forEach(card => {
        const h3 = card.querySelector('h3');
        if (!h3) return;
        
        const countryName = h3.innerText.toLowerCase();
        
        // Remove previous highlights
        card.style.boxShadow = '';
        card.style.borderColor = '';
        card.style.transform = '';

        // Allow up to 2 character mistakes for words > 4 chars
        const maxMistakes = query.length > 4 ? 2 : 1;
        const distance = getEditDistance(query, countryName);
        
        // Also check if the query is a close match to the beginning of the country name
        const prefixDistance = getEditDistance(query, countryName.substring(0, query.length));

        if (countryName.includes(query) || distance <= maxMistakes || prefixDistance <= maxMistakes) {
          found = true;
          setTimeout(() => {
            // Apply highlight effect after scrolling
            card.style.transition = 'all 0.5s ease';
            card.style.boxShadow = '0 0 40px rgba(99, 102, 241, 0.8)';
            card.style.borderColor = 'var(--accent)';
            card.style.transform = 'scale(1.05)';
            card.style.zIndex = '10';
            
            // Remove highlight after 3.5 seconds
            setTimeout(() => {
              card.style.boxShadow = '';
              card.style.borderColor = '';
              card.style.transform = '';
              card.style.zIndex = '';
            }, 3500);
          }, 800); // Wait for smooth scroll to finish
        }
      });

      if (!found) {
        setTimeout(() => {
          showCustomAlert("Country Not Found", "Sorry, we couldn't find a matching country. Please check our available top destinations below.");
        }, 800);
      }
    };

    heroSearchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleSearch();
    });
    heroSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
    });

    // Typewriter effect for Search Placeholder
    const examples = ['Russia', 'Georgia', 'Kazakhstan', 'Uzbekistan', 'Egypt'];
    let currentExampleIdx = 0;
    let currentCharIdx = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    const typePlaceholder = () => {
      // Don't animate if user is focused or has typed something
      if (document.activeElement === heroSearchInput || heroSearchInput.value.length > 0) {
        heroSearchInput.setAttribute('placeholder', "Where do you want to study?");
        setTimeout(typePlaceholder, 1000);
        return;
      }

      const currentWord = examples[currentExampleIdx];
      
      if (isDeleting) {
        heroSearchInput.setAttribute('placeholder', `Try searching "${currentWord.substring(0, currentCharIdx - 1)}"`);
        currentCharIdx--;
        typingSpeed = 50;
      } else {
        heroSearchInput.setAttribute('placeholder', `Try searching "${currentWord.substring(0, currentCharIdx + 1)}"`);
        currentCharIdx++;
        typingSpeed = 150;
      }

      if (!isDeleting && currentCharIdx === currentWord.length) {
        typingSpeed = 2000; // Pause at the end of the word
        isDeleting = true;
      } else if (isDeleting && currentCharIdx === 0) {
        isDeleting = false;
        currentExampleIdx = (currentExampleIdx + 1) % examples.length;
        typingSpeed = 500; // Pause before typing the next word
      }

      setTimeout(typePlaceholder, typingSpeed);
    };

    // Start typewriter effect
    setTimeout(typePlaceholder, 1000);
  }

  // Start the schedule
  schedulePopup();
});
