
const foods = [
  {
    id:'cacao', name:'Fèves de cacao', icon:'🫘', country:'cote-ivoire', countryName:"Côte d’Ivoire", continent:'Afrique',
    clues:["Je suis en Afrique.","Je suis en Afrique de l’Ouest.","Mon pays donne sur le golfe de Guinée."]
  },
  {
    id:'vanille', name:'Gousses de vanille', icon:'🌿', country:'madagascar', countryName:'Madagascar', continent:'Afrique',
    clues:["Je suis en Afrique.","Je suis une grande île de l’océan Indien.","Je me trouve à l’est du Mozambique."]
  },
  {
    id:'the', name:'Feuilles de thé', icon:'🍃', country:'chine', countryName:'Chine', continent:'Asie',
    clues:["Je suis en Asie.","Je suis en Asie de l’Est.","Mon vaste territoire borde l’océan Pacifique."]
  },
  {
    id:'riz', name:'Grains de riz', icon:'🌾', country:'inde', countryName:'Inde', continent:'Asie',
    clues:["Je suis en Asie.","Je suis en Asie du Sud.","Mon pays forme une grande péninsule qui s’avance dans l’océan Indien."]
  },
  {
    id:'olives', name:'Olives', icon:'🫒', country:'espagne', countryName:'Espagne', continent:'Europe',
    clues:["Je suis en Europe.","Je suis dans le sud-ouest de l’Europe.","Je suis sur la péninsule Ibérique, à l’ouest de la France."]
  },
  {
    id:'saumon', name:'Saumon', icon:'🐟', country:'norvege', countryName:'Norvège', continent:'Europe',
    clues:["Je suis en Europe.","Je suis en Europe du Nord.","Mon pays occupe l’ouest de la péninsule Scandinave."]
  },
  {
    id:'cafe', name:'Grains de café', icon:'🫘', country:'bresil', countryName:'Brésil', continent:'Amérique',
    clues:["Je suis en Amérique.","Je suis en Amérique du Sud.","Je suis le plus vaste pays d’Amérique du Sud et je borde l’océan Atlantique."]
  },
  {
    id:'banane', name:'Banane', icon:'🍌', country:'equateur', countryName:'Équateur', continent:'Amérique',
    clues:["Je suis en Amérique.","Je suis sur la côte pacifique de l’Amérique du Sud.","La ligne de l’équateur traverse mon pays."]
  },
  {
    id:'avocat', name:'Avocat', icon:'🥑', country:'mexique', countryName:'Mexique', continent:'Amérique',
    clues:["Je suis en Amérique.","Je suis en Amérique du Nord.","Mon pays se trouve juste au sud des États-Unis."]
  },
  {
    id:'kiwi', name:'Kiwi', icon:'🥝', country:'nouvelle-zelande', countryName:'Nouvelle-Zélande', continent:'Océanie',
    clues:["Je suis en Océanie.","Je me trouve au sud-est de l’Australie.","Mon pays est formé principalement de deux grandes îles."]
  }
];

const countries = [
  {id:'mexique',name:'Mexique',x:11.5,y:45.5},
  {id:'equateur',name:'Équateur',x:20.7,y:57.0},
  {id:'bresil',name:'Brésil',x:29.0,y:64.3},
  {id:'espagne',name:'Espagne',x:47.0,y:34.0},
  {id:'norvege',name:'Norvège',x:53.0,y:23.0},
  {id:'cote-ivoire',name:"Côte d’Ivoire",x:49.5,y:50.7},
  {id:'madagascar',name:'Madagascar',x:61.0,y:67.0},
  {id:'inde',name:'Inde',x:70.8,y:45.4},
  {id:'chine',name:'Chine',x:80.5,y:36.5},
  {id:'nouvelle-zelande',name:'Nouvelle-Zélande',x:94.0,y:78.0}
];

const continentLabels = [
  {name:'AMÉRIQUE',x:23,y:38},{name:'EUROPE',x:50.5,y:27},{name:'AFRIQUE',x:52,y:52},
  {name:'ASIE',x:75,y:28},{name:'OCÉANIE',x:84,y:70},{name:'ANTARCTIQUE',x:55,y:89}
];

