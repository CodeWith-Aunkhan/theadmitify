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

  if (modal) {
    // Open Modal
    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'flex';
      });
    });

    // Close Modal
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    // Close on outside click
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
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
  }

  // Re-initialize Lucide icons for new content
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
