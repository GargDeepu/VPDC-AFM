/* Exact VPDC brand asset loader.
   Uses the exact supplied SVG asset. No logo reconstruction or redraw.
*/
(function () {
  const SOURCE = 'assets/vpdc-logo.svg.gz.b64';
  let logoUrl = null;
  let ready = false;
  let applying = false;

  function bytesFromBase64(text) {
    const clean = text.replace(/\s+/g, '');
    const bin = atob(clean);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  async function gunzip(bytes) {
    if ('DecompressionStream' in window) {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      return new Uint8Array(await new Response(stream).arrayBuffer());
    }
    throw new Error('This browser does not support the required SVG asset decompression.');
  }

  async function loadExactLogo() {
    const response = await fetch(SOURCE, { cache: 'no-store' });
    if (!response.ok) throw new Error('Exact VPDC logo asset could not be loaded.');
    const encoded = await response.text();
    const compressed = bytesFromBase64(encoded);
    const svgBytes = await gunzip(compressed);
    const svgText = new TextDecoder('utf-8').decode(svgBytes);
    logoUrl = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' }));
    ready = true;
    applyExactLogo();
  }

  function makeImage(kind) {
    const wrap = document.createElement('span');
    wrap.className = 'vpdc-exact-logo-wrap ' + kind;
    const img = document.createElement('img');
    img.className = 'vpdc-exact-logo';
    img.src = logoUrl;
    img.alt = 'VPDC – Vinijyn Pro Classes';
    img.decoding = 'async';
    img.draggable = false;
    wrap.appendChild(img);
    return wrap;
  }

  function applyExactLogo() {
    if (!ready || applying) return;
    applying = true;
    try {
      document.querySelectorAll('.vpc-logo, .vpdc-logo').forEach((el) => {
        if (el.dataset.exactLogo === '1') return;
        let kind = 'small';
        if (el.classList.contains('large')) kind = 'large';
        else if (el.classList.contains('mini')) kind = 'mini';
        el.innerHTML = '';
        el.appendChild(makeImage(kind));
        el.dataset.exactLogo = '1';
      });
    } finally {
      applying = false;
    }
  }

  const style = document.createElement('style');
  style.textContent = `
    /* The supplied SVG is 863 × 525. Reserve its full aspect-ratio box so the
       following heading can never overlap the logo on the login/completion pages. */
    .vpc-logo.large,
    .vpdc-logo.large{
      display:block !important;
      width:100% !important;
      min-height:0 !important;
      height:auto !important;
      margin-bottom:28px !important;
      line-height:0 !important;
      overflow:visible !important;
    }
    .vpdc-exact-logo-wrap{
      display:block !important;
      position:relative !important;
      width:300px !important;
      max-width:100% !important;
      aspect-ratio:863 / 525 !important;
      height:auto !important;
      margin:0 auto !important;
      padding:0 !important;
      box-sizing:border-box !important;
      background:#fff !important;
      border-radius:0 !important;
      overflow:hidden !important;
      line-height:0 !important;
      flex:none !important;
    }
    .vpdc-exact-logo-wrap.small{width:180px !important;aspect-ratio:863 / 525 !important}
    .vpdc-exact-logo-wrap.mini{width:104px !important;aspect-ratio:863 / 525 !important}
    .vpdc-exact-logo{
      display:block !important;
      width:100% !important;
      height:100% !important;
      max-width:none !important;
      object-fit:contain !important;
      object-position:center !important;
    }
    @media(max-width:560px){
      .vpc-logo.large,
      .vpdc-logo.large{margin-bottom:24px !important}
      .vpdc-exact-logo-wrap.large{width:min(300px,92vw) !important}
      .vpdc-exact-logo-wrap.small{width:min(180px,72vw) !important}
      .vpdc-exact-logo-wrap.mini{width:92px !important}
    }
  `;
  document.head.appendChild(style);

  const observer = new MutationObserver(applyExactLogo);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  loadExactLogo().catch((error) => console.error('Exact VPDC logo load failed:', error));
})();
