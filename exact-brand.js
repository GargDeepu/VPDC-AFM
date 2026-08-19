/* Loads the exact VPDC SVG asset preserved in repository history. */
(function () {
  const SOURCE = 'https://raw.githubusercontent.com/GargDeepu/VPDC-AFM/b86a4c0f6049fb0dbbfb6adf2c0c47c88f97910f/assets/vpdc-logo.svg.gz.b64';
  let logoUrl = null, ready = false, applying = false;
  function bytesFromBase64(text) {
    const bin = atob(text.replace(/\s+/g, ''));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  async function loadLogo() {
    const r = await fetch(SOURCE, { cache: 'force-cache' });
    if (!r.ok) throw new Error('VPDC logo asset unavailable');
    const stream = new Blob([bytesFromBase64(await r.text())]).stream().pipeThrough(new DecompressionStream('gzip'));
    const svg = await new Response(stream).text();
    logoUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    ready = true; apply();
  }
  function makeImage(kind) {
    const img = document.createElement('img');
    img.className = 'vpdc-brand-logo vpdc-brand-logo--' + kind;
    img.src = logoUrl; img.alt = 'VPDC – Vinijyn Pro Classes';
    img.decoding = 'async'; img.draggable = false;
    return img;
  }
  function apply() {
    if (!ready || applying) return;
    applying = true;
    try {
      document.querySelectorAll('.vpc-logo, .vpdc-logo').forEach((el) => {
        if (el.dataset.brandApplied === '1') return;
        const kind = el.classList.contains('large') ? 'large' : el.classList.contains('mini') ? 'mini' : 'small';
        el.replaceChildren(makeImage(kind));
        el.dataset.brandApplied = '1';
      });
    } finally { applying = false; }
  }
  const style = document.createElement('style');
  style.textContent = '.vpdc-brand-logo{display:block;max-width:100%;height:auto;object-fit:contain}.vpc-logo,.vpdc-logo{line-height:0}.vpc-logo.large,.vpdc-logo.large{width:min(300px,92vw);margin:0 auto 24px}.vpc-logo.mini,.vpdc-logo.mini{width:92px}';
  document.head.appendChild(style);
  new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
  loadLogo().catch(e => console.error('VPDC logo load failed:', e));
})();