const qs=(s,r=document)=>r.querySelector(s);
const qsa=(s,r=document)=>[...r.querySelectorAll(s)];

function shuffle(items){
  const a=[...items];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function shuffledDifferent(items,previous=[]){
  let a=shuffle(items),tries=0;
  while(previous.length===a.length && a.every((x,i)=>x===previous[i]) && tries++<30) a=shuffle(items);
  if(previous.length===a.length && a.every((x,i)=>x===previous[i])) a=[...a.slice(1),a[0]];
  return a;
}
function foodById(id){return foods.find(f=>f.id===id)}
function countryById(id){return countries.find(c=>c.id===id)}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}

const state = {
  1:{hadError:false,validated:false},
  2:{hadError:false,validated:false}
};

function addStaticSpeakers(){
  qsa('.readable').forEach(host=>{
    if(host.dataset.speakerReady) return;
    host.dataset.speakerReady='1';
    const b=document.createElement('button');
    b.type='button';b.className='speaker';
    b.dataset.speak=[...host.childNodes].filter(n=>!(n.nodeType===1 && n.classList?.contains('speaker'))).map(n=>n.textContent||'').join(' ').replace(/\s+/g,' ').trim();
    b.setAttribute('aria-label','Lire ce texte');b.textContent='🔊';
    host.appendChild(b);
  });
}

function setFeedback(stage,type,text){
  const el=qs(`#feedback-${stage}`);
  el.className=`feedback ${type}`;
  el.innerHTML=`<span>${escapeHtml(text)}</span><button type="button" class="speaker" data-speak="${escapeHtml(text)}" aria-label="Lire le message">🔊</button>`;
}
function clearFeedback(stage){
  const el=qs(`#feedback-${stage}`);el.className='feedback';el.innerHTML='';
}

function showStage(n){
  [1,2].forEach(i=>qs(`#stage-${i}`).classList.toggle('is-hidden',i!==n));
  qsa('.stage-tab').forEach(t=>t.classList.toggle('is-active',+t.dataset.stage===n));
  window.scrollTo({top:Math.max(0,qs(`#stage-${n}`).offsetTop-20),behavior:'smooth'});
}
qsa('.stage-tab').forEach(t=>t.addEventListener('click',()=>{if(!t.disabled) showStage(+t.dataset.stage)}));

function unlock(stage){
  state[stage].validated=true;
  const tab=qs(`[data-stage="${stage}"]`);
  tab.classList.add('is-done');
  qs(`[data-status="${stage}"]`).textContent='Validé ✓';
  if(stage===1){
    const n=qs('[data-stage="2"]');n.disabled=false;qs('[data-status="2"]').textContent='À faire';
  }else{
    qs('#final-card').classList.remove('is-hidden');
    qs('#knowledge-summary').classList.remove('is-hidden');
    renderSummary();
  }
}

function foodCardElement(food,{mini=false,onRemove=null,onSelect=null,selected=false}={}){
  const b=document.createElement('div');
  b.className=`food-card${mini?' food-card--mini':''}${selected?' is-selected':''}`;
  b.dataset.food=food.id;
  b.setAttribute('role','button');
  b.setAttribute('tabindex','0');
  b.innerHTML=`<span class="food-card__icon">${food.icon}</span><span class="food-card__name">${food.name}</span><button type="button" class="speaker" data-speak="${escapeHtml(food.name)}" aria-label="Lire ${escapeHtml(food.name)}">🔊</button>`;
  b.querySelector('.speaker').addEventListener('click',e=>e.stopPropagation());
  if(onRemove) b.addEventListener('click',e=>{if(e.target.closest('.speaker'))return;onRemove(food.id)});
  else if(onSelect) b.addEventListener('click',e=>{if(e.target.closest('.speaker'))return;onSelect(food.id)});
  b.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){
      e.preventDefault();
      if(onRemove) onRemove(food.id);
      else if(onSelect) onSelect(food.id);
    }
  });
  return b;
}

