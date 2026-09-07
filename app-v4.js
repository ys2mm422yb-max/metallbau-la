const SOURCE_PROJECTS = window.SOURCE_PROJECTS || [];
const CATEGORY_INFO = {
  "treppen": {
    "label": "Treppen & Geländer",
    "intro": "Innen oder außen, Bestand oder Neubau: Treppen, Geländer und Absturzsicherungen werden passend zur Situation geplant und mit Metall, Holz, Glas oder Naturstein kombiniert."
  },
  "tore": {
    "label": "Tore & Zäune",
    "intro": "Zäune und Tore passend zu Garten und Gebäude – aus Stahl, Edelstahl, Holz, Glas oder Bronze und individuell auf das Anwesen abgestimmt."
  },
  "balkone": {
    "label": "Balkone & Terrassen",
    "intro": "Von Stahlbalkonen und Geländern über Reparaturen und Sanierungen bis zur Integration von Balkonkraftwerken."
  },
  "stahlbau": {
    "label": "Carports, Dächer & Stahlbau",
    "intro": "Carports, Überdachungen und Stahlkonstruktionen – je nach Projekt kombiniert mit Glas, Holz, Blech und weiteren Bauteilen."
  },
  "interior": {
    "label": "Interior & Metallgestaltung",
    "intro": "Individuelle Objekte und Lösungen für Wohnraum, Garten und gewerbliche Räume – gemeinsam entworfen, geplant, gefertigt und montiert."
  },
  "medallions": {
    "label": "Medallions",
    "intro": "Bronze-Medaillons werden mit handgemachten Stempeln geprägt und können vergoldet, gefärbt, verzinnt oder unbehandelt ausgeführt werden. Auch eigene Motive und individuell gefertigte Stempel sind möglich."
  }
};

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

const state = { filter: 'all', query: '', gallery: [], galleryIndex: 0, galleryTitle: '', scrollY: 0 };
const categoryLabel = (key) => key === 'medallions' ? 'Medallions' : (CATEGORY_INFO[key]?.label || key);

function esc(value='') { return value.replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c])); }

function setupHeader() {
  const header = $('.site-header');
  const toggle = $('.nav-toggle');
  const nav = $('.site-nav');
  if (!header || !toggle || !nav) return;
  const open = () => {
    state.scrollY = window.scrollY;
    document.body.style.top = `-${state.scrollY}px`;
    document.body.classList.add('nav-open');
    toggle.setAttribute('aria-expanded','true');
    toggle.setAttribute('aria-label','Navigation schließen');
  };
  const close = () => {
    if (!document.body.classList.contains('nav-open')) return;
    document.body.classList.remove('nav-open');
    document.body.style.top = '';
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label','Navigation öffnen');
    window.scrollTo(0, state.scrollY);
  };
  toggle.addEventListener('click', () => document.body.classList.contains('nav-open') ? close() : open());
  $$('.site-nav a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { close(); closeLightbox(); } });
}

function setupServices() {
  const services = $('.services');
  if (!services) return;
  if (!services.querySelector('[data-filter-link="medallions"]')) {
    const card = document.createElement('a');
    card.className='service-card'; card.href='#referenzen'; card.dataset.filterLink='medallions';
    card.innerHTML='<span class="service-index">06</span><h3>Medallions</h3><p>Individuell geprägte Bronze-Medaillons und eigene Stempel nach Motivwunsch.</p><span class="service-arrow">↗</span>';
    const lohn=[...services.querySelectorAll('.service-card')].find(x=>x.getAttribute('href')==='#lohnfertigung');
    if (lohn) { const idx=lohn.querySelector('.service-index'); if (idx) idx.textContent='07'; services.insertBefore(card,lohn); } else services.append(card);
  }
  services.querySelectorAll('[data-filter-link]').forEach(a => a.addEventListener('click', () => {
    state.filter=a.dataset.filterLink; state.query='';
    setTimeout(() => { syncControls(); renderReferences(); $('#referenzen')?.scrollIntoView({behavior:'smooth'}); }, 40);
  }));
}

function renderReferenceTools() {
  const top=$('.projects-top');
  if (!top) return;
  const old=$('.filter-bar',top); if (old) old.remove();
  const tools=document.createElement('div'); tools.className='reference-tools';
  const filters=[['all','Alle'],['treppen','Treppen'],['tore','Tore & Zäune'],['balkone','Balkone'],['stahlbau','Stahlbau'],['interior','Interior'],['medallions','Medallions']];
  tools.innerHTML=`<div class="filter-bar" aria-label="Referenzen filtern">${filters.map(([k,l])=>`<button class="filter-chip${k==='all'?' is-active':''}" type="button" data-filter="${k}">${l}</button>`).join('')}</div><label class="reference-search"><span class="sr-only">Referenzen durchsuchen</span><input type="search" placeholder="Projekt suchen …" autocomplete="off"><b aria-hidden="true">⌕</b></label>`;
  top.append(tools);
  tools.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{ state.filter=btn.dataset.filter; renderReferences(); syncControls(); }));
  tools.querySelector('input').addEventListener('input',e=>{ state.query=e.target.value.trim().toLowerCase(); renderReferences(); });
  const note=document.createElement('div'); note.className='category-note'; note.id='category-note'; top.append(note);
}

