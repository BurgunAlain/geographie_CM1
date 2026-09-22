const quizQuestions = [
  {q:"Les calories servent à mesurer :", options:["le poids des aliments","l’énergie que donnent les aliments","la quantité d’eau dans les aliments"], correct:1},
  {q:"Notre corps a besoin de calories pour :", options:["fonctionner, bouger et grandir","changer de couleur","dormir toute la journée"], correct:0},
  {q:"En moyenne, un enfant de 9 ans a besoin d’environ :", options:["500 calories par jour","2 000 calories par jour","5 000 calories par jour"], correct:1},
  {q:"La sous-nutrition est une situation où une personne :", options:["mange trop de sucre","ne mange pas assez pour vivre correctement","mange uniquement des légumes"], correct:1},
  {q:"La malnutrition correspond à :", options:["une alimentation équilibrée","une alimentation déséquilibrée","le fait de boire trop d’eau"], correct:1}
];

const countries = [
  {id:"france", name:"France", flag:"🇫🇷", rows:[
    ["Petit-déjeuner","330"],["Déjeuner","36 + 170 + 200 + 80 + 52"],["Goûter","800"],["Dîner","450 + 120"]
  ], total:2238},
  {id:"usa", name:"États-Unis", flag:"🇺🇸", rows:[
    ["Petit-déjeuner","420"],["Déjeuner","310 + 135 + 52"],["Goûter","746"],["Dîner","590 + 400 + 150 + 300"]
  ], total:3103},
  {id:"nk", name:"Corée du Nord", flag:"🇰🇵", rows:[
    ["Petit-déjeuner","300"],["Déjeuner","240 + 50"],["Goûter","0"],["Dîner","100 + 150"]
  ], total:840},
  {id:"rca", name:"République centrafricaine", flag:"🇨🇫", rows:[
    ["Petit-déjeuner","0"],["Déjeuner","240 + 180 + 37 + 44"],["Goûter","0"],["Dîner","≈ 300"]
  ], total:801}
];

const stageState = {
  1:{hadError:false, validated:false},
  2:{hadError:false, validated:false},
  3:{hadError:false, validated:false}
};

function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; }

function renderQuiz(){
  const area=qs('#quiz-area');
  area.innerHTML='';
  quizQuestions.forEach((item,i)=>{
    const card=document.createElement('article');
    card.className='question-card';
    card.dataset.q=i;
    card.innerHTML=`<h3><span class="qnum">${i+1}</span><span>${item.q}</span></h3><div class="option-grid"></div>`;
    const grid=qs('.option-grid',card);
    item.options.forEach((opt,j)=>{
      const label=document.createElement('label');
      label.className='option';
      label.innerHTML=`<input type="radio" name="q${i}" value="${j}"><span>${opt}</span>`;
      grid.appendChild(label);
    });
    area.appendChild(card);
  });
}

function renderCalc(){
  const area=qs('#calc-area'); area.innerHTML='';
  countries.forEach(c=>{
    const card=document.createElement('article');
    card.className='country-card'; card.dataset.country=c.id;
    card.innerHTML=`
      <div class="country-title"><span class="flag">${c.flag}</span><h3>${c.name}</h3></div>
      <div class="calorie-lines">${c.rows.map(r=>`<div class="calorie-line"><span>${r[0]}</span><span>${r[1]}</span></div>`).join('')}</div>
      <div class="answer-row"><label for="ans-${c.id}">Total de la journée</label><input inputmode="numeric" pattern="[0-9]*" id="ans-${c.id}" aria-label="Total pour ${c.name}"><span class="answer-unit">calories</span></div>`;
    area.appendChild(card);
  });
}

function renderDiagnostic(){
  qs('#totals-strip').innerHTML=countries.map(c=>`<div class="total-pill"><strong>${c.flag} ${c.name}</strong><span>${c.total.toLocaleString('fr-FR')} cal.</span></div>`).join('');
  ['undernutrition','malnutrition'].forEach(kind=>{
    const area=qs(`#chips-${kind}`); area.innerHTML='';
    countries.forEach(c=>{
      const b=document.createElement('button');
      b.type='button'; b.className='choice-chip'; b.dataset.country=c.id;
      b.textContent=`${c.flag} ${c.name}`;
      b.addEventListener('click',()=>b.classList.toggle('is-selected'));
      area.appendChild(b);
    });
  });
}

function markStageDone(stage){
  stageState[stage].validated=true;
  const tab=qs(`[data-stage="${stage}"]`);
  tab.classList.add('is-done');
  qs(`[data-status="${stage}"]`).textContent='Validé ✓';
  if(stage<3){
    const next=qs(`[data-stage="${stage+1}"]`); next.disabled=false;
    qs(`[data-status="${stage+1}"]`).textContent='À faire';
  } else {
    qs('#final-card').classList.remove('is-hidden');
  }
}

function showStage(stage){
  qsa('[data-stage-panel]').forEach(p=>p.classList.toggle('is-hidden',Number(p.dataset.stagePanel)!==stage));
  qsa('.stage-tab').forEach(t=>{t.classList.toggle('is-active',Number(t.dataset.stage)===stage);t.removeAttribute('aria-current');});
  const tab=qs(`[data-stage="${stage}"]`); tab.setAttribute('aria-current','step');
  window.scrollTo({top:Math.max(0, qs(`[data-stage-panel="${stage}"]`).offsetTop-20),behavior:'smooth'});
}

