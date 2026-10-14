
const ingredients = [
  {id:'carottes', label:'Carottes', category:'agri'},
  {id:'pois-chiches', label:'Pois chiches', category:'agri'},
  {id:'tomates', label:'Tomates', category:'agri'},
  {id:'courgettes', label:'Courgettes', category:'agri'},
  {id:'sucre', label:'Sucre', category:'transformed'},
  {id:'farine', label:'Farine de blé', category:'transformed'},
  {id:'vinaigre', label:'Vinaigre d’alcool', category:'transformed'},
  {id:'huile', label:'Huile d’olive', category:'transformed'},
  {id:'e133', label:'E133', category:'additive'},
  {id:'xanthane', label:'Gomme xanthane', category:'additive'},
  {id:'sorbate', label:'Sorbate de potassium', category:'additive'},
  {id:'ascorbique', label:'Acide ascorbique', category:'additive'}
];

const labScenarios = [
  {
    id:'texture',
    text:'Une préparation est trop liquide et coule de la cuillère. Le fabricant veut qu’elle tienne mieux.',
    answer:'Texture'
  },
  {
    id:'couleur',
    text:'Un sirop doit avoir la teinte verte attendue, alors que ses ingrédients de base ne suffisent pas à lui donner cette apparence.',
    answer:'Couleur'
  },
  {
    id:'conservation',
    text:'Un produit doit garder ses qualités plus longtemps pendant le transport et le stockage.',
    answer:'Conservation'
  },
  {
    id:'gout',
    text:'Le fabricant veut que le produit rappelle davantage la menthe lorsqu’on le goûte.',
    answer:'Goût'
  }
];
const labFunctions = ['Texture','Goût','Couleur','Conservation'];

const inspectionQuestions = [
  {
    id:'deux-colorants',
    prompt:'Quel produit contient deux colorants identifiés par des codes commençant par E ?',
    choices:[
      {id:'compote',label:'La compote pommes-mangues'},
      {id:'carottes',label:'Les carottes râpées assaisonnées'},
      {id:'sirop',label:'Le sirop de menthe'}
    ], answer:'sirop'
  },
  {
    id:'epaississant-conservateur',
    prompt:'Dans quel produit trouve-t-on à la fois un épaississant et un conservateur ?',
    choices:[
      {id:'compote',label:'La compote pommes-mangues'},
      {id:'carottes',label:'Les carottes râpées assaisonnées'},
      {id:'sirop',label:'Le sirop de menthe'}
    ], answer:'carottes'
  },
  {
    id:'presque-fruits',
    prompt:'Quel produit est composé presque entièrement de fruits avant les quelques ingrédients ajoutés ?',
    choices:[
      {id:'compote',label:'La compote pommes-mangues'},
      {id:'carottes',label:'Les carottes râpées assaisonnées'},
      {id:'sirop',label:'Le sirop de menthe'}
    ], answer:'compote'
  },
  {
    id:'liste-longue',
    prompt:'Parmi ces trois produits, lequel possède la liste d’ingrédients la plus longue ?',
    choices:[
      {id:'compote',label:'La compote pommes-mangues'},
      {id:'carottes',label:'Les carottes râpées assaisonnées'},
      {id:'sirop',label:'Le sirop de menthe'}
    ], answer:'carottes'
  },
  {
    id:'plus-transforme',
    prompt:'En utilisant les indices de la séance (longueur de la liste et présence d’additifs), lequel semble le plus transformé ?',
    choices:[
      {id:'compote',label:'La compote pommes-mangues'},
      {id:'carottes',label:'Les carottes râpées assaisonnées'},
      {id:'sirop',label:'Le sirop de menthe'}
    ], answer:'carottes'
  },
  {
    id:'justification',
    prompt:'Quel indice justifie le mieux ce choix ?',
    choices:[
      {id:'longue-additifs',label:'Sa liste est longue et elle contient plusieurs additifs.'},
      {id:'legume',label:'Il contient des carottes, donc il est forcément très transformé.'},
      {id:'emballage',label:'Il est vendu dans un emballage, donc c’est le plus transformé.'}
    ], answer:'longue-additifs'
  }
];

const state = {
  1:{hadError:false,validated:false},
  2:{hadError:false,validated:false},
  3:{hadError:false,validated:false},
  4:{hadError:false,validated:false}
};