// ------------------------------------------------------------
// Drag pointer : utilisable souris + tactile. Le tap reste disponible.
// ------------------------------------------------------------
let drag = null;
function bindPointerDrag(el,foodId,onDrop){
  let startX=0,startY=0,moved=false,pointerId=null,ghost=null;
  el.addEventListener('pointerdown',e=>{
    if(e.target.closest('.speaker')) return;
    if(e.button!==undefined && e.button!==0) return;
    pointerId=e.pointerId;startX=e.clientX;startY=e.clientY;moved=false;
    drag={foodId,onDrop,source:el};
    el.setPointerCapture?.(pointerId);
  });
  el.addEventListener('pointermove',e=>{
    if(!drag || drag.source!==el || e.pointerId!==pointerId) return;
    const d=Math.hypot(e.clientX-startX,e.clientY-startY);
    if(!moved && d<10) return;
    if(!moved){
      moved=true;
      ghost=el.cloneNode(true);
      ghost.classList.add('drag-ghost');
      ghost.querySelectorAll('.speaker').forEach(x=>x.remove());
      document.body.appendChild(ghost);
    }
    e.preventDefault();
    ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';
    qsa('.country-target').forEach(x=>x.classList.remove('is-dragover'));
    const under=document.elementFromPoint(e.clientX,e.clientY)?.closest('.country-target');
    if(under) under.classList.add('is-dragover');
  });
  el.addEventListener('pointerup',e=>{
    if(!drag || drag.source!==el || e.pointerId!==pointerId) return;
    const wasMoved=moved;
    if(ghost){ghost.remove();ghost=null}
    qsa('.country-target').forEach(x=>x.classList.remove('is-dragover'));
    if(wasMoved){
      const under=document.elementFromPoint(e.clientX,e.clientY)?.closest('.country-target');
      if(under) onDrop(foodId,under.dataset.country);
      el.dataset.suppressClick=String(Date.now()+350);
    }
    drag=null;moved=false;pointerId=null;
  });
}

function renderMap(containerId,placements,onCountryClick,onRemove,stage){
  const map=qs(containerId);map.innerHTML='';
  continentLabels.forEach(c=>{
    const el=document.createElement('span');el.className='continent-label';el.textContent=c.name;el.style.left=c.x+'%';el.style.top=c.y+'%';map.appendChild(el);
  });
  countries.forEach(c=>{
    const target=document.createElement('div');
    target.className='country-target';target.dataset.country=c.id;
    target.setAttribute('role','button');target.setAttribute('tabindex','0');
    target.style.left=c.x+'%';target.style.top=c.y+'%';
    target.innerHTML=`<span class="country-target__name">${c.name}</span><button type="button" class="speaker" data-speak="${escapeHtml(c.name)}" aria-label="Lire ${escapeHtml(c.name)}">🔊</button><div class="country-target__slot"></div>`;
    target.querySelector('.speaker').addEventListener('click',e=>e.stopPropagation());
    target.addEventListener('click',e=>{
      if(e.target.closest('.speaker') || e.target.closest('.map-food-token')) return;
      onCountryClick(c.id);
    });
    target.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){
        e.preventDefault();
        onCountryClick(c.id);
      }
    });
    const foodId=Object.keys(placements).find(id=>placements[id]===c.id);
    if(foodId){
      const f=foodById(foodId);
      const tok=document.createElement('div');tok.className='map-food-token';tok.dataset.food=foodId;
      tok.innerHTML=`<span>${f.icon}</span><span>${f.name}</span>`;
      tok.title='Toucher pour retirer cet aliment';
      tok.addEventListener('click',e=>{e.stopPropagation();onRemove(foodId)});
      target.querySelector('.country-target__slot').appendChild(tok);
    }
    map.appendChild(target);
  });
}

// ------------------------------------------------------------
// Étape 1
// ------------------------------------------------------------
let order1=[],placement1={},selected1=null;