qsa('.stage-tab').forEach(tab=>tab.addEventListener('click',()=>{if(!tab.disabled)showStage(Number(tab.dataset.stage));}));

function clearFeedback(stage){
  const f=qs(`#feedback-${stage}`); f.textContent=''; f.className='feedback';
  qs(`#restart-${stage}`).classList.add('is-hidden');
}

function report(stage,type,text){
  const f=qs(`#feedback-${stage}`); f.className=`feedback ${type}`; f.textContent=text;
}

qs('#check-1').addEventListener('click',()=>{
  let all=true;
  quizQuestions.forEach((item,i)=>{
    const card=qs(`.question-card[data-q="${i}"]`);
    qsa('.option',card).forEach(o=>o.classList.remove('is-correct','is-wrong'));
    const chosen=qs(`input[name="q${i}"]:checked`);
    if(!chosen){ all=false; return; }
    const chosenIndex=Number(chosen.value);
    chosen.closest('.option').classList.add(chosenIndex===item.correct?'is-correct':'is-wrong');
    if(chosenIndex!==item.correct) all=false;
  });
  if(!all){
    stageState[1].hadError=true;
    report(1,'bad','Il reste au moins une réponse à corriger. Cette tentative sert maintenant d’entraînement : corrige tout, puis tu devras recommencer l’étape pour la valider.');
    return;
  }
  if(stageState[1].hadError){
    report(1,'train','Tout est maintenant correct. Tu as bien corrigé ! Pour obtenir la validation, recommence l’étape et réussis-la sans aucune erreur.');
    qs('#restart-1').classList.remove('is-hidden');
  } else {
    report(1,'ok','Sans-faute ! Étape 1 validée.');
    markStageDone(1);
    qs('[data-stage="2"]').focus();
  }
});

qs('#restart-1').addEventListener('click',()=>{
  stageState[1].hadError=false; clearFeedback(1); renderQuiz();
});

qs('#check-2').addEventListener('click',()=>{
  let all=true;
  countries.forEach(c=>{
    const card=qs(`.country-card[data-country="${c.id}"]`); card.classList.remove('is-correct','is-wrong');
    const raw=qs(`#ans-${c.id}`).value.trim().replace(/\s/g,'');
    const value=Number(raw);
    const ok=raw!=='' && value===c.total;
    card.classList.add(ok?'is-correct':'is-wrong');
    if(!ok) all=false;
  });
  if(!all){
    stageState[2].hadError=true;
    report(2,'bad','Vérifie tes additions. Au moins un total n’est pas correct. Corrige-les pour t’entraîner ; cette tentative ne pourra plus être validée.');
    return;
  }
  if(stageState[2].hadError){
    report(2,'train','Tous les totaux sont maintenant corrects. Pour valider l’étape, recommence et trouve les quatre résultats sans erreur lors de la même tentative.');
    qs('#restart-2').classList.remove('is-hidden');
  } else {
    report(2,'ok','Les quatre calculs sont justes du premier coup. Étape 2 validée !');
    markStageDone(2);
  }
});

qs('#restart-2').addEventListener('click',()=>{
  stageState[2].hadError=false; clearFeedback(2); renderCalc();
});

function selectedSet(kind){ return new Set(qsa(`#chips-${kind} .choice-chip.is-selected`).map(b=>b.dataset.country)); }
function sameSet(a,b){ return a.size===b.size && [...a].every(x=>b.has(x)); }

qs('#check-3').addEventListener('click',()=>{
  const answers={undernutrition:new Set(['nk','rca']),malnutrition:new Set(['usa'])};
  let all=true;
  ['undernutrition','malnutrition'].forEach(kind=>{
    const chosen=selectedSet(kind); const ok=sameSet(chosen,answers[kind]);
    const box=qs(`[data-diagnostic="${kind}"]`); box.classList.remove('is-correct','is-wrong'); box.classList.add(ok?'is-correct':'is-wrong');
    qsa(`#chips-${kind} .choice-chip`).forEach(b=>{
      b.classList.remove('is-answer','is-bad');
      if(b.classList.contains('is-selected')) b.classList.add(answers[kind].has(b.dataset.country)?'is-answer':'is-bad');
    });
    if(!ok) all=false;
  });
  if(!all){
    stageState[3].hadError=true;
    report(3,'bad','Au moins un pays est mal classé ou manque. Appuie sur les pays pour modifier tes choix. Cette tentative devient une tentative d’entraînement.');
    return;
  }
  if(stageState[3].hadError){
    report(3,'train','Tes choix sont maintenant corrects. Recommence l’étape et réussis les deux diagnostics sans erreur pour obtenir la validation.');
    qs('#restart-3').classList.remove('is-hidden');
  } else {
    report(3,'ok','Sans-faute ! Étape 3 validée. Mission accomplie !');
    markStageDone(3);
  }
});

qs('#restart-3').addEventListener('click',()=>{
  stageState[3].hadError=false; clearFeedback(3); renderDiagnostic();
  qsa('.diagnostic-question').forEach(x=>x.classList.remove('is-correct','is-wrong'));
});

renderQuiz(); renderCalc(); renderDiagnostic();