function qs(s,r=document){return r.querySelector(s)}
function qsa(s,r=document){return [...r.querySelectorAll(s)]}
function shuffle(arr){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
  return a;
}
function sameOrder(a,b){return a.length===b.length && a.every((x,i)=>x===b[i])}
function shuffleDifferent(arr, previous=[]){
  let a=shuffle(arr), tries=0;
  while((sameOrder(a,arr)||sameOrder(a,previous)) && tries++<50) a=shuffle(arr);
  if(sameOrder(a,arr)) a=[...arr.slice(1),arr[0]];
  return a;
}
function shuffledIngredients(){
  let a=shuffle(ingredients);
  let tries=0;
  const grouped = x => x.some((v,i)=>i>1 && x[i-1].category===v.category && x[i-2].category===v.category);
  while(grouped(a) && tries++<40) a=shuffle(ingredients);
  return a;
}
function setFeedback(stage,type,text){
  const el=qs(`#feedback-${stage}`);
  el.className=`feedback ${type}`; el.textContent=text;
}
function clearFeedback(stage){const el=qs(`#feedback-${stage}`);el.className='feedback';el.textContent=''}
function unlock(stage){
  state[stage].validated=true;
  const tab=qs(`[data-stage="${stage}"]`);
  tab.classList.add('is-done');
  qs(`[data-status="${stage}"]`).textContent='Validé ✓';
  if(stage<4){
    const n=qs(`[data-stage="${stage+1}"]`);
    n.disabled=false; qs(`[data-status="${stage+1}"]`).textContent='À faire';
  }else qs('#final-card').classList.remove('is-hidden');
}
function showStage(stage){
  qsa('[data-stage-panel]').forEach(p=>p.classList.toggle('is-hidden',Number(p.dataset.stagePanel)!==stage));
  qsa('.stage-tab').forEach(t=>t.classList.toggle('is-active',Number(t.dataset.stage)===stage));
}
qsa('.stage-tab').forEach(t=>t.addEventListener('click',()=>{if(!t.disabled)showStage(Number(t.dataset.stage))}));

// ---------- ÉTAPE 1 ----------
let ingredientOrder=[];
let ingredientPlacement={};
let selectedIngredient=null;

function ingredientById(id){return ingredients.find(x=>x.id===id)}
function makeIngredientChip(item){
  const b=document.createElement('button');
  b.type='button'; b.className='ingredient-chip'; b.dataset.id=item.id; b.textContent=item.label;
  if(selectedIngredient===item.id) b.classList.add('is-selected');
  b.addEventListener('click',e=>{
    e.stopPropagation();
    // A placed ingredient is always removable.
    if(ingredientPlacement[item.id]){
      ingredientPlacement[item.id]=null;
      selectedIngredient=null;
      renderStage1();
      return;
    }
    selectedIngredient=selectedIngredient===item.id?null:item.id;
    renderStage1();
  });
  return b;
}
function renderStage1(){
  const bank=qs('#ingredient-bank');
  const bins={agri:qs('#bin-agri'),transformed:qs('#bin-transformed'),additive:qs('#bin-additive')};
  bank.innerHTML=''; Object.values(bins).forEach(x=>x.innerHTML='');
  ingredientOrder.forEach(item=>{
    const chip=makeIngredientChip(item);
    const p=ingredientPlacement[item.id];
    (p?bins[p]:bank).appendChild(chip);
  });
  ['agri','transformed','additive'].forEach(k=>{
    qs(`#count-${k}`).textContent=Object.values(ingredientPlacement).filter(v=>v===k).length;
  });
}
function placeIngredient(bin){
  if(!selectedIngredient)return;
  ingredientPlacement[selectedIngredient]=bin;
  selectedIngredient=null; renderStage1(); clearFeedback(1);
}
qsa('.sort-bin').forEach(bin=>{
  bin.addEventListener('click',()=>placeIngredient(bin.dataset.bin));
  bin.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();placeIngredient(bin.dataset.bin)}})
});
function reset1(){
  state[1].hadError=false; selectedIngredient=null; ingredientPlacement={};
  ingredients.forEach(x=>ingredientPlacement[x.id]=null);
  ingredientOrder=shuffledIngredients();
  clearFeedback(1); renderStage1();
}
qs('#reset-1').addEventListener('click',reset1);
qs('#check-1').addEventListener('click',()=>{
  let all=true;
  ingredients.forEach(item=>{
    const el=qs(`.ingredient-chip[data-id="${item.id}"]`);
    const ok=ingredientPlacement[item.id]===item.category;
    if(el){el.classList.remove('is-correct','is-wrong');el.classList.add(ok?'is-correct':'is-wrong')}
    if(!ok)all=false;
  });
  if(!all){
    state[1].hadError=true;
    setFeedback(1,'bad','Il reste au moins une erreur ou un ingrédient non classé. Corrige pour apprendre, puis réinitialise l’étape pour tenter un sans-faute.');
    return;
  }
  if(state[1].hadError){
    setFeedback(1,'train','Tout est maintenant correct. Bravo pour la correction ! Réinitialise l’étape et réussis-la sans erreur pour la valider.');
  }else{
    setFeedback(1,'ok','Sans-faute ! Les 12 ingrédients sont correctement classés. Étape 1 validée.');
    unlock(1);
  }
});

