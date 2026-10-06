const foods=[
{id:"carotte",label:"Carotte",icon:"🥕",cat:"local"},{id:"laitue",label:"Laitue",icon:"🥬",cat:"local"},
{id:"pdt",label:"Pomme de terre",icon:"🥔",cat:"local"},{id:"poire",label:"Poire",icon:"🍐",cat:"local"},
{id:"pomme",label:"Pomme",icon:"🍎",cat:"local"},{id:"viande",label:"Viande",icon:"🍖",cat:"local"},
{id:"laitier",label:"Produit laitier",icon:"🥛",cat:"local"},{id:"pates",label:"Pâtes",icon:"🍝",cat:"france"},
{id:"chocolat",label:"Chocolat",icon:"🍫",cat:"import"},{id:"riz",label:"Riz",icon:"🍚",cat:"import"},
{id:"saumon",label:"Saumon",icon:"🐟",cat:"import"},{id:"banane",label:"Banane",icon:"🍌",cat:"import"}];

const routes=[
{id:"belgique",place:"Belgique",food:"chocolat",foodLabel:"🍫 Chocolat",distance:"300 km"},
{id:"norvege",place:"Norvège",food:"saumon",foodLabel:"🐟 Saumon",distance:"1 500 km"},
{id:"antilles",place:"Antilles françaises",food:"banane",foodLabel:"🍌 Banane",distance:"7 000 km"},
{id:"cambodge",place:"Cambodge",food:"riz",foodLabel:"🍚 Riz",distance:"10 000 km"}];

const scenarios=[
{q:"Pourquoi la banane est-elle importée dans l’exemple de la séance ?",a:"Le bananier a besoin d’un climat chaud et humide, rare en France métropolitaine à grande échelle.",opts:["Le bananier a besoin d’un climat chaud et humide, rare en France métropolitaine à grande échelle.","Parce qu’une banane ne peut jamais pousser en Europe.","Parce que les bananes ne sont consommées qu’en hiver."]},
{q:"Que signifie « importer un aliment » ?",a:"Faire venir un produit d’un autre pays ou territoire.",opts:["Faire venir un produit d’un autre pays ou territoire.","Cultiver uniquement des aliments près de chez soi.","Transformer un aliment dans une usine française."]},
{q:"La ville travaille avec des agriculteurs de sa région. Comment appelle-t-on cette provenance ?",a:"Une production locale.",opts:["Une production locale.","Une importation.","Une production forcément étrangère."]},
{q:"Pourquoi certains aliments ne poussent-ils pas facilement en France métropolitaine ?",a:"Ils ont besoin de conditions de climat particulières.",opts:["Ils ont besoin de conditions de climat particulières.","Parce que la France interdit leur culture.","Parce que les agriculteurs français ne cultivent aucun fruit."]},
{q:"Notre alimentation dépend-elle uniquement de la production locale ?",a:"Non, elle dépend aussi de productions françaises et d’échanges avec d’autres territoires.",opts:["Oui, tous les aliments sont produits près de chez nous.","Non, elle dépend aussi de productions françaises et d’échanges avec d’autres territoires.","Non, car tous nos aliments sont importés."]}];

const state={1:{error:false,done:false},2:{error:false,done:false},3:{error:false,done:false}};
const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function shuffledDifferent(a){let b=shuffle(a),n=0;while(b.every((x,i)=>x===a[i])&&n++<25)b=shuffle(a);if(b.every((x,i)=>x===a[i]))b=[...a.slice(1),a[0]];return b}
function feedback(n,type,text){const e=qs("#feedback"+n);e.className="feedback "+type;e.textContent=text}
function clearFeedback(n){const e=qs("#feedback"+n);e.className="feedback";e.textContent=""}
function showStage(n){[1,2,3].forEach(i=>qs("#stage"+i).classList.toggle("hidden",i!==n));qsa(".tab").forEach(t=>t.classList.toggle("active",+t.dataset.go===n))}
function complete(n){state[n].done=true;const t=qs(`[data-go="${n}"]`);t.classList.add("done");qs(`[data-status="${n}"]`).textContent="Validé ✓";if(n<3){const nt=qs(`[data-go="${n+1}"]`);nt.disabled=false;qs(`[data-status="${n+1}"]`).textContent="À faire"}else qs("#final").classList.remove("hidden")}
qsa(".tab").forEach(t=>t.onclick=()=>{if(!t.disabled)showStage(+t.dataset.go)});

