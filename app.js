const SUPA_URL="https://vqpdrncugaipfpcmpout.supabase.co";
const SUPA_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcGRybmN1Z2FpcGZwY21wb3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwODcxNTUsImV4cCI6MjA5MTY2MzE1NX0.5EZ026A8BvsbPuffe9dyg-Qo7yL3vXvOqxEwb35KY_E";
const HEADERS={"apikey":SUPA_KEY,"Authorization":"Bearer "+SUPA_KEY,"Content-Type":"application/json"};
const WA="34622922173";
const WA_MSG={educacion:"Hola, te escribo desde la app de Perros de la Isla. Me interesa el servicio de Educación canina básica y avanzada.",reactividad:"Hola, te escribo desde la app de Perros de la Isla. Me interesa el servicio de Control de reactividad e impulsividad.",cachorros:"Hola, te escribo desde la app de Perros de la Isla. Me interesa el programa de Educación temprana para cachorros.",ansiedad:"Hola, te escribo desde la app de Perros de la Isla. Me interesa el servicio de Gestión de ansiedad y miedos.",general:"Hola, te escribo desde la app de Perros de la Isla. Me gustaría consultarte sobre vuestros servicios de adiestramiento."};
const VICTORIA_TEMA={educacion:'basica',reactividad:'reactividad',cachorros:'cachorros',ansiedad:'ansiedad'};
const VICTORIA_URL='https://perrosdelaisla.github.io/hola/';
function openWhatsApp(s){
  if(VICTORIA_TEMA[s]){
    window.open(VICTORIA_URL+'?tema='+VICTORIA_TEMA[s]+'&origen=paseos','_blank');
    return false;
  }
  window.open("https://wa.me/"+WA+"?text="+encodeURIComponent(WA_MSG[s]||WA_MSG.general),"_blank");
  return false;
}

function previewPhotos(event){
  const files=Array.from(event.target.files||[]);
  const currentTotal=(editMode?existingPhotos.length:0)+selectedPhotos.length;
  const slots=4-currentTotal;
  if(slots<=0){showToast('Máximo 4 fotos','error');return;}
  const toAdd=files.slice(0,slots);
  if(files.length>slots) showToast(`Solo se añaden ${slots} foto${slots>1?'s':''}`,'error');
  selectedPhotos.push(...toAdd);
  renderPhotoPreviews();
  event.target.value='';
}