// ---------- ÉTAPE 2 ----------
let labOrder=[], labAnswers={}, labOptionOrders={};

function renderStage2(){
  const root=qs('#lab-scenarios'); root.innerHTML='';
  labOrder.forEach((scenario,index)=>{
    const card=document.createElement('article'); card.className='lab-card'; card.dataset.scenario=scenario.id;
    const head=document.createElement('div'); head.className='lab-card__head';
    head.innerHTML=`<span>${index+1}</span><strong>${scenario.text}</strong>`;
    card.appendChild(head);
    const options=document.createElement('div'); options.className='lab-options';
    (labOptionOrders[scenario.id]||labFunctions).forEach(func=>{
      const b=document.createElement('button'); b.type='button'; b.className='lab-option'; b.dataset.scenario=scenario.id; b.dataset.func=func; b.textContent=func;
      if(labAnswers[scenario.id]===func)b.classList.add('is-selected');
      b.addEventListener('click',()=>{labAnswers[scenario.id]=func; clearFeedback(2); renderStage2()});
      options.appendChild(b);
    });
    card.appendChild(options); root.appendChild(card);
  });
}
function reset2(){
  state[2].hadError=false; labAnswers={};
  const old=labOrder.map(x=>x.id);
  labOrder=shuffleDifferent(labScenarios.map(x=>x.id),old).map(id=>labScenarios.find(x=>x.id===id));
  labOptionOrders={}; labScenarios.forEach(s=>labOptionOrders[s.id]=shuffleDifferent(labFunctions));
  clearFeedback(2); renderStage2();
}
qs('#reset-2').addEventListener('click',reset2);
qs('#check-2').addEventListener('click',()=>{
  let all=true;
  labScenarios.forEach(s=>{
    const chosen=labAnswers[s.id], ok=chosen===s.answer;
    qsa(`.lab-option[data-scenario="${s.id}"]`).forEach(b=>{
      b.classList.remove('is-correct','is-wrong');
      if(b.dataset.func===chosen)b.classList.add(ok?'is-correct':'is-wrong');
    });
    if(!ok)all=false;
  });
  if(!all){
    state[2].hadError=true;
    setFeedback(2,'bad','Au moins une enquête n’est pas résolue. Relis l’effet décrit, corrige tes réponses, puis réinitialise l’étape pour tenter le sans-faute.');
    return;
  }
  if(state[2].hadError){
    setFeedback(2,'train','Les quatre enquêtes sont maintenant correctes. Réinitialise l’étape et recommence sans erreur pour la valider.');
  }else{
    setFeedback(2,'ok','Sans-faute ! Tu sais déduire la fonction d’un additif à partir de l’effet recherché. Étape 2 validée.');
    unlock(2);
  }
});

// ---------- ÉTAPE 3 ----------
let inspectionOrder=[], inspectionAnswers={}, inspectionChoiceOrders={};