// STEP 1
let foodOrder=[],foodPlace={},selectedFood=null;
function foodCard(f){const b=document.createElement("button");b.type="button";b.className="food-card";b.dataset.food=f.id;b.innerHTML=`<span>${f.icon}</span>${f.label}`;if(selectedFood===f.id)b.classList.add("selected");b.onclick=e=>{e.stopPropagation();qsa(".food-card").forEach(x=>x.classList.remove("correct","wrong"));if(foodPlace[f.id]){foodPlace[f.id]=null;selectedFood=null;render1();return}selectedFood=selectedFood===f.id?null:f.id;render1()};return b}
function render1(){const bank=qs("#food-bank"),bins={local:qs("#bin-local"),france:qs("#bin-france"),import:qs("#bin-import")};bank.innerHTML="";Object.values(bins).forEach(x=>x.innerHTML="");foodOrder.forEach(f=>(foodPlace[f.id]?bins[foodPlace[f.id]]:bank).appendChild(foodCard(f)));["local","france","import"].forEach(k=>qs("#count-"+k).textContent=Object.values(foodPlace).filter(v=>v===k).length)}
function placeFood(cat){if(!selectedFood)return;foodPlace[selectedFood]=cat;selectedFood=null;clearFeedback(1);render1()}
qsa(".bin").forEach(b=>{b.onclick=()=>placeFood(b.dataset.bin);b.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();placeFood(b.dataset.bin)}}});
function reset1(){state[1].error=false;selectedFood=null;foodOrder=shuffledDifferent(foods);foodPlace={};foods.forEach(f=>foodPlace[f.id]=null);clearFeedback(1);render1()}
qs("#reset1").onclick=reset1;
qs("#check1").onclick=()=>{let all=true;foods.forEach(f=>{const el=qs(`[data-food="${f.id}"]`);const ok=foodPlace[f.id]===f.cat;el?.classList.add(ok?"correct":"wrong");if(!ok)all=false});if(!all){state[1].error=true;feedback(1,"bad","Il reste au moins une erreur ou un aliment non classé. Corrige, puis réinitialise l’étape pour tenter un sans-faute.");return}if(state[1].error)feedback(1,"train","Tout est maintenant correct. Réinitialise l’étape et refais-la sans erreur pour la valider.");else{feedback(1,"ok","Sans-faute ! Étape 1 validée.");complete(1)}};