function renderPhotoPreviews(){
  const list=document.getElementById('previewList');
  const wrap=document.getElementById('previewWrap');
  const counter=document.getElementById('photoCount');
  if(!list||!wrap||!counter) return;
  const totalCount=(editMode?existingPhotos.length:0)+selectedPhotos.length;
  counter.textContent=totalCount;
  if(totalCount===0){wrap.style.display='none';list.innerHTML='';return;}
  wrap.style.display='block';
  list.innerHTML='';
  // Fotos ya subidas (solo en modo edición)
  if(editMode){
    existingPhotos.forEach((url,idx)=>{
      const div=document.createElement('div');
      div.className='preview-thumb';
      div.innerHTML=`<img src="${url}" class="clickable-img" onclick="openImage('${url}')"><button class="remove" onclick="removeExistingPhoto(${idx})" type="button">✕</button>`;
      list.appendChild(div);
    });
  }
  // Fotos nuevas (File objects)
  selectedPhotos.forEach((file,idx)=>{
    const reader=new FileReader();
    reader.onload=function(e){
      const div=document.createElement('div');
      div.className='preview-thumb';
      div.innerHTML=`<img src="${e.target.result}" class="clickable-img" onclick="openImage('${e.target.result}')"><button class="remove" onclick="removePhoto(${idx})" type="button">✕</button>`;
      list.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}

function removePhoto(idx){
  selectedPhotos.splice(idx,1);
  renderPhotoPreviews();
}

function removeExistingPhoto(idx){
  existingPhotos.splice(idx,1);
  renderPhotoPreviews();
}
function abrirCamara(){const input=document.getElementById('foto');input.setAttribute('capture','environment');input.click();}
function abrirGaleria(){const input=document.getElementById('foto');input.removeAttribute('capture');input.click();}
function previewRutaPhoto(event){
  const file=event.target.files[0];
  const wrap=document.getElementById('rutaPreviewWrap');
  const img=document.getElementById('rutaPreviewImg');
  if(!file){wrap.style.display='none';img.src='';img.onclick=null;return;}
  const reader=new FileReader();
  reader.onload=function(e){
    img.src=e.target.result;
    img.onclick=()=>openImage(e.target.result);
    wrap.style.display='block';
  };
  reader.readAsDataURL(file);
}

// TIPO DE PELIGRO
const PELIGRO_ICONS={Procesionaria:'🐛',Garrapatas:'🕷️',Cristales:'🔪',Veneno:'☠️',Otro:'⚠️'};
const PELIGRO_COLORS={Procesionaria:'#c0392b',Garrapatas:'#8e44ad',Cristales:'#e67e22',Veneno:'#2c3e50',Otro:'#7f8c8d'};
function getPeligroIcon(tipo){return PELIGRO_ICONS[tipo]||'⚠️';}
function getPeligroColor(tipo){return PELIGRO_COLORS[tipo]||'#c0392b';}
function updateRiesgoOptions(){const tipo=document.getElementById('inp-tipo').value;const otroGroup=document.getElementById('otro-peligro-group');otroGroup.style.display=tipo==='Otro'?'block':'none';}

let profilePhotoFile=null;
let selectedPhotos=[]; // Array de File objects para el reporte actual (máx 4)
let editMode=false;
let editingId=null;
let editingOriginalLat=null;
let editingOriginalLng=null;
let existingPhotos=[]; // URLs de fotos ya subidas que se mantienen al editar
function previewProfilePhoto(event){const file=event.target.files[0];if(!file) return;profilePhotoFile=file;const reader=new FileReader();reader.onload=function(e){document.getElementById('onb-foto-preview').innerHTML=`<img src="${e.target.result}" alt="Tu foto">`;};reader.readAsDataURL(file);}

// ===== INSIGNIAS DE ALERTA =====
const BADGES_ALERTAS=[
  {id:'primer_rastro',emoji:'🐾',name:'Primer Rastro',desc:'Primer avistamiento reportado',check:(r,v)=>r>=1},
  {id:'olfato_fino',emoji:'👃',name:'Olfato Fino',desc:'10 avistamientos reportados',check:(r,v)=>r>=10},
  {id:'perro_explorador',emoji:'🧭',name:'Perro Explorador',desc:'Reportado en 5+ municipios',check:(r,v)=>r>=5},
  {id:'lider_manada',emoji:'🐺',name:'Líder de Manada',desc:'20 confirmaciones dadas',check:(r,v)=>v>=20},
  {id:'leyenda_isla',emoji:'👑',name:'Leyenda de la Isla',desc:'Top 10 del año',check:(r,v)=>r>=25&&v>=50},
  {id:'expedicionario',emoji:'⚡',name:'Expedicionario',desc:'Activo toda la temporada',check:(r,v)=>r>=8&&v>=15}
];

// ===== INSIGNIAS DE RUTAS =====
const BADGES_RUTAS=[
  {id:'olfateador_caminos',emoji:'🗺️',name:'Olfateador de Caminos',desc:'Sugerir tu primera ruta',check:(rt,rv)=>rt>=1},
  {id:'patas_inquietas',emoji:'🥾',name:'Patas Inquietas',desc:'3 rutas sugeridas',check:(rt,rv)=>rt>=3},
  {id:'explorador_isla',emoji:'🏔️',name:'Explorador de la Isla',desc:'10 rutas sugeridas',check:(rt,rv)=>rt>=10},
  {id:'cartografo_canino',emoji:'🌍',name:'Cartógrafo Canino',desc:'20 rutas sugeridas',check:(rt,rv)=>rt>=20},
  {id:'ruta_dorada',emoji:'⭐',name:'Ruta Dorada',desc:'1 ruta verificada por Perros de la Isla',check:(rt,rv)=>rv>=1},
  {id:'rastro_confianza',emoji:'🏅',name:'Rastro de Confianza',desc:'5 rutas verificadas por Perros de la Isla',check:(rt,rv)=>rv>=5},
  {id:'trazador_pro',emoji:'📐',name:'Trazador Pro',desc:'Ruta con 10+ puntos de trazado',check:(rt,rv,hasDetailedRoute)=>hasDetailedRoute},
  {id:'alpha_manada',emoji:'👑',name:'Alpha de la Manada',desc:'15 rutas + 3 verificadas',check:(rt,rv)=>rt>=15&&rv>=3}
];

function getHighestBadge(r,v){const u=BADGES_ALERTAS.filter(b=>b.check(r,v));return u.length>0?u[u.length-1]:null;}

// ===== INSIGNIAS DE DIFUSIÓN =====
const BADGES_SHARES=[
  {id:'altavoz_perruno',emoji:'📢',name:'Altavoz Perruno',desc:'Compartir la app 1 vez',check:(s)=>s>=1},
  {id:'megafono_manada',emoji:'📣',name:'Megáfono de la Manada',desc:'Compartir 5 veces',check:(s)=>s>=5},
  {id:'embajador_canino',emoji:'🔊',name:'Embajador Canino',desc:'Compartir 15 veces',check:(s)=>s>=15},
  {id:'viral_isla',emoji:'👑',name:'Viral de la Isla',desc:'Compartir 30 veces',check:(s)=>s>=30}
];

function renderAllBadges(reports,votes,rutasTotal,rutasVerificadas,hasDetailedRoute,sharesCount){
  document.getElementById('badges-grid-alertas').innerHTML=BADGES_ALERTAS.map(b=>{const u=b.check(reports,votes);return `<div class="badge-item ${u?'unlocked':'locked'}"><span class="badge-emoji">${u?b.emoji:'🔒'}</span><div class="badge-name">${b.name}</div><div class="badge-desc">${b.desc}</div></div>`;}).join('');
  document.getElementById('badges-grid-rutas').innerHTML=BADGES_RUTAS.map(b=>{const u=b.check(rutasTotal,rutasVerificadas,hasDetailedRoute);return `<div class="badge-item ${u?'unlocked-ruta':'locked'}"><span class="badge-emoji">${u?b.emoji:'🔒'}</span><div class="badge-name">${b.name}</div><div class="badge-desc">${b.desc}</div></div>`;}).join('');
  document.getElementById('badges-grid-shares').innerHTML=BADGES_SHARES.map(b=>{const u=b.check(sharesCount||0);return `<div class="badge-item ${u?'unlocked-share':'locked'}"><span class="badge-emoji">${u?b.emoji:'🔒'}</span><div class="badge-name">${b.name}</div><div class="badge-desc">${b.desc}</div></div>`;}).join('');
}

// PERFIL
function getUserId(){let id=localStorage.getItem('pdi_user_id');if(!id){id='u_'+Date.now()+'_'+Math.random().toString(36).substr(2,9);localStorage.setItem('pdi_user_id',id);}return id;}
const USER_ID=getUserId();
function getProfile(){const p=localStorage.getItem('pdi_profile');return p?JSON.parse(p):null;}

document.addEventListener('DOMContentLoaded',()=>{
  const profile=getProfile();
  if(profile){document.getElementById('onboarding').classList.add('hidden');updateProfileBtn();}

  const im=document.getElementById('imgModal');
  if(im){
    im.addEventListener('click',(e)=>{
      if(e.target.id==='imgModal'||e.target.id==='imgModalWrap') closeImage();
    });
  }
  const imContent=document.getElementById('imgModalContent');
  if(imContent){
    let lastTap=0;
    imContent.addEventListener('click',(e)=>{
      e.stopPropagation();
      const now=Date.now();
      if(now-lastTap<350){imContent.classList.toggle('zoomed');}
      lastTap=now;
    });
  }
  document.addEventListener('keydown',(e)=>{
    if(e.key==='Escape'){
      const im=document.getElementById('imgModal');
      if(im&&im.style.display==='flex') closeImage();
    }
  });
});

async function uploadProfilePhoto(file){try{const compressed=await compressImage(file,400,0.8);const fn='profile_'+USER_ID+'_'+Date.now()+'.jpg';const ur=await fetch(SUPA_URL+"/storage/v1/object/avistamientos/"+fn,{method:"POST",headers:{"apikey":SUPA_KEY,"Authorization":"Bearer "+SUPA_KEY,"Content-Type":"image/jpeg"},body:compressed});if(ur.ok) return SUPA_URL+"/storage/v1/object/public/avistamientos/"+fn;}catch(e){console.error('Error subiendo foto perfil:',e);}return null;}

// Anti-abuso: validar que un nombre tenga 2+ letras reales (no solo puntos/números)
function validateName(name){
  if(!name) return false;
  const trimmed = name.trim();
  if(trimmed.length < 2) return false;
  const letterMatches = trimmed.match(/[a-záéíóúñüA-ZÁÉÍÓÚÑÜ]/g);
  return letterMatches !== null && letterMatches.length >= 2;
}

// Variable temporal para guardar los datos pendientes mientras se muestra el modal de recuperación
let pendingProfileData = null;

async function saveProfile(){
  const nombre=document.getElementById('onb-nombre').value.trim();
  const perro=document.getElementById('onb-perro').value.trim();
  const zona=document.getElementById('onb-zona').value;
  const visible=document.getElementById('onb-visible').checked;
  if(!validateName(nombre)){showToast('Escribe tu nombre real (al menos 2 letras)','error');return;}
  if(!validateName(perro)){showToast('Escribe el nombre de tu perro (al menos 2 letras)','error');return;}

  // ANTI-DUPLICADOS: si ya existe un perfil en localStorage, es edición — saltamos la comprobación
  const existing = getProfile();
  if(!existing){
    try {
      const nombreEnc = encodeURIComponent(nombre);
      const perroEnc = encodeURIComponent(perro);
      const zonaEnc = encodeURIComponent(zona);
      const r = await fetch(SUPA_URL+`/rest/v1/usuarios?nombre=eq.${nombreEnc}&nombre_perro=eq.${perroEnc}&zona=eq.${zonaEnc}&select=*`,{headers:HEADERS});
      const matches = await r.json();
      if(Array.isArray(matches) && matches.length > 0){
        pendingProfileData = {nombre, perro, zona, visible};
        const duplicate = matches[0];
        showRecoverModal(duplicate);
        return;
      }
    } catch(e){
      console.error('Error comprobando duplicados:', e);
      // Si falla la comprobación, continuar normal (no bloquear al usuario)
    }
  }

  await finalizeSaveProfile(nombre, perro, zona, visible);
}

async function finalizeSaveProfile(nombre, perro, zona, visible){
  let fotoUrl=getProfile()?.foto||null;
  if(profilePhotoFile){showToast('Subiendo foto...','success');fotoUrl=await uploadProfilePhoto(profilePhotoFile);profilePhotoFile=null;}
  const profile={nombre,nombre_perro:perro,zona,visible,foto:fotoUrl,created_at:getProfile()?.created_at||new Date().toISOString()};
  localStorage.setItem('pdi_profile',JSON.stringify(profile));
  fetch(SUPA_URL+"/rest/v1/usuarios",{method:"POST",headers:{...HEADERS,"Prefer":"return=minimal,resolution=merge-duplicates"},body:JSON.stringify({id:USER_ID,nombre,nombre_perro:perro,zona,visible,foto:fotoUrl})}).catch(()=>{});
  document.getElementById('onboarding').classList.add('hidden');
  updateProfileBtn();
  showToast(`¡Bienvenido/a ${nombre}! 🐾`,'success');
}

async function showRecoverModal(duplicate){
  const avatar = document.getElementById('recoverAvatar');
  if(duplicate.foto){
    avatar.innerHTML = `<img src="${duplicate.foto}" alt="" style="width:100%;height:100%;object-fit:cover">`;
  } else {
    avatar.innerHTML = '';
    avatar.textContent = duplicate.nombre.charAt(0).toUpperCase();
  }
  document.getElementById('recoverName').textContent = duplicate.nombre;
  document.getElementById('recoverDog').textContent = '🐕 ' + duplicate.nombre_perro;
  document.getElementById('recoverZone').textContent = '📍 ' + duplicate.zona;

  let statsText = '';
  try {
    const [alertsRes, rutasRes] = await Promise.all([
      fetch(SUPA_URL+`/rest/v1/avistamientos?reporter_id=eq.${duplicate.id}&select=id`,{headers:HEADERS}),
      fetch(SUPA_URL+`/rest/v1/rutas?reporter_id=eq.${duplicate.id}&select=id`,{headers:HEADERS})
    ]);
    const alerts = await alertsRes.json();
    const rutas = await rutasRes.json();
    const parts = [];
    if(Array.isArray(alerts) && alerts.length > 0) parts.push(`${alerts.length} alerta${alerts.length > 1 ? 's' : ''}`);
    if(Array.isArray(rutas) && rutas.length > 0) parts.push(`${rutas.length} ruta${rutas.length > 1 ? 's' : ''}`);
    if(duplicate.shares > 0) parts.push(`${duplicate.shares} share${duplicate.shares > 1 ? 's' : ''}`);
    statsText = parts.length > 0 ? '📊 ' + parts.join(' · ') : '📊 Sin actividad aún';
  } catch(e){
    statsText = '';
  }
  document.getElementById('recoverStats').textContent = statsText;

  document.getElementById('recoverModal').setAttribute('data-recover-id', duplicate.id);
  document.getElementById('recoverModal').classList.add('open');
}

async function recoverAcceptProfile(){
  const duplicateId = document.getElementById('recoverModal').getAttribute('data-recover-id');
  if(!duplicateId){showToast('Error al recuperar perfil','error');return;}

  try {
    const r = await fetch(SUPA_URL+`/rest/v1/usuarios?id=eq.${duplicateId}&select=*`,{headers:HEADERS});
    const [profile] = await r.json();
    if(!profile){showToast('No se encontró el perfil','error');return;}

    localStorage.setItem('pdi_user_id', duplicateId);

    const localProfile = {
      nombre: profile.nombre,
      nombre_perro: profile.nombre_perro,
      zona: profile.zona,
      visible: profile.visible,
      foto: profile.foto,
      created_at: profile.created_at
    };
    localStorage.setItem('pdi_profile', JSON.stringify(localProfile));

    document.getElementById('recoverModal').classList.remove('open');
    document.getElementById('onboarding').classList.add('hidden');
    pendingProfileData = null;
    showToast(`¡Bienvenido de vuelta, ${profile.nombre}! 🐾`,'success');
    setTimeout(() => { location.reload(); }, 1200);
  } catch(e){
    console.error('Error recuperando perfil:', e);
    showToast('Error al recuperar, inténtalo de nuevo','error');
  }
}

async function recoverDeclineProfile(){
  if(!pendingProfileData){showToast('Error inesperado','error');return;}
  const {nombre, perro, zona, visible} = pendingProfileData;

  let sufijo = 2;
  try {
    const nombreEnc = encodeURIComponent(nombre);
    const r = await fetch(SUPA_URL+`/rest/v1/usuarios?nombre=like.${nombreEnc}*&nombre_perro=eq.${encodeURIComponent(perro)}&zona=eq.${encodeURIComponent(zona)}&select=nombre`,{headers:HEADERS});
    const matches = await r.json();
    if(Array.isArray(matches)) sufijo = matches.length + 1;
  } catch(e){}

  const nombreConSufijo = `${nombre} (${sufijo})`;
  document.getElementById('recoverModal').classList.remove('open');
  pendingProfileData = null;
  await finalizeSaveProfile(nombreConSufijo, perro, zona, visible);
}

function updateProfileBtn(){
  const btn=document.getElementById('headerProfileBtn');
  const p=getProfile();
  if(p){
    btn.classList.add('has-profile');
    if(p.foto){btn.innerHTML=`<img src="${p.foto}" alt="${p.nombre}">`;}
    else{btn.textContent=p.nombre.charAt(0).toUpperCase();}
  }
}

async function openProfile(){
  const p=getProfile();
  if(!p){document.getElementById('onboarding').classList.remove('hidden');return;}
  const avatar=document.getElementById('prof-avatar');
  // BUG 3 FIX: onclick directo en la <img>, no en el div contenedor
  if(p.foto){
    avatar.innerHTML=`<img src="${p.foto}" alt="${p.nombre}" class="clickable-img" onclick="openImage('${p.foto}')">`;
    avatar.classList.add('clickable');
  }else{
    avatar.textContent=p.nombre.charAt(0).toUpperCase();
    avatar.classList.remove('clickable');
  }
  document.getElementById('prof-name').textContent=p.nombre;
  document.getElementById('prof-dog').textContent='🐕 '+p.nombre_perro;
  document.getElementById('prof-zone').textContent='📍 '+p.zona;
  const since=p.created_at?new Date(p.created_at):new Date();
  const months=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  document.getElementById('prof-since').textContent='Miembro desde '+months[since.getMonth()]+' '+since.getFullYear();
  const voteCount=Object.keys(localStorage).filter(k=>k.startsWith('pdi_conf_')).length;
  document.getElementById('prof-confirms').textContent=voteCount;

  let reportCount=0;
  try{const r=await fetch(SUPA_URL+`/rest/v1/avistamientos?reporter_id=eq.${USER_ID}&select=id`,{headers:HEADERS});const data=await r.json();reportCount=data.length||0;}catch(e){}
  document.getElementById('prof-reports').textContent=reportCount;

  let rutasTotal=0,rutasVerificadas=0,hasDetailedRoute=false;
  try{
    const rr=await fetch(SUPA_URL+`/rest/v1/rutas?reporter_id=eq.${USER_ID}&select=id,verificada,waypoints`,{headers:HEADERS});
    const rutasData=await rr.json();
    rutasTotal=rutasData.length||0;
    rutasVerificadas=rutasData.filter(r=>r.verificada).length;
    hasDetailedRoute=rutasData.some(r=>r.waypoints&&r.waypoints.length>=10);
  }catch(e){}
  document.getElementById('prof-rutas').textContent=rutasTotal;

  let sharesCount=0;
  try{
    const sr=await fetch(SUPA_URL+`/rest/v1/usuarios?id=eq.${USER_ID}&select=shares`,{headers:HEADERS});
    const[su]=await sr.json();
    sharesCount=su?.shares||0;
  }catch(e){}
  document.getElementById('prof-shares').textContent=sharesCount;

  renderAllBadges(reportCount,voteCount,rutasTotal,rutasVerificadas,hasDetailedRoute,sharesCount);

  // POSICIÓN EN EL RANKING
  try {
    const [usersRes, alertasRes, rutasRes] = await Promise.all([
      fetch(SUPA_URL+'/rest/v1/usuarios?select=id,shares',{headers:HEADERS}),
      fetch(SUPA_URL+'/rest/v1/avistamientos?select=reporter_id&status=eq.activo',{headers:HEADERS}),
      fetch(SUPA_URL+'/rest/v1/rutas?select=reporter_id,verificada&status=eq.activo',{headers:HEADERS})
    ]);
    const usersAll = await usersRes.json();
    const alertasAll = await alertasRes.json();
    const rutasAll = await rutasRes.json();

    const scoresAll = {};
    alertasAll.forEach(a => { if(a.reporter_id) scoresAll[a.reporter_id] = (scoresAll[a.reporter_id]||0) + 10; });
    rutasAll.forEach(r => {
      if(r.reporter_id){
        scoresAll[r.reporter_id] = (scoresAll[r.reporter_id]||0) + 15;
        if(r.verificada) scoresAll[r.reporter_id] += 25;
      }
    });
    usersAll.forEach(u => { if(u.shares && u.shares > 0) scoresAll[u.id] = (scoresAll[u.id]||0) + (u.shares*5); });

    const ranking = usersAll
      .map(u => ({id: u.id, score: scoresAll[u.id]||0}))
      .filter(u => u.score > 0)
      .sort((a,b) => b.score - a.score);

    const myScore = scoresAll[USER_ID] || 0;
    const myPosition = ranking.findIndex(u => u.id === USER_ID) + 1;
    const totalWithScore = ranking.length;

    const banner = document.getElementById('rankBanner');
    const posEl = document.getElementById('rankBannerPosition');
    if(banner && posEl){
      banner.style.display = 'flex';
      if(myScore === 0 || myPosition === 0){
        banner.classList.add('no-rank');
        posEl.textContent = 'Aún sin puntos · Toca para ver ranking';
      } else {
        banner.classList.remove('no-rank');
        const medalEmoji = myPosition === 1 ? '🥇 ' : myPosition === 2 ? '🥈 ' : myPosition === 3 ? '🥉 ' : '';
        posEl.textContent = `${medalEmoji}#${myPosition} de ${totalWithScore} · ${myScore} pts`;
      }
    }
  } catch(e){
    console.error('Error calculando ranking:', e);
    const banner = document.getElementById('rankBanner');
    if(banner) banner.style.display = 'none';
  }

  document.getElementById('profileModal').classList.add('open');
}

function closeProfile(){document.getElementById('profileModal').classList.remove('open');}
function editProfile(){closeProfile();const p=getProfile();if(p){document.getElementById('onb-nombre').value=p.nombre;document.getElementById('onb-perro').value=p.nombre_perro;document.getElementById('onb-zona').value=p.zona;document.getElementById('onb-visible').checked=p.visible;if(p.foto){document.getElementById('onb-foto-preview').innerHTML=`<img src="${p.foto}" alt="Tu foto">`;}}profilePhotoFile=null;document.getElementById('onboarding').classList.remove('hidden');}

// HELPERS
function escapeHtml(t){if(t===null||t===undefined) return '';return String(t).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
function getDistance(lat1,lng1,lat2,lng2){const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLng=(lng2-lng1)*Math.PI/180;const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
function timeAgo(d){if(!d) return 'Fecha desconocida';const m=Math.floor((Date.now()-new Date(d).getTime())/60000);if(m<1) return 'Ahora mismo';if(m<60) return `Hace ${m} min`;const h=Math.floor(m/60);if(h<24) return `Hace ${h} h`;const dd=Math.floor(h/24);if(dd<30) return `Hace ${dd} día${dd>1?'s':''}`;const mm=Math.floor(dd/30);return `Hace ${mm} mes${mm>1?'es':''}`;}
function isHistorico(d){if(!d) return false;return(Date.now()-new Date(d).getTime())/86400000>30;}
function colorForRisk(a){const now=Date.now();if(a.denials&&a.denials>=2) return '#27ae60';if(a.last_confirmed_at){const ch=(now-new Date(a.last_confirmed_at).getTime())/3600000;if(ch<=48) return '#c0392b';}if(a.created_at){const ah=(now-new Date(a.created_at).getTime())/3600000;if(ah<=48) return '#e67e22';if(ah<=168) return '#f1c40f';}return '#7f8c8d';}
function createRiskIcon(color,faded){const o=faded?0.5:1;return L.divIcon({html:`<div style="background:${color};width:13px;height:13px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.6);opacity:${o}"></div>`,iconSize:[13,13],iconAnchor:[6,6],className:''});}
function createRutaIcon(verificada){return L.divIcon({html:`<div class="ruta-marker ${verificada?'verificada-marker':'pendiente-marker'}">${verificada?'✅':'🐕'}</div>`,iconSize:[28,28],iconAnchor:[14,14],className:''});}

// BUG 4 FIX: toast z-index subido en CSS (6500) y duración 4500ms
function showToast(msg,type){const t=document.getElementById('toast');t.textContent=msg;t.className='toast show '+(type||'success');setTimeout(()=>t.classList.remove('show'),4500);}

function checkHotZone(){const box=document.getElementById('hotZoneBox'),text=document.getElementById('hotZoneText');if(!box||!text) return;if(!userLat||!userLng){box.style.display='none';return;}const items=document.querySelectorAll('.avist-item');if(items.length===0){box.style.display='none';return;}if(items.length>=3){box.style.display='block';box.style.borderColor='#c0392b';text.textContent='🚨 Zona caliente: varios reportes cerca';return;}if(items.length>=1){box.style.display='block';box.style.borderColor='#e67e22';text.textContent='⚠️ Precaución: hay reportes cercanos';return;}box.style.display='block';box.style.borderColor='#27ae60';text.textContent='✅ Sin actividad cercana';}
function calcWaypointsDistance(wps){if(!wps||wps.length<2) return null;let total=0;for(let i=1;i<wps.length;i++){total+=getDistance(wps[i-1].lat,wps[i-1].lng,wps[i].lat,wps[i].lng);}return total;}

// VETS
const vets=[{name:"Veterinary Hospital Canis",addr:"C/ Agnès de Pacs 12, Palma",phone:"+34971732100",rating:4.3,reviews:3123,h24:true,zone:"palma",lat:39.5956,lng:2.6529,maps:"https://maps.google.com/?q=39.5956,2.6529"},{name:"AniCura Aragó Hospital Veterinari",addr:"C/ Son Morro 4, Palma",phone:"+34971479354",rating:4.1,reviews:1612,h24:true,zone:"palma",lat:39.5741,lng:2.6872,maps:"https://maps.google.com/?q=39.5741,2.6872"},{name:"Hospital Veterinari Ciutat d'Inca",addr:"C/ dels Pagesos 14, Inca",phone:"+34971505483",rating:4.1,reviews:759,h24:true,zone:"inca",lat:39.7123,lng:2.9122,maps:"https://maps.google.com/?q=39.7123,2.9122"},{name:"MiVet Hospital Veterinario",addr:"Ctra. Palma-Artà km 47, Manacor",phone:"+34971845047",rating:3.9,reviews:331,h24:true,zone:"manacor",lat:39.5723,lng:3.1937,maps:"https://maps.google.com/?q=39.5723,3.1937"},{name:"Veterclinic Son Servera",addr:"Av. de la Constitució 19, Son Servera",phone:"+34971567474",rating:4.6,reviews:484,h24:true,zone:"manacor",lat:39.6183,lng:3.3633,maps:"https://maps.google.com/?q=39.6183,3.3633"},{name:"Clínica Veterinaria Peludets",addr:"C/ de Jesús 36, Palma",phone:"+34640377985",rating:4.6,reviews:387,h24:false,zone:"palma",lat:39.5822,lng:2.6438,maps:"https://maps.google.com/?q=39.5822,2.6438"},{name:"Calvià Veterinaris",addr:"Santa Ponça, Calvià",phone:"+34971690000",rating:4.5,reviews:210,h24:false,zone:"calvia",lat:39.5081,lng:2.4766,maps:"https://maps.google.com/?q=39.5081,2.4766"},{name:"Centre Veterinari Llucmajor",addr:"Av. Jaume III, Llucmajor",phone:"+34971660000",rating:4.4,reviews:168,h24:false,zone:"llucmajor",lat:39.4907,lng:2.8911,maps:"https://maps.google.com/?q=39.4907,2.8911"}];
function renderVets(list){document.getElementById('vet-list').innerHTML=list.map(v=>`<div class="vet-card"><div class="vet-top"><div class="vet-ico">🏥</div><div style="flex:1"><div class="vet-name">${v.name}</div><div class="vet-addr">${v.addr}</div><div class="badges-row">${v.h24?'<span class="badge-24h">24H URGENCIAS</span>':''}</div><div style="font-size:11px;color:#aaa;margin-top:4px">${v.h24?"🟢 Abierto 24 horas":"🟠 Llamar para confirmar urgencia"}</div></div></div><div class="vet-rating"><span>⭐</span> ${v.rating} · ${v.reviews.toLocaleString()} reseñas</div><div class="vet-actions"><button class="btn-call" onclick="window.location.href='tel:${v.phone}'">📞 Llamar</button><button class="btn-nav" onclick="window.open('${v.maps}')">🧭 Cómo llegar</button></div></div>`).join('');}
function filterVets(zone,btn){document.querySelectorAll('.filtro').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderVets(zone==='all'?vets:zone==='24h'?vets.filter(v=>v.h24):vets.filter(v=>v.zone===zone));}
renderVets(vets);

// NAV
function showTab(id,btn){document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));document.getElementById(id).classList.add('active');btn.classList.add('active');if(id==='mapa') setTimeout(()=>{initMap();if(window.map) window.map.invalidateSize();},100);window.scrollTo({top:0,behavior:'smooth'});}

// MAP MODE TOGGLE
let currentMapMode='avistamientos';
let rutasLayer,avistamientosLayer;
let cachedAvistamientos=[];
function switchMapMode(mode,btn){currentMapMode=mode;document.querySelectorAll('.map-toggle button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const ac=document.getElementById('avistamientos-content');const rc=document.getElementById('rutas-content');if(mode==='avistamientos'){ac.classList.add('active');rc.classList.remove('active');if(rutasLayer) rutasLayer.clearLayers();loadAvistamientos();}else{rc.classList.add('active');ac.classList.remove('active');if(markersLayer) markersLayer.clearLayers();loadRutas();}if(window.map) window.map.invalidateSize();}

// MAP
let markersLayer,selectedLat=null,selectedLng=null,tempMarker=null,mapInit=false;
let reportMode=false,userLat=null,userLng=null,userMarker=null,isSubmitting=false;
let namesCache={};

// TRACING STATE
let traceMode=false,traceWaypoints=[],traceMarkers=[],tracePolyline=null;

async function loadNamesCache(ids){const toFetch=ids.filter(id=>id&&!namesCache[id]);if(toFetch.length===0) return;try{const qs=toFetch.map(id=>`"${id}"`).join(',');const res=await fetch(SUPA_URL+`/rest/v1/usuarios?id=in.(${qs})&select=id,nombre,nombre_perro,zona,visible,foto`,{headers:HEADERS});const users=await res.json();users.forEach(u=>{namesCache[u.id]=u.visible?{name:u.nombre+' y '+u.nombre_perro+' 🐕',foto:u.foto||null}:{name:'Un vecino de '+u.zona,foto:null};});toFetch.forEach(id=>{if(!namesCache[id]) namesCache[id]={name:'Un vecino de Mallorca',foto:null};});}catch(e){}}

// CAMBIO 4: capas de mapa — orden de ciclo y etiquetas
const MAP_LAYERS_ORDER=['topo','street','satellite','dark'];
const MAP_LAYER_NEXT_LABELS={topo:'🗺️ Callejero',street:'🛰️ Satélite',satellite:'🌑 Oscuro',dark:'🥾 Senderos'};

function initMap(){
  if(mapInit) return;mapInit=true;
  markersLayer=L.layerGroup();rutasLayer=L.layerGroup();

  // CAMBIO 4 PASO 2: maxZoom:19 en el mapa
  window.map=L.map('map',{zoomControl:false,maxZoom:19}).setView([39.65,2.95],9);
  markersLayer.addTo(window.map);rutasLayer.addTo(window.map);

  // CAMBIO 4 PASO 1: 4 capas de mapa
  window.topoLayer=L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',{attribution:'© OpenTopoMap',maxZoom:17,maxNativeZoom:17});
  window.darkLayer=L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{attribution:'© CartoDB',maxZoom:19});
  window.streetLayer=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',maxZoom:19});
  window.satelliteLayer=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{attribution:'© Esri',maxZoom:19});

  // CAMBIO 4 PASO 3: capa inicial topo, botón muestra siguiente (Callejero)
  window.currentLayer='topo';
  window.topoLayer.addTo(window.map);
  document.getElementById('layerToggleBtn').innerHTML='🗺️ Callejero';

  window.rIcon=createRiskIcon('#c0392b');
  const bIcon=L.divIcon({html:'<div style="background:#2980b9;width:13px;height:13px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.6)"></div>',iconSize:[13,13],iconAnchor:[6,6],className:''});

  window.map.on('click',function(e){
    if(traceMode){
      const pt={lat:e.latlng.lat,lng:e.latlng.lng};
      traceWaypoints.push(pt);
      updateTraceUI();
      const idx=traceWaypoints.length;
      let icon;
      if(idx===1){icon=L.divIcon({html:'<div class="wp-start">A</div>',iconSize:[22,22],iconAnchor:[11,11],className:''});}
      else{icon=L.divIcon({html:'<div class="wp-mid"></div>',iconSize:[14,14],iconAnchor:[7,7],className:''});}
      const mk=L.marker([pt.lat,pt.lng],{icon}).addTo(window.map);
      traceMarkers.push(mk);
      if(idx>=3){traceMarkers[idx-2].setIcon(L.divIcon({html:'<div class="wp-mid"></div>',iconSize:[14,14],iconAnchor:[7,7],className:''}));}
      if(idx>=2){traceMarkers[idx-1].setIcon(L.divIcon({html:'<div class="wp-end">B</div>',iconSize:[22,22],iconAnchor:[11,11],className:''}));}
      const latlngs=traceWaypoints.map(w=>[w.lat,w.lng]);
      if(tracePolyline){tracePolyline.setLatLngs(latlngs);}else{tracePolyline=L.polyline(latlngs,{color:'#2980b9',weight:4,opacity:0.8,dashArray:'8,6'}).addTo(window.map);}
      return;
    }
    if(!reportMode && !editMode) return;
    selectedLat=e.latlng.lat;selectedLng=e.latlng.lng;checkHotZone();
    if(tempMarker) window.map.removeLayer(tempMarker);
    const draggable=editMode;
    tempMarker=L.marker([selectedLat,selectedLng],{icon:window.rIcon,draggable}).addTo(window.map);
    if(draggable){
      tempMarker.on('dragend',ev=>{const ll=ev.target.getLatLng();selectedLat=ll.lat;selectedLng=ll.lng;});
    } else {
      tempMarker.bindPopup("📍 Ubicación seleccionada").openPopup();
    }
    // Actualizar input de ubicación con reverse geocoding
    setTimeout(()=>{fetch(`https://nominatim.openstreetmap.org/reverse?lat=${selectedLat}&lon=${selectedLng}&format=json`).then(r=>r.json()).then(d=>{const lugar=d.address.city||d.address.town||d.address.village||"Zona desconocida";document.getElementById('inp-ubicacion').value=lugar+" ("+selectedLat.toFixed(5)+", "+selectedLng.toFixed(5)+")";}).catch(()=>{});},100);
    // Solo en modo reportar, abrir modal (en modo edición ya está abierto)
    if(reportMode && !editMode){
      openModal();
      reportMode=false;
    }
  });

  vets.forEach(v=>{L.marker([v.lat,v.lng],{icon:bIcon}).addTo(window.map).bindPopup(`<div style="font-size:13px">🏥 <b>${v.name}</b><br><small>${v.addr}</small><br><br><a href="tel:${v.phone}" style="display:block;margin-bottom:6px;background:#c0392b;color:#fff;padding:6px;border-radius:6px;text-align:center;text-decoration:none">📞 Llamar</a><a href="${v.maps}" target="_blank" style="display:block;background:#3498db;color:#fff;padding:6px;border-radius:6px;text-align:center;text-decoration:none">🧭 Cómo llegar</a></div>`);});
  loadAvistamientos();
}

// CAMBIO 4 PASO 4: función toggleMapLayer cicla entre 4 capas
function toggleMapLayer(e){
  if(e){e.stopPropagation();e.preventDefault();}
  const btn=document.getElementById('layerToggleBtn');
  if(window.currentLayer==='topo') window.map.removeLayer(window.topoLayer);
  else if(window.currentLayer==='street') window.map.removeLayer(window.streetLayer);
  else if(window.currentLayer==='satellite') window.map.removeLayer(window.satelliteLayer);
  else if(window.currentLayer==='dark') window.map.removeLayer(window.darkLayer);
  const idx=MAP_LAYERS_ORDER.indexOf(window.currentLayer);
  const next=MAP_LAYERS_ORDER[(idx+1)%MAP_LAYERS_ORDER.length];
  window.currentLayer=next;
  if(next==='topo') window.topoLayer.addTo(window.map);
  else if(next==='street') window.streetLayer.addTo(window.map);
  else if(next==='satellite') window.satelliteLayer.addTo(window.map);
  else if(next==='dark') window.darkLayer.addTo(window.map);
  btn.innerHTML=MAP_LAYER_NEXT_LABELS[next];
}

// TRACING FUNCTIONS
function updateTraceUI(){const n=traceWaypoints.length;document.getElementById('traceCount').textContent=n+' punto'+(n!==1?'s':'');document.getElementById('btnTraceUndo').disabled=n===0;document.getElementById('btnTraceDone').disabled=n<2;const hint=document.getElementById('traceHint');if(n===0) hint.innerHTML='<strong>Toca el mapa</strong> para marcar el punto de inicio de tu ruta.';else if(n===1) hint.innerHTML='Punto de inicio marcado. <strong>Toca el mapa</strong> para añadir el siguiente punto.';else hint.innerHTML=`Ruta con <strong>${n} puntos</strong> · ${calcTraceDistance()} · Sigue añadiendo o pulsa <strong>Listo</strong>.`;}
function calcTraceDistance(){if(traceWaypoints.length<2) return '0 m';let total=0;for(let i=1;i<traceWaypoints.length;i++){total+=getDistance(traceWaypoints[i-1].lat,traceWaypoints[i-1].lng,traceWaypoints[i].lat,traceWaypoints[i].lng);}if(total<1) return Math.round(total*1000)+' m';return total.toFixed(1)+' km';}
function traceUndo(){if(traceWaypoints.length===0) return;traceWaypoints.pop();const mk=traceMarkers.pop();if(mk) window.map.removeLayer(mk);if(traceWaypoints.length>=2){tracePolyline.setLatLngs(traceWaypoints.map(w=>[w.lat,w.lng]));traceMarkers[traceMarkers.length-1].setIcon(L.divIcon({html:'<div class="wp-end">B</div>',iconSize:[22,22],iconAnchor:[11,11],className:''}));}else if(traceWaypoints.length===1){if(tracePolyline){window.map.removeLayer(tracePolyline);tracePolyline=null;}traceMarkers[0].setIcon(L.divIcon({html:'<div class="wp-start">A</div>',iconSize:[22,22],iconAnchor:[11,11],className:''}));}else{if(tracePolyline){window.map.removeLayer(tracePolyline);tracePolyline=null;}}updateTraceUI();}
function traceCancel(){traceMarkers.forEach(mk=>window.map.removeLayer(mk));traceMarkers=[];traceWaypoints=[];if(tracePolyline){window.map.removeLayer(tracePolyline);tracePolyline=null;}traceMode=false;document.getElementById('traceToolbar').classList.remove('active');showToast('Trazado cancelado','error');}
function traceDone(){if(traceWaypoints.length<2){showToast('Marca al menos 2 puntos','error');return;}traceMode=false;document.getElementById('traceToolbar').classList.remove('active');selectedLat=traceWaypoints[0].lat;selectedLng=traceWaypoints[0].lng;document.getElementById('rutaModal').classList.add('open');const distKm=calcWaypointsDistance(traceWaypoints);if(distKm!==null){const sel=document.getElementById('ruta-distancia');if(distKm<2) sel.value='Corta (< 2 km)';else if(distKm<=5) sel.value='Media (2-5 km)';else sel.value='Larga (> 5 km)';}setTimeout(()=>{fetch(`https://nominatim.openstreetmap.org/reverse?lat=${selectedLat}&lon=${selectedLng}&format=json`).then(r=>r.json()).then(d=>{const lugar=d.address.city||d.address.town||d.address.village||"Zona desconocida";document.getElementById('ruta-nombre').placeholder=lugar+' — nombre de la ruta';}).catch(()=>{});},100);}

// AVISTAMIENTOS
// CAMBIO A: helpers para navegación bidireccional mapa ↔ tarjeta
let markersById={};

function goToMapMarker(id,lat,lng){
  if(!window.map){showToast('El mapa no está listo','error');return;}
  const mapEl=document.getElementById('map');
  if(!mapEl) return;
  mapEl.scrollIntoView({behavior:'smooth',block:'start'});
  setTimeout(()=>{
    window.map.invalidateSize();
    window.map.setView([parseFloat(lat),parseFloat(lng)],16);
    const mk=markersById[id];
    if(mk){
      try{mk.openPopup();}catch(e){}
      const iconEl=mk._icon;
      if(iconEl){
        iconEl.classList.remove('highlight-pulse');
        void iconEl.offsetWidth;
        iconEl.classList.add('highlight-pulse');
        setTimeout(()=>iconEl.classList.remove('highlight-pulse'),2700);
      }
    }
  },350);
}

function goToCard(id,cardSelector){
  if(window.map) window.map.closePopup();
  const card=document.querySelector(`${cardSelector}[data-id="${id}"]`);
  if(!card){showToast('No se encontró la tarjeta','error');return;}
  card.scrollIntoView({behavior:'smooth',block:'center'});
  card.classList.remove('highlight-pulse');
  void card.offsetWidth;
  card.classList.add('highlight-pulse');
  setTimeout(()=>card.classList.remove('highlight-pulse'),2700);
}

async function loadAvistamientos(){
  try{const res=await fetch(SUPA_URL+"/rest/v1/avistamientos?select=*&status=eq.activo&order=created_at.desc",{headers:HEADERS});if(!res.ok){document.getElementById('avist-container').innerHTML='<p style="color:#c0392b;font-size:13px">Error cargando avistamientos.</p>';return;}let data=await res.json();data=data.filter(a=>{if(!a.created_at) return true;const days=(Date.now()-new Date(a.created_at).getTime())/86400000;if(days<=7) return true;if(a.last_confirmed_at){if((Date.now()-new Date(a.last_confirmed_at).getTime())/86400000<=7) return true;}return false;});cachedAvistamientos=data;const reporterIds=[...new Set(data.map(a=>a.reporter_id).filter(Boolean))];await loadNamesCache(reporterIds);const reportCounts={};data.forEach(a=>{if(a.reporter_id){reportCounts[a.reporter_id]=(reportCounts[a.reporter_id]||0)+1;}});if(userLat&&userLng){data=data.map(a=>({...a,distance:(a.lat&&a.lng)?getDistance(userLat,userLng,parseFloat(a.lat),parseFloat(a.lng)):null}));data.sort((a,b)=>{if(a.distance===null) return 1;if(b.distance===null) return -1;return a.distance-b.distance;});}
  if(currentMapMode==='avistamientos'){
  markersLayer.clearLayers();
  markersById={};
  data.forEach(a=>{
    const lat=parseFloat(a.lat),lng=parseFloat(a.lng);
    if(isNaN(lat)||isNaN(lng)) return;
    const color=getPeligroColor(a.tipo_peligro||'Procesionaria');
    const icon=createRiskIcon(color,isHistorico(a.created_at));
    const tipo=a.tipo_peligro||'Procesionaria';
    const popupHtml=`<div class="popup-clickable" onclick="goToCard('${a.id}','.avist-item')"><div style="font-size:13px">${getPeligroIcon(tipo)} <b>${escapeHtml(a.ubicacion||'Sin ubicación')}</b><br><span style="color:#666;font-size:11px">${timeAgo(a.created_at)}</span><br>${escapeHtml(tipo)} · ${escapeHtml(a.riesgo||'')}</div><span class="popup-hint">👁️ Ver detalles ↓</span></div>`;
    const mk=L.marker([lat,lng],{icon}).addTo(markersLayer).bindPopup(popupHtml);
    markersById[a.id]=mk;
  });
}
  const container=document.getElementById('avist-container');if(data.length===0){container.innerHTML='<p style="color:#555;font-size:13px">Aún no hay alertas reportadas. ¡Sé el primero!</p>';return;}
  container.innerHTML=data.map(a=>{const riesgo=a.riesgo||'Sin especificar';const clase=riesgo.toLowerCase().includes('medio')?'medio':riesgo.toLowerCase().includes('bajo')?'bajo':'alto';const hist=isHistorico(a.created_at);const conf=a.confirmations||0;const ya=localStorage.getItem('pdi_conf_'+a.id);const nameInfo=a.reporter_id?namesCache[a.reporter_id]:null;const reporterName=nameInfo?nameInfo.name:'';const rCount=a.reporter_id?(reportCounts[a.reporter_id]||0):0;const topBadge=getHighestBadge(rCount,0);const badgeTag=topBadge?` · ${topBadge.emoji} ${topBadge.name}`:'';const tipo=a.tipo_peligro||'Procesionaria';const tipoIcon=getPeligroIcon(tipo);const tipoLabel=tipo==='Otro'&&a.otro_peligro?a.otro_peligro:tipo;return `<div class="avist-item ${hist?'historico':''}" data-id="${a.id}"><div class="avist-icon">${tipoIcon}</div><div class="avist-info"><h4 class="clickable-location" onclick="goToMapMarker('${a.id}','${a.lat}','${a.lng}')">${escapeHtml(a.ubicacion||'Ubicación desconocida')}</h4><div style="font-size:11px;font-weight:700;color:${getPeligroColor(tipo)};margin:3px 0;text-transform:uppercase;letter-spacing:.5px">${tipoIcon} ${escapeHtml(tipoLabel)}</div>${(()=>{const arr=(a.fotos&&Array.isArray(a.fotos)&&a.fotos.length>0)?a.fotos:(a.foto?[a.foto]:[]);if(arr.length===0) return '';if(arr.length===1) return `<img src="${arr[0]}" alt="Alerta" onclick="openImage('${arr[0]}')" class="avist-img">`;return `<div class="gallery-scroll">${arr.map(u=>`<img src="${u}" onclick="openImage('${u}')" class="gallery-img">`).join('')}</div><div class="gallery-dots">${arr.length} fotos · desliza →</div>`;})()}<p>${escapeHtml(a.descripcion||'Sin descripción')}</p><div class="avist-meta"><span>🕒 ${timeAgo(a.created_at)}</span>${a.edited_at?'<span class="edited-mark">(editado)</span>':''}${a.distance?`<span class="dot-sep">·</span><span>📍 A ${a.distance.toFixed(1)} km</span>`:''}<span class="dot-sep">·</span><span class="badge ${clase}">${riesgo}</span>${hist?'<span class="badge historico">Histórico</span>':''}</div>${reporterName?`<p class="avist-reporter">${nameInfo&&nameInfo.foto?`<img src="${nameInfo.foto}" onclick="event.stopPropagation();openImage('${nameInfo.foto}')" class="clickable-img" style="width:20px;height:20px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:4px">`:''}Reportado por ${escapeHtml(reporterName)}${badgeTag}</p>`:''}${conf>0?`<p class="confirm-count">✅ ${conf} persona${conf>1?'s':''} confirmó que sigue ahí</p>`:''}<div class="confirm-actions"><button class="btn-confirm" onclick="confirmSighting('${a.id}',true)" ${ya?'disabled':''}>${ya==='confirm'?'✅ Confirmado':'👁️ Sigue ahí'}</button><button class="btn-deny" onclick="confirmSighting('${a.id}',false)" ${ya?'disabled':''}>${ya==='deny'?'❌ Desmentido':'🚫 Ya no está'}</button></div>${a.reporter_id===USER_ID?`<button class="btn-edit-own" onclick='openEditModal(${JSON.stringify(a).replace(/'/g,"&#39;").replace(/"/g,"&quot;")})'>✏️ Editar mi reporte</button>`:''}</div></div>`;}).join('');checkHotZone();}catch(err){console.error("Error:",err);document.getElementById('avist-container').innerHTML='<p style="color:#c0392b;font-size:13px">Error de conexión.</p>';}
}

// RUTAS
let allRutas=[];
async function loadRutas(){try{const res=await fetch(SUPA_URL+"/rest/v1/rutas?select=*&status=eq.activo&order=verificada.desc,created_at.desc",{headers:HEADERS});if(!res.ok){document.getElementById('rutas-container').innerHTML='<p style="color:#c0392b;font-size:13px">Error cargando rutas.</p>';return;}allRutas=await res.json();if(cachedAvistamientos.length===0){try{const ar=await fetch(SUPA_URL+"/rest/v1/avistamientos?select=lat,lng,ubicacion,riesgo,created_at&status=eq.activo&order=created_at.desc",{headers:HEADERS});cachedAvistamientos=await ar.json();}catch(e){}}const reporterIds=[...new Set(allRutas.map(r=>r.reporter_id).filter(Boolean))];await loadNamesCache(reporterIds);renderRutasList(allRutas);renderRutasOnMap(allRutas);}catch(err){console.error("Error rutas:",err);document.getElementById('rutas-container').innerHTML='<p style="color:#c0392b;font-size:13px">Error de conexión.</p>';}}

function getNearbyAlerts(lat,lng,radiusKm,waypoints){if(!lat||!lng) return [];radiusKm=radiusKm||1.5;const recentAlerts=cachedAvistamientos.filter(a=>{if(!a.created_at) return true;return(Date.now()-new Date(a.created_at).getTime())/86400000<=14;});if(waypoints&&waypoints.length>=2){return recentAlerts.filter(a=>{if(!a.lat||!a.lng) return false;const aLat=parseFloat(a.lat),aLng=parseFloat(a.lng);for(const wp of waypoints){if(getDistance(wp.lat,wp.lng,aLat,aLng)<=radiusKm) return true;}return false;});}return recentAlerts.filter(a=>{if(!a.lat||!a.lng) return false;return getDistance(parseFloat(lat),parseFloat(lng),parseFloat(a.lat),parseFloat(a.lng))<=radiusKm;});}

function renderRutasOnMap(rutas){
  rutasLayer.clearLayers();
  markersById={};
  cachedAvistamientos.forEach(a=>{
    const lat=parseFloat(a.lat),lng=parseFloat(a.lng);
    if(isNaN(lat)||isNaN(lng)) return;
    const icon=createRiskIcon(colorForRisk(a),true);
    L.marker([lat,lng],{icon}).addTo(rutasLayer).bindPopup(`<div style="font-size:12px">⚠️ <b>Alerta procesionaria</b><br>${escapeHtml(a.ubicacion||'')}<br><span style="color:#888;font-size:11px">${timeAgo(a.created_at)}</span></div>`);
  });
  rutas.forEach(r=>{
    const wps=r.waypoints;
    const isVer=!!r.verificada;
    const lineColor=isVer?'#27ae60':'#b7950b';
    if(wps&&wps.length>=2){
      const latlngs=wps.map(w=>[w.lat,w.lng]);
      const polyOpts={color:lineColor,weight:isVer?4:3,opacity:isVer?0.85:0.6};
      if(!isVer) polyOpts.dashArray='8,6';
      L.polyline(latlngs,polyOpts).addTo(rutasLayer);
      const startPopup=`<div class="popup-clickable" onclick="goToCard('${r.id}','.ruta-card')"><div style="font-size:13px">${isVer?'✅':'🐕'} <b>${escapeHtml(r.nombre)}</b><br><span style="color:#27ae60;font-size:11px">INICIO</span>${isVer?'<br><span style="color:#27ae60;font-size:11px;font-weight:700">VERIFICADA</span>':''}</div><span class="popup-hint">👁️ Ver detalles ↓</span></div>`;
      const mkStart=L.marker([wps[0].lat,wps[0].lng],{icon:L.divIcon({html:'<div class="wp-start">A</div>',iconSize:[22,22],iconAnchor:[11,11],className:''})}).addTo(rutasLayer).bindPopup(startPopup);
      markersById[r.id]=mkStart;
      const lastWp=wps[wps.length-1];
      L.marker([lastWp.lat,lastWp.lng],{icon:L.divIcon({html:'<div class="wp-end">B</div>',iconSize:[22,22],iconAnchor:[11,11],className:''})}).addTo(rutasLayer).bindPopup(`<div style="font-size:13px">${isVer?'✅':'🐕'} <b>${escapeHtml(r.nombre)}</b><br><span style="color:#c0392b;font-size:11px">FINAL</span></div>`);
    } else {
      const lat=parseFloat(r.lat),lng=parseFloat(r.lng);
      if(isNaN(lat)||isNaN(lng)) return;
      const singlePopup=`<div class="popup-clickable" onclick="goToCard('${r.id}','.ruta-card')"><div style="font-size:13px">${isVer?'✅':'🐕'} <b>${escapeHtml(r.nombre)}</b><br><span style="color:#888;font-size:11px">${escapeHtml(r.distancia||'')} · ${escapeHtml(r.dificultad||'')}</span>${isVer?'<br><span style="color:#27ae60;font-size:11px;font-weight:700">VERIFICADA</span>':''}</div><span class="popup-hint">👁️ Ver detalles ↓</span></div>`;
      const mk=L.marker([lat,lng],{icon:createRutaIcon(isVer)}).addTo(rutasLayer).bindPopup(singlePopup);
      markersById[r.id]=mk;
    }
  });
}

function renderRutasList(rutas){const container=document.getElementById('rutas-container');if(rutas.length===0){container.innerHTML='<p style="color:#555;font-size:13px">Aún no hay rutas sugeridas. ¡Sé el primero en compartir tu ruta favorita!</p>';return;}
container.innerHTML=rutas.map(r=>{const nearby=getNearbyAlerts(r.lat,r.lng,1.5,r.waypoints);const nameInfo=r.reporter_id?namesCache[r.reporter_id]:null;const reporterName=nameInfo?nameInfo.name:'';const mapsUrl=r.waypoints&&r.waypoints.length>=2?`https://www.google.com/maps/dir/${r.waypoints.map(w=>w.lat+','+w.lng).join('/')}`:`https://maps.google.com/?q=${r.lat},${r.lng}`;const wpDist=calcWaypointsDistance(r.waypoints);let distHtml='';if(wpDist!==null){distHtml=`<div class="ruta-distance-calc">📐 Distancia real: <strong>${wpDist<1?Math.round(wpDist*1000)+' m':wpDist.toFixed(1)+' km'}</strong> · ${r.waypoints.length} puntos</div>`;}let tags='';if(r.distancia) tags+=`<span class="ruta-tag tag-distancia">📏 ${escapeHtml(r.distancia)}</span>`;if(r.dificultad) tags+=`<span class="ruta-tag tag-dificultad">⛰️ ${escapeHtml(r.dificultad)}</span>`;if(r.suelo) tags+=`<span class="ruta-tag tag-suelo">👣 ${escapeHtml(r.suelo)}</span>`;if(r.sombra) tags+=`<span class="ruta-tag tag-sombra">🌿 Sombra: ${escapeHtml(r.sombra)}</span>`;if(r.agua&&r.agua!=='No') tags+=`<span class="ruta-tag tag-agua">💧 ${escapeHtml(r.agua)}</span>`;if(r.tipo_perro&&r.tipo_perro!=='Todos') tags+=`<span class="ruta-tag tag-perro">🐕 ${escapeHtml(r.tipo_perro)}</span>`;let alertasHtml='';if(nearby.length>0){alertasHtml=`<div class="ruta-alertas"><div class="ruta-alertas-title">⚠️ ${nearby.length} alerta${nearby.length>1?'s':''} de peligro cerca</div>${nearby.slice(0,3).map(a=>`<div class="ruta-alerta-item">${getPeligroIcon(a.tipo_peligro||'Procesionaria')} ${escapeHtml(a.ubicacion||'Zona cercana')} — ${escapeHtml(a.tipo_peligro||'Procesionaria')} · ${timeAgo(a.created_at)}</div>`).join('')}${nearby.length>3?`<div class="ruta-alerta-item" style="color:#888">...y ${nearby.length-3} más</div>`:''}</div>`;}else{alertasHtml='<div class="ruta-safe">✅ Sin alertas de peligro recientes en esta zona</div>';}let notasHtml='';if(r.notas_carlos){notasHtml=`<div class="ruta-notas-carlos"><div class="ruta-notas-carlos-title">🐾 Nota de Perros de la Isla</div><p>${escapeHtml(r.notas_carlos)}</p></div>`;}const sello=r.verificada?`<span class="sello-verificada"><svg viewBox="0 0 24 24"><path d="M12 2L13.09 8.26L20 9L14.14 13.14L15.82 20L12 16.27L8.18 20L9.86 13.14L4 9L10.91 8.26L12 2Z"/></svg>Verificada</span>`:`<span class="sello-pendiente">⏳ Pendiente</span>`;return `<div class="ruta-card ${r.verificada?'verificada':''}" data-id="${r.id}">${r.foto?`<img src="${r.foto}" alt="${escapeHtml(r.nombre)}" class="ruta-card-img" onclick="openImage('${r.foto}')">`:''}<div class="ruta-card-body"><div class="ruta-card-header"><h4 class="clickable-location" onclick="goToMapMarker('${r.id}','${(r.waypoints&&r.waypoints[0])?r.waypoints[0].lat:r.lat}','${(r.waypoints&&r.waypoints[0])?r.waypoints[0].lng:r.lng}')">${escapeHtml(r.nombre)}</h4>${sello}</div><p class="ruta-desc">${escapeHtml(r.descripcion||'Sin descripción')}</p>${distHtml}<div class="ruta-tags">${tags}</div>${alertasHtml}${notasHtml}<div class="ruta-meta"><span>🕒 ${timeAgo(r.created_at)}</span>${reporterName?`<span class="dot-sep">·</span><span>Sugerida por ${escapeHtml(reporterName)}</span>`:''}</div><div class="ruta-actions"><button class="btn-ruta-nav" onclick="window.open('${mapsUrl}')">🧭 Cómo llegar</button></div></div></div>`;}).join('');}

function filterRutas(filter,btn){document.querySelectorAll('.rutas-filtro').forEach(b=>b.classList.remove('active'));btn.classList.add('active');let filtered=allRutas;if(filter==='verificada') filtered=allRutas.filter(r=>r.verificada);else if(filter==='corta') filtered=allRutas.filter(r=>r.distancia&&r.distancia.toLowerCase().includes('corta'));else if(filter==='media') filtered=allRutas.filter(r=>r.distancia&&r.distancia.toLowerCase().includes('media'));else if(filter==='larga') filtered=allRutas.filter(r=>r.distancia&&r.distancia.toLowerCase().includes('larga'));else if(filter==='facil') filtered=allRutas.filter(r=>r.dificultad&&r.dificultad.toLowerCase().includes('fácil'));renderRutasList(filtered);renderRutasOnMap(filtered);}

// RUTA MODAL
function openRutaModal(){if(!window.map){showToast('Abre primero el mapa','error');return;}if(!getProfile()){document.getElementById('onboarding').classList.remove('hidden');return;}reportMode=false;traceMode=true;traceWaypoints=[];traceMarkers.forEach(mk=>window.map.removeLayer(mk));traceMarkers=[];if(tracePolyline){window.map.removeLayer(tracePolyline);tracePolyline=null;}updateTraceUI();document.getElementById('traceToolbar').classList.add('active');showToast('Toca el mapa para ir trazando la ruta','success');}

function closeRutaModal(){document.getElementById('rutaModal').classList.remove('open');traceMarkers.forEach(mk=>window.map.removeLayer(mk));traceMarkers=[];if(tracePolyline){window.map.removeLayer(tracePolyline);tracePolyline=null;}traceWaypoints=[];traceMode=false;selectedLat=null;selectedLng=null;document.getElementById('traceToolbar').classList.remove('active');document.getElementById('ruta-nombre').value='';document.getElementById('ruta-descripcion').value='';document.getElementById('ruta-foto').value='';document.getElementById('rutaPreviewWrap').style.display='none';document.getElementById('rutaPreviewImg').src='';}

async function submitRuta(){if(isSubmitting) return;isSubmitting=true;const btn=document.getElementById('btn-submit-ruta');const nombre=document.getElementById('ruta-nombre').value.trim();const descripcion=document.getElementById('ruta-descripcion').value.trim();const distancia=document.getElementById('ruta-distancia').value;const dificultad=document.getElementById('ruta-dificultad').value;const suelo=document.getElementById('ruta-suelo').value;const sombra=document.getElementById('ruta-sombra').value;const agua=document.getElementById('ruta-agua').value;const tipo_perro=document.getElementById('ruta-tipo-perro').value;const file=document.getElementById('ruta-foto').files[0];if(traceWaypoints.length<2){showToast('La ruta necesita al menos 2 puntos','error');isSubmitting=false;return;}if(!nombre){showToast('Escribe el nombre de la ruta','error');isSubmitting=false;return;}btn.disabled=true;btn.innerHTML='<span class="spinner"></span>Enviando...';try{let imageUrl=null;if(file){try{const compressed=await compressImage(file);const fn='ruta_'+Date.now()+'_'+Math.random().toString(36).substr(2,6)+'.jpg';const ur=await fetch(SUPA_URL+"/storage/v1/object/avistamientos/"+fn,{method:"POST",headers:{"apikey":SUPA_KEY,"Authorization":"Bearer "+SUPA_KEY,"Content-Type":"image/jpeg"},body:compressed});if(ur.ok) imageUrl=SUPA_URL+"/storage/v1/object/public/avistamientos/"+fn;}catch(e){}}const startPt=traceWaypoints[0];const res=await fetch(SUPA_URL+"/rest/v1/rutas",{method:"POST",headers:{...HEADERS,"Prefer":"return=minimal"},body:JSON.stringify({nombre,descripcion,lat:startPt.lat,lng:startPt.lng,distancia,dificultad,suelo,sombra,agua,tipo_perro,foto:imageUrl,reporter_id:USER_ID,verificada:false,status:'activo',waypoints:traceWaypoints})});if(!res.ok){showToast('Error al guardar la ruta.','error');btn.disabled=false;btn.innerHTML='Enviar sugerencia';isSubmitting=false;return;}closeRutaModal();await loadRutas();showToast('🐕 ¡Ruta sugerida! Perros de la Isla la revisará pronto.','success');}catch(err){showToast('Error al guardar la ruta.','error');}finally{isSubmitting=false;btn.disabled=false;btn.innerHTML='Enviar sugerencia';}}

// AVISTAMIENTOS ACTIONS
async function confirmSighting(id,isConfirm){if(localStorage.getItem('pdi_conf_'+id)){showToast('Ya has votado en este avistamiento','error');return;}try{const r=await fetch(SUPA_URL+`/rest/v1/avistamientos?id=eq.${id}&select=confirmations,denials`,{headers:HEADERS});const[c]=await r.json();if(!c) return;const nc=isConfirm?(c.confirmations||0)+1:c.confirmations||0;const nd=!isConfirm?(c.denials||0)+1:c.denials||0;const up={confirmations:nc,denials:nd};if(isConfirm) up.last_confirmed_at=new Date().toISOString();if(nd>=3) up.status='archivado';const res=await fetch(SUPA_URL+`/rest/v1/avistamientos?id=eq.${id}`,{method:'PATCH',headers:{...HEADERS,'Prefer':'return=minimal'},body:JSON.stringify(up)});if(res.ok){localStorage.setItem('pdi_conf_'+id,isConfirm?'confirm':'deny');showToast(isConfirm?'✅ Gracias por confirmar':'🚫 Gracias por avisar','success');loadAvistamientos();}else showToast('Error al votar','error');}catch(e){showToast('Error de conexión','error');}}

function activateReportMode(){if(!window.map){showToast('Abre primero el mapa','error');return;}if(!getProfile()){document.getElementById('onboarding').classList.remove('hidden');return;}reportMode=true;traceMode=false;selectedLat=null;selectedLng=null;if(tempMarker){window.map.removeLayer(tempMarker);tempMarker=null;}showToast('Toca el mapa para marcar la ubicación','success');}
function openModal(){if(!selectedLat||!selectedLng){showToast('Primero toca el mapa o usa tu ubicación','error');return;}document.getElementById('modal').classList.add('open');}
function closeModal(){
  if(editMode){closeEditModal();return;}
  document.getElementById('modal').classList.remove('open');
  if(tempMarker){window.map.removeLayer(tempMarker);tempMarker=null;}
  selectedLat=null;selectedLng=null;reportMode=false;
  document.getElementById('inp-tipo').value='Procesionaria';
  document.getElementById('inp-otro-peligro').value='';
  document.getElementById('otro-peligro-group').style.display='none';
  document.getElementById('inp-ubicacion').value='';
  document.getElementById('inp-descripcion').value='';
  document.getElementById('foto').value='';
  // Limpiar fotos múltiples (Cambio 2)
  selectedPhotos=[];
  const wrap=document.getElementById('previewWrap');
  if(wrap) wrap.style.display='none';
  const list=document.getElementById('previewList');
  if(list) list.innerHTML='';
  const counter=document.getElementById('photoCount');
  if(counter) counter.textContent='0';
}

function openEditModal(a){
  if(!a||a.reporter_id!==USER_ID){showToast('Solo puedes editar tus reportes','error');return;}
  if(a.status!=='activo'){showToast('Este reporte ya no se puede editar','error');return;}
  if(!window.map){showToast('Abre primero el mapa','error');return;}
  editMode=true;
  editingId=a.id;
  editingOriginalLat=parseFloat(a.lat);
  editingOriginalLng=parseFloat(a.lng);
  selectedLat=editingOriginalLat;
  selectedLng=editingOriginalLng;
  existingPhotos=(a.fotos&&Array.isArray(a.fotos)&&a.fotos.length>0)?[...a.fotos]:(a.foto?[a.foto]:[]);
  selectedPhotos=[];
  document.getElementById('inp-tipo').value=a.tipo_peligro||'Procesionaria';
  document.getElementById('inp-otro-peligro').value=a.otro_peligro||'';
  updateRiesgoOptions();
  document.getElementById('inp-ubicacion').value=a.ubicacion||'';
  document.getElementById('inp-riesgo').value=a.riesgo||'Alto';
  document.getElementById('inp-descripcion').value=a.descripcion||'';
  document.querySelector('#modal .modal-box h2').textContent='✏️ Editar reporte';
  document.getElementById('btn-submit').textContent='Guardar cambios';
  if(tempMarker) window.map.removeLayer(tempMarker);
  tempMarker=L.marker([selectedLat,selectedLng],{icon:window.rIcon,draggable:true}).addTo(window.map);
  tempMarker.on('dragend',ev=>{const ll=ev.target.getLatLng();selectedLat=ll.lat;selectedLng=ll.lng;});
  window.map.setView([selectedLat,selectedLng],16);
  renderPhotoPreviews();
  document.getElementById('modal').classList.add('open');
  showToast('Toca el mapa o arrastra el marcador para mover la ubicación','success');
}

function closeEditModal(){
  document.getElementById('modal').classList.remove('open');
  if(tempMarker){window.map.removeLayer(tempMarker);tempMarker=null;}
  selectedLat=null;selectedLng=null;
  reportMode=false;editMode=false;editingId=null;
  editingOriginalLat=null;editingOriginalLng=null;
  existingPhotos=[];selectedPhotos=[];
  const title=document.querySelector('#modal .modal-box h2');
  if(title) title.textContent='📍 Reportar peligro';
  document.getElementById('btn-submit').textContent='Enviar alerta';
  document.getElementById('inp-tipo').value='Procesionaria';
  document.getElementById('inp-otro-peligro').value='';
  document.getElementById('otro-peligro-group').style.display='none';
  document.getElementById('inp-ubicacion').value='';
  document.getElementById('inp-descripcion').value='';
  document.getElementById('foto').value='';
  const wrap=document.getElementById('previewWrap');
  if(wrap) wrap.style.display='none';
  const list=document.getElementById('previewList');
  if(list) list.innerHTML='';
  const counter=document.getElementById('photoCount');
  if(counter) counter.textContent='0';
}

async function compressImage(file,maxW,q){maxW=maxW||1200;q=q||0.75;return new Promise((res,rej)=>{const r=new FileReader();r.onload=e=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');let w=img.width,h=img.height;if(w>maxW){h=(maxW/w)*h;w=maxW;}c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);c.toBlob(b=>res(b),'image/jpeg',q);};img.onerror=rej;img.src=e.target.result;};r.onerror=rej;r.readAsDataURL(file);});}

function dispatchSubmit(){
  if(editMode) submitEdit();
  else submitReport();
}

async function submitReport(){
  if(isSubmitting) return;
  isSubmitting=true;
  const btn=document.getElementById('btn-submit');
  const tipo_peligro=document.getElementById('inp-tipo').value;
  const otro_peligro=tipo_peligro==='Otro'?document.getElementById('inp-otro-peligro').value.trim():null;
  const ubicacion=document.getElementById('inp-ubicacion').value.trim();
  const riesgo=document.getElementById('inp-riesgo').value;
  const descripcion=document.getElementById('inp-descripcion').value.trim();
  if(!selectedLat||!selectedLng){showToast('Toca el mapa para marcar la ubicación exacta','error');isSubmitting=false;return;}
  if(!ubicacion){showToast('Escribe la ubicación','error');isSubmitting=false;return;}
  if(tipo_peligro==='Otro'&&!otro_peligro){showToast('Describe el tipo de peligro','error');isSubmitting=false;return;}
  try{
    const oneH=new Date(Date.now()-3600000).toISOString();
    const cr=await fetch(SUPA_URL+`/rest/v1/avistamientos?reporter_id=eq.${USER_ID}&created_at=gte.${oneH}&select=id`,{headers:HEADERS});
    const recent=await cr.json();
    if(recent.length>=5){showToast('Has reportado mucho en la última hora.','error');isSubmitting=false;return;}
    const sixH=new Date(Date.now()-21600000).toISOString();
    const nr=await fetch(SUPA_URL+`/rest/v1/avistamientos?created_at=gte.${sixH}&select=lat,lng`,{headers:HEADERS});
    const nearby=await nr.json();
    for(const r of nearby){if(!r.lat||!r.lng) continue;if(getDistance(selectedLat,selectedLng,parseFloat(r.lat),parseFloat(r.lng))<=0.08){showToast('Ya existe un reporte reciente muy cerca.','error');isSubmitting=false;return;}}
  }catch(e){}
  btn.disabled=true;
  btn.innerHTML='<span class="spinner"></span>Enviando...';
  try{
    // Subir todas las fotos seleccionadas (Cambio 2)
    const imageUrls=[];
    for(const file of selectedPhotos){
      try{
        const compressed=await compressImage(file);
        const fn=Date.now()+"_"+Math.random().toString(36).substr(2,6)+".jpg";
        const ur=await fetch(SUPA_URL+"/storage/v1/object/avistamientos/"+fn,{method:"POST",headers:{"apikey":SUPA_KEY,"Authorization":"Bearer "+SUPA_KEY,"Content-Type":"image/jpeg"},body:compressed});
        if(ur.ok) imageUrls.push(SUPA_URL+"/storage/v1/object/public/avistamientos/"+fn);
      }catch(e){}
    }
    const res=await fetch(SUPA_URL+"/rest/v1/avistamientos",{method:"POST",headers:{...HEADERS,"Prefer":"return=minimal"},body:JSON.stringify({
      ubicacion,descripcion,riesgo,
      lat:selectedLat,lng:selectedLng,
      foto:imageUrls[0]||null,
      fotos:imageUrls,
      reporter_id:USER_ID,tipo_peligro,otro_peligro
    })});
    if(!res.ok){showToast('Error al guardar.','error');btn.disabled=false;btn.innerHTML='Enviar alerta';isSubmitting=false;return;}
    userLat=selectedLat;userLng=selectedLng;
    closeModal();
    await loadAvistamientos();
    showToast('✅ Avistamiento reportado. ¡Gracias!','success');
  }catch(err){showToast('Error al guardar.','error');}
  finally{isSubmitting=false;btn.disabled=false;btn.innerHTML='Enviar alerta';}
}

async function submitEdit(){
  if(isSubmitting) return;
  const btn=document.getElementById('btn-submit');
  const tipo_peligro=document.getElementById('inp-tipo').value;
  const otro_peligro=tipo_peligro==='Otro'?document.getElementById('inp-otro-peligro').value.trim():null;
  const ubicacion=document.getElementById('inp-ubicacion').value.trim();
  const riesgo=document.getElementById('inp-riesgo').value;
  const descripcion=document.getElementById('inp-descripcion').value.trim();
  if(!ubicacion){showToast('Escribe la ubicación','error');return;}
  if(tipo_peligro==='Otro'&&!otro_peligro){showToast('Describe el tipo de peligro','error');return;}
  const distMovedKm=getDistance(editingOriginalLat,editingOriginalLng,selectedLat,selectedLng);
  const distMovedM=distMovedKm*1000;
  const bigMove=distMovedM>=50;
  if(bigMove){
    const ok=confirm('Has movido la ubicación más de 50 metros. Esto reiniciará las confirmaciones porque el reporte ya no corresponde al punto original.\n\n¿Quieres continuar?');
    if(!ok) return;
  }
  isSubmitting=true;
  btn.disabled=true;
  btn.innerHTML='<span class="spinner"></span>Guardando...';
  try{
    const newUrls=[];
    for(const file of selectedPhotos){
      try{
        const compressed=await compressImage(file);
        const fn=Date.now()+"_"+Math.random().toString(36).substr(2,6)+".jpg";
        const ur=await fetch(SUPA_URL+"/storage/v1/object/avistamientos/"+fn,{method:"POST",headers:{"apikey":SUPA_KEY,"Authorization":"Bearer "+SUPA_KEY,"Content-Type":"image/jpeg"},body:compressed});
        if(ur.ok) newUrls.push(SUPA_URL+"/storage/v1/object/public/avistamientos/"+fn);
      }catch(e){}
    }
    const finalPhotos=[...existingPhotos,...newUrls];
    const update={
      tipo_peligro,otro_peligro,
      ubicacion,riesgo,descripcion,
      lat:selectedLat,lng:selectedLng,
      foto:finalPhotos[0]||null,
      fotos:finalPhotos,
      edited_at:new Date().toISOString()
    };
    if(bigMove){
      update.confirmations=0;
      update.denials=0;
      update.last_confirmed_at=null;
    }
    const res=await fetch(SUPA_URL+`/rest/v1/avistamientos?id=eq.${editingId}`,{method:'PATCH',headers:{...HEADERS,'Prefer':'return=minimal'},body:JSON.stringify(update)});
    if(!res.ok){showToast('Error al guardar los cambios','error');btn.disabled=false;btn.innerHTML='Guardar cambios';isSubmitting=false;return;}
    closeEditModal();
    await loadAvistamientos();
    showToast(bigMove?'✅ Reporte actualizado (votos reiniciados)':'✅ Reporte actualizado','success');
  }catch(err){
    showToast('Error al guardar','error');
  }finally{
    isSubmitting=false;
    btn.disabled=false;
    btn.innerHTML='Guardar cambios';
  }
}

function goToUserLocation(){if(!navigator.geolocation){showToast('Tu dispositivo no soporta geolocalización','error');return;}navigator.geolocation.getCurrentPosition(pos=>{const lat=pos.coords.latitude,lng=pos.coords.longitude;window.map.setView([lat,lng],15);if(userMarker) window.map.removeLayer(userMarker);userMarker=L.marker([lat,lng],{icon:L.divIcon({html:'<div style="background:#3498db;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.6)"></div>',className:''})}).addTo(window.map).bindPopup("📍 Estás aquí").openPopup();selectedLat=lat;selectedLng=lng;userLat=lat;userLng=lng;if(currentMapMode==='avistamientos') loadAvistamientos(); else loadRutas();checkHotZone();setTimeout(()=>{fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`).then(r=>r.json()).then(d=>{const lugar=d.address.city||d.address.town||d.address.village||"Ubicación actual";document.getElementById('inp-ubicacion').value=lugar+" ("+lat.toFixed(5)+", "+lng.toFixed(5)+")";}).catch(()=>{});},100);},err=>{if(err.code===1) showToast('Permiso de ubicación bloqueado','error');else if(err.code===2) showToast('No se pudo detectar tu ubicación','error');else if(err.code===3) showToast('La ubicación tardó demasiado','error');else showToast('Error al obtener ubicación','error');},{enableHighAccuracy:false,timeout:5000,maximumAge:60000});}

function toggleMapFull(e){if(e){e.stopPropagation();e.preventDefault();}const m=document.getElementById('map'),b=document.getElementById('exitFullBtn');const f=m.classList.toggle('fullscreen');b.style.display=f?'block':'none';setTimeout(()=>{if(window.map) window.map.invalidateSize();},200);}

// IMAGEN MODAL
function openImage(src){
  if(!src) return;
  const img=document.getElementById('imgModalContent');
  img.classList.remove('zoomed');
  img.src=src;
  document.getElementById('imgModal').style.display='flex';
  document.body.style.overflow='hidden';
}
function closeImage(){
  document.getElementById('imgModal').style.display='none';
  document.getElementById('imgModalContent').classList.remove('zoomed');
  document.body.style.overflow='';
}

// ===== RANKING =====
async function openRanking(){
  document.getElementById('rankingModal').classList.add('open');
  const container=document.getElementById('ranking-list');
  container.innerHTML='<p style="color:#555;font-size:13px;text-align:center">Cargando ranking...</p>';
  try{
    const ur=await fetch(SUPA_URL+'/rest/v1/usuarios?select=id,nombre,nombre_perro,zona,visible,foto,shares',{headers:HEADERS});
    const users=await ur.json();
    const ar=await fetch(SUPA_URL+'/rest/v1/avistamientos?select=reporter_id&status=eq.activo',{headers:HEADERS});
    const alertas=await ar.json();
    const rr=await fetch(SUPA_URL+'/rest/v1/rutas?select=reporter_id,verificada&status=eq.activo',{headers:HEADERS});
    const rutas=await rr.json();
    const scores={};
    alertas.forEach(a=>{if(a.reporter_id){scores[a.reporter_id]=(scores[a.reporter_id]||0)+10;}});
    rutas.forEach(r=>{if(r.reporter_id){scores[r.reporter_id]=(scores[r.reporter_id]||0)+15;if(r.verificada) scores[r.reporter_id]+=25;}});
    users.forEach(u=>{if(u.shares&&u.shares>0){scores[u.id]=(scores[u.id]||0)+(u.shares*5);}});
    const ranking=users.map(u=>({...u,score:scores[u.id]||0})).filter(u=>u.score>0).sort((a,b)=>b.score-a.score).slice(0,15);
    if(ranking.length===0){container.innerHTML='<p style="color:#555;font-size:13px;text-align:center">Aún no hay actividad. ¡Sé el primero en reportar o compartir una ruta!</p>';return;}
    container.innerHTML=ranking.map((u,i)=>{
      const isMe=u.id===USER_ID;
      const displayName=u.visible?u.nombre:'Un vecino de '+u.zona;
      const displayDog=u.visible&&u.nombre_perro?' y '+u.nombre_perro+' 🐕':'';
      // BUG 3 FIX: onclick directo en la <img> con stopPropagation
      const hasPhoto=u.foto&&u.visible;
      const avatarInner=hasPhoto
        ? `<img src="${u.foto}" alt="" class="clickable-img" onclick="event.stopPropagation();openImage('${u.foto}')">`
        : (u.visible?u.nombre.charAt(0).toUpperCase():'?');
      return `<div class="ranking-item ${isMe?'is-me':''}"><div class="ranking-pos">${i+1}</div><div class="ranking-avatar">${avatarInner}</div><div class="ranking-info"><div class="ranking-name">${escapeHtml(displayName)}${escapeHtml(displayDog)}</div><div class="ranking-dog">${escapeHtml(u.zona)}</div></div><div class="ranking-score"><div class="ranking-pts">${u.score}</div><div class="ranking-label">puntos</div></div></div>`;
    }).join('');
  }catch(e){container.innerHTML='<p style="color:#c0392b;font-size:13px;text-align:center">Error cargando ranking.</p>';}
}
function closeRanking(){document.getElementById('rankingModal').classList.remove('open');}

// ===== GPS RECORDING =====
let gpsWatchId=null,gpsWaypoints=[],gpsMarkers=[],gpsPolyline=null,gpsStartTime=null,gpsTimerInterval=null;

function startGpsRecording(){
  if(!window.map){showToast('Abre primero el mapa','error');return;}
  if(!getProfile()){document.getElementById('onboarding').classList.remove('hidden');return;}
  if(!navigator.geolocation){showToast('Tu dispositivo no soporta geolocalización','error');return;}
  gpsWaypoints=[];gpsMarkers.forEach(m=>window.map.removeLayer(m));gpsMarkers=[];
  if(gpsPolyline){window.map.removeLayer(gpsPolyline);gpsPolyline=null;}
  reportMode=false;traceMode=false;
  document.getElementById('gpsToolbar').classList.add('active');
  gpsStartTime=Date.now();
  updateGpsUI();
  gpsTimerInterval=setInterval(updateGpsTimer,1000);
  showToast('📡 Grabando... ¡No bloquees la pantalla!','success');
  if('wakeLock' in navigator){try{navigator.wakeLock.request('screen').then(wl=>{window._wakeLock=wl;}).catch(()=>{});}catch(e){}}
  setTimeout(()=>{showToast('⚠️ Mantén la pantalla encendida mientras grabas','error');},4000);
  gpsWatchId=navigator.geolocation.watchPosition(pos=>{
    const pt={lat:pos.coords.latitude,lng:pos.coords.longitude};
    if(gpsWaypoints.length>0){const last=gpsWaypoints[gpsWaypoints.length-1];if(getDistance(last.lat,last.lng,pt.lat,pt.lng)<0.005) return;}
    gpsWaypoints.push(pt);
    if(gpsWaypoints.length===1){
      const mk=L.marker([pt.lat,pt.lng],{icon:L.divIcon({html:'<div class="wp-start">A</div>',iconSize:[22,22],iconAnchor:[11,11],className:''})}).addTo(window.map);
      gpsMarkers.push(mk);
      window.map.setView([pt.lat,pt.lng],16);
    }
    const latlngs=gpsWaypoints.map(w=>[w.lat,w.lng]);
    if(gpsPolyline){gpsPolyline.setLatLngs(latlngs);}
    else{gpsPolyline=L.polyline(latlngs,{color:'#e74c3c',weight:4,opacity:0.9}).addTo(window.map);}
    window.map.panTo([pt.lat,pt.lng]);
    updateGpsUI();
  },err=>{showToast('Error de GPS: '+err.message,'error');},{enableHighAccuracy:true,timeout:10000,maximumAge:3000});
}

function updateGpsUI(){
  document.getElementById('gpsPoints').textContent=gpsWaypoints.length;
  const dist=calcWaypointsDistance(gpsWaypoints);
  document.getElementById('gpsDist').textContent=dist===null?'0 m':(dist<1?Math.round(dist*1000)+' m':dist.toFixed(1)+' km');
}

function updateGpsTimer(){
  if(!gpsStartTime) return;
  const s=Math.floor((Date.now()-gpsStartTime)/1000);
  const m=Math.floor(s/60);const ss=s%60;
  document.getElementById('gpsTime').textContent=m+':'+(ss<10?'0':'')+ss;
}

function cancelGpsRecording(){
  if(gpsWatchId!==null){navigator.geolocation.clearWatch(gpsWatchId);gpsWatchId=null;}
  clearInterval(gpsTimerInterval);gpsTimerInterval=null;gpsStartTime=null;
  if(window._wakeLock){try{window._wakeLock.release();window._wakeLock=null;}catch(e){}}
  gpsMarkers.forEach(m=>window.map.removeLayer(m));gpsMarkers=[];
  if(gpsPolyline){window.map.removeLayer(gpsPolyline);gpsPolyline=null;}
  gpsWaypoints=[];
  document.getElementById('gpsToolbar').classList.remove('active');
  showToast('Grabación cancelada','error');
}

function stopGpsRecording(){
  if(gpsWatchId!==null){navigator.geolocation.clearWatch(gpsWatchId);gpsWatchId=null;}
  clearInterval(gpsTimerInterval);gpsTimerInterval=null;gpsStartTime=null;
  if(window._wakeLock){try{window._wakeLock.release();window._wakeLock=null;}catch(e){}}
  document.getElementById('gpsToolbar').classList.remove('active');
  if(gpsWaypoints.length<2){showToast('Necesitas caminar un poco más para grabar la ruta','error');cancelGpsRecording();return;}
  const lastPt=gpsWaypoints[gpsWaypoints.length-1];
  const mk=L.marker([lastPt.lat,lastPt.lng],{icon:L.divIcon({html:'<div class="wp-end">B</div>',iconSize:[22,22],iconAnchor:[11,11],className:''})}).addTo(window.map);
  gpsMarkers.push(mk);
  traceWaypoints=gpsWaypoints.slice();
  traceMarkers=gpsMarkers.slice();
  tracePolyline=gpsPolyline;
  gpsWaypoints=[];gpsMarkers=[];gpsPolyline=null;
  selectedLat=traceWaypoints[0].lat;selectedLng=traceWaypoints[0].lng;
  const distKm=calcWaypointsDistance(traceWaypoints);
  if(distKm!==null){const sel=document.getElementById('ruta-distancia');if(distKm<2) sel.value='Corta (< 2 km)';else if(distKm<=5) sel.value='Media (2-5 km)';else sel.value='Larga (> 5 km)';}
  document.getElementById('rutaModal').classList.add('open');
  setTimeout(()=>{fetch(`https://nominatim.openstreetmap.org/reverse?lat=${selectedLat}&lon=${selectedLng}&format=json`).then(r=>r.json()).then(d=>{const lugar=d.address.city||d.address.town||d.address.village||"Zona desconocida";document.getElementById('ruta-nombre').placeholder=lugar+' — nombre de la ruta';}).catch(()=>{});},100);
  showToast(`📡 Ruta grabada: ${traceWaypoints.length} puntos`,'success');
}

// ===== RETO COUNTDOWN =====
const RETO_END=new Date('2026-04-26T23:59:59').getTime();

function updateRetoBanner(){
  const banner=document.getElementById('retoBanner');
  if(!banner) return;
  const now=Date.now();
  const diff=RETO_END-now;

  if(diff>0){
    const d=Math.floor(diff/86400000);
    const h=Math.floor((diff%86400000)/3600000);
    const m=Math.floor((diff%3600000)/60000);
    const s=Math.floor((diff%60000)/1000);
    banner.className='reto-banner';
    banner.innerHTML=`
      <div class="reto-gift">🎁</div>
      <div class="reto-title">Reto: ¡Comparte y Gana!</div>
      <div class="reto-desc">Quien más comparta la app se lleva un <strong style="color:#f9ca24">arnés + juguete + premio sorpresa 🎁</strong> para su perro</div>
      <div class="reto-countdown">
        <div class="reto-time-box"><div class="reto-time-num">${d}</div><div class="reto-time-label">Días</div></div>
        <div class="reto-time-box"><div class="reto-time-num">${h}</div><div class="reto-time-label">Horas</div></div>
        <div class="reto-time-box"><div class="reto-time-num">${m}</div><div class="reto-time-label">Min</div></div>
        <div class="reto-time-box"><div class="reto-time-num">${s}</div><div class="reto-time-label">Seg</div></div>
      </div>
      <div class="reto-prize">🏆 Toca aquí para ver el ranking</div>`;
  } else {
    loadRetoWinner();
  }
}

async function loadRetoWinner(){
  const banner=document.getElementById('retoBanner');
  if(!banner) return;
  try{
    const r=await fetch(SUPA_URL+'/rest/v1/usuarios?select=id,nombre,nombre_perro,zona,visible,foto,shares&order=shares.desc&limit=1',{headers:HEADERS});
    const[winner]=await r.json();
    if(!winner||!winner.shares||winner.shares===0){
      banner.innerHTML=`<div class="reto-gift-open">📦</div><div class="reto-title">El reto ha terminado</div><div class="reto-winner-sub">No hubo participantes esta vez. ¡Pronto lanzaremos un nuevo reto!</div>`;
      banner.className='reto-banner revealed';
      return;
    }
    const name=winner.visible?winner.nombre:'Un vecino de '+winner.zona;
    const dog=winner.visible&&winner.nombre_perro?winner.nombre_perro:'su perro';
    const isMe=winner.id===USER_ID;
    let confetti='';
    const colors=['#f9ca24','#e74c3c','#27ae60','#3498db','#9b59b6','#e67e22'];
    for(let i=0;i<20;i++){
      const c=colors[i%colors.length];
      const left=Math.random()*100;
      const delay=Math.random()*2;
      const size=4+Math.random()*4;
      confetti+=`<div class="confetti" style="background:${c};left:${left}%;animation-delay:${delay}s;width:${size}px;height:${size}px"></div>`;
    }
    banner.className='reto-banner revealed';
    banner.innerHTML=`${confetti}
      <div class="reto-gift-open">🎉</div>
      <div class="reto-title">${isMe?'¡¡GANASTE!!':'¡Tenemos ganador!'}</div>
      <div class="reto-winner-name">${escapeHtml(name)}</div>
      <div class="reto-winner-sub">${isMe?`¡Felicidades! Tú y ${escapeHtml(dog)} os lleváis el arnés + juguete + premio sorpresa 🎁`:`${escapeHtml(name)} y ${escapeHtml(dog)} se llevan el premio 🐕`}<br>Compartió ${winner.shares} veces · ¡Gracias por mover la comunidad!</div>
      <div class="reto-prize" style="margin-top:12px">🏆 Toca para ver el ranking completo</div>`;
  }catch(e){
    banner.innerHTML=`<div class="reto-gift-open">🎉</div><div class="reto-title">¡El reto ha terminado!</div><div class="reto-winner-sub">Toca para ver quién ganó</div>`;
    banner.className='reto-banner revealed';
  }
}

setInterval(updateRetoBanner,1000);
document.addEventListener('DOMContentLoaded',()=>{setTimeout(updateRetoBanner,500);});

// ===== SHARE APP =====
const SHARE_URL='https://perrosdelaisla.github.io';
const SHARE_TEXT='🐾 Paseos seguros para perros en Mallorca. Reporta peligros, comparte rutas y protege a la comunidad perruna. ¡Descarga la app de Perros de la Isla!';

// Límites anti-abuso
const SHARE_COOLDOWN_MS = 30 * 1000; // 30 segundos entre shares
const SHARE_MAX_PER_DAY = 10;        // 10 shares máximo por día

async function shareApp(){
  if(!getProfile()){document.getElementById('onboarding').classList.remove('hidden');return;}

  // CAPA 1: obtener estado actual del usuario
  let currentShares = 0;
  let lastShareAt = null;
  let sharesToday = 0;
  let sharesTodayDate = null;
  try{
    const r = await fetch(SUPA_URL+`/rest/v1/usuarios?id=eq.${USER_ID}&select=shares,last_share_at,shares_today,shares_today_date`,{headers:HEADERS});
    const[u] = await r.json();
    if(u){
      currentShares = u.shares || 0;
      lastShareAt = u.last_share_at ? new Date(u.last_share_at).getTime() : null;
      sharesToday = u.shares_today || 0;
      sharesTodayDate = u.shares_today_date || null;
    }
  }catch(e){
    showToast('Error de conexión, inténtalo de nuevo','error');
    return;
  }

  // CAPA 2: cooldown de 30 segundos entre shares
  if(lastShareAt && (Date.now() - lastShareAt) < SHARE_COOLDOWN_MS){
    const secLeft = Math.ceil((SHARE_COOLDOWN_MS - (Date.now() - lastShareAt)) / 1000);
    showToast(`Espera ${secLeft}s para compartir otra vez 🐾`,'error');
    return;
  }

  // CAPA 3: máximo diario (se resetea cada día nuevo)
  const today = new Date().toISOString().split('T')[0];
  const isNewDay = sharesTodayDate !== today;
  if(!isNewDay && sharesToday >= SHARE_MAX_PER_DAY){
    showToast(`Ya compartiste ${SHARE_MAX_PER_DAY} veces hoy, ¡gracias! Vuelve mañana 🐾`,'error');
    return;
  }

  // CAPA 4: ejecutar share real y solo contar si NO se canceló
  let shareSucceeded = false;
  if(navigator.share){
    try{
      await navigator.share({title:'Perros de la Isla — Paseos Seguros',text:SHARE_TEXT,url:SHARE_URL});
      shareSucceeded = true;
    }catch(e){
      if(e.name !== 'AbortError'){console.error('Error al compartir:',e);}
      shareSucceeded = false;
    }
  } else {
    window.open('https://wa.me/?text='+encodeURIComponent(SHARE_TEXT+' '+SHARE_URL),'_blank');
    shareSucceeded = true;
  }

  if(!shareSucceeded) return;

  // Todo OK: incrementar contadores
  const newCount = currentShares + 1;
  const newSharesToday = isNewDay ? 1 : (sharesToday + 1);
  try{
    await fetch(SUPA_URL+`/rest/v1/usuarios?id=eq.${USER_ID}`,{
      method:'PATCH',
      headers:{...HEADERS,'Prefer':'return=minimal'},
      body:JSON.stringify({
        shares: newCount,
        last_share_at: new Date().toISOString(),
        shares_today: newSharesToday,
        shares_today_date: today
      })
    });
    updateShareCounts(newCount);
    const remaining = SHARE_MAX_PER_DAY - newSharesToday;
    if(remaining > 0){
      showToast(`📢 ¡+5 puntos! Llevas ${newCount} compartidas · ${remaining} disponibles hoy`,'success');
    } else {
      showToast(`📢 ¡+5 puntos! Llevas ${newCount} compartidas · último de hoy`,'success');
    }
  }catch(e){
    showToast('Error al guardar, inténtalo de nuevo','error');
  }
}

async function loadShareCount(){
  try{
    const r=await fetch(SUPA_URL+`/rest/v1/usuarios?id=eq.${USER_ID}&select=shares`,{headers:HEADERS});
    const[u]=await r.json();
    updateShareCounts(u?.shares||0);
  }catch(e){}
}

function updateShareCounts(n){
  document.querySelectorAll('.share-count').forEach(el=>{
    el.textContent=n>0?n+' veces':'';
  });
}

document.addEventListener('DOMContentLoaded',()=>{setTimeout(loadShareCount,1000);});

let deferredPrompt;function isStandalone(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone;}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;});

function showInstallBanner(){
  if(isStandalone()) return;
  const banner=document.getElementById('installBanner');
  const instructions=document.getElementById('installInstructions');
  const btn=document.getElementById('installBtn');
  const ua=navigator.userAgent.toLowerCase();
  if(/iphone|ipad|ipod/.test(ua)&&/safari/.test(ua)&&!/crios|fxios/.test(ua)){
    instructions.innerHTML='En Safari: toca el botón <strong style="color:#fff">Compartir</strong> (📤) de la barra inferior y luego <strong style="color:#fff">"Añadir a pantalla de inicio"</strong>.';
    btn.textContent='Entendido';
    btn.onclick=function(){closeBanner();};
  } else if(/iphone|ipad|ipod/.test(ua)){
    instructions.innerHTML='Para instalar la app, ábrela en <strong style="color:#fff">Safari</strong>. Luego toca Compartir (📤) → "Añadir a pantalla de inicio".';
    btn.textContent='Entendido';
    btn.onclick=function(){closeBanner();};
  } else if(deferredPrompt){
    instructions.textContent='Añade Perros de la Isla a tu pantalla de inicio para acceder más rápido.';
    btn.textContent='Instalar ahora';
    btn.onclick=function(){installApp();};
  } else {
    instructions.innerHTML='Abre el menú de tu navegador (<strong style="color:#fff">⋮</strong> o <strong style="color:#fff">⋯</strong>) y selecciona <strong style="color:#fff">"Añadir a pantalla de inicio"</strong>.';
    btn.textContent='Entendido';
    btn.onclick=function(){closeBanner();};
  }
  setTimeout(()=>{banner.style.display='block';},2000);
}
function installApp(){if(deferredPrompt){deferredPrompt.prompt();deferredPrompt.userChoice.then(()=>{deferredPrompt=null;document.getElementById('installBanner').style.display='none';});}else{closeBanner();}}
function closeBanner(){document.getElementById('installBanner').style.display='none';}
document.addEventListener('DOMContentLoaded',()=>{setTimeout(showInstallBanner,3000);});
if("serviceWorker" in navigator){navigator.serviceWorker.register("service-worker.js").catch(()=>{});}