function renderStage3(){
  const root=qs('#inspection-questions'); root.innerHTML='';
  inspectionOrder.forEach((q,index)=>{
    const card=document.createElement('article'); card.className='inspection-card'; card.dataset.inspection=q.id;
    card.innerHTML=`<div class="inspection-card__head"><span>${index+1}</span><strong>${q.prompt}</strong></div>`;
    const opts=document.createElement('div'); opts.className='inspection-options';
    (inspectionChoiceOrders[q.id]||q.choices).forEach(choice=>{
      const b=document.createElement('button'); b.type='button'; b.className='inspection-option'; b.dataset.q=q.id; b.dataset.choice=choice.id; b.textContent=choice.label;
      if(inspectionAnswers[q.id]===choice.id)b.classList.add('is-selected');
      b.addEventListener('click',()=>{inspectionAnswers[q.id]=choice.id;clearFeedback(3);renderStage3()});
      opts.appendChild(b);
    });
    card.appendChild(opts); root.appendChild(card);
  });
}
function reset3(){
  state[3].hadError=false; inspectionAnswers={};
  const old=inspectionOrder.map(x=>x.id);
  inspectionOrder=shuffleDifferent(inspectionQuestions.map(x=>x.id),old).map(id=>inspectionQuestions.find(x=>x.id===id));
  inspectionChoiceOrders={};
  inspectionQuestions.forEach(q=>inspectionChoiceOrders[q.id]=shuffleDifferent(q.choices));
  clearFeedback(3); renderStage3();
}
qs('#reset-3').addEventListener('click',reset3);
qs('#check-3').addEventListener('click',()=>{
  let all=true;
  inspectionQuestions.forEach(q=>{
    const chosen=inspectionAnswers[q.id], ok=chosen===q.answer;
    qsa(`.inspection-option[data-q="${q.id}"]`).forEach(b=>{
      b.classList.remove('is-correct','is-wrong');
      if(b.dataset.choice===chosen)b.classList.add(ok?'is-correct':'is-wrong');
    });
    if(!ok)all=false;
  });
  if(!all){
    state[3].hadError=true;
    setFeedback(3,'bad','Il reste au moins une réponse à revoir. Retourne aux trois listes d’ingrédients, cherche l’indice utile, puis corrige.');
    return;
  }
  if(state[3].hadError){
    setFeedback(3,'train','Toutes les enquêtes sont maintenant correctes. Réinitialise l’étape et recommence sans erreur pour la valider.');
  }else{
    setFeedback(3,'ok','Sans-faute ! Tu sais chercher des indices dans une liste d’ingrédients. La trace écrite est débloquée !');
    unlock(3);
  }
});

// ---------- ÉTAPE 4 : TRACE ÉCRITE À TROUS ----------
const clozeWords = [
  {id:'trois', label:'trois'},
  {id:'produits-agricoles', label:'produits agricoles'},
  {id:'nature', label:'nature'},
  {id:'carotte', label:'carotte'},
  {id:'produits-transformes', label:'produits transformés'},
  {id:'fabriques', label:'fabriqués'},
  {id:'pain', label:'pain'},
  {id:'additifs', label:'additifs'},
  {id:'industrie', label:'industrie'},
  {id:'conserver', label:'conserver'},
  {id:'gout', label:'goût'},
  {id:'couleur', label:'couleur'},
  {id:'texture', label:'texture'},
  {id:'colorants', label:'colorants'}
];

let clozeOrder=[];
let clozePlacement={};
let selectedClozeWord=null;

function clozeWordById(id){return clozeWords.find(w=>w.id===id)}
function placedSlotForWord(id){
  return Object.keys(clozePlacement).find(slot=>clozePlacement[slot]===id) || null;
}

function renderCloze(){
  const bank=qs('#cloze-bank');
  bank.innerHTML='';

  clozeOrder.forEach(id=>{
    if(placedSlotForWord(id)) return;
    const w=clozeWordById(id);
    const b=document.createElement('button');
    b.type='button';
    b.className='cloze-word';
    b.dataset.word=id;
    b.textContent=w.label;
    if(selectedClozeWord===id) b.classList.add('is-selected');
    b.addEventListener('click',()=>{
      selectedClozeWord=selectedClozeWord===id ? null : id;
      qsa('.cloze-word').forEach(x=>
        x.classList.toggle('is-selected',x.dataset.word===selectedClozeWord)
      );
      qsa('.cloze-slot').forEach(x=>x.classList.remove('is-correct','is-wrong'));
      clearFeedback(4);
    });
    bank.appendChild(b);
  });

  qsa('.cloze-slot').forEach(slot=>{
    const id=clozePlacement[slot.dataset.slot] || null;
    slot.textContent=id ? clozeWordById(id).label : '…';
    slot.classList.toggle('is-filled',Boolean(id));
    slot.classList.remove('is-correct','is-wrong');
  });
}

