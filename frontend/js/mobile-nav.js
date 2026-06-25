function injectMobileNav(links, currentPage, breakpoint) {
  var bp = breakpoint || 'md';
  var hidden = bp === 'lg' ? 'lg:hidden' : 'md:hidden';

  var nav = document.createElement('div');
  nav.innerHTML = `
    <button
      id="mobileMenuBtn"
      class="fixed top-4 left-4 z-50 ${hidden} bg-white border border-slate-200 rounded-lg p-2 shadow-sm"
      aria-label="Open navigation menu"
      aria-expanded="false"
    >
      <i data-lucide="menu" class="w-5 h-5 text-slate-700"></i>
    </button>

    <div
      id="mobileOverlay"
      class="fixed inset-0 bg-black/40 z-40 hidden"
      aria-hidden="true"
    ></div>

    <div
      id="mobileDrawer"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
      class="fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-50 transform -translate-x-full transition-transform duration-300 ${hidden} flex-col flex"
    >
      <div class="flex items-center justify-between p-5 border-b border-slate-100">
        <span class="text-lg font-bold text-indigo-600">PlacementorAI</span>
        <button id="mobileCloseBtn" aria-label="Close navigation menu" class="p-1 rounded hover:bg-slate-100">
          <i data-lucide="x" class="w-5 h-5 text-slate-600"></i>
        </button>
      </div>
      <nav class="flex-1 px-4 py-4 space-y-1">
        ${links.map(function(link) {
          var isActive = link.href.includes(currentPage);
          return `<a href="${link.href}"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}"
          >
            <i data-lucide="${link.icon}" class="w-4 h-4"></i>
            ${link.label}
          </a>`;
        }).join('')}
      </nav>
      <div class="p-4 border-t border-slate-100">
        <a href="../login.html" class="flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 transition-colors">
          <i data-lucide="log-out" class="w-4 h-4"></i> Logout
        </a>
      </div>
    </div>
  `;

  document.body.appendChild(nav);

  if (window.lucide) lucide.createIcons();

  var btn = document.getElementById('mobileMenuBtn');
  var closeBtn = document.getElementById('mobileCloseBtn');
  var overlay = document.getElementById('mobileOverlay');
  var drawer = document.getElementById('mobileDrawer');

  function openDrawer() {
    drawer.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
    btn.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    drawer.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeDrawer();
  });
}