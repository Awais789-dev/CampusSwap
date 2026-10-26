/* CampusSwap — vanilla JS. Data lives in localStorage (browser-only, NOT a real database). */
const CATS = [
  { name: 'Books & Notes', icon: '📚' }, { name: 'Electronics', icon: '💻' },
  { name: 'Clothing', icon: '👕' }, { name: 'Accessories', icon: '🎒' },
  { name: 'Hostel Essentials', icon: '🛏️' }, { name: 'Sports Equipment', icon: '🏏' }
];
const FALLBACK = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450"><rect width="100%" height="100%" fill="#ece8ff"/><text x="50%" y="50%" font-size="80" text-anchor="middle" dominant-baseline="middle">🛍️</text></svg>');
const img = s => `https://picsum.photos/seed/${s}/600/450`;

// id, title, price, original, category, seller, campus, condition, description, image seed
const SEED = [
  [1,'Engineering Mathematics Textbook',1800,3200,'Books & Notes','Ayesha Khan','NUST Islamabad','Like New','Kreyszig-style textbook, no highlighting, all pages intact.','book1'],
  [2,'Casio FX-991ES Calculator',2500,4200,'Electronics','Hamza Ali','FAST Lahore','Used','Scientific calculator, works perfectly. Cover included.','calc2'],
  [3,'Hoodie (Navy, Size M)',1500,3500,'Clothing','Sara Ahmed','LUMS Lahore','Like New','Warm fleece hoodie worn only a few times.','hoodie3'],
  [4,'Laptop Backpack 25L',2200,4000,'Accessories','Usman Tariq','IBA Karachi','Used','Water-resistant backpack with padded laptop sleeve.','bag4'],
  [5,'Mini Fridge for Hostel',14000,22000,'Hostel Essentials','Bilal Raza','UET Lahore','Used','Compact 90L fridge, cools well. Pickup from hostel.','fridge5'],
  [6,'Cricket Bat (English Willow)',6500,9500,'Sports Equipment','Hassan Mir','COMSATS Islamabad','Like New','Lightly used bat with grip and cover.','bat6'],
  [7,'Wireless Headphones',4500,7500,'Electronics','Noor Fatima','Karachi University','Like New','Bluetooth headphones, 20-hour battery, box included.','phones7'],
  [8,'Study Table Lamp (LED)',900,1800,'Hostel Essentials','Zain Malik','NED Karachi','New','Adjustable LED lamp, USB powered, still sealed.','lamp8'],
  [9,'Data Structures Notes Bundle',600,'','Books & Notes','Maryam Siddiqui','FAST Karachi','Used','Handwritten, well-organised notes with solved past papers.','notes9'],
  [10,'Badminton Racket Set',2800,4500,'Sports Equipment','Ali Hussain','GIKI','Like New','Two rackets, three shuttlecocks and a carry bag.','badm10'],
  [11,'Denim Jacket (Size L)',2000,4800,'Clothing','Hira Baig','Punjab University','Used','Classic denim jacket in great condition.','jacket11'],
  [12,'Wrist Watch (Analog)',1700,3000,'Accessories','Daniyal Shah','SZABIST Karachi','New','Minimal analog watch with leather strap.','watch12']
].map(([id,title,price,original,category,seller,campus,condition,description,seed]) =>
  ({ id, title, price, original, category, seller, campus, condition, description, image: img(seed), featured: id <= 8 }));

/* ---------- Helpers ---------- */
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const esc = t => String(t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pkr = n => 'Rs ' + Number(n).toLocaleString('en-PK');
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { toast('Browser storage unavailable', 'err'); } };

let products = load('cs_products', null);
if (!products) { products = SEED; save('cs_products', products); }
let wishlist = load('cs_wishlist', []);

function toast(msg, type = '') {
  const t = document.createElement('div');
  t.className = 'toast ' + type; t.textContent = msg;
  $('#toasts').append(t);
  setTimeout(() => t.remove(), 3200);
}

/* ---------- Rendering ---------- */
function card(p) {
  const fav = wishlist.includes(p.id);
  return `<article class="card product">
    <button class="fav" data-fav="${p.id}" aria-pressed="${fav}" aria-label="${fav ? 'Remove from' : 'Add to'} wishlist">${fav ? '♥' : '♡'}</button>
    <img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">
    <div class="info">
      <div><span class="tag">${esc(p.category)}</span> <span class="tag cond">${esc(p.condition)}</span></div>
      <h3>${esc(p.title)}</h3>
      <div class="price">${pkr(p.price)}${p.original ? `<s>${pkr(p.original)}</s>` : ''}</div>
      <div class="small">👤 ${esc(p.seller)} · 🎓 ${esc(p.campus)}</div>
      <button class="btn btn-outline" data-view="${p.id}">View Details</button>
    </div></article>`;
}

