const foods = [
  {id:'pomme', name:'Pomme', img:'assets/foods/pomme.webp', category:'raw'},
  {id:'pommes-de-terre', name:'Pommes de terre', img:'assets/foods/pommes-de-terre.webp', category:'raw'},
  {id:'carottes', name:'Carottes', img:'assets/foods/carottes.webp', category:'raw'},
  {id:'ble', name:'Blé', img:'assets/foods/ble.webp', category:'raw'},
  {id:'fraises', name:'Fraises', img:'assets/foods/fraises.webp', category:'raw'},
  {id:'cerises', name:'Cerises', img:'assets/foods/cerises.webp', category:'raw'},
  {id:'lait', name:'Lait', img:'assets/foods/lait.webp', category:'raw'},
  {id:'cacao', name:'Cacao', img:'assets/foods/cacao.webp', category:'raw'},
  {id:'tournesol', name:'Tournesol', img:'assets/foods/tournesol.webp', category:'raw'},
  {id:'culture-agricole', name:'Récolte agricole', img:'assets/foods/culture-agricole.webp', category:'raw'},
  {id:'farine', name:'Farine', img:'assets/foods/farine.webp', category:'transformed'},
  {id:'compote', name:'Compote', img:'assets/foods/compote.webp', category:'transformed'},
  {id:'confiture', name:'Confiture', img:'assets/foods/confiture.webp', category:'transformed'},
  {id:'puree', name:'Purée', img:'assets/foods/puree.webp', category:'transformed'},
  {id:'huile', name:'Huile', img:'assets/foods/huile.webp', category:'transformed'},
  {id:'tarte-fraises', name:'Tarte aux fraises', img:'assets/foods/tarte-fraises.webp', category:'transformed'},
  {id:'sucre', name:'Sucre', img:'assets/foods/sucre.webp', category:'transformed'},
  {id:'carottes-rapees', name:'Carottes râpées', img:'assets/foods/carottes-rapees.webp', category:'transformed'},
  {id:'chocolat', name:'Chocolat', img:'assets/foods/chocolat.webp', category:'transformed'},
  {id:'yaourt', name:'Yaourt', img:'assets/foods/yaourt.webp', category:'transformed'}
];

const pairs = [
  {raw:'pomme', transformed:'compote'},
  {raw:'pommes-de-terre', transformed:'puree'},
  {raw:'carottes', transformed:'carottes-rapees'},
  {raw:'ble', transformed:'farine'},
  {raw:'tournesol', transformed:'huile'},
  {raw:'cacao', transformed:'chocolat'},
  {raw:'lait', transformed:'yaourt'},
  {raw:'fraises', transformed:'confiture'}
];

const stageState = {
  1:{hadError:false, validated:false},
  2:{hadError:false, validated:false},
  3:{hadError:false, validated:false}
};

function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; }
function foodById(id){ return foods.find(f=>f.id===id); }

function markStageDone(stage){
  stageState[stage].validated=true;
  const tab=qs(`[data-stage="${stage}"]`);
  tab.classList.add('is-done');
  qs(`[data-status="${stage}"]`).textContent='Validé ✓';
  if(stage<3){
    const next=qs(`[data-stage="${stage+1}"]`);
    next.disabled=false;
    qs(`[data-status="${stage+1}"]`).textContent='À faire';
  }else{
    qs('#final-card').classList.remove('is-hidden');
  }
}

function showStage(stage){
  qsa('[data-stage-panel]').forEach(p=>p.classList.toggle('is-hidden',Number(p.dataset.stagePanel)!==stage));
  qsa('.stage-tab').forEach(t=>{
    t.classList.toggle('is-active',Number(t.dataset.stage)===stage);
    t.removeAttribute('aria-current');
  });
  const tab=qs(`[data-stage="${stage}"]`);
  tab.setAttribute('aria-current','step');
  window.scrollTo({top:Math.max(0,qs(`[data-stage-panel="${stage}"]`).offsetTop-20),behavior:'smooth'});
}

