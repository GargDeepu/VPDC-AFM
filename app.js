/* VPC AFM – V2 enhancement layer built on the original KBC-style AFM experience. */
const CFG = {
  url: 'https://qzsuqxgsnzmmzzwujhps.supabase.co',
  key: 'sb_publishable_aF3Tmp_V4yHaop8j9Hu4BA_nB8YEU9O',
  quiz: 'afm-master',
  feedback: 'https://docs.google.com/forms/d/e/1FAIpQLSdN2TbASV9tvzUfvImDBDD3XHRE4JWsU6m5YCK7eLDU5wZ-nQ/viewform?embedded=true',
  feedbackOpen: 'https://docs.google.com/forms/d/e/1FAIpQLSdN2TbASV9tvzUfvImDBDD3XHRE4JWsU6m5YCK7eLDU5wZ-nQ/viewform?usp=publish-editor'
};
const db = window.supabase.createClient(CFG.url, CFG.key);

let S = {
  student: null,
  attempt: null,
  questions: [],
  i: 0,
  answers: {},
  started: Date.now(),
  questionStarted: Date.now(),
  timer: null,
  lifeline5050: {},
  expertUsed: {},
  pollUsed: {},
  hidden: {},
  passageOpen: true
};
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const sec = (n) => { n=Math.max(0,Math.floor(n||0)); return `${String(Math.floor(n/3600)).padStart(2,'0')}:${String(Math.floor(n/60)%60).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`; };

function vpcLogo(size='small') {
  return `<div class="vpc-logo ${size}"><div class="vpc-wordmark">VP<span>:</span>C</div><div class="vpc-sub">VINIJYN PRO CLASSES</div></div>`;
}

function login() {
  document.body.innerHTML = `<div class="login-page"><div class="login-glow"></div><section class="login-card">${vpcLogo('large')}<div class="login-kicker">CA FINAL • PAPER 2</div><h1>Advanced Financial Management</h1><p class="login-copy">Enter your details once. Your progress, answers and time will be saved automatically so you can return and continue from where you stopped.</p><div class="login-note"><i class="fa-solid fa-cloud-arrow-up"></i> Use the same mobile number whenever you return.</div><form id="login-form"><label>Full Name</label><input name="name" required minlength="2" autocomplete="name" placeholder="Your name"><label>Mobile Number</label><input name="phone" required inputmode="tel" autocomplete="tel" placeholder="Your mobile number"><label>City / Place</label><input name="place" required minlength="2" autocomplete="address-level2" placeholder="Your city or place"><button class="primary-btn" type="submit"><i class="fa-solid fa-play"></i> Start / Continue Learning</button></form><div id="login-error" class="login-error"></div></section></div>`;
  $('#login-form').onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const name = String(f.get('name')||'').trim();
    const phone = String(f.get('phone')||'').trim();
    const place = String(f.get('place')||'').trim();
    if (phone.replace(/\D/g,'').length < 7) return $('#login-error').textContent = 'Please enter a valid mobile number.';
    $('#login-error').textContent = 'Connecting your VPC learning session…';
    const { data, error } = await db.rpc('register_or_resume_student', { p_name:name, p_phone:phone, p_place:place });
    if (error) return $('#login-error').textContent = error.message;
    S.student = data;
    localStorage.setItem('vpcPhone', phone);
    localStorage.setItem('vpcName', name);
    localStorage.setItem('vpcPlace', place);
    await bootQuiz();
  };
}

function normalizeQuestions(raw) {
  return raw.map((q,i)=>({
    id:String(q.id ?? q.questionId ?? i+1),
    text:q.question ?? q.text ?? q.questionText ?? '',
    options:Array.isArray(q.options) ? q.options : (q.answers ?? []),
    correct:Number(q.correctAnswer ?? q.correct ?? q.answer ?? q.correctOption ?? -1),
    caseText:q.passage ?? q.caseScenarioText ?? '',
    caseId:String(q.caseScenarioNum ?? q.caseId ?? q.caseNumber ?? q.scenarioId ?? ''),
    caseTitle:q.caseScenarioTitle ?? '',
    type:q.type ?? '',
    explanation:q.explanation ?? '',
    raw:q
  }));
}