function select1(id){
  const until=Number(qs(`[data-food="${id}"]`)?.dataset.suppressClick||0);
  if(Date.now()<until) return;
  selected1=selected1===id?null:id;clearFeedback(1);render1();
}
function remove1(id){placement1[id]=null;selected1=null;clearFeedback(1);render1()}
function place1(foodId,countryId){
  const displaced=Object.keys(placement1).find(id=>placement1[id]===countryId && id!==foodId);
  if(displaced) placement1[displaced]=null;
  placement1[foodId]=countryId;selected1=null;clearFeedback(1);render1();
}
function countryClick1(countryId){if(selected1) place1(selected1,countryId)}
function render1(){
  const bank=qs('#food-bank-1');bank.innerHTML='';
  order1.forEach(id=>{
    if(placement1[id]) return;
    const f=foodById(id);
    const b=foodCardElement(f,{onSelect:select1,selected:selected1===id});
    bindPointerDrag(b,id,place1);bank.appendChild(b);
  });
  renderMap('#map-1',placement1,countryClick1,remove1,1);
}
function reset1(){
  state[1].hadError=false;selected1=null;placement1={};foods.forEach(f=>placement1[f.id]=null);
  order1=shuffledDifferent(foods.map(f=>f.id),order1);
  qsa('#map-1 .country-target').forEach(x=>x.classList.remove('is-correct','is-wrong'));
  clearFeedback(1);render1();
}
qs('#reset-1').addEventListener('click',reset1);

qs('#check-1').addEventListener('click',()=>{
  let all=true;
  foods.forEach(f=>{
    if(placement1[f.id]!==f.country) all=false;
  });
  qsa('#map-1 .country-target').forEach(target=>{
    const c=target.dataset.country;
    const assigned=Object.keys(placement1).find(id=>placement1[id]===c);
    target.classList.remove('is-correct','is-wrong');
    if(assigned) target.classList.add(foodById(assigned).country===c?'is-correct':'is-wrong');
  });
  if(!all){
    state[1].hadError=true;
    setFeedback(1,'bad','Il reste au moins une erreur ou un aliment non placé. Corrige tes associations, puis réinitialise l’étape pour tenter un sans-faute.');
    return;
  }
  if(state[1].hadError){
    setFeedback(1,'train','Tout est maintenant correct. Réinitialise l’étape et recommence-la sans erreur pour obtenir la validation.');
  }else{
    setFeedback(1,'ok','Sans-faute ! Tu as retrouvé les dix pays producteurs. L’enquête avec indices est débloquée.');
    unlock(1);
  }
});

// ------------------------------------------------------------
// Étape 2
// ------------------------------------------------------------
let order2=[],placement2={},current2=null,hints2={};

function chooseCurrent2(id){current2=id;render2()}
function remove2(id){placement2[id]=null;current2=id;clearFeedback(2);render2()}
function nextUnplaced2(except=null){
  return order2.find(id=>!placement2[id] && id!==except) || order2.find(id=>!placement2[id]) || current2 || order2[0];
}
function place2(foodId,countryId){
  const displaced=Object.keys(placement2).find(id=>placement2[id]===countryId && id!==foodId);
  if(displaced) placement2[displaced]=null;
  placement2[foodId]=countryId;
  clearFeedback(2);
  const next=nextUnplaced2(foodId);
  current2=next;
  render2();
}
function countryClick2(countryId){if(current2) place2(current2,countryId)}
function revealHint(n){
  hints2[current2]=Math.max(hints2[current2]||1,n);
  renderCluePanel();
}
function renderCluePanel(){
  const panel=qs('#clue-panel');
  const f=foodById(current2);
  const count=hints2[current2]||1;
  const clueRows=f.clues.slice(0,count).map((t,i)=>`
    <div class="clue-row"><strong>Indice ${i+1} :</strong> ${t}
      <button type="button" class="speaker" data-speak="${escapeHtml('Indice '+(i+1)+'. '+t)}" aria-label="Lire cet indice">🔊</button>
    </div>`).join('');
  panel.innerHTML=`
    <div class="clue-card">
      <div id="current-food-card" class="clue-food">
        <span class="clue-food__icon">${f.icon}</span>
        <span class="clue-food__name">${f.name}</span>
        <button type="button" class="speaker" data-speak="${escapeHtml(f.name)}" aria-label="Lire ${escapeHtml(f.name)}">🔊</button>
      </div>
      <div class="clue-content">
        <h3>Dans quel pays producteur dois-tu placer cet aliment ?</h3>
        <div class="clue-list">${clueRows}</div>
        <div class="clue-hidden">
          ${count<2?'<button class="hint-btn" id="hint-2" type="button">Afficher l’indice 2</button>':''}
          ${count<3?'<button class="hint-btn" id="hint-3" type="button">Afficher l’indice 3</button>':''}
        </div>
        <div class="clue-progress">${placement2[f.id]?'Réponse placée : tu peux la modifier.':'Cet aliment n’est pas encore placé.'}</div>
      </div>
    </div>`;
  qs('#hint-2')?.addEventListener('click',()=>revealHint(2));
  qs('#hint-3')?.addEventListener('click',()=>revealHint(3));
  qs('#current-food-card .speaker')?.addEventListener('click',e=>e.stopPropagation());
  bindPointerDrag(qs('#current-food-card'),f.id,place2);
}

