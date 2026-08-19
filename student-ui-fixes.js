/* Student identity + creator-credit display corrections. */
(function(){
  function addStudentName(){
    try{
      if(!window.S || !S.student || !S.student.name) return;
      const name=String(S.student.name).trim();
      if(!name) return;
      const tools=document.querySelector('.header-tools');
      if(tools && !tools.querySelector('.student-name-chip')){
        const chip=document.createElement('div');
        chip.className='student-name-chip';
        chip.textContent=name;
        chip.title='Logged-in student';
        chip.style.cssText='max-width:150px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#e2e8f0;font-size:11px;font-weight:700;padding:6px 8px;border:1px solid rgba(148,163,184,.2);border-radius:9px;background:rgba(255,255,255,.05)';
        const brand=tools.querySelector('.brand-mini');
        if(brand) tools.insertBefore(chip,brand); else tools.appendChild(chip);
      }
    }catch(e){}
  }

  function creatorCredit(){
    const completion=!!document.querySelector('.completion-page,.vpdc-complete,.completion-card,.vpdc-complete-card');
    document.querySelectorAll('.vpdc-footer-credit,.creator-credit').forEach(el=>el.remove());
    if(completion && !document.querySelector('.student-creator-credit')){
      const el=document.createElement('div');
      el.className='student-creator-credit';
      el.textContent='Created by Mr. Divyanshu Garg';
      el.style.cssText='margin-top:18px;text-align:center;font-size:9px;color:#64748b;letter-spacing:.02em';
      const card=document.querySelector('.completion-card,.vpdc-complete-card');
      if(card) card.appendChild(el);
    }
  }

  function mobileIdentity(){
    addStudentName();
    creatorCredit();
    document.querySelectorAll('.student-name-chip').forEach(el=>el.style.maxWidth=window.innerWidth<420?'92px':'150px');
  }

  const mo=new MutationObserver(()=>mobileIdentity());
  window.addEventListener('DOMContentLoaded',()=>{mobileIdentity();mo.observe(document.body,{childList:true,subtree:true});});
  window.addEventListener('resize',mobileIdentity);
})();