function loadQuestions() {
  const raw = Array.isArray(window.AFM_MCQS_QUESTIONS) && window.AFM_MCQS_QUESTIONS.length
    ? window.AFM_MCQS_QUESTIONS
    : (Array.isArray(window.FR_MCQS_QUESTIONS) ? window.FR_MCQS_QUESTIONS : []);
  return normalizeQuestions(raw);
}

async function bootQuiz() {
  S.questions = loadQuestions();
  if (!S.questions.length) return renderError('Question bank could not be loaded', 'The original AFM question bank was not available in this browser session.');

  const { data, error } = await db.rpc('resume_attempt', { p_phone:S.student.phone, p_quiz_key:CFG.quiz });
  if (error) return renderError('Unable to resume your attempt', error.message);
  S.attempt = data;
  S.i = Math.min(Number(data.current_question_index || 0), S.questions.length - 1);
  S.answers = {};
  S.hidden = {};
  const a = await db.rpc('load_attempt_answers', { p_phone:S.student.phone, p_attempt_id:S.attempt.id });
  if (!a.error) (a.data||[]).forEach(x => {
    S.answers[String(x.question_id)] = x;
    S.hidden[String(x.question_id)] = x.hidden_options || [];
    if (x.used_5050) S.lifeline5050[String(x.question_id)] = true;
  });
  S.started = Date.now() - Number(data.total_seconds || 0) * 1000;
  S.questionStarted = Date.now();
  render();
}

function renderError(title, text) {
  document.body.innerHTML = `<div class="login-page"><section class="login-card">${vpcLogo('large')}<div class="login-kicker">VPC • AFM</div><h1>${esc(title)}</h1><p class="login-copy">${esc(text)}</p><button class="primary-btn" onclick="location.reload()"><i class="fa-solid fa-rotate-right"></i> Refresh</button></section></div>`;
}

function answerState(q) {
  return S.answers[q.id] || { question_id:q.id, selected_option:null, correct_option:q.correct, is_correct:null, skipped:false, marked_for_review:false, hidden_options:S.hidden[q.id]||[], used_5050:false, used_expert:false, used_poll:false, seconds_spent:0 };
}

function paletteStatus(q,j) {
  const a = S.answers[q.id];
  if (j === S.i) return 'current';
  if (!a) return '';
  if (a.marked_for_review) return 'marked';
  if (a.skipped) return 'skipped';
  if (a.selected_option !== null && a.selected_option !== undefined) return a.is_correct ? 'answered' : 'wrong';
  return '';
}

function stats() {
  const values = Object.values(S.answers);
  const answered = values.filter(a => a.selected_option !== null && a.selected_option !== undefined);
  const correct = answered.filter(a => a.is_correct).length;
  return { attempted:answered.length, correct, wrong:answered.length-correct, skipped:values.filter(a=>a.skipped).length, accuracy:answered.length?Math.round(correct/answered.length*100):0, time:Math.floor((Date.now()-S.started)/1000) };
}

function caseOptions() {
  const map = new Map();
  S.questions.forEach(q => { if (q.caseId && !map.has(q.caseId)) map.set(q.caseId, q.caseTitle || `Case Scenario ${q.caseId}`); });
  return [...map.entries()].map(([id,title]) => `<option value="${esc(id)}">${esc(title)}</option>`).join('');
}

function render() {
  const q = S.questions[S.i]; if (!q) return;
  const a = answerState(q);
  if (S.timer) clearInterval(S.timer);
  const hidden = S.hidden[q.id] || [];
  const answered = a.selected_option !== null && a.selected_option !== undefined;
  const optionsHtml = q.options.map((o,j)=>{
    const text = typeof o === 'object' ? (o.text ?? o.label ?? JSON.stringify(o)) : o;
    let cls = 'option-btn';
    if (hidden.includes(j)) cls += ' eliminated';
    if (answered && j === q.correct) cls += ' correct';
    if (answered && j === a.selected_option && j !== q.correct) cls += ' wrong';
    if (!answered && j === a.selected_option) cls += ' selected';
    return `<button class="${cls}" data-opt="${j}" ${answered||hidden.includes(j)?'disabled':''}><span class="opt-label">${String.fromCharCode(65+j)}</span><span class="opt-text">${hidden.includes(j) ? 'Option eliminated by 50:50' : esc(text).replace(/^[ ]*\([a-d]\)\s*/i,'')}</span></button>`;
  }).join('');

  const scenarioSelect = `<select id="scenario-select" title="Jump to a case scenario"><option value="">${esc(q.caseTitle || 'Current Case Scenario')}</option>${caseOptions()}</select>`;
  const passageBlock = q.caseText ? `<section class="scenario-card"><div class="scenario-head"><div><i class="fa-solid fa-file-lines"></i><span>${esc(q.caseTitle || `Case Scenario ${q.caseId}`)}</span></div><button id="toggle-passage" class="ghost-btn"><i class="fa-solid ${S.passageOpen?'fa-chevron-up':'fa-chevron-down'}"></i> ${S.passageOpen?'Hide Context':'Show Context'}</button></div><div id="scenario-passage" class="scenario-passage ${S.passageOpen?'':'collapsed'}">${esc(q.caseText)}</div></section>` : '';

  document.body.innerHTML = `<div class="quiz-shell">
    <header class="quiz-header">
      <div class="course-title"><span class="kicker">CA FINAL | PAPER 2</span><span class="subject">Advanced Financial Management</span></div>
      <div class="header-center"><span class="scenario-label">Case Scenario</span>${scenarioSelect}</div>
      <div class="header-tools"><div class="timer"><i class="fa-regular fa-clock"></i><span id="timer-display">${sec((Date.now()-S.started)/1000).slice(3)}</span></div><div class="score-chip">Q: ${S.i+1} / ${S.questions.length}</div><div class="brand-mini">${vpcLogo('mini')}</div></div>
    </header>
    <div class="lifeline-bar">
      <button id="life-5050" class="lifeline cyan"><span class="big">50:50</span><span>per question</span></button>
      <button id="life-expert" class="lifeline gold"><i class="fa-solid fa-user-tie"></i><span>Expert</span></button>
      <button id="life-poll" class="lifeline purple"><i class="fa-solid fa-chart-simple"></i><span>Poll</span></button>
      <div class="lifeline-note">Lifelines are preserved in your saved attempt.</div>
    </div>
    <main class="quiz-main">
      <section class="quiz-content">
        ${passageBlock}
        <section class="question-card">
          <div class="question-meta"><span class="question-tag">${esc(q.type || `${q.caseTitle || 'Question'} `)}</span><span class="saved-state" id="saved">☁ Saved</span></div>
          <div class="question-text"><span class="qnum">Q${S.i+1}.</span> ${esc(q.text).replace(/^Q\d+[\.\)]\s*/,'')}</div>
          <div class="options-grid">${optionsHtml}</div>
        </section>
      </section>
      <aside class="palette-card"><div class="palette-head"><h3>Question Palette</h3><button id="save-now" class="small-btn">Save</button></div><div class="palette-grid">${S.questions.map((x,j)=>`<button class="palette-btn ${paletteStatus(x,j)}" data-go="${j}">${j+1}</button>`).join('')}</div><div class="legend"><span><i class="dot answered"></i> Answered</span><span><i class="dot wrong"></i> Wrong</span><span><i class="dot marked"></i> Marked</span><span><i class="dot current"></i> Current</span></div><div class="live-panel"><h4>Live Status</h4><div class="status-grid"><div><b>${stats().attempted}</b><span>Attempted</span></div><div><b>${stats().accuracy}%</b><span>Accuracy</span></div><div><b>${stats().correct}</b><span>Correct</span></div><div><b>${sec(stats().time)}</b><span>Time</span></div></div></div></aside>
    </main>
    <footer class="bottom-bar"><button id="prev" class="bottom-btn secondary"><i class="fa-solid fa-arrow-left"></i> Prev</button><div class="bottom-middle"><button id="mark" class="bottom-btn"><i class="fa-regular fa-bookmark"></i> ${a.marked_for_review?'Marked':'Mark'}</button><button id="analysis" class="bottom-btn analysis-btn"><i class="fa-solid fa-chart-line"></i> Analysis</button><button id="case-jump" class="bottom-btn"><i class="fa-solid fa-table-cells-large"></i> Case Jump</button></div><button id="next" class="bottom-btn next">${S.i===S.questions.length-1?'Finish':'Next / Skip'} <i class="fa-solid fa-arrow-right"></i></button></footer>
  </div>`;

  document.querySelectorAll('[data-opt]').forEach(b=>b.onclick=()=>choose(+b.dataset.opt));
  document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{S.i=+b.dataset.go;S.questionStarted=Date.now();render();});
  $('#prev').onclick=()=>move(-1);
  $('#next').onclick=()=>move(1);
  $('#mark').onclick=toggleMark;
  $('#analysis').onclick=analysis;
  $('#case-jump').onclick=caseJump;
  $('#save-now').onclick=()=>save('active');
  $('#scenario-select').onchange=(e)=>{ const id=e.target.value; if(!id)return; const first=S.questions.findIndex(x=>x.caseId===id); if(first>=0){S.i=first;S.questionStarted=Date.now();render();} };
  if($('#toggle-passage')) $('#toggle-passage').onclick=()=>{S.passageOpen=!S.passageOpen;render();};
  $('#life-5050').onclick=use5050;
  $('#life-expert').onclick=useExpert;
  $('#life-poll').onclick=usePoll;
  refreshLifelines(q,a);
  S.timer=setInterval(()=>{const el=$('#timer-display');if(el)el.textContent=sec((Date.now()-S.started)/1000).slice(3);},1000);
}

function refreshLifelines(q,a){
  const b=$('#life-5050'); if(b){const used=!!S.lifeline5050[q.id];b.disabled=used||a.selected_option!==null&&a.selected_option!==undefined;b.classList.toggle('disabled',b.disabled);}
  const caseId=q.caseId||'0';
  const e=$('#life-expert'); if(e){e.disabled=!!S.expertUsed[caseId];e.classList.toggle('disabled',e.disabled);}
  const p=$('#life-poll'); if(p){p.disabled=!!S.pollUsed[caseId];p.classList.toggle('disabled',p.disabled);}
}

async function choose(j){
  const q=S.questions[S.i],a=answerState(q);
  a.selected_option=j;a.correct_option=q.correct;a.is_correct=j===q.correct;a.skipped=false;a.question_index=S.i;a.seconds_spent=Math.floor((a.seconds_spent||0)+(Date.now()-S.questionStarted)/1000);
  S.answers[q.id]=a;await saveAnswer(a);playSound(a.is_correct);render();
}
function playSound(correct){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C(),o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=correct?660:220;g.gain.value=.05;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.12);}catch(e){}}
async function move(n){
  await save('active');
  if(n>0&&S.i===S.questions.length-1){return finish();}
  S.i=Math.max(0,Math.min(S.questions.length-1,S.i+n));S.questionStarted=Date.now();render();
}
async function toggleMark(){const q=S.questions[S.i],a=answerState(q);a.marked_for_review=!a.marked_for_review;S.answers[q.id]=a;await saveAnswer(a);render();}
async function saveAnswer(a){const {error}=await db.rpc('save_attempt_answer',{p_phone:S.student.phone,p_attempt_id:S.attempt.id,p_question_id:a.question_id,p_question_index:a.question_index,p_selected_option:a.selected_option,p_correct_option:a.correct_option,p_is_correct:a.is_correct,p_skipped:a.skipped,p_marked:a.marked_for_review,p_hidden_options:a.hidden_options||S.hidden[a.question_id]||[],p_used_5050:a.used_5050||false,p_used_expert:a.used_expert||false,p_used_poll:a.used_poll||false,p_seconds_spent:Math.floor(a.seconds_spent||0)});if(error)console.error(error);}
async function save(status='active'){if(!S.attempt)return;const q=S.questions[S.i];const {error}=await db.rpc('save_attempt_progress',{p_phone:S.student.phone,p_attempt_id:S.attempt.id,p_current_index:S.i,p_current_question_id:q.id,p_total_seconds:Math.floor((Date.now()-S.started)/1000),p_status:status});const x=$('#saved');if(x)x.textContent=error?'⚠ Save issue':'☁ Saved just now';}

document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save('active');});
window.addEventListener('beforeunload',()=>{try{save('active');}catch(e){}});

function analysis(){
  const x=stats();
  const html=`<div class="overlay" id="overlay"><div class="analysis-card"><button class="close-btn" id="close">✕</button><div class="analysis-title"><i class="fa-solid fa-chart-line"></i> Live Performance Analysis</div><div class="analysis-grid"><div class="analysis-box"><b>${x.attempted}</b><span>Attempted</span></div><div class="analysis-box"><b>${x.correct}</b><span>Correct</span></div><div class="analysis-box"><b>${x.wrong}</b><span>Wrong</span></div><div class="analysis-box"><b>${x.skipped}</b><span>Skipped</span></div><div class="analysis-box"><b>${x.accuracy}%</b><span>Accuracy</span></div><div class="analysis-box"><b>${sec(x.time)}</b><span>Total Time</span></div></div><div class="analysis-section"><h4>Time Management</h4><p>Average time per attempted question: <strong>${x.attempted?sec(x.time/x.attempted):'00:00:00'}</strong></p></div><div class="analysis-section"><h4>Current Position</h4><p>Question <strong>${S.i+1}</strong> of <strong>${S.questions.length}</strong>. Your progress is saved continuously.</p></div><button class="primary-btn" id="close2">Back to Quiz</button></div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);$('#close').onclick=()=>$('#overlay').remove();$('#close2').onclick=()=>$('#overlay').remove();
}

function caseJump(){
  const q=S.questions[S.i],id=q.caseId; if(!id)return;
  const list=S.questions.map((x,i)=>({x,i})).filter(z=>z.x.caseId===id);
  document.body.insertAdjacentHTML('beforeend',`<div class="overlay" id="overlay"><div class="analysis-card"><button class="close-btn" id="close">✕</button><div class="analysis-title"><i class="fa-solid fa-table-cells-large"></i> Jump within ${esc(q.caseTitle||`Case Scenario ${id}`)}</div><p class="analysis-copy">Choose any question in this case scenario.</p><div class="case-jump-grid">${list.map(z=>`<button data-case="${z.i}">Q${z.i+1}</button>`).join('')}</div></div></div>`);
  $('#close').onclick=()=>$('#overlay').remove();document.querySelectorAll('[data-case]').forEach(b=>b.onclick=()=>{S.i=+b.dataset.case;S.questionStarted=Date.now();$('#overlay').remove();render();});
}

async function use5050(){
  const q=S.questions[S.i],a=answerState(q); if(a.selected_option!==null&&a.selected_option!==undefined||S.lifeline5050[q.id])return;
  const wrong=q.options.map((_,i)=>i).filter(i=>i!==q.correct).sort(()=>Math.random()-.5).slice(0,2);
  S.hidden[q.id]=wrong;S.lifeline5050[q.id]=true;a.hidden_options=wrong;a.used_5050=true;S.answers[q.id]=a;await saveAnswer(a);render();
}
function expertText(q){return q.explanation||'Use the case facts and the underlying AFM concept to identify the correct option.';}
function useExpert(){const q=S.questions[S.i],id=q.caseId||'0';if(S.expertUsed[id])return;S.expertUsed[id]=true;document.body.insertAdjacentHTML('beforeend',`<div class="overlay" id="overlay"><div class="analysis-card"><button class="close-btn" id="close">✕</button><div class="analysis-title"><i class="fa-solid fa-user-tie"></i> Expert Advice</div><p class="analysis-copy">${esc(expertText(q)).replace(/\n/g,'<br>')}</p><div class="expert-tip">Available once for this case scenario.</div></div></div>`);$('#close').onclick=()=>$('#overlay').remove();}
function usePoll(){const q=S.questions[S.i],id=q.caseId||'0';if(S.pollUsed[id])return;S.pollUsed[id]=true;const dist=q.options.map((_,i)=>i===q.correct?62:Math.round(38/(q.options.length-1)));document.body.insertAdjacentHTML('beforeend',`<div class="overlay" id="overlay"><div class="analysis-card"><button class="close-btn" id="close">✕</button><div class="analysis-title"><i class="fa-solid fa-chart-simple"></i> Audience Poll</div><p class="analysis-copy">Illustrative poll based on the question difficulty and correct answer.</p>${q.options.map((o,i)=>`<div class="poll-row"><div class="poll-label"><span>${String.fromCharCode(65+i)}. ${esc(String(o).replace(/^\([a-d]\)\s*/i,''))}</span><strong>${dist[i]}%</strong></div><div class="poll-bg"><div class="poll-fill ${i===q.correct?'correct':''}" style="width:${dist[i]}%"></div></div></div>`).join('')}</div></div>`);$('#close').onclick=()=>$('#overlay').remove();}

async function finish(){
  await save('completed');
  const x=stats();
  document.body.innerHTML=`<div class="completion-page"><div class="completion-glow"></div><section class="completion-card">${vpcLogo('large')}<div class="completion-icon"><i class="fa-solid fa-trophy"></i></div><div class="login-kicker">ATTEMPT COMPLETED</div><h1>Well done, ${esc(S.student.name || 'Student')}!</h1><p class="login-copy">You attempted <strong>${x.attempted}</strong> questions with <strong>${x.accuracy}%</strong> accuracy in <strong>${sec(x.time)}</strong>.</p><div class="completion-actions"><button id="review" class="secondary-big"><i class="fa-solid fa-chart-line"></i> Review Analysis</button><button id="restart" class="secondary-big"><i class="fa-solid fa-rotate-right"></i> Start Again</button></div><div class="feedback-wrap"><div class="feedback-title"><i class="fa-regular fa-comment-dots"></i> Share your feedback with VPC</div><iframe class="feedback-frame" src="${CFG.feedback}" title="VPC Student Feedback Form" loading="lazy"></iframe><a class="feedback-link" href="${CFG.feedbackOpen}" target="_blank" rel="noopener">Open feedback form in a new tab</a></div></section></div>`;
  $('#review').onclick=analysis;
  $('#restart').onclick=async()=>{localStorage.removeItem('vpcAttemptRestart');await db.rpc('start_new_attempt',{p_phone:S.student.phone,p_quiz_key:CFG.quiz}).catch(()=>{});location.reload();};
}

(async()=>{
  const p=localStorage.getItem('vpcPhone');
  if(p){S.student={phone:p,name:localStorage.getItem('vpcName')||'',place:localStorage.getItem('vpcPlace')||''};await bootQuiz();}
  else login();
})();