qsa('.stage-tab').forEach(tab=>tab.addEventListener('click',()=>{ if(!tab.disabled) showStage(Number(tab.dataset.stage)); }));

function clearFeedback(stage){
  const f=qs(`#feedback-${stage}`);
  f.textContent='';
  f.className='feedback';
  qs(`#restart-${stage}`).classList.add('is-hidden');
}
function report(stage,type,text){
  const f=qs(`#feedback-${stage}`);
  f.className=`feedback ${type}`;
  f.textContent=text;
}

// ----- Étape 1 : tri -----
let placements={};
let selectedFood=null;
foods.forEach(f=>placements[f.id]=null);

function makeFoodCard(food){
  const b=document.createElement('button');
  b.type='button';
  b.className='food-card';
  b.dataset.food=food.id;
  b.innerHTML=`<img src="${food.img}" alt="${food.name}"><span>${food.name}</span>`;
  b.addEventListener('click',(e)=>{
    e.stopPropagation();

    // Si l'aliment est déjà placé, un simple toucher le retire
    // et le remet dans la zone « À classer ».
    if(placements[food.id]!==null){
      placements[food.id]=null;
      selectedFood=null;
      renderSort();
      return;
    }

    // Sinon, on le sélectionne pour le placer dans une catégorie.
    selectedFood = selectedFood===food.id ? null : food.id;
    qsa('.food-card').forEach(x=>x.classList.toggle('is-selected',x.dataset.food===selectedFood));
  });
  return b;
}

function renderSort(){
  const bank=qs('#food-bank'), raw=qs('#bin-raw'), transformed=qs('#bin-transformed');
  bank.innerHTML=''; raw.innerHTML=''; transformed.innerHTML='';
  foods.forEach(food=>{
    const card=makeFoodCard(food);
    if(placements[food.id]==='raw') raw.appendChild(card);
    else if(placements[food.id]==='transformed') transformed.appendChild(card);
    else bank.appendChild(card);
  });
}

function moveSelectedTo(bin){
  if(!selectedFood) return;
  placements[selectedFood]=bin;
  selectedFood=null;
  renderSort();
  qsa('.food-card').forEach(x=>x.classList.remove('is-correct','is-wrong'));
}

qsa('.sort-bin').forEach(bin=>{
  bin.addEventListener('click',()=>moveSelectedTo(bin.dataset.bin));
  bin.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){e.preventDefault();moveSelectedTo(bin.dataset.bin);}
  });
});

qs('#check-1').addEventListener('click',()=>{
  let all=true;
  foods.forEach(food=>{
    const card=qs(`.food-card[data-food="${food.id}"]`);
    if(!card) return;
    card.classList.remove('is-correct','is-wrong');
    const ok=placements[food.id]===food.category;
    card.classList.add(ok?'is-correct':'is-wrong');
    if(!ok) all=false;
  });
  if(!all){
    stageState[1].hadError=true;
    report(1,'bad','Au moins un aliment est mal classé ou n’a pas encore été placé. Touche un aliment mal placé pour le retirer, puis replace-le dans la bonne catégorie. Cette tentative ne pourra plus être validée.');
    return;
  }
  if(stageState[1].hadError){
    report(1,'train','Tout le tri est maintenant correct. Bravo pour la correction ! Recommence l’étape et réalise le classement sans aucune erreur pour la valider.');
    qs('#restart-1').classList.remove('is-hidden');
  }else{
    report(1,'ok','Sans-faute ! Les 20 aliments sont correctement classés. Étape 1 validée.');
    markStageDone(1);
  }
});

qs('#restart-1').addEventListener('click',()=>{
  stageState[1].hadError=false;
  selectedFood=null;
  foods.forEach(f=>placements[f.id]=null);
  clearFeedback(1);
  renderSort();
});

// ----- Étape 2 : associations -----
let selectedRaw=null;
let pairMap={}; // transformed -> raw
const transformedOrder=['chocolat','farine','yaourt','compote','huile','carottes-rapees','confiture','puree'];
const rawOrder=['carottes','cacao','pomme','tournesol','fraises','lait','ble','pommes-de-terre'];