function placeClozeWord(slotId){
  const existing=clozePlacement[slotId] || null;

  // Un trou déjà rempli peut toujours être vidé.
  if(!selectedClozeWord && existing){
    clozePlacement[slotId]=null;
    renderCloze();
    clearFeedback(4);
    return;
  }

  if(!selectedClozeWord) return;

  // Si le mot était déjà dans un autre trou, on le libère.
  const previous=placedSlotForWord(selectedClozeWord);
  if(previous) clozePlacement[previous]=null;

  // Le mot qui était éventuellement dans ce trou retourne automatiquement à la banque.
  clozePlacement[slotId]=selectedClozeWord;
  selectedClozeWord=null;
  renderCloze();
  clearFeedback(4);
}

qsa('.cloze-slot').forEach(slot=>{
  slot.addEventListener('click',()=>placeClozeWord(slot.dataset.slot));
});

function reset4(){
  state[4].hadError=false;
  selectedClozeWord=null;
  clozePlacement={};
  clozeWords.forEach(w=>clozePlacement[w.id]=null);

  const old=[...clozeOrder];
  clozeOrder=shuffleDifferent(clozeWords.map(w=>w.id),old);

  clearFeedback(4);
  renderCloze();
}

qs('#reset-4').addEventListener('click',reset4);

qs('#check-4').addEventListener('click',()=>{
  let all=true;

  qsa('.cloze-slot').forEach(slot=>{
    const expected=slot.dataset.slot;
    const ok=clozePlacement[expected]===expected;
    slot.classList.remove('is-correct','is-wrong');
    slot.classList.add(ok?'is-correct':'is-wrong');
    if(!ok) all=false;
  });

  if(!all){
    state[4].hadError=true;
    setFeedback(4,'bad','Il reste au moins un mot mal placé ou un trou vide. Corrige pour apprendre, puis réinitialise l’étape pour tenter un sans-faute.');
    return;
  }

  if(state[4].hadError){
    setFeedback(4,'train','La trace écrite est maintenant correcte. Réinitialise l’étape et complète-la sans aucune erreur pour la valider.');
  }else{
    setFeedback(4,'ok','Sans-faute ! La trace écrite est entièrement correcte. Mission accomplie !');
    unlock(4);
  }
});


// ---------- Initialisation ----------
reset1(); reset2(); reset3(); reset4();

const preview=new URLSearchParams(location.search).get('preview');
if(preview==='stage1full'){
  ingredients.forEach(x=>ingredientPlacement[x.id]=x.category);renderStage1();
}
if(preview==='stage2') showStage(2);
if(preview==='stage3') showStage(3);
if(preview==='stage4') showStage(4);

// Internal automated functional test.
if(new URLSearchParams(location.search).get('autotest')==='1'){
  const result=[];
  try{
    // Stage 1 wrong -> correction -> reset -> perfect
    ingredientPlacement[ingredients[0].id]=ingredients[0].category==='agri'?'additive':'agri';
    qs('#check-1').click(); result.push(state[1].hadError===true);
    ingredients.forEach(x=>ingredientPlacement[x.id]=x.category);renderStage1();qs('#check-1').click();
    result.push(state[1].validated===false);
    qs('#reset-1').click();ingredients.forEach(x=>ingredientPlacement[x.id]=x.category);renderStage1();qs('#check-1').click();
    result.push(state[1].validated===true);

    // Stage 2 perfect
    labScenarios.forEach(s=>labAnswers[s.id]=s.answer);renderStage2();qs('#check-2').click();
    result.push(state[2].validated===true);

    // Stage 3 perfect
    inspectionQuestions.forEach(q=>inspectionAnswers[q.id]=q.answer);renderStage3();qs('#check-3').click();
    result.push(state[3].validated===true);

    // Stage 4 : erreur -> correction without validation -> reset -> perfect
    clozeWords.forEach(w=>clozePlacement[w.id]=w.id);
    clozePlacement.trois='nature';clozePlacement.nature='trois';
    renderCloze();qs('#check-4').click();
    result.push(state[4].hadError===true && state[4].validated===false);
    clozeWords.forEach(w=>clozePlacement[w.id]=w.id);renderCloze();qs('#check-4').click();
    result.push(state[4].validated===false);
    reset4();clozeWords.forEach(w=>clozePlacement[w.id]=w.id);renderCloze();qs('#check-4').click();
    result.push(state[4].validated===true);

    qs('#autotest-result').textContent=result.every(Boolean)?'AUTOTEST_OK':'AUTOTEST_FAIL';
    document.body.dataset.autotest=result.every(Boolean)?'ok':'fail';
  }catch(e){
    qs('#autotest-result').textContent='AUTOTEST_ERROR '+e.message;
    document.body.dataset.autotest='error';
  }
}
