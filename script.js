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
      image: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&q=80&w=600',
      duration: '6 Years',
      medium: 'English Medium',
      eligibility: '50% PCB & NEET Qualified',
      fees: '₹2.5 Lakhs to ₹5 Lakhs / Year',
      desc: 'Russia is home to world-renowned medical universities. Most of them are government-owned and approved by WHO and the National Medical Commission (NMC).',
      hostel: 'Fully furnished hostel with separate mess facility for Indian students.'
    },
    'Georgia': {
      title: 'MBBS in Georgia',
      image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80&w=600',
      duration: '6 Years',
      medium: 'English Medium',
      eligibility: '50% PCB & NEET Qualified',
      fees: '₹4 Lakhs to ₹6 Lakhs / Year',
      desc: 'Georgia offers high European standard education with top clinical infrastructure. Perfect destination for students aiming to practice in Europe or the US.',
      hostel: 'Excellent hostel options with standard student kitchen facilities.'
    },
    'America': {
      title: 'MBBS in America (Caribbean)',
      image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&q=80&w=600',
      duration: '5.5 Years',
      medium: 'English Medium',
      eligibility: '50% PCB & NEET Qualified',
      fees: '₹10 Lakhs to ₹15 Lakhs / Year',
      desc: 'Fastest pathway to residency in the United States. USMLE syllabus integrated from the first day of classes.',
      hostel: 'Modern student dorms, high security, and standard international dining.'
    },
    'Egypt': {
      title: 'MBBS in Egypt',
      image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&q=80&w=600',
      duration: '5 Years + 2 Years Internship',
      medium: 'English Medium',
      eligibility: '50% PCB & NEET Qualified',
      fees: '₹4 Lakhs to ₹5 Lakhs / Year',
      desc: 'Top-ranked, historic universities like Cairo University. High patient flow in clinical rotations matching Indian climate and disease profiles.',
      hostel: 'Safe university hostels with modern amenities and high-speed internet.'
    },
    'Nepal': {
      title: 'MBBS in Nepal',
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=600',
      duration: '5.5 Years',
      medium: 'English Medium',
      eligibility: '50% PCB & NEET Qualified',
      fees: '₹8 Lakhs to ₹12 Lakhs / Year',
      desc: 'Close proximity to India with no visa requirement. Textbooks, curriculum, and exam patterns are identical to NMC rules.',
      hostel: 'In-campus hostels with Indian food served in separate student mess.'
    },
    'Philippines': {
      title: 'MBBS in Philippines',
      image: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&q=80&w=600',
      duration: '5.5 Years (BS + MD)',
      medium: 'English Medium',
      eligibility: '50% PCB & NEET Qualified',
      fees: '₹3.5 Lakhs to ₹5 Lakhs / Year',
      desc: 'Highest passing rate in FMGE licensing exam. American styled medical curriculum with focus on early clinical rotations.',
      hostel: 'Hostels with air-conditioning, security, and options for Indian food.'
    },
    'Uzbekistan': {
      title: 'MBBS in Uzbekistan',
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=600',
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

  // Start the schedule
  schedulePopup();
});
