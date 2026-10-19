(() => {
  'use strict';
  const STATIC_SELECTORS = [".hero__copy", ".rule-card", ".stage-heading > div:first-child", ".source-card", ".definition-strip", ".meal-evidence-static__head", ".flag-diagnostic__intro", ".diagnostic-dropzone__head", ".final-card"];

  const DYNAMIC_BLOCK_SELECTORS = [".question-card h3", ".country-card", ".meal-card-static", ".feedback"];

  const INLINE_SELECTORS = [".option", ".country-flag"];

  const CLEAN_REMOVE = [".qnum", ".country-flag__emoji", ".diagnostic-count", ".stage-tab__status"];

  const synth = window.speechSynthesis;
  const supported = !!(synth && window.SpeechSynthesisUtterance);
  let activeButton=null, activeUtterance=null, frenchVoice=null;

  function chooseFrenchVoice(){
    if(!supported) return null;
    const voices=synth.getVoices?synth.getVoices():[];
    frenchVoice=voices.find(v=>/^fr-FR$/i.test(v.lang))||voices.find(v=>/^fr/i.test(v.lang))||voices.find(v=>/fran[cç]ais|french/i.test(v.name))||null;
    return frenchVoice;
  }
  if(supported){chooseFrenchVoice();try{synth.addEventListener?.('voiceschanged',chooseFrenchVoice)}catch(e){} }

  function cleanText(text){return String(text||'').replace(/\s+/g,' ').replace(/…/g,' mot à compléter ').replace(/\s+([,.;:!?])/g,'$1').trim()}
  function readableText(element){
    if(!element) return '';
    const clone=element.cloneNode(true);
    clone.querySelectorAll(['.tts-button','.tts-inline','[aria-hidden="true"]',...CLEAN_REMOVE].join(',')).forEach(el=>el.remove());
    clone.querySelectorAll('.cloze-slot').forEach(slot=>{const v=cleanText(slot.textContent);slot.textContent=(!v||v==='mot à compléter')?' mot à compléter ':` ${v} `});
    return cleanText(clone.textContent);
  }
  function resetVisual(){if(activeButton){activeButton.classList.remove('is-speaking');activeButton.setAttribute('aria-label','Lire ce texte');activeButton.setAttribute('title','Lire ce texte')}activeButton=null;activeUtterance=null}
  function stopSpeech(){if(!supported)return; synth.cancel(); resetVisual()}
  function speak(text,button){
    if(!supported)return;
    if(activeButton===button&&button.classList.contains('is-speaking')){stopSpeech();return}
    stopSpeech(); const cleaned=cleanText(typeof text==='function'?text():text); if(!cleaned)return;
    const u=new SpeechSynthesisUtterance(cleaned);u.lang='fr-FR';u.rate=.92;u.pitch=1;u.volume=1;const voice=frenchVoice||chooseFrenchVoice();if(voice)u.voice=voice;
    activeButton=button;activeUtterance=u;button.classList.add('is-speaking');button.setAttribute('aria-label','Arrêter la lecture');button.setAttribute('title','Arrêter la lecture');
    const finish=()=>{if(activeUtterance===u)resetVisual()};u.onend=finish;u.onerror=finish;synth.speak(u);
  }
  function wire(button,getText){
    if(!supported){button.classList.add('is-unavailable');button.setAttribute('aria-label','Lecture vocale non disponible');return}
    const activate=ev=>{ev.preventDefault();ev.stopPropagation();speak(getText,button)};
    button.addEventListener('click',activate);button.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){activate(ev)}})
  }
  function makeBlockSpeaker(host,customText=null){
    if(!host||host.dataset.ttsBlock==='1')return;host.dataset.ttsBlock='1';host.classList.add('tts-host','tts-pad');
    const b=document.createElement('button');b.type='button';b.className='tts-button';b.textContent='🔊';b.setAttribute('aria-label','Lire ce texte');b.setAttribute('title','Lire ce texte');
    wire(b,()=>cleanText(typeof customText==='function'?customText():(customText||readableText(host))));host.appendChild(b)
  }
  function makeInlineSpeaker(host,customText=null){
    if(!host||host.dataset.ttsInline==='1')return;host.dataset.ttsInline='1';host.classList.add('tts-inline-host');
    const s=document.createElement('span');s.className='tts-inline';s.textContent='🔊';s.setAttribute('role','button');s.setAttribute('tabindex','0');s.setAttribute('aria-label','Lire ce texte');s.setAttribute('title','Lire ce texte');
    wire(s,()=>cleanText(typeof customText==='function'?customText():(customText||readableText(host))));host.appendChild(s)
  }
  function enhance(){
    STATIC_SELECTORS.forEach(sel=>document.querySelectorAll(sel).forEach(el=>makeBlockSpeaker(el)));
    DYNAMIC_BLOCK_SELECTORS.forEach(sel=>document.querySelectorAll(sel).forEach(el=>makeBlockSpeaker(el)));
    INLINE_SELECTORS.forEach(sel=>document.querySelectorAll(sel).forEach(el=>makeInlineSpeaker(el)));
  }

  enhance();
  const observer=new MutationObserver(()=>enhance());observer.observe(document.body,{childList:true,subtree:true,characterData:true});
  document.addEventListener('click',ev=>{if(ev.target.closest('.stage-tab,.tab'))stopSpeech()},true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSpeech()});window.addEventListener('pagehide',stopSpeech);
})();