function rawInUse(rawId){ return Object.values(pairMap).includes(rawId); }
function unpairByRaw(rawId){
  Object.keys(pairMap).forEach(t=>{ if(pairMap[t]===rawId) delete pairMap[t]; });
}

function renderPairs(){
  const rawCol=qs('#raw-pairs'), transCol=qs('#transformed-pairs');
  rawCol.innerHTML=''; transCol.innerHTML='';
  const pairNumbers={};
  Object.keys(pairMap).forEach((t,i)=>{ pairNumbers[t]=i+1; });

  rawOrder.forEach(id=>{
    const f=foodById(id);
    const b=document.createElement('button');
    b.type='button'; b.className='pair-card'; b.dataset.raw=id;
    const t=Object.keys(pairMap).find(key=>pairMap[key]===id);
    if(selectedRaw===id) b.classList.add('is-selected');
    if(t) b.classList.add('is-paired');
    b.innerHTML=`<img src="${f.img}" alt="${f.name}"><strong>${f.name}</strong>${t?`<span class="pair-badge">${pairNumbers[t]}</span>`:''}`;
    b.addEventListener('click',()=>{
      qsa('.pair-card').forEach(x=>x.classList.remove('is-correct','is-wrong'));
      if(rawInUse(id)){
        unpairByRaw(id); selectedRaw=null;
      }else{
        selectedRaw=selectedRaw===id?null:id;
      }
      renderPairs();
    });
    rawCol.appendChild(b);
  });

  transformedOrder.forEach(id=>{
    const f=foodById(id);
    const b=document.createElement('button');
    b.type='button'; b.className='pair-card'; b.dataset.transformed=id;
    if(pairMap[id]) b.classList.add('is-paired');
    b.innerHTML=`<img src="${f.img}" alt="${f.name}"><strong>${f.name}</strong>${pairMap[id]?`<span class="pair-badge">${pairNumbers[id]}</span>`:''}`;
    b.addEventListener('click',()=>{
      qsa('.pair-card').forEach(x=>x.classList.remove('is-correct','is-wrong'));
      if(pairMap[id]){
        delete pairMap[id]; selectedRaw=null;
      }else if(selectedRaw){
        unpairByRaw(selectedRaw);
        pairMap[id]=selectedRaw;
        selectedRaw=null;
      }
      renderPairs();
    });
    transCol.appendChild(b);
  });
}

qs('#check-2').addEventListener('click',()=>{
  let all=true;
  pairs.forEach(pair=>{
    const ok=pairMap[pair.transformed]===pair.raw;
    const r=qs(`.pair-card[data-raw="${pair.raw}"]`);
    const t=qs(`.pair-card[data-transformed="${pair.transformed}"]`);
    if(r) r.classList.add(ok?'is-correct':'is-wrong');
    if(t) t.classList.add(ok?'is-correct':'is-wrong');
    if(!ok) all=false;
  });
  if(Object.keys(pairMap).length!==pairs.length) all=false;

  if(!all){
    stageState[2].hadError=true;
    report(2,'bad','Au moins un duo n’est pas correct ou manque. Touche une carte associée pour la libérer, puis essaie de nouveau. Cette tentative devient un entraînement.');
    return;
  }
  if(stageState[2].hadError){
    report(2,'train','Les 8 duos sont maintenant justes. Pour valider l’étape, recommence-la et retrouve tous les duos sans erreur.');
    qs('#restart-2').classList.remove('is-hidden');
  }else{
    report(2,'ok','Les 8 duos sont corrects du premier coup. Étape 2 validée !');
    markStageDone(2);
  }
});

qs('#restart-2').addEventListener('click',()=>{
  stageState[2].hadError=false;
  selectedRaw=null; pairMap={};
  clearFeedback(2); renderPairs();
});