function renderAll() {
  $('#featuredGrid').innerHTML = products.filter(p => p.featured).slice(0, 8).map(card).join('');
  const list = filtered();
  $('#productGrid').innerHTML = list.map(card).join('');
  $('#emptyState').hidden = list.length > 0;
  $('#resultCount').textContent = `${list.length} item${list.length === 1 ? '' : 's'} found`;
  const w = products.filter(p => wishlist.includes(p.id));
  $('#wishGrid').innerHTML = w.map(card).join('');
  $('#wishEmpty').hidden = w.length > 0;
  $('#wishCount').textContent = w.length;
}

function filtered() {
  const q = $('#search').value.trim().toLowerCase(), cat = $('#catFilter').value, cond = $('#condFilter').value, sort = $('#sort').value;
  let l = products.filter(p =>
    (!q || (p.title + p.description + p.category + p.seller + p.campus).toLowerCase().includes(q)) &&
    (!cat || p.category === cat) && (!cond || p.condition === cond));
  if (sort) l = [...l].sort((a, b) => sort === 'asc' ? a.price - b.price : b.price - a.price);
  return l;
}

function clearFilters() {
  ['#search', '#catFilter', '#condFilter', '#sort'].forEach(s => $(s).value = '');
  renderAll();
}

/* ---------- Setup: categories & selects ---------- */
function setup() {
  const opts = '<option value="">All categories</option>' + CATS.map(c => `<option>${c.name}</option>`).join('');
  $('#heroCat').innerHTML = opts; $('#catFilter').innerHTML = opts;
  $('#sCat').innerHTML = '<option value="">Select…</option>' + CATS.map(c => `<option>${c.name}</option>`).join('');
  $('#categoryGrid').innerHTML = CATS.map(c => `<button class="cat-card" data-cat="${c.name}"><span>${c.icon}</span>${c.name}</button>`).join('');
  $('#footerCats').innerHTML = CATS.map(c => `<a href="#explore" data-cat="${c.name}">${c.name}</a>`).join('');
}

function goExplore(cat = '', q = '') {
  $('#catFilter').value = cat; $('#search').value = q; renderAll();
  $('#explore').scrollIntoView();
}

/* ---------- Product modal ---------- */
function openProduct(id) {
  const p = products.find(x => x.id === id); if (!p) return;
  $('#productModalBody').innerHTML = `<img class="modal-img" src="${esc(p.image)}" alt="${esc(p.title)}">
    <div class="modal-body"><div><span class="tag">${esc(p.category)}</span> <span class="tag cond">${esc(p.condition)}</span></div>
    <h2 style="margin:0">${esc(p.title)}</h2>
    <div class="price" style="font-size:1.3rem">${pkr(p.price)}${p.original ? `<s>${pkr(p.original)}</s>` : ''}</div>
    <p>${esc(p.description)}</p>
    <p class="small">👤 Seller: <b>${esc(p.seller)}</b><br>🎓 Campus: <b>${esc(p.campus)}</b></p>
    <button class="btn btn-primary" data-contact="${esc(p.seller)}">Contact Seller</button></div>`;
  $('#productModal').showModal();
}

/* ---------- Forms ---------- */
function setError(input, msg) {
  input.classList.toggle('invalid', !!msg);
  const s = input.closest('.field').querySelector('.error'); if (s) s.textContent = msg || '';
  return !msg;
}

