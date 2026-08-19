/* Last visual pass. Keeps flattened source passages readable and prevents the case card from collapsing. */
(function(){
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function formatPassages(){
    document.querySelectorAll('.scenario-passage').forEach(el=>{
      if(el.dataset.formatted==='1') return;
      const raw=el.textContent.trim();
      if(!raw) return;
      const lines=raw.split(/\n+/).map(s=>s.trim()).filter(Boolean);
      // The question source stores some ICAI tables as one value per line. Keep the data intact,
      // but render it as a readable responsive table/grid rather than one narrow vertical stream.
      const economy=lines.indexOf('Economy');
      const boom=lines.indexOf('Boom');
      const tail=lines.findIndex((s,i)=>i>boom && /^The risk-free rate|^The total numbers|^From the information/i.test(s));
      if(economy>=0 && boom>economy){
        const intro=lines.slice(0,economy).join(' ');
        const heads=['Economy','Probability','Return on Stock A (%)','Return on Stock B (%)','Market Portfolio (%)'];
        const body=lines.slice(boom,tail>boom?tail:lines.length);
        const rows=[];
        for(let i=0;i<body.length;i+=2){
          if(/^(Boom|Normal|Recession)$/i.test(body[i])) rows.push([body[i],body[i+1]||'—','—','—','—']);
        }
        const after=(tail>boom?lines.slice(tail):[]).join(' ');
        el.innerHTML=`<p class="scenario-intro">${esc(intro)}</p><div class="scenario-table-wrap"><table class="scenario-table"><thead><tr>${heads.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${after?`<p class="scenario-after">${esc(after)}</p>`:''}`;
      } else {
        el.textContent=raw;
      }
      el.dataset.formatted='1';
    });
  }
  const style=document.createElement('style');
  style.textContent=`
    .scenario-passage{display:block!important;width:100%!important;min-width:0!important;max-height:min(48vh,520px)!important;overflow:auto!important;white-space:pre-wrap!important;overflow-wrap:anywhere!important;word-break:normal!important;line-height:1.65!important}
    .scenario-table-wrap{width:100%;overflow-x:auto;margin:14px 0;border:1px solid rgba(126,163,202,.28);border-radius:10px}
    .scenario-table{width:100%;min-width:720px;border-collapse:collapse;font-size:14px}.scenario-table th,.scenario-table td{padding:10px 12px;border-bottom:1px solid rgba(126,163,202,.18);text-align:left;vertical-align:top}.scenario-table th{white-space:normal;background:rgba(34,53,78,.55)}.scenario-intro,.scenario-after{margin:0 0 12px}
    .quiz-content,.scenario-card,.question-card,.scenario-head>div{min-width:0!important}.scenario-head{display:flex!important;gap:14px!important;align-items:flex-start!important;justify-content:space-between!important}.scenario-head span{white-space:normal!important;overflow-wrap:anywhere!important}
    @media(max-width:900px){.scenario-passage{max-height:none!important}.scenario-table{font-size:12px}.scenario-table th,.scenario-table td{padding:9px}.scenario-card{overflow:hidden!important}}
  `;
  document.head.appendChild(style);
  const run=()=>formatPassages();
  run(); new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
})();