function renderReview(){
  const wrap=qs('#review-strip');wrap.innerHTML='';
  order2.forEach(id=>{
    const f=foodById(id);
    const b=document.createElement('button');b.type='button';
    b.className=`review-item${current2===id?' is-current':''}${placement2[id]?' is-placed':''}`;
    b.innerHTML=`<span class="review-item__icon">${f.icon}</span><span><span class="review-item__name">${f.name}</span><span class="review-item__state">${placement2[id]?'placé':'à placer'}</span></span>`;
    b.addEventListener('click',()=>chooseCurrent2(id));
    wrap.appendChild(b);
  });
}
function render2(){
  renderCluePanel();
  renderMap('#map-2',placement2,countryClick2,remove2,2);
  renderReview();
}
function reset2(){
  state[2].hadError=false;placement2={};hints2={};
  foods.forEach(f=>{placement2[f.id]=null;hints2[f.id]=1});
  order2=shuffledDifferent(foods.map(f=>f.id),order2);
  current2=order2[0];clearFeedback(2);render2();
}
qs('#reset-2').addEventListener('click',reset2);

qs('#check-2').addEventListener('click',()=>{
  let all=true;
  foods.forEach(f=>{if(placement2[f.id]!==f.country)all=false});
  qsa('#map-2 .country-target').forEach(target=>{
    const c=target.dataset.country;
    const assigned=Object.keys(placement2).find(id=>placement2[id]===c);
    target.classList.remove('is-correct','is-wrong');
    if(assigned) target.classList.add(foodById(assigned).country===c?'is-correct':'is-wrong');
  });
  if(!all){
    state[2].hadError=true;
    setFeedback(2,'bad','Au moins une association est encore incorrecte ou incomplète. Utilise les indices, corrige, puis réinitialise l’étape pour tenter un sans-faute.');
    return;
  }
  if(state[2].hadError){
    setFeedback(2,'train','Toutes les associations sont maintenant correctes. Réinitialise l’étape et refais-la entièrement sans erreur pour la valider.');
  }else{
    setFeedback(2,'ok','Sans-faute ! Tu as utilisé la carte et les indices pour retrouver les pays producteurs. Mission accomplie !');
    unlock(2);
  }
});

function renderSummary(){
  const wrap=qs('#summary-grid');wrap.innerHTML='';
  foods.forEach(f=>{
    const div=document.createElement('div');div.className='summary-card';
    div.innerHTML=`<strong>${f.icon} ${f.name} → ${f.countryName}</strong><small>${f.continent}</small><button type="button" class="speaker" data-speak="${escapeHtml(f.name+' : '+f.countryName+', '+f.continent)}" aria-label="Lire cette association">🔊</button>`;
    div.querySelector('.speaker').style.position='absolute';div.querySelector('.speaker').style.right='8px';div.querySelector('.speaker').style.top='8px';
    wrap.appendChild(div);
  });
}

addStaticSpeakers();
reset1();
reset2();
