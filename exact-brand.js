/* Exact VPDC brand asset loader.
   The source asset is the exact SVG supplied for VPDC branding.
   It is stored in the repository as gzip+base64 only to preserve the original SVG
   bytes through the repository connector, then reconstructed in the browser.
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
    throw new Error('This browser does not support gzip decompression required for the exact logo asset.');
  }

  async function loadExactLogo() {
    const response = await fetch(SOURCE, { cache: 'no-store' });
    if (!response.ok) throw new Error('Exact VPDC logo asset could not be loaded.');
    const encoded = await response.text();
    const compressed = bytesFromBase64(encoded);
    const svgBytes = await gunzip(compressed);
    const svgText = new TextDecoder('utf-8').decode(svgBytes);
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    logoUrl = URL.createObjectURL(blob);
    ready = true;
    applyExactLogo();
  }

  function makeImage(kind) {
    const wrap = document.createElement('span');
    wrap.className = 'vpdc-exact-logo-wrap';
    const img = document.createElement('img');
    img.className = 'vpdc-exact-logo';
    img.src = logoUrl;
    img.alt = 'VPDC – Vinijyn Pro Classes';
    img.decoding = 'async';
    img.draggable = false;
    if (kind === 'large') wrap.classList.add('large');
    else if (kind === 'mini') wrap.classList.add('mini');
    else wrap.classList.add('small');
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

  const observer = new MutationObserver(applyExactLogo);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  const style = document.createElement('style');
  style.textContent = `
    .vpdc-exact-logo-wrap{display:inline-flex;align-items:center;justify-content:center;background:#fff;border-radius:7px;padding:4px 7px;box-sizing:border-box;overflow:hidden;line-height:0}
    .vpdc-exact-logo-wrap.small{width:180px;max-width:100%}
    .vpdc-exact-logo-wrap.large{width:300px;max-width:100%}
    .vpdc-exact-logo-wrap.mini{width:104px;max-width:100%}
    .vpdc-exact-logo{display:block;width:100%;height:auto;max-width:100%;object-fit:contain}
    @media(max-width:560px){
      .vpdc-exact-logo-wrap.large{width:min(270px,92vw)}
      .vpdc-exact-logo-wrap.small{width:min(175px,70vw)}
      .vpdc-exact-logo-wrap.mini{width:92px}
    }
  `;
  document.head.appendChild(style);

  loadExactLogo().catch((error) => console.error('Exact VPDC logo load failed:', error));
})();