function syncControls() {
  $$('.filter-chip').forEach(btn => btn.classList.toggle('is-active', btn.dataset.filter===state.filter));
  const input=$('.reference-search input'); if (input && input.value!==state.query) input.value=state.query;
}

function matchesProject(p) {
  const byCat=state.filter==='all'||p.category===state.filter;
  if (!byCat) return false;
  if (!state.query) return true;
  const hay=`${p.year} ${p.title} ${p.description} ${categoryLabel(p.category)}`.toLowerCase();
  return hay.includes(state.query);
}

function projectCard(p, i) {
  const desc=p.description ? `<p>${esc(p.description)}</p>` : '';
  const meta=[categoryLabel(p.category),p.year].filter(Boolean).join(' · ');
  const galleryCount=p.images.length;
  return `<article class="reference-card" data-category="${p.category}" data-project-id="${p.id}" style="--delay:${Math.min(i,10)*35}ms"><button class="reference-image" type="button" data-project-gallery="${p.id}" data-lightbox-src="${p.images[0]}" aria-label="Bilder zu ${esc(p.title)} öffnen"><img src="${p.images[0]}" alt="${esc(p.title)}" loading="lazy" decoding="async"></button><div class="reference-copy"><span>${esc(meta)}</span><h3>${esc(p.title)}</h3>${desc}<div class="reference-actions"><button type="button" data-project-gallery="${p.id}">${galleryCount} ${galleryCount===1?'Bild':'Bilder'} ansehen</button><button type="button" data-prefill-project="${esc(p.title)}">Projekt ähnlich anfragen</button></div></div></article>`;
}

function renderReferences() {
  const grid=$('#reference-grid'); if (!grid) return;
  const items=SOURCE_PROJECTS.filter(matchesProject);
  grid.innerHTML=items.map(projectCard).join('') || '<p class="empty-results">Keine Referenz passt zu dieser Suche.</p>';
  const note=$('#category-note');
  if (note) {
    const visibleCat=state.filter==='all' ? null : state.filter;
    const count=items.length;
    if (visibleCat) {
      const info=CATEGORY_INFO[visibleCat];
      note.innerHTML=`<strong>${esc(categoryLabel(visibleCat))}</strong><p>${esc(info?.intro||'')}</p><span>${count} ${count===1?'Projekt':'Projekte'} in dieser Auswahl</span>`;
    } else {
      note.innerHTML=`<strong>Referenzen aus allen Bereichen</strong><p>Alle auf dem bestehenden öffentlichen Webauftritt aufgeführten Projektgruppen sind hier mit Bildern und den wesentlichen Projektinformationen zusammengeführt.</p><span>${SOURCE_PROJECTS.length} Projektgruppen</span>`;
    }
  }
  bindDynamicReferenceActions(); renderArchive();
}

function bindDynamicReferenceActions() {
  $$('[data-project-gallery]').forEach(btn=>btn.addEventListener('click',()=>openProjectGallery(btn.dataset.projectGallery)));
  $$('[data-prefill-project]').forEach(btn=>btn.addEventListener('click',()=>prefillProject(btn.dataset.prefillProject)));
}

function renderArchive() {
  const list=$('.archive-list'); if (!list) return;
  const items=SOURCE_PROJECTS.filter(matchesProject);
  list.innerHTML=items.map(p=>`<div data-category="${p.category}" data-search="${esc(`${p.year} ${p.title} ${p.description}`.toLowerCase())}"><span>${p.year||'—'}</span><strong>${esc(p.title)}</strong><small>${esc(categoryLabel(p.category))}</small></div>`).join('');
}

function setupArchive() {
  const panel=$('.archive-panel'); if (!panel) return;
  let toggle=$('.archive-toggle',panel);
  if (!toggle) {
    toggle=document.createElement('button'); toggle.className='archive-toggle'; toggle.type='button'; toggle.setAttribute('aria-expanded','false'); toggle.textContent='Kompletten Projektindex anzeigen';
    const list=$('.archive-list',panel); panel.insertBefore(toggle,list);
  }
  toggle.addEventListener('click',()=>{
    const expanded=toggle.getAttribute('aria-expanded')==='true';
    toggle.setAttribute('aria-expanded',String(!expanded)); panel.classList.toggle('is-expanded',!expanded); toggle.textContent=expanded?'Kompletten Projektindex anzeigen':'Projektindex einklappen';
  });
}

