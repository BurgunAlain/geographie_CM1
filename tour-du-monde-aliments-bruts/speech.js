
(() => {
  const synth=window.speechSynthesis;
  const supported=!!(synth&&window.SpeechSynthesisUtterance);
  let activeButton=null,activeUtterance=null,frVoice=null;

  function pickVoice(){
    if(!supported)return null;
    const vs=synth.getVoices?.()||[];
    frVoice=vs.find(v=>/^fr-FR$/i.test(v.lang))||vs.find(v=>/^fr/i.test(v.lang))||null;
    return frVoice;
  }
  if(supported){
    pickVoice();
    synth.addEventListener?.('voiceschanged',pickVoice);
  }
  function stop(){
    if(!supported)return;
    synth.cancel();
    if(activeButton)activeButton.classList.remove('is-speaking');
    activeButton=null;activeUtterance=null;
  }
  function speak(text,button){
    if(!supported)return;
    if(activeButton===button&&button.classList.contains('is-speaking')){stop();return}
    stop();
    const clean=String(text||'').replace(/\s+/g,' ').trim();
    if(!clean)return;
    const u=new SpeechSynthesisUtterance(clean);
    u.lang='fr-FR';u.rate=.92;u.pitch=1;u.volume=1;
    const v=frVoice||pickVoice();if(v)u.voice=v;
    activeButton=button;activeUtterance=u;button.classList.add('is-speaking');
    const done=()=>{if(activeUtterance===u)stop()};
    u.onend=done;u.onerror=done;synth.speak(u);
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('.speaker');if(!b)return;
    e.preventDefault();e.stopPropagation();
    if(!supported){b.title='Lecture vocale non disponible';return}
    speak(b.dataset.speak||'',b);
  },true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
  window.addEventListener('pagehide',stop);
})();
