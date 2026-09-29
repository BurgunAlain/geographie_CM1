
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
  {id:'couleur', text:'Le fabricant veut que son sirop soit bien vert.', answer:'Couleur'},
  {id:'texture', text:'Le fabricant veut que son dessert soit plus épais et plus crémeux.', answer:'Texture'},
  {id:'gout', text:'Le fabricant veut modifier le goût d’un produit.', answer:'Goût'},
  {id:'conservation', text:'Le fabricant veut que son aliment se conserve plus longtemps.', answer:'Conservation'}
];
const labFunctions = ['Texture','Goût','Couleur','Conservation'];

const products = [
  {id:'fruit', title:'Un fruit', ingredients:'Ingrédients : pomme.', rank:1},
  {id:'compote', title:'Une compote', ingredients:'Ingrédients : pomme, sucre, vitamine C.', rank:2},
  {id:'industriel', title:'Un dessert industriel', ingredients:'Ingrédients : farine, sucre, huile, sirop de glucose, cacao, émulsifiant, arôme, colorant, conservateur…', rank:3}
];

const compareChallenges = [
  {id:'duel1', prompt:'Fruit ou compote : lequel est le plus transformé ?', choices:[{id:'fruit',label:'Le fruit'},{id:'compote',label:'La compote'}], answer:'compote'},
  {id:'duel2', prompt:'Compote ou dessert industriel : lequel est le plus transformé ?', choices:[{id:'compote',label:'La compote'},{id:'industriel',label:'Le dessert industriel'}], answer:'industriel'},
  {id:'duel3', prompt:'Carotte ou carottes râpées assaisonnées du commerce : lequel est le plus transformé ?', choices:[{id:'carotte',label:'La carotte'},{id:'carottes-commerce',label:'Les carottes râpées assaisonnées'}], answer:'carottes-commerce'}
];

const clueChoices = [
  {id:'longue', label:'Une liste d’ingrédients souvent plus longue', correct:true},
  {id:'additifs', label:'La présence possible d’additifs', correct:true},
  {id:'un-seul', label:'Un seul ingrédient venant directement de la nature', correct:false},
  {id:'brut', label:'Un produit agricole brut', correct:false}
];

const state = {
  1:{hadError:false,validated:false},
  2:{hadError:false,validated:false},
  3:{hadError:false,validated:false}
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
  if(stage<3){
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
  let ids=shuffleDifferent(labScenarios.map(x=>x.id),old);
  labOrder=ids.map(id=>labScenarios.find(x=>x.id===id));
  labOptionOrders={};
  labScenarios.forEach(s=>labOptionOrders[s.id]=shuffleDifferent(labFunctions));
  clearFeedback(2); renderStage2();
}
qs('#reset-2').addEventListener('click',reset2);
qs('#check-2').addEventListener('click',()=>{
  let all=true;
  labScenarios.forEach(s=>{
    const chosen=labAnswers[s.id]; const ok=chosen===s.answer;
    qsa(`.lab-option[data-scenario="${s.id}"]`).forEach(b=>{
      b.classList.remove('is-correct','is-wrong');
      if(b.dataset.func===chosen)b.classList.add(ok?'is-correct':'is-wrong');
    });
    if(!ok)all=false;
  });
  if(!all){
    state[2].hadError=true;
    setFeedback(2,'bad','Au moins une situation n’est pas résolue correctement. Tu peux changer tes réponses, puis réinitialiser l’étape pour tenter le sans-faute.');
    return;
  }
  if(state[2].hadError){
    setFeedback(2,'train','Les quatre situations sont maintenant résolues. Réinitialise l’étape et recommence sans erreur pour la valider.');
  }else{
    setFeedback(2,'ok','Sans-faute ! Tu sais choisir la fonction d’un additif à partir d’un besoin concret. Étape 2 validée.');
    unlock(2);
  }
});

// ---------- ÉTAPE 3 ----------
let productOrder=[], selectedProduct=null, rankPlacement={};
let compareOrder=[], compareAnswers={}, compareChoiceOrders={};
let clueOrder=[], clueSelected=new Set();

function productById(id){return products.find(x=>x.id===id)}
function makeProductCard(p){
  const b=document.createElement('button');b.type='button';b.className='product-card';b.dataset.product=p.id;
  if(selectedProduct===p.id)b.classList.add('is-selected');
  b.innerHTML=`<h3>${p.title}</h3><p>${p.ingredients}</p>`;
  b.addEventListener('click',e=>{
    e.stopPropagation();
    if(rankPlacement[p.id]){rankPlacement[p.id]=null;selectedProduct=null;renderRank();return}
    selectedProduct=selectedProduct===p.id?null:p.id;renderRank();
  });
  return b;
}
function renderRank(){
  const bank=qs('#rank-bank');bank.innerHTML=''; [1,2,3].forEach(r=>qs(`#rank-${r}`).innerHTML='');
  productOrder.forEach(p=>{const card=makeProductCard(p);const r=rankPlacement[p.id];(r?qs(`#rank-${r}`):bank).appendChild(card)});
}
function placeRank(rank){
  if(!selectedProduct)return;
  Object.keys(rankPlacement).forEach(id=>{if(rankPlacement[id]===rank)rankPlacement[id]=null});
  rankPlacement[selectedProduct]=rank;selectedProduct=null;renderRank();clearFeedback(3);
}
qsa('.rank-slot').forEach(slot=>{
  slot.addEventListener('click',()=>placeRank(Number(slot.dataset.rank)));
  slot.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();placeRank(Number(slot.dataset.rank))}})
});

function renderCompare(){
  const root=qs('#compare-grid');root.innerHTML='';
  compareOrder.forEach((c,index)=>{
    const card=document.createElement('article');card.className='compare-card';card.dataset.compare=c.id;
    card.innerHTML=`<div class="compare-card__q"><span>${index+1}</span><strong>${c.prompt}</strong></div>`;
    const options=document.createElement('div');options.className='compare-options';
    (compareChoiceOrders[c.id]||c.choices).forEach(choice=>{
      const b=document.createElement('button');b.type='button';b.className='compare-option';b.dataset.compare=c.id;b.dataset.choice=choice.id;b.textContent=choice.label;
      if(compareAnswers[c.id]===choice.id)b.classList.add('is-selected');
      b.addEventListener('click',()=>{compareAnswers[c.id]=choice.id;clearFeedback(3);renderCompare()});
      options.appendChild(b);
    });card.appendChild(options);root.appendChild(card);
  });
}
function renderClues(){
  const root=qs('#clue-grid');root.innerHTML='';
  clueOrder.forEach(c=>{
    const b=document.createElement('button');b.type='button';b.className='clue-card';b.dataset.clue=c.id;b.textContent=c.label;
    if(clueSelected.has(c.id))b.classList.add('is-selected');
    b.addEventListener('click',()=>{clueSelected.has(c.id)?clueSelected.delete(c.id):clueSelected.add(c.id);clearFeedback(3);renderClues()});
    root.appendChild(b);
  });
}
function reset3(){
  state[3].hadError=false; selectedProduct=null; rankPlacement={}; compareAnswers={}; clueSelected=new Set();
  products.forEach(p=>rankPlacement[p.id]=null);
  const oldProducts=productOrder.map(p=>p.id);let ids=shuffleDifferent(products.map(p=>p.id),oldProducts);
  if(ids.every((id,i)=>productById(id).rank===i+1))ids=[ids[1],ids[2],ids[0]];productOrder=ids.map(productById);
  const oldCompare=compareOrder.map(c=>c.id);compareOrder=shuffleDifferent(compareChallenges.map(c=>c.id),oldCompare).map(id=>compareChallenges.find(c=>c.id===id));
  compareChoiceOrders={};compareChallenges.forEach(c=>compareChoiceOrders[c.id]=shuffleDifferent(c.choices));
  const oldClues=clueOrder.map(c=>c.id);clueOrder=shuffleDifferent(clueChoices.map(c=>c.id),oldClues).map(id=>clueChoices.find(c=>c.id===id));
  clearFeedback(3);renderRank();renderCompare();renderClues();
}
qs('#reset-3').addEventListener('click',reset3);
qs('#check-3').addEventListener('click',()=>{
  let all=true;
  products.forEach(p=>{
    const ok=rankPlacement[p.id]===p.rank; const el=qs(`.product-card[data-product="${p.id}"]`);
    if(el){el.classList.remove('is-correct','is-wrong');el.classList.add(ok?'is-correct':'is-wrong')} if(!ok)all=false;
  });
  compareChallenges.forEach(c=>{
    const chosen=compareAnswers[c.id], ok=chosen===c.answer;
    qsa(`.compare-option[data-compare="${c.id}"]`).forEach(b=>{b.classList.remove('is-correct','is-wrong');if(b.dataset.choice===chosen)b.classList.add(ok?'is-correct':'is-wrong')});
    if(!ok)all=false;
  });
  const correctClues=new Set(clueChoices.filter(c=>c.correct).map(c=>c.id));
  const cluesOk=clueSelected.size===correctClues.size && [...correctClues].every(id=>clueSelected.has(id));
  qsa('.clue-card').forEach(b=>{b.classList.remove('is-correct','is-wrong');if(clueSelected.has(b.dataset.clue))b.classList.add(correctClues.has(b.dataset.clue)?'is-correct':'is-wrong')});
  if(!cluesOk)all=false;
  if(!all){
    state[3].hadError=true;
    setFeedback(3,'bad','Il reste au moins une erreur dans les trois défis. Corrige pour comprendre, puis réinitialise l’étape pour tenter un sans-faute.');return;
  }
  if(state[3].hadError){
    setFeedback(3,'train','Les trois défis sont maintenant corrects. Réinitialise l’étape et refais-la sans erreur pour la valider.');
  }else{
    setFeedback(3,'ok','Sans-faute ! Tu sais utiliser une liste d’ingrédients pour raisonner sur le niveau de transformation. Mission réussie !');unlock(3);
  }
});

// ---------- Initialisation ----------
reset1(); reset2(); reset3();

// Preview for visual QA: fills stage 1 completely without validating.
if(new URLSearchParams(location.search).get('preview')==='stage1full'){
  ingredients.forEach(x=>ingredientPlacement[x.id]=x.category);renderStage1();
}

// Internal automated functional test.
if(new URLSearchParams(location.search).get('autotest')==='1'){
  const result=[];
  try{
    // Stage 1 wrong -> correct -> reset -> perfect
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
    products.forEach(p=>rankPlacement[p.id]=p.rank);
    compareChallenges.forEach(c=>compareAnswers[c.id]=c.answer);
    clueChoices.filter(c=>c.correct).forEach(c=>clueSelected.add(c.id));
    renderRank();renderCompare();renderClues();qs('#check-3').click();
    result.push(state[3].validated===true);

    qs('#autotest-result').textContent=result.every(Boolean)?'AUTOTEST_OK':'AUTOTEST_FAIL';
    document.body.dataset.autotest=result.every(Boolean)?'ok':'fail';
  }catch(e){
    qs('#autotest-result').textContent='AUTOTEST_ERROR '+e.message;
    document.body.dataset.autotest='error';
  }
}