$('#sellForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = id => $('#' + id);
  const price = Number(f('sPrice').value);
  let ok = true;
  const check = (id, bad, msg) => { ok = setError(f(id), bad ? msg : '') && ok; };
  check('sTitle', f('sTitle').value.trim().length < 3, 'Enter a title (3+ characters).');
  check('sDesc', f('sDesc').value.trim().length < 10, 'Description needs 10+ characters.');
  check('sPrice', !(price > 0), 'Enter a valid price in PKR.');
  check('sCat', !f('sCat').value, 'Choose a category.');
  check('sCond', !f('sCond').value, 'Choose a condition.');
  check('sCampus', !f('sCampus').value.trim(), 'Enter your campus.');
  check('sSeller', !f('sSeller').value.trim(), 'Enter your name.');
  const url = f('sImage').value.trim();
  check('sImage', url && !/^https?:\/\/.+/i.test(url), 'Enter a valid http(s) URL or leave blank.');
  if (!ok) return toast('Please fix the highlighted fields.', 'err');
  products.unshift({
    id: Date.now(), title: f('sTitle').value.trim(), description: f('sDesc').value.trim(), price, original: '',
    category: f('sCat').value, condition: f('sCond').value, campus: f('sCampus').value.trim(),
    seller: f('sSeller').value.trim(), image: url || img('new' + Date.now()), featured: false
  });
  save('cs_products', products); e.target.reset(); renderAll();
  toast('Item listed successfully! 🎉', 'ok'); $('#explore').scrollIntoView();
});

/* ---------- Auth (simulated only: nothing is saved) ---------- */
let authMode = 'login';
function setAuth(mode) {
  authMode = mode;
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === mode));
  $('#nameField').hidden = mode === 'login';
  $('#authSubmit').textContent = mode === 'login' ? 'Login' : 'Create Account';
  $('#authForm').reset(); $$('#authForm .invalid').forEach(i => setError(i, ''));
}
$('#authForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#aName'), email = $('#aEmail'), pass = $('#aPass'); let ok = true;
  if (authMode === 'signup') ok = setError(name, name.value.trim().length < 2 ? 'Enter your name.' : '') && ok;
  ok = setError(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) ? '' : 'Enter a valid email.') && ok;
  ok = setError(pass, pass.value.length < 6 ? 'Password must be 6+ characters.' : '') && ok;
  if (!ok) return;
  toast(authMode === 'login' ? 'Demo login successful (no real account).' : 'Demo sign-up complete (nothing was saved).', 'ok');
  $('#authModal').close();
});
$('#pwToggle').addEventListener('click', () => {
  const p = $('#aPass'), show = p.type === 'password';
  p.type = show ? 'text' : 'password';
  $('#pwToggle').setAttribute('aria-label', show ? 'Hide password' : 'Show password');
});

/* ---------- Global event delegation ---------- */
document.addEventListener('click', e => {
  const t = e.target;
  const get = a => t.closest(`[${a}]`);
  if (get('data-fav')) {
    const id = Number(get('data-fav').dataset.fav), had = wishlist.includes(id);
    wishlist = had ? wishlist.filter(x => x !== id) : [...wishlist, id];
    save('cs_wishlist', wishlist); renderAll(); toast(had ? 'Removed from wishlist' : 'Added to wishlist ♥');
  } else if (get('data-view')) openProduct(Number(get('data-view').dataset.view));
  else if (get('data-contact')) toast(`Demo: message sent to ${get('data-contact').dataset.contact}. (No real messaging in this project.)`, 'ok');
  else if (get('data-cat')) { e.preventDefault(); goExplore(get('data-cat').dataset.cat); }
  else if (get('data-auth')) { setAuth(get('data-auth').dataset.auth); $('#authModal').showModal(); }
  else if (get('data-tab')) setAuth(get('data-tab').dataset.tab);
  else if (get('data-demo')) { e.preventDefault(); toast(`Demo link: ${get('data-demo').dataset.demo} page not available.`); }
  else if (get('data-clear')) clearFilters();
  else if (get('[data-close]') || t.matches('[data-close]')) t.closest('dialog').close();
  else if (t.tagName === 'DIALOG') t.close(); // click on backdrop
  if (t.closest('.nav-links a, .nav-links button')) { $('#navLinks').classList.remove('open'); $('#navToggle').setAttribute('aria-expanded', 'false'); }
});
// Escape closes <dialog> natively.

$('#navToggle').addEventListener('click', () => {
  const open = $('#navLinks').classList.toggle('open');
  $('#navToggle').setAttribute('aria-expanded', open);
});
$('#heroForm').addEventListener('submit', e => { e.preventDefault(); goExplore($('#heroCat').value, $('#heroQuery').value.trim()); });
$('#clearFilters').addEventListener('click', clearFilters);
['#search', '#catFilter', '#condFilter', '#sort'].forEach(s => $(s).addEventListener('input', renderAll));
// Broken images fall back to a local placeholder
document.addEventListener('error', e => {
  if (e.target.tagName === 'IMG' && !e.target.dataset.fb) { e.target.dataset.fb = 1; e.target.src = FALLBACK; }
}, true);

setup(); renderAll();
