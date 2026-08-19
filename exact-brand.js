/* Hard brand override: always render the preserved official VPDC SVG, never the CSS/text reconstruction. */
(function () {
  const SOURCE = 'https://raw.githubusercontent.com/GargDeepu/VPDC-AFM/b86a4c0f6049fb0dbbfb6adf2c0c47c88f97910f/assets/vpdc-logo.svg.gz.b64';
  let logoUrl = null;
  const b64 = t => Uint8Array.from(atob(t.replace(/\s+/g,'')), c => c.charCodeAt(0));
  async function getLogo() {
    if (logoUrl) return logoUrl;
    const r = await fetch(SOURCE, {cache:'no-store'});
    if (!r.ok) throw new Error('official logo unavailable');
    const bytes = b64(await r.text());
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const svg = await new Response(stream).text();
    logoUrl = URL.createObjectURL(new Blob([svg], {type:'image/svg+xml'}));
    return logoUrl;
  }
  function paint(src) {
    document.querySelectorAll('.vpc-logo, .vpdc-logo').forEach(el => {
      if (el.dataset.brandSrc === src) return;
      el.innerHTML = '<img class="vpdc-brand-logo" alt="VPDC – Vinijyn Pro Classes">';
      const img = el.querySelector('img');
      img.src = src;
      el.dataset.brandSrc = src;
    });
  }
  const style=document.createElement('style');
  style.textContent=`
    .vpc-logo,.vpdc-logo{display:block!important;line-height:0!important;overflow:visible!important;background:none!important}
    .vpc-wordmark,.vpc-sub{display:none!important}
    .vpc-logo .vpdc-brand-logo,.vpdc-logo .vpdc-brand-logo{display:block!important;width:100%!important;height:100%!important;max-width:100%!important;object-fit:contain!important;object-position:center!important}
    .vpc-logo.large{width:min(340px,80vw)!important;height:auto!important;margin:0 auto 20px!important}
    .vpc-logo.mini{width:96px!important;height:40px!important}
    .brand-mini{overflow:visible!important;display:flex!important;align-items:center!important}
  `;
  document.head.appendChild(style);
  getLogo().then(src => {
    paint(src);
    new MutationObserver(() => paint(src)).observe(document.documentElement,{childList:true,subtree:true});
    setInterval(() => paint(src), 500);
  }).catch(console.error);
})();