function setupSpecialWork() {
  const existing=$('#specialarbeiten'); if (!existing) return;
  existing.innerHTML=`<div class="content-width special-layout"><div class="special-copy"><p class="section-label">Interior & Medallions</p><h2>Metallgestaltung mit eigener Handschrift.</h2><p>Vom ausgezeichneten Schachtisch über Leuchten, Feuerobjekte und Gastronomieeinrichtungen bis zu individuell geprägten Bronze-Medaillons.</p><div class="special-links"><button type="button" data-jump-filter="interior">9 Interior-Projekte ansehen</button><button type="button" data-jump-filter="medallions">Medaillon-Galerie ansehen</button><a href="https://www.larasser-metallbau.de/referenzen/interior/">Interior Original-Galerie</a><a href="https://www.larasser-metallbau.de/referenzen/medallions/">Medallions Original-Galerie</a></div></div><div class="special-showcase"><button class="special-main" type="button" data-project-gallery="${SOURCE_PROJECTS.find(p=>p.title==='Schachtisch')?.id||''}"><img src="${SOURCE_PROJECTS.find(p=>p.title==='Schachtisch')?.images[0]||''}" alt="Schachtisch" loading="lazy"><span><b>2023</b> Schachtisch · Meisterpreis</span></button><div class="medallion-mini-grid">${(SOURCE_PROJECTS.find(p=>p.category==='medallions')?.images||[]).slice(0,6).map(u=>`<button type="button" data-project-gallery="${SOURCE_PROJECTS.find(p=>p.category==='medallions')?.id}"><img src="${u}" alt="Bronze-Medaillon" loading="lazy"></button>`).join('')}</div><div class="special-projects">${SOURCE_PROJECTS.filter(p=>p.category==='interior').map(p=>`<article class="special-project"><span>${p.year}</span><strong>${esc(p.title)}</strong></article>`).join('')}</div></div></div>`;
  existing.querySelectorAll('[data-jump-filter]').forEach(btn=>btn.addEventListener('click',()=>{ state.filter=btn.dataset.jumpFilter; state.query=''; syncControls(); renderReferences(); $('#referenzen')?.scrollIntoView({behavior:'smooth'}); }));
  bindDynamicReferenceActions();
}

function setupLightbox() {
  const dialog=$('#lightbox'); if (!dialog) return;
  if (!dialog.querySelector('.lightbox-prev')) {
    dialog.insertAdjacentHTML('beforeend','<button class="lightbox-prev" type="button" aria-label="Vorheriges Bild">‹</button><button class="lightbox-next" type="button" aria-label="Nächstes Bild">›</button><div class="lightbox-caption"></div>');
  }
  $('.lightbox-close',dialog)?.addEventListener('click',closeLightbox);
  $('.lightbox-prev',dialog)?.addEventListener('click',()=>stepGallery(-1));
  $('.lightbox-next',dialog)?.addEventListener('click',()=>stepGallery(1));
  dialog.addEventListener('click',e=>{ if(e.target===dialog) closeLightbox(); });
  document.addEventListener('keydown',e=>{ if(!dialog.open) return; if(e.key==='ArrowLeft') stepGallery(-1); if(e.key==='ArrowRight') stepGallery(1); });
}

function openProjectGallery(id) {
  const p=SOURCE_PROJECTS.find(x=>x.id===id); if(!p) return;
  state.gallery=p.images; state.galleryIndex=0; state.galleryTitle=p.title; showGalleryImage();
  const dialog=$('#lightbox'); if(dialog && !dialog.open){ dialog.showModal(); document.body.classList.add('lightbox-open'); }
}
function showGalleryImage(){ const dialog=$('#lightbox'); if(!dialog||!state.gallery.length)return; const img=$('img',dialog); img.src=state.gallery[state.galleryIndex]; img.alt=`${state.galleryTitle} – Bild ${state.galleryIndex+1} von ${state.gallery.length}`; const cap=$('.lightbox-caption',dialog); if(cap) cap.textContent=`${state.galleryTitle} · ${state.galleryIndex+1}/${state.gallery.length}`; }
function stepGallery(dir){ if(!state.gallery.length)return; state.galleryIndex=(state.galleryIndex+dir+state.gallery.length)%state.gallery.length; showGalleryImage(); }
function closeLightbox(){ const d=$('#lightbox'); if(d?.open)d.close(); document.body.classList.remove('lightbox-open'); }

