(function () {
  const tabBtns = document.querySelectorAll('.tab-btn');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      if (typeof showSection === 'function') {
        showSection(section);
      }
    });
  });

  const observer = new MutationObserver(() => {
    const activeNav = document.querySelector('.nav-item.active');
    if (!activeNav) return;
    const active = activeNav.dataset.section;
    tabBtns.forEach(b => {
      b.classList.toggle('active', b.dataset.section === active);
    });
  });

  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    observer.observe(sidebar, { attributes: true, subtree: true, attributeFilter: ['class'] });
  }
})();