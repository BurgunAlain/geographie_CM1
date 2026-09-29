
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

const effectPairs = [
  {effect:'Rendre un produit plus épais ou plus crémeux', func:'Texture'},
  {effect:'Modifier le goût', func:'Goût'},
  {effect:'Donner de la couleur', func:'Couleur'},
  {effect:'Conserver un aliment plus longtemps', func:'Conservation'}
];

const products = [
  {id:'fruit', title:'Un fruit', ingredients:'Ingrédients : pomme.', rank:1},
  {id:'compote', title:'Une compote', ingredients:'Ingrédients : pomme, sucre, vitamine C.', rank:2},
  {id:'industriel', title:'Un dessert industriel', ingredients:'Ingrédients : farine, sucre, huile, sirop de glucose, cacao, émulsifiant, arôme, colorant, conservateur…', rank:3}
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
let effectOrder=[], functionOrder=[];
let selectedEffect=null, pairMap={}; // func -> effect

function effectInUse(effect){return Object.values(pairMap).includes(effect)}
function removePairByEffect(effect){Object.keys(pairMap).forEach(f=>{if(pairMap[f]===effect)delete pairMap[f]})}
function renderStage2(){
  const ec=qs('#effect-column'), fc=qs('#function-column');
  ec.innerHTML='';fc.innerHTML='';
  const nums={};Object.keys(pairMap).forEach((f,i)=>nums[f]=i+1);
  effectOrder.forEach(effect=>{
    const b=document.createElement('button');b.type='button';b.className='pair-card';b.dataset.effect=effect;
    const linked=Object.keys(pairMap).find(f=>pairMap[f]===effect);
    if(selectedEffect===effect)b.classList.add('is-selected');
    if(linked)b.classList.add('is-paired');
    b.innerHTML=`<strong>${effect}</strong>${linked?`<span class="pair-badge">${nums[linked]}</span>`:''}`;
    b.addEventListener('click',()=>{
      clearFeedback(2);
      if(effectInUse(effect)){removePairByEffect(effect);selectedEffect=null}
      else selectedEffect=selectedEffect===effect?null:effect;
      renderStage2();
    });
    ec.appendChild(b);
  });
  functionOrder.forEach(func=>{
    const b=document.createElement('button');b.type='button';b.className='pair-card';b.dataset.func=func;
    if(pairMap[func])b.classList.add('is-paired');
    b.innerHTML=`<strong>${func}</strong>${pairMap[func]?`<span class="pair-badge">${nums[func]}</span>`:''}`;
    b.addEventListener('click',()=>{
      clearFeedback(2);
      if(pairMap[func]){delete pairMap[func];selectedEffect=null}
      else if(selectedEffect){removePairByEffect(selectedEffect);pairMap[func]=selectedEffect;selectedEffect=null}
      renderStage2();
    });
    fc.appendChild(b);
  });
}
function reset2(){
  state[2].hadError=false; selectedEffect=null;pairMap={};
  const oldEffects=[...effectOrder], oldFunctions=[...functionOrder];
  effectOrder=shuffleDifferent(effectPairs.map(x=>x.effect),oldEffects);
  functionOrder=shuffleDifferent(effectPairs.map(x=>x.func),oldFunctions);
  // Évite aussi que les bonnes associations se retrouvent toutes face à face par hasard.
  let tries=0;
  const expectedFunc = effect => effectPairs.find(p=>p.effect===effect).func;
  while(effectOrder.every((effect,i)=>expectedFunc(effect)===functionOrder[i]) && tries++<50){
    functionOrder=shuffleDifferent(effectPairs.map(x=>x.func),functionOrder);
  }
  clearFeedback(2);renderStage2();
}
qs('#reset-2').addEventListener('click',reset2);
qs('#check-2').addEventListener('click',()=>{
  let all=true;
  effectPairs.forEach(p=>{
    const ok=pairMap[p.func]===p.effect;
    const e=qs(`.pair-card[data-effect="${CSS.escape(p.effect)}"]`);
    const f=qs(`.pair-card[data-func="${CSS.escape(p.func)}"]`);
    if(e)e.classList.add(ok?'is-correct':'is-wrong');
    if(f)f.classList.add(ok?'is-correct':'is-wrong');
    if(!ok)all=false;
  });
  if(Object.keys(pairMap).length!==4)all=false;
  if(!all){
    state[2].hadError=true;
    setFeedback(2,'bad','Au moins une association est incorrecte ou manque. Tu peux toucher une carte déjà associée pour libérer le duo.');
    return;
  }
  if(state[2].hadError){
    setFeedback(2,'train','Les quatre associations sont maintenant correctes. Réinitialise l’étape et recommence sans erreur pour la valider.');
  }else{
    setFeedback(2,'ok','Sans-faute ! Tu connais les quatre rôles présentés dans la séance. Étape 2 validée.');
    unlock(2);
  }
});

// ---------- ÉTAPE 3 ----------
let productOrder=[], selectedProduct=null, rankPlacement={}; // product -> rank

function productById(id){return products.find(x=>x.id===id)}
function makeProductCard(p){
  const b=document.createElement('button');b.type='button';b.className='product-card';b.dataset.product=p.id;
  if(selectedProduct===p.id)b.classList.add('is-selected');
  b.innerHTML=`<h3>${p.title}</h3><p>${p.ingredients}</p>`;
  b.addEventListener('click',e=>{
    e.stopPropagation();
    if(rankPlacement[p.id]){
      rankPlacement[p.id]=null;selectedProduct=null;renderStage3();return;
    }
    selectedProduct=selectedProduct===p.id?null:p.id;renderStage3();
  });
  return b;
}
function renderStage3(){
  const bank=qs('#rank-bank');bank.innerHTML='';
  [1,2,3].forEach(r=>qs(`#rank-${r}`).innerHTML='');
  productOrder.forEach(p=>{
    const card=makeProductCard(p);
    const r=rankPlacement[p.id];
    (r?qs(`#rank-${r}`):bank).appendChild(card);
  });
}
function placeRank(rank){
  if(!selectedProduct)return;
  // one product per slot: displaced card returns to bank
  Object.keys(rankPlacement).forEach(id=>{if(rankPlacement[id]===rank)rankPlacement[id]=null});
  rankPlacement[selectedProduct]=rank;selectedProduct=null;renderStage3();clearFeedback(3);
}
qsa('.rank-slot').forEach(slot=>{
  slot.addEventListener('click',()=>placeRank(Number(slot.dataset.rank)));
  slot.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();placeRank(Number(slot.dataset.rank))}})
});
function reset3(){
  state[3].hadError=false;selectedProduct=null;rankPlacement={};
  products.forEach(p=>rankPlacement[p.id]=null);
  const old=productOrder.map(p=>p.id);
  let ids=shuffleDifferent(products.map(p=>p.id),old);
  // La banque ne doit jamais présenter directement l’ordre 1 → 2 → 3.
  if(ids.every((id,i)=>productById(id).rank===i+1)) ids=[ids[1],ids[2],ids[0]];
  productOrder=ids.map(productById);
  clearFeedback(3);renderStage3();
}
qs('#reset-3').addEventListener('click',reset3);
qs('#check-3').addEventListener('click',()=>{
  let all=true;
  products.forEach(p=>{
    const ok=rankPlacement[p.id]===p.rank;
    const el=qs(`.product-card[data-product="${p.id}"]`);
    if(el){el.classList.remove('is-correct','is-wrong');el.classList.add(ok?'is-correct':'is-wrong')}
    if(!ok)all=false;
  });
  if(!all){
    state[3].hadError=true;
    setFeedback(3,'bad','L’ordre n’est pas encore correct. Observe la longueur des listes d’ingrédients et corrige tes choix.');
    return;
  }
  if(state[3].hadError){
    setFeedback(3,'train','L’ordre est maintenant correct. Réinitialise l’étape et refais-la sans erreur pour la valider.');
  }else{
    setFeedback(3,'ok','Sans-faute ! Tu as classé les trois produits du moins transformé au plus transformé. Mission réussie !');
    unlock(3);
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
    effectPairs.forEach(p=>pairMap[p.func]=p.effect);renderStage2();qs('#check-2').click();
    result.push(state[2].validated===true);

    // Stage 3 perfect
    products.forEach(p=>rankPlacement[p.id]=p.rank);renderStage3();qs('#check-3').click();
    result.push(state[3].validated===true);

    qs('#autotest-result').textContent=result.every(Boolean)?'AUTOTEST_OK':'AUTOTEST_FAIL';
    document.body.dataset.autotest=result.every(Boolean)?'ok':'fail';
  }catch(e){
    qs('#autotest-result').textContent='AUTOTEST_ERROR '+e.message;
    document.body.dataset.autotest='error';
  }
}