function projectTypeForProject(title){ const p=SOURCE_PROJECTS.find(x=>x.title===title); if(!p)return 'Sonstiges'; return ({treppen:'Treppen & Geländer',tore:'Tore & Zäune',balkone:'Balkone & Terrassen',stahlbau:'Carports, Dächer & Stahlbau',interior:'Interior & Metallgestaltung',medallions:'Medallions'})[p.category]||'Sonstiges'; }
function prefillProject(title){ const select=$('#project-type'); const details=$('#details'); if(select) select.value=projectTypeForProject(title); if(details) details.value=`Ich interessiere mich für ein Projekt ähnlich „${title}“. `; $('#anfrage')?.scrollIntoView({behavior:'smooth',block:'start'}); details?.focus({preventScroll:true}); }

function setupForm() {
  const form=$('#project-form'); if(!form) return;
  const file=$('#files'), status=$('#file-status');
  file?.addEventListener('change',()=>{ const names=[...file.files].map(f=>f.name); if(status) status.textContent=names.length?names.join(', '):'Optional – Bilder oder PDF auswählen'; });
  $$('[data-prefill]').forEach(a=>a.addEventListener('click',()=>{ const sel=$('#project-type'); if(sel) sel.value=a.dataset.prefill; }));
  form.addEventListener('submit',e=>{
    e.preventDefault();
    if(!form.reportValidity()) return;
    const fd=new FormData(form); const selectedFiles=[...(file?.files||[])].map(f=>f.name);
    const lines=[
      `Projektart: ${fd.get('project-type')||''}`, `Material: ${fd.get('material')||''}`, `Maße: ${fd.get('dimensions')||''}`, `Stückzahl: ${fd.get('quantity')||''}`, `Ort / PLZ: ${fd.get('location')||''}`, '', `Beschreibung: ${fd.get('details')||''}`, '', `Name: ${fd.get('name')||''}`, `E-Mail: ${fd.get('email')||''}`, `Telefon: ${fd.get('phone')||''}`,
      selectedFiles.length ? `Dateien zum manuellen Anhängen: ${selectedFiles.join(', ')}` : 'Dateien: keine ausgewählt'
    ];
    const subject=`Projektanfrage – ${fd.get('project-type')||'Metallbau'}`;
    window.location.href=`mailto:stephan.larasser@t-online.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    const note=$('#form-note'); if(note) note.textContent='Die E-Mail-App wurde vorbereitet. Ausgewählte Dateien bitte dort noch manuell anhängen.';
  });
}

function upgradeContact() {
  const actions=$('.contact-actions'); if(actions) actions.innerHTML='<a href="tel:+498092709151"><span>Zentrale</span><strong>+49 8092 709151</strong></a><a href="mailto:stephan.larasser@t-online.de"><span>E-Mail</span><strong>stephan.larasser@t-online.de</strong></a><a href="tel:+491715248966"><span>Stephan Larasser · Mobil</span><strong>+49 171 5248966</strong></a><a href="tel:+491773248147"><span>Martin Larasser · Mobil</span><strong>+49 177 3248147</strong></a>';
  const footer=$('.footer-grid'); if(footer){ const contact=footer.children[2]; if(contact) contact.innerHTML='<a href="tel:+498092709151">+49 8092 709151</a><a href="mailto:stephan.larasser@t-online.de">stephan.larasser@t-online.de</a><a href="tel:+491715248966">Stephan: +49 171 5248966</a><a href="tel:+491773248147">Martin: +49 177 3248147</a>'; }
  const bottom=$('.footer-bottom'); if(bottom && !bottom.querySelector('.legal-links')) bottom.insertAdjacentHTML('beforeend','<span class="legal-links"><a href="https://www.larasser-metallbau.de/impressum/">Impressum</a><a href="https://www.larasser-metallbau.de/datenschutzerklarung/">Datenschutz</a></span>');
}

function rewriteCopy() {
  const h2=$('#referenzen .section-head h2'); if(h2) h2.textContent='Arbeiten, die zeigen, was möglich ist.';
  const p=$('#referenzen .section-head .section-intro'); if(p) p.textContent='Treppen, Tore, Balkone, Stahlbau, Interior und Medaillons – mit echten Projekten, Bildern und Details aus dem bisherigen öffentlichen Webauftritt.';
}

function init(){ setupHeader(); setupServices(); rewriteCopy(); renderReferenceTools(); setupArchive(); setupSpecialWork(); setupLightbox(); setupForm(); upgradeContact(); renderReferences(); syncControls(); }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();