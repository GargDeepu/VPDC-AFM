/* VPDC authentication + authenticated learning-session layer.
   UI is intentionally left to the existing application. */
(function(){
  // Claim startup immediately so legacy app.js cannot auto-resume through the
  // unauthenticated phone-only RPC path.
  window.__VPDC_AUTH_V2_ACTIVE__ = true;
  if(typeof db==='undefined') return;
  const client=db;
  const redirectTo=window.location.origin+window.location.pathname;
  let pending={name:'',phone:'',place:''};

  const normalizePhone=(v)=>{const raw=String(v||'').trim();const d=raw.replace(/\D/g,'');if(d.length===10)return '+91'+d;if(raw.startsWith('+')&&d.length>=8)return '+'+d;return d.length>=8?'+'+d:'';};
  const userMeta=(u)=>{const m=u?.user_metadata||{};return {name:String(m.full_name||m.name||m.user_name||'').trim(),email:String(u?.email||m.email||'').trim()};};
  const setMsg=(m,bad=false)=>{const el=document.getElementById('auth-msg');if(el){el.textContent=m;el.style.color=bad?'#fca5a5':'#a5f3fc';}};
  const card=(body)=>{const logo=typeof window.vpcLogo==='function'?window.vpcLogo('large'):'';document.body.innerHTML=`<div class="login-page"><div class="login-glow"></div><section class="login-card">${logo}<div class="login-kicker">CA FINAL • PAPER 2</div><h1>Advanced Financial Management</h1>${body}<div id="auth-msg" class="login-error"></div></section></div>`;};

  function showLogin(){
    card(`<p class="login-copy">Continue with Google, then verify your mobile number once. Your progress, answers, sessions and activity remain linked to your VPDC student account.</p><div class="login-note"><i class="fa-brands fa-google"></i> Google sign-in + one-time mobile verification</div><button id="google-login" class="primary-btn" type="button"><i class="fa-brands fa-google"></i> Continue with Google</button><p class="login-copy" style="margin-top:12px;font-size:10px">Your mobile number is collected for verified student contact and account continuity.</p>`);
    document.getElementById('google-login').onclick=async()=>{setMsg('Opening Google sign-in…');const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo}});if(error)setMsg(error.message,true);};
  }

  async function showProfile(user,student){
    const meta=userMeta(user),name=student?.name||meta.name||'',place=student?.place||'',phone=student?.phone||'';
    card(`<p class="login-copy">Welcome${name?', '+esc(name):''}. Enter your mobile number and city once to complete your verified VPDC student profile.</p><form id="profile-form"><label>Full Name</label><input name="name" value="${esc(name)}" required minlength="2" autocomplete="name" placeholder="Your name"><label>Mobile Number</label><input name="phone" value="${esc(phone)}" required inputmode="tel" autocomplete="tel" placeholder="+91 98765 43210"><label>City / Place</label><input name="place" value="${esc(place)}" required minlength="2" autocomplete="address-level2" placeholder="Your city or place"><button class="primary-btn" type="submit"><i class="fa-solid fa-mobile-screen-button"></i> Send OTP</button></form>`);
    document.getElementById('profile-form').onsubmit=async(e)=>{e.preventDefault();const f=new FormData(e.target);const n=String(f.get('name')||'').trim();const p=normalizePhone(f.get('phone'));const pl=String(f.get('place')||'').trim();if(!p){setMsg('Please enter a valid mobile number.',true);return;}pending={name:n,phone:p,place:pl};setMsg('Sending OTP to '+p+'…');const {error}=await client.auth.updateUser({phone:p});if(error){setMsg(error.message,true);return;}showOtp(user);};
  }

  function showOtp(user){
    card(`<p class="login-copy">We sent a 6-digit OTP to <strong>${esc(pending.phone)}</strong>.</p><form id="otp-form"><label>Mobile OTP</label><input name="otp" required inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" placeholder="Enter 6-digit OTP"><button class="primary-btn" type="submit"><i class="fa-solid fa-circle-check"></i> Verify Mobile & Continue</button><button id="back-profile" class="vpdc-btn" type="button" style="width:100%;margin-top:9px">Change mobile number</button></form>`);
    document.getElementById('back-profile').onclick=()=>showProfile(user,pending);
    document.getElementById('otp-form').onsubmit=async(e)=>{e.preventDefault();const token=String(new FormData(e.target).get('otp')||'').trim();if(!/^\d{6}$/.test(token)){setMsg('Enter the 6-digit OTP.',true);return;}setMsg('Verifying mobile number…');const {data,error}=await client.auth.verifyOtp({phone:pending.phone,token,type:'phone_change'});if(error){setMsg(error.message,true);return;}const u=data?.user||(await client.auth.getUser()).data.user;const r=await client.rpc('link_authenticated_student',{p_name:pending.name,p_place:pending.place,p_phone:pending.phone,p_phone_verified:true});if(r.error){setMsg(r.error.message,true);return;}await bootAuthenticated(u,r.data);};
  }

  async function bootAuthenticated(user,studentOverride){
    const {data,error}=await client.rpc('start_learning_session',{p_quiz_key:CFG.quiz});
    if(error){renderError('Unable to start your VPC session',error.message);return;}
    const student=studentOverride||data.student;S.student=student;S.attempt=data.attempt;S.sessionId=data.session.id;S.questions=loadQuestions();
    if(!S.questions.length){renderError('Question bank could not be loaded','The AFM question bank was not available in this browser session.');return;}
    S.i=Math.min(Number(S.attempt.current_question_index||0),S.questions.length-1);S.answers={};S.hidden={};S.lifeline5050={};S.expertUsed={};S.pollUsed={};
    const a=await client.rpc('load_authenticated_attempt_answers',{p_attempt_id:S.attempt.id});
    if(!a.error)(a.data||[]).forEach(x=>{S.answers[String(x.question_id)]=x;S.hidden[String(x.question_id)]=x.hidden_options||[];if(x.used_5050)S.lifeline5050[String(x.question_id)]=true;});
    S.started=Date.now()-Number(S.attempt.total_seconds||0)*1000;S.questionStarted=Date.now();
    render();
  }

  async function ensure(){
    const {data}=await client.auth.getSession();
    if(!data.session){showLogin();return;}
    const user=data.session.user;let {data:student,error}=await client.from('students').select('*').eq('auth_user_id',user.id).maybeSingle();
    if(error){renderError('Unable to load your student profile',error.message);return;}
    if(user.phone_confirmed_at&&user.phone){
      if(!student){pending={name:userMeta(user).name,phone:normalizePhone(user.phone),place:''};showProfile(user,{name:pending.name,phone:pending.phone,place:''});return;}
      await bootAuthenticated(user,student);return;
    }
    showProfile(user,student||{});
  }

  window.vpdcPersistAnswer=async(a)=>{if(!S.attempt)return;const {error}=await client.rpc('save_authenticated_answer',{p_attempt_id:S.attempt.id,p_question_id:a.question_id,p_question_index:a.question_index,p_selected_option:a.selected_option,p_correct_option:a.correct_option,p_is_correct:a.is_correct,p_skipped:!!a.skipped,p_marked:!!a.marked_for_review,p_hidden_options:a.hidden_options||S.hidden[a.question_id]||[],p_used_5050:!!a.used_5050,p_used_expert:!!a.used_expert,p_used_poll:!!a.used_poll,p_seconds_spent:Math.floor(a.seconds_spent||0)});if(error)console.error('save_authenticated_answer',error);return !error;};
  window.vpdcPersistProgress=async(status='active')=>{if(!S.attempt)return;return client.rpc('save_authenticated_progress',{p_attempt_id:S.attempt.id,p_current_index:S.i,p_current_question_id:S.questions[S.i]?.id||'',p_total_seconds:Math.floor((Date.now()-S.started)/1000),p_status:status});};
  window.vpdcLogEvent=async(type,q,a)=>{if(!S.sessionId||!S.attempt||!q)return;const {error}=await client.rpc('record_answer_event',{p_session_id:S.sessionId,p_attempt_id:S.attempt.id,p_question_id:String(q.id),p_question_index:S.i,p_event_type:type,p_selected_option:a?.selected_option??null,p_is_correct:a?.is_correct??null,p_skipped:!!a?.skipped,p_marked_for_review:!!a?.marked_for_review,p_hidden_options:a?.hidden_options||S.hidden[q.id]||[],p_used_5050:!!a?.used_5050,p_used_expert:!!a?.used_expert,p_used_poll:!!a?.used_poll,p_seconds_spent:Math.floor(a?.seconds_spent||0)});if(error)console.error('record_answer_event',error);};

  const wrap=(name,after)=>{const fn=window[name];if(typeof fn!=='function')return;window[name]=async function(...args){const beforeI=S.i;const q=S.questions?.[beforeI];const out=await fn.apply(this,args);await after?.(q,out);return out;};};
  wrap('choose',async(q)=>{if(q)await window.vpdcLogEvent('answer_selected',q,S.answers[q.id]);});
  wrap('toggleMark',async(q)=>{if(q)await window.vpdcLogEvent('mark_toggled',q,S.answers[q.id]);});
  wrap('move',async(q)=>{if(q)await window.vpdcLogEvent('navigation',q,S.answers[q.id]);});
  wrap('use5050',async(q)=>{if(q)await window.vpdcLogEvent('lifeline_5050',q,S.answers[q.id]);});
  wrap('useExpert',async(q)=>{if(q)await window.vpdcLogEvent('lifeline_expert',q,S.answers[q.id]);});
  wrap('usePoll',async(q)=>{if(q)await window.vpdcLogEvent('lifeline_poll',q,S.answers[q.id]);});
  wrap('save',async()=>{await window.vpdcPersistProgress('active');});
  window.vpdcLogout=async()=>{await client.auth.signOut();location.href=redirectTo;};

  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')window.vpdcPersistProgress?.('active');});
  window.addEventListener('beforeunload',()=>{try{window.vpdcPersistProgress?.('active');}catch(e){}});

  ensure();
})();