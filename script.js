document.addEventListener('DOMContentLoaded', () => {
  // Navbar transparency on scroll
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
      nav.style.padding = '1rem 5%';
      nav.style.background = 'rgba(15, 23, 42, 0.95)';
    } else {
      nav.style.padding = '1.5rem 5%';
      nav.style.background = 'rgba(15, 23, 42, 0.8)';
    }
  });

  // Re-initialize Lucide icons for new content
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
