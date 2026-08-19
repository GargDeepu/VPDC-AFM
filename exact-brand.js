/* Official VPDC logo loader: uses the repository-local brand asset only. */
(function () {
  const LOGO = 'assets/vpdc-logo.svg';
  function makeImage(kind) {
    const img = document.createElement('img');
    img.className = `vpdc-brand-logo vpdc-brand-logo--${kind}`;
    img.src = LOGO;
    img.alt = 'VPDC – Vinijyn Pro Classes';
    img.decoding = 'async';
    img.draggable = false;
    return img;
  }
  function apply() {
    document.querySelectorAll('.vpc-logo, .vpdc-logo').forEach((el) => {
      if (el.dataset.brandApplied === '1') return;
      const kind = el.classList.contains('large') ? 'large' : el.classList.contains('mini') ? 'mini' : 'small';
      el.replaceChildren(makeImage(kind));
      el.dataset.brandApplied = '1';
    });
  }
  const observer = new MutationObserver(apply);
  observer.observe(document.documentElement, { childList:true, subtree:true });
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', apply, {once:true}) : apply();
})();