// STEP 2
let routeFoodOrder=[],distanceOrder=[],routeFoodPlace={},distancePlace={},selectedRoute=null;
function routeItem(type,id,label){const b=document.createElement("button");b.type="button";b.className="route-item";b.dataset.type=type;b.dataset.id=id;b.textContent=label;if(selectedRoute&&selectedRoute.type===type&&selectedRoute.id===id)b.classList.add("selected");b.onclick=e=>{e.stopPropagation();qsa(".route-item").forEach(x=>x.classList.remove("correct","wrong"));const map=type==="food"?routeFoodPlace:distancePlace;if(map[id]){map[id]=null;selectedRoute=null;render2();return}selectedRoute=selectedRoute&&selectedRoute.type===type&&selectedRoute.id===id?null:{type,id};render2()};return b}
function render2(){const fb=qs("#route-food-bank"),db=qs("#distance-bank"),zones=qs("#route-zones");fb.innerHTML="";db.innerHTML="";zones.innerHTML="";
routeFoodOrder.forEach(r=>{const placed=routeFoodPlace[r.food];if(!placed)fb.appendChild(routeItem("food",r.food,r.foodLabel))});
distanceOrder.forEach(d=>{const placed=distancePlace[d];if(!placed)db.appendChild(routeItem("distance",d,d))});
routes.forEach(r=>{const z=document.createElement("section");z.className="route-zone";z.dataset.zone=r.id;z.innerHTML=`<h3>${r.place}</h3><p>Place l’aliment et la distance.</p><div class="route-slots"><div class="route-slot foodslot"><label>ALIMENT</label></div><div class="route-slot distslot"><label>DISTANCE</label></div></div>`;const fp=Object.keys(routeFoodPlace).find(id=>routeFoodPlace[id]===r.id),dp=Object.keys(distancePlace).find(id=>distancePlace[id]===r.id);if(fp){const rr=routes.find(x=>x.food===fp);z.querySelector(".foodslot").appendChild(routeItem("food",fp,rr.foodLabel))}if(dp)z.querySelector(".distslot").appendChild(routeItem("distance",dp,dp));z.onclick=()=>placeRoute(r.id);zones.appendChild(z)})}
function placeRoute(zone){if(!selectedRoute)return;const map=selectedRoute.type==="food"?routeFoodPlace:distancePlace;Object.keys(map).forEach(id=>{if(map[id]===zone)map[id]=null});map[selectedRoute.id]=zone;selectedRoute=null;clearFeedback(2);render2()}
function reset2(){state[2].error=false;selectedRoute=null;routeFoodOrder=shuffledDifferent(routes);distanceOrder=shuffledDifferent(routes.map(r=>r.distance));routeFoodPlace={};distancePlace={};routes.forEach(r=>{routeFoodPlace[r.food]=null;distancePlace[r.distance]=null});clearFeedback(2);render2()}
qs("#reset2").onclick=reset2;
qs("#check2").onclick=()=>{let all=true;qsa(".route-zone").forEach(z=>z.classList.remove("correct","wrong"));routes.forEach(r=>{const ok=routeFoodPlace[r.food]===r.id&&distancePlace[r.distance]===r.id;qs(`[data-zone="${r.id}"]`).classList.add(ok?"correct":"wrong");if(!ok)all=false});if(!all){state[2].error=true;feedback(2,"bad","Au moins une route est incorrecte ou incomplète. Corrige, puis réinitialise l’étape pour tenter un sans-faute.");return}if(state[2].error)feedback(2,"train","Toutes les routes sont maintenant correctes. Réinitialise l’étape et recommence sans erreur.");else{feedback(2,"ok","Sans-faute ! Étape 2 validée.");complete(2)}};

// STEP 3
let questionOrder=[],answers={};
function render3(){const wrap=qs("#quiz3");wrap.innerHTML="";questionOrder.forEach((s,idx)=>{const card=document.createElement("article");card.className="scenario";card.dataset.q=s.q;card.innerHTML=`<h3>${idx+1}. ${s.q}</h3><div class="options"></div>`;const box=card.querySelector(".options");shuffledDifferent(s.opts).forEach(o=>{const b=document.createElement("button");b.type="button";b.className="option";b.textContent=o;if(answers[s.q]===o)b.classList.add("selected");b.onclick=()=>{answers[s.q]=o;qsa(".option",card).forEach(x=>x.classList.remove("selected","correct","wrong"));b.classList.add("selected");clearFeedback(3)};box.appendChild(b)});wrap.appendChild(card)})}
function reset3(){state[3].error=false;answers={};questionOrder=shuffledDifferent(scenarios);clearFeedback(3);render3()}
qs("#reset3").onclick=reset3;
qs("#check3").onclick=()=>{let all=true;questionOrder.forEach(s=>{const card=qs(`.scenario[data-q="${CSS.escape(s.q)}"]`);qsa(".option",card).forEach(b=>{if(b.textContent===s.a&&answers[s.q]===s.a)b.classList.add("correct");else if(b.classList.contains("selected")&&b.textContent!==s.a)b.classList.add("wrong")});if(answers[s.q]!==s.a)all=false});if(!all){state[3].error=true;feedback(3,"bad","Au moins une réponse est incorrecte ou manque. Corrige, puis réinitialise l’étape pour tenter un sans-faute.");return}if(state[3].error)feedback(3,"train","Tout est maintenant correct. Réinitialise l’étape et recommence sans erreur pour la valider.");else{feedback(3,"ok","Sans-faute ! Étape 3 validée. Mission accomplie !");complete(3)}};

reset1();reset2();reset3();
