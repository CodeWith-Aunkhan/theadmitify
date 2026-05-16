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

  // Handle Global Form
  if (globalForm) {
    globalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you! Your quick application has been received. Our team will contact you soon.');
      modal.style.display = 'none';
      globalForm.reset();
    });
  }

  // Handle Login Form (Demo)
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Login Successful! Redirecting to Student Dashboard (Demo)...');
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
