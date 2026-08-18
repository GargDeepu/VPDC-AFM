/* VPDC AFM correction layer. Loaded after app.js so it preserves the existing data/auth logic while correcting UI behavior. */
(function(){
  const feedbackUrl='https://docs.google.com/forms/d/e/1FAIpQLSdN2TbASV9tvzUfvImDBDD3XHRE4JWsU6m5YCK7eLDU5wZ-nQ/viewform?usp=publish-editor';

  function logo(size='small'){
    const scale=size==='large'?1.7:size==='mini'?0.55:1;
    return `<div class="vpdc-logo" style="transform:scale(${scale});transform-origin:left center;width:${220*scale}px"><div style="font-size:34px;line-height:.8;font-weight:900;letter-spacing:3px;color:#05070b;font-family:Arial,Helvetica,sans-serif">VP<span style="color:#ed1c24">:</span>DC</div><div style="height:2px;background:#111;margin:8px 0 6px;width:100%"></div><div style="font-size:10px;letter-spacing:2px;white-space:nowrap;font-family:Arial,Helvetica,sans-serif"><span style="color:#ed1c24">VINIJYN</span> <span style="color:#111">PRO CLASSES</span></div></div>`;
  }
  window.vpcLogo=logo;

  function injectStyles(){
    if(document.getElementById('vpdc-fix-style'))return;
    const s=document.createElement('style');s.id='vpdc-fix-style';s.textContent=`
      body{background:radial-gradient(circle at top,#0d1f3c 0%,#050a15 100%)!important;color:#fff!important}
      .vpdc-shell{min-height:100vh;background:transparent;font-family:Poppins,Arial,sans-serif;padding-bottom:92px}
      .vpdc-header{position:sticky;top:0;z-index:50;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px;padding:12px 18px;background:rgba(8,18,36,.96);border-bottom:1px solid rgba(255,255,255,.08);backdrop-filter:blur(14px)}
      .vpdc-title .kicker{display:block;font-size:10px;color:#93c5fd;font-weight:700;letter-spacing:.15em}.vpdc-title .subject{display:block;color:#fbbf24;font-size:17px;font-weight:800}
      .vpdc-center{display:flex;align-items:center;gap:8px;justify-content:center}.vpdc-center label{font-size:10px;color:#94a3b8}.vpdc-center select{background:#0f1f38;color:#fff;border:1px solid #334155;border-radius:9px;padding:8px 10px}
      .vpdc-tools{display:flex;justify-content:flex-end;align-items:center;gap:10px}.vpdc-timer{color:#fde047;font-weight:800}.vpdc-score{background:#14254a;border:1px solid #3b82f6;color:#dbeafe;border-radius:9px;padding:7px 10px;font-weight:800;font-size:12px}.vpdc-mini{display:flex;justify-content:flex-end}
      .vpdc-lifelines{display:flex;align-items:center;justify-content:center;gap:10px;padding:10px;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(0,0,0,.28)}
      .vpdc-life{min-width:74px;padding:9px 12px;border-radius:12px;border:1px solid #475569;background:#111c2f;color:#fff;font-weight:800;font-size:11px}.vpdc-life .big{display:block;font-size:15px}.vpdc-life.cyan{color:#67e8f9;border-color:#0891b2}.vpdc-life.gold{color:#facc15;border-color:#a16207}.vpdc-life.purple{color:#c4b5fd;border-color:#7c3aed}.vpdc-life:disabled{opacity:.35;cursor:not-allowed}.vpdc-life-note{font-size:10px;color:#64748b;margin-left:10px}
      .vpdc-main{max-width:1450px;margin:18px auto;padding:0 18px;display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:18px}.vpdc-content{min-width:0}
      .vpdc-card{background:rgba(15,23,42,.9);border:1px solid rgba(148,163,184,.18);border-radius:18px;box-shadow:0 10px 35px rgba(0,0,0,.35);padding:18px}.vpdc-case{margin-bottom:14px;background:rgba(15,30,52,.96);border:1px solid rgba(96,165,250,.18);border-radius:18px;overflow:hidden}.vpdc-case-head{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;color:#93c5fd;font-weight:800}.vpdc-case-body{padding:0 16px 16px;white-space:pre-wrap;line-height:1.6;color:#e2e8f0}.vpdc-question{font-size:19px;line-height:1.65;margin:6px 0 18px}.vpdc-qnum{color:#facc15;font-weight:900}.vpdc-options{display:grid;gap:10px}.vpdc-option{width:100%;display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-radius:14px;border:2px solid #2563eb;background:linear-gradient(145deg,#0f2444,#071525);color:#fff;text-align:left;font-size:14px}.vpdc-option:hover:not(:disabled){border-color:#f59e0b;transform:translateY(-1px)}.vpdc-option .letter{width:26px;height:26px;display:grid;place-items:center;border-radius:50%;background:rgba(245,158,11,.16);color:#facc15;flex:none}.vpdc-option.correct{background:linear-gradient(145deg,#166534,#14532d);border-color:#4ade80}.vpdc-option.wrong{background:linear-gradient(145deg,#991b1b,#7f1d1d);border-color:#fca5a5}.vpdc-option.eliminated{opacity:.28;pointer-events:none;text-decoration:line-through}
      .vpdc-sidebar{position:sticky;top:92px;align-self:start}.vpdc-side-title{display:flex;justify-content:space-between;align-items:center;color:#fff}.vpdc-case-list{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:12px}.vpdc-case-q,.vpdc-palette-q{aspect-ratio:1;border-radius:9px;border:1px solid #334155;background:#172235;color:#e2e8f0;font-weight:800;cursor:pointer}.vpdc-case-q.current,.vpdc-palette-q.current{outline:3px solid #f59e0b}.vpdc-case-q.answered,.vpdc-palette-q.answered{background:#1d4ed8}.vpdc-case-q.wrong,.vpdc-palette-q.wrong{background:#991b1b}.vpdc-case-q.marked,.vpdc-palette-q.marked{background:#7c3aed}.vpdc-side-note{font-size:10px;color:#64748b;margin-top:12px}
      .vpdc-bottom{position:fixed;left:0;right:0;bottom:0;z-index:100;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px;background:rgba(9,17,32,.96);border-top:1px solid rgba(255,255,255,.08);backdrop-filter:blur(14px)}.vpdc-bottom-center{display:flex;gap:8px}.vpdc-btn{border:1px solid #475569;background:#18253a;color:#fff;padding:9px 13px;border-radius:10px;font-weight:800}.vpdc-btn.primary{background:#eab308;color:#0b1220;border-color:#facc15}.vpdc-btn.analysis{background:#7c3aed;border-color:#8b5cf6}.vpdc-btn:disabled{opacity:.45;cursor:not-allowed}
      .vpdc-overlay{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.78);backdrop-filter:blur(10px);display:grid;place-items:center;padding:18px}.vpdc-modal{width:min(760px,100%);max-height:85vh;overflow:auto;background:linear-gradient(160deg,#0f172a,#050a15);border:1px solid rgba(245,158,11,.35);border-radius:20px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.55)}.vpdc-modal-head{display:flex;justify-content:space-between;align-items:center}.vpdc-modal h2{margin:0}.vpdc-palette-grid{display:grid;grid-template-columns:repeat(10,1fr);gap:7px;margin-top:16px}.vpdc-modal-close{background:#1e293b;color:#fff;border:0;border-radius:8px;padding:8px 10px}.vpdc-footer-credit{position:fixed;right:14px;bottom:100px;color:#64748b;font-size:9px;z-index:95;pointer-events:none}
      .vpdc-complete{min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at top,#0d1f3c 0%,#050a15 100%)}.vpdc-complete-card{width:min(700px,100%);text-align:center;background:rgba(15,23,42,.96);border:1px solid rgba(245,158,11,.25);border-radius:24px;padding:34px;box-shadow:0 25px 80px rgba(0,0,0,.45)}.vpdc-feedback-note{margin-top:24px;padding:14px 16px;border-radius:14px;background:#0b1628;border:1px solid rgba(148,163,184,.16);color:#94a3b8;font-size:12px}
      @media(max-width:900px){.vpdc-header{grid-template-columns:1fr;gap:8px}.vpdc-tools{justify-content:space-between}.vpdc-main{grid-template-columns:1fr}.vpdc-sidebar{position:static;order:2}.vpdc-case-list{grid-template-columns:repeat(8,1fr)}}
      @media(max-width:560px){.vpdc-main{padding:0 10px}.vpdc-question{font-size:17px}.vpdc-bottom{padding:8px}.vpdc-bottom-center{gap:4px}.vpdc-btn{padding:8px 9px;font-size:11px}.vpdc-palette-grid{grid-template-columns:repeat(6,1fr)}.vpdc-case-list{grid-template-columns:repeat(6,1fr)}}
    `;document.head.appendChild(s);
  }

  function qCaseId(q){return String(q.caseId||'0')}
  function caseQuestions(){const q=S.questions[S.i]; if(!q||!q.caseId)return[]; return S.questions.map((x,i)=>({x,i})).filter(z=>qCaseId(z.x)===qCaseId(q));}
  function caseUsed5050(q){const id=qCaseId(q);return Object.values(S.answers).some(a=>a&&a.used_5050&&S.questions.some(x=>String(x.id)===String(a.question_id)&&qCaseId(x)===id));}

  window.refreshLifelines=function(q,a){
    const b=document.getElementById('life-5050'); if(b){const used=caseUsed5050(q);b.disabled=used || (a.selected_option!==null&&a.selected_option!==undefined);}
    const e=document.getElementById('life-expert'); if(e)e.disabled=!!S.expertUsed[qCaseId(q)];
    const p=document.getElementById('life-poll'); if(p)p.disabled=!!S.pollUsed[qCaseId(q)];
  };

  window.use5050=async function(){
    const q=S.questions[S.i],a=answerState(q);if(!q||caseUsed5050(q)|| (a.selected_option!==null&&a.selected_option!==undefined))return;
    const wrong=q.options.map((_,i)=>i).filter(i=>i!==q.correct).sort(()=>Math.random()-.5).slice(0,2);
    S.hidden[q.id]=wrong;S.lifeline5050[q.id]=true;a.hidden_options=wrong;a.used_5050=true;S.answers[q.id]=a;await saveAnswer(a);render();
  };

  window.caseJump=function(){
    const q=S.questions[S.i];if(!q||!q.caseId)return;
    const list=caseQuestions();
    document.body.insertAdjacentHTML('beforeend',`<div class="vpdc-overlay" id="vpdc-overlay"><div class="vpdc-modal"><div class="vpdc-modal-head"><h2>Jump within ${esc(q.caseTitle||`Case Scenario ${q.caseId}`)}</h2><button class="vpdc-modal-close" id="vpdc-close">✕</button></div><p style="color:#94a3b8">Only questions belonging to the current case are shown here.</p><div class="vpdc-case-list">${list.map(z=>`<button class="vpdc-case-q ${paletteStatus(z.x,z.i)}" data-case-go="${z.i}">Q${z.i+1}</button>`).join('')}</div></div></div>`);
    document.getElementById('vpdc-close').onclick=()=>document.getElementById('vpdc-overlay')?.remove();document.querySelectorAll('[data-case-go]').forEach(b=>b.onclick=()=>{S.i=+b.dataset.caseGo;S.questionStarted=Date.now();document.getElementById('vpdc-overlay')?.remove();render();});
  };

  window.openPalette=function(){
    document.body.insertAdjacentHTML('beforeend',`<div class="vpdc-overlay" id="vpdc-overlay"><div class="vpdc-modal"><div class="vpdc-modal-head"><h2>Question Palette</h2><button class="vpdc-modal-close" id="vpdc-close">✕</button></div><p style="color:#94a3b8">Jump to any question in the current AFM practice set.</p><div class="vpdc-palette-grid">${S.questions.map((x,j)=>`<button class="vpdc-palette-q ${paletteStatus(x,j)}" data-palette-go="${j}">${j+1}</button>`).join('')}</div></div></div>`);
    document.getElementById('vpdc-close').onclick=()=>document.getElementById('vpdc-overlay')?.remove();document.querySelectorAll('[data-palette-go]').forEach(b=>b.onclick=()=>{S.i=+b.dataset.paletteGo;S.questionStarted=Date.now();document.getElementById('vpdc-overlay')?.remove();render();});
  };

  window.analysis=window.analysis||function(){};
  const oldAnalysis=window.analysis;
  window.analysis=function(){oldAnalysis();};

  window.vpdcRender=function(){
    const q=S.questions[S.i];if(!q)return;const a=answerState(q);if(S.timer)clearInterval(S.timer);injectStyles();
    const hidden=S.hidden[q.id]||[];const answered=a.selected_option!==null&&a.selected_option!==undefined;
    const opts=q.options.map((o,j)=>{const text=typeof o==='object'?(o.text??o.label??JSON.stringify(o)):o;let c='vpdc-option';if(hidden.includes(j))c+=' eliminated';if(answered&&j===q.correct)c+=' correct';if(answered&&j===a.selected_option&&j!==q.correct)c+=' wrong';return `<button class="${c}" data-opt="${j}" ${answered||hidden.includes(j)?'disabled':''}><span class="letter">${String.fromCharCode(65+j)}</span><span>${hidden.includes(j)?'Option eliminated by 50:50':esc(text).replace(/^\s*\([a-d]\)\s*/i,'')}</span></button>`}).join('');
    const cList=caseQuestions();
    document.body.innerHTML=`<div class="vpdc-shell"><header class="vpdc-header"><div class="vpdc-title"><span class="kicker">CA FINAL | PAPER 2</span><span class="subject">Advanced Financial Management</span></div><div class="vpdc-center"><label>Case Scenario</label><select id="scenario-select"><option value="">${esc(q.caseTitle||'Current Case')}</option>${[...new Map(S.questions.filter(x=>x.caseId).map(x=>[qCaseId(x),x.caseTitle||`Case Scenario ${x.caseId}`])).entries()].map(([id,t])=>`<option value="${id}">${esc(t)}</option>`).join('')}</select></div><div class="vpdc-tools"><div class="vpdc-timer">◷ <span id="timer-display">${sec((Date.now()-S.started)/1000).slice(3)}</span></div><div class="vpdc-score">Q:${S.i+1}/${S.questions.length}</div><div class="vpdc-mini">${logo('mini')}</div></div></header><div class="vpdc-lifelines"><button id="life-5050" class="vpdc-life cyan"><span class="big">50:50</span><span>once per case</span></button><button id="life-expert" class="vpdc-life gold">★ Expert</button><button id="life-poll" class="vpdc-life purple">▥ Poll</button><div class="vpdc-life-note">Lifelines are saved with your attempt</div></div><main class="vpdc-main"><section class="vpdc-content">${q.caseText?`<section class="vpdc-card vpdc-case"><div class="vpdc-case-head"><span>▣ ${esc(q.caseTitle||`Case Scenario ${q.caseId}`)}</span><button id="toggle-passage" class="vpdc-btn">${S.passageOpen?'Hide Context':'Show Context'}</button></div><div class="vpdc-case-body" id="case-body" style="display:${S.passageOpen?'block':'none'}">${esc(q.caseText)}</div></section>`:''}<section class="vpdc-card"><div style="display:flex;justify-content:space-between;color:#94a3b8;font-size:12px"><span>${q.type?esc(q.type):'Case Scenario'}</span><span id="saved">☁ Saved</span></div><div class="vpdc-question"><span class="vpdc-qnum">Q${S.i+1}.</span> ${esc(q.text).replace(/^Q\d+[\.\)]\s*/,'')}</div><div class="vpdc-options">${opts}</div></section></section><aside class="vpdc-sidebar"><section class="vpdc-card"><div class="vpdc-side-title"><h3>Case Questions</h3><button id="save-now" class="vpdc-btn">Save</button></div><div class="vpdc-side-note">${q.caseId?'Questions in this case only':'No case-specific questions for this item.'}</div><div class="vpdc-case-list">${cList.map(z=>`<button class="vpdc-case-q ${paletteStatus(z.x,z.i)}" data-case-go-side="${z.i}">${z.i+1}</button>`).join('')}</div></section></aside></main><footer class="vpdc-bottom"><button id="prev" class="vpdc-btn"><span>←</span> Prev</button><div class="vpdc-bottom-center"><button id="mark" class="vpdc-btn">${a.marked_for_review?'★ Marked':'☆ Mark'}</button><button id="analysis" class="vpdc-btn analysis">📊 Analysis</button><button id="palette" class="vpdc-btn">▦ Palette</button><button id="case-jump" class="vpdc-btn">↔ Case Jump</button></div><button id="next" class="vpdc-btn primary">${S.i===S.questions.length-1?'Finish':'Next / Skip'} →</button></footer><div class="vpdc-footer-credit">Created by Mr. Divyanshu Garg</div></div>`;

    document.querySelectorAll('[data-opt]').forEach(b=>b.onclick=()=>choose(+b.dataset.opt));
    document.querySelectorAll('[data-case-go-side]').forEach(b=>b.onclick=()=>{S.i=+b.dataset.caseGoSide;S.questionStarted=Date.now();render();});
    $('#prev').onclick=()=>move(-1);$('#next').onclick=()=>move(1);$('#mark').onclick=toggleMark;$('#analysis').onclick=analysis;$('#palette').onclick=openPalette;$('#case-jump').onclick=caseJump;$('#save-now').onclick=()=>save('active');$('#life-5050').onclick=use5050;$('#life-expert').onclick=useExpert;$('#life-poll').onclick=usePoll;
    $('#scenario-select').onchange=e=>{const id=e.target.value;if(!id)return;const first=S.questions.findIndex(x=>qCaseId(x)===id);if(first>=0){S.i=first;S.questionStarted=Date.now();render();}};
    if($('#toggle-passage'))$('#toggle-passage').onclick=()=>{S.passageOpen=!S.passageOpen;render();};
    refreshLifelines(q,a);
    S.timer=setInterval(()=>{const el=$('#timer-display');if(el)el.textContent=sec((Date.now()-S.started)/1000).slice(3);},1000);
  };

  window.render=window.vpdcRender;

  window.finish=async function(){
    await save('completed');const x=stats();
    document.body.innerHTML=`<div class="vpdc-complete"><section class="vpdc-complete-card">${logo('large')}<div style="font-size:44px;margin:10px 0">🏆</div><div style="color:#fbbf24;letter-spacing:.15em;font-size:11px;font-weight:800">ATTEMPT COMPLETED</div><h1 style="margin:8px 0">Well done, ${esc(S.student?.name||'Student')}!</h1><p style="color:#94a3b8">You attempted <strong>${x.attempted}</strong> questions with <strong>${x.accuracy}%</strong> accuracy in <strong>${sec(x.time)}</strong>.</p><div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:18px"><button id="review" class="vpdc-btn analysis">📊 Review Analysis</button><button id="restart" class="vpdc-btn primary">↻ Start Again</button></div><div class="vpdc-feedback-note"><strong style="color:#e2e8f0">Student Feedback</strong><br>We keep feedback outside the quiz page to avoid cookie prompts or embedded Google Form overlays.<br><button id="feedback" class="vpdc-btn" style="margin-top:10px">Open Google Feedback Form ↗</button></div><div style="margin-top:20px;color:#64748b;font-size:10px">Created by Mr. Divyanshu Garg</div></section></div>`;
    $('#review').onclick=analysis;
    $('#feedback').onclick=()=>window.open(feedbackUrl,'_blank','noopener,noreferrer');
    $('#restart').onclick=async()=>{await db.rpc('start_new_attempt',{p_phone:S.student.phone,p_quiz_key:CFG.quiz});location.reload();};
  };

  window.login=function(){
    document.body.innerHTML=`<div class="login-page"><section class="login-card">${logo('large')}<div class="login-kicker">CA FINAL • PAPER 2</div><h1>Advanced Financial Management</h1><p class="login-copy">Enter your details once. Your progress, answers and time will be saved automatically so you can return and continue from where you stopped.</p><div class="login-note">Use the same mobile number whenever you return.</div><form id="login-form"><label>Full Name</label><input name="name" required minlength="2" placeholder="Your name"><label>Mobile Number</label><input name="phone" required inputmode="tel" placeholder="Your mobile number"><label>City / Place</label><input name="place" required minlength="2" placeholder="Your city or place"><button class="primary-btn" type="submit">Start / Continue Learning</button></form><div id="login-error" class="login-error"></div></section></div>`;
    $('#login-form').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),name=String(f.get('name')||'').trim(),phone=String(f.get('phone')||'').trim(),place=String(f.get('place')||'').trim();if(phone.replace(/\D/g,'').length<7)return $('#login-error').textContent='Please enter a valid mobile number.';$('#login-error').textContent='Connecting your VPC learning session…';const {data,error}=await db.rpc('register_or_resume_student',{p_name:name,p_phone:phone,p_place:place});if(error)return $('#login-error').textContent=error.message;S.student=data;localStorage.setItem('vpcPhone',phone);localStorage.setItem('vpcName',name);localStorage.setItem('vpcPlace',place);await bootQuiz();};
  };

  function bootFix(){injectStyles();if(document.querySelector('.quiz-shell'))render();else if(document.querySelector('#login-form'))login();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootFix);else bootFix();
})();