// ----- Étape 3 : défis -----
const challenges={
  apple:{
    container:'#apple-options', type:'text',
    options:[
      {id:'compote',label:'Compote'},{id:'jus',label:'Jus de pomme'},{id:'tarte-pomme',label:'Tarte aux pommes'},
      {id:'yaourt',label:'Yaourt'},{id:'chocolat',label:'Chocolat'}
    ], correct:new Set(['compote','jus','tarte-pomme'])
  },
  tart:{
    container:'#tart-options', type:'food',
    options:['fraises','ble','lait','cacao','pomme'], correct:new Set(['fraises','ble'])
  },
  actions:{
    container:'#action-options', type:'text',
    options:[
      {id:'couper',label:'Couper'},{id:'melanger',label:'Mélanger'},{id:'cuire',label:'Cuire'},
      {id:'ajouter',label:'Ajouter'},{id:'conserver',label:'Conserver'},{id:'tel-quel',label:'Ne rien modifier'}
    ], correct:new Set(['couper','melanger','cuire','ajouter','conserver'])
  }
};
const challengeSelections={apple:new Set(),tart:new Set(),actions:new Set()};

function toggleChallenge(kind,id,button){
  const set=challengeSelections[kind];
  if(set.has(id)) set.delete(id); else set.add(id);
  button.classList.toggle('is-selected',set.has(id));
  button.classList.remove('is-answer','is-bad');
  qs(`[data-challenge="${kind}"]`).classList.remove('is-correct','is-wrong');
}

function renderChallenges(){
  Object.keys(challenges).forEach(kind=>{
    challengeSelections[kind]=new Set();
    const cfg=challenges[kind], area=qs(cfg.container); area.innerHTML='';
    if(cfg.type==='text'){
      cfg.options.forEach(opt=>{
        const b=document.createElement('button');
        b.type='button'; b.className='text-chip'; b.dataset.id=opt.id; b.textContent=opt.label;
        b.addEventListener('click',()=>toggleChallenge(kind,opt.id,b));
        area.appendChild(b);
      });
    }else{
      cfg.options.forEach(id=>{
        const f=foodById(id), b=document.createElement('button');
        b.type='button'; b.className='mini-food'; b.dataset.id=id;
        b.innerHTML=`<img src="${f.img}" alt="${f.name}"><span>${f.name}</span>`;
        b.addEventListener('click',()=>toggleChallenge(kind,id,b));
        area.appendChild(b);
      });
    }
  });
}

function sameSet(a,b){ return a.size===b.size && [...a].every(x=>b.has(x)); }

qs('#check-3').addEventListener('click',()=>{
  let all=true;
  Object.keys(challenges).forEach(kind=>{
    const cfg=challenges[kind], chosen=challengeSelections[kind];
    const ok=sameSet(chosen,cfg.correct);
    const box=qs(`[data-challenge="${kind}"]`);
    box.classList.remove('is-correct','is-wrong');
    box.classList.add(ok?'is-correct':'is-wrong');
    qsa(`${cfg.container} button`).forEach(b=>{
      b.classList.remove('is-answer','is-bad');
      if(b.classList.contains('is-selected')) b.classList.add(cfg.correct.has(b.dataset.id)?'is-answer':'is-bad');
    });
    if(!ok) all=false;
  });

  if(!all){
    stageState[3].hadError=true;
    report(3,'bad','Au moins un défi comporte une réponse en trop ou une réponse manquante. Corrige tes choix : cette tentative sert maintenant d’entraînement.');
    return;
  }
  if(stageState[3].hadError){
    report(3,'train','Tout est désormais correct. Recommence l’étape et réussis les trois défis sans erreur pour obtenir la validation.');
    qs('#restart-3').classList.remove('is-hidden');
  }else{
    report(3,'ok','Sans-faute ! Étape 3 validée. Mission accomplie !');
    markStageDone(3);
  }
});

qs('#restart-3').addEventListener('click',()=>{
  stageState[3].hadError=false;
  clearFeedback(3);
  qsa('.challenge').forEach(x=>x.classList.remove('is-correct','is-wrong'));
  renderChallenges();
});

renderSort();
renderPairs();
renderChallenges();
