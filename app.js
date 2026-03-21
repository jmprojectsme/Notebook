// ── DOM References ─────────────────────────────────────
const profilePic    = document.getElementById('profilePic');
const profileName   = document.getElementById('profileName');
const userNameInput = document.getElementById('userNameInput');
const uploadPic     = document.getElementById('uploadPic');
const drawer        = document.getElementById('drawer');
const overlay       = document.getElementById('overlay');

// ── Helpers ────────────────────────────────────────────
function store(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function load(key, def)  { try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; } }

// ── Profile ────────────────────────────────────────────
// FIX: use FileReader (base64) instead of objectURL so picture persists on reload
uploadPic.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    profilePic.src = ev.target.result;
    store('notePic', ev.target.result);
  };
  reader.readAsDataURL(file);
});

userNameInput.addEventListener('input', () => {
  const name = userNameInput.value.trim();
  profileName.textContent = name || 'Your Name';
  store('noteName', name);
});

// Restore profile on load
window.addEventListener('load', () => {
  const pic  = load('notePic',  null);
  const name = load('noteName', '');
  if (pic)  profilePic.src = pic;
  if (name) { profileName.textContent = name; userNameInput.value = name; }

  // Restore paper + theme colors
  const paper = load('paperColor', null);
  const text  = load('paperText',  null);
  const theme = load('themeColor', null);
  if (paper) document.documentElement.style.setProperty('--paper', paper);
  if (text)  document.documentElement.style.setProperty('--text', text);
  if (theme) {
    document.documentElement.style.setProperty('--theme', theme);
    document.documentElement.style.setProperty('--bg', theme + '22');
  }
});

// ── Drawer ─────────────────────────────────────────────
function openDrawer()  { drawer.classList.add('open');  overlay.classList.add('show'); }
function closeDrawer() { drawer.classList.remove('open'); overlay.classList.remove('show'); }

document.getElementById('profileBtn').addEventListener('click', openDrawer);
document.getElementById('closeDrawerBtn').addEventListener('click', closeDrawer);
overlay.addEventListener('click', closeDrawer);

// ── Paper Color Swatches ───────────────────────────────
document.querySelectorAll('.color-swatch[data-bg]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.documentElement.style.setProperty('--paper', btn.dataset.bg);
    document.documentElement.style.setProperty('--text',  btn.dataset.color);
    store('paperColor', btn.dataset.bg);
    store('paperText',  btn.dataset.color);
    document.querySelectorAll('.color-swatch[data-bg]').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

// ── Theme Color Swatches ───────────────────────────────
document.querySelectorAll('.color-swatch[data-theme]').forEach(btn => {
  btn.addEventListener('click', () => {
    const color = btn.dataset.theme;
    document.documentElement.style.setProperty('--theme', color);
    document.documentElement.style.setProperty('--bg',    color + '22');
    store('themeColor', color);
    document.querySelectorAll('.color-swatch[data-theme]').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

// ── Tabs ───────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab + 'Tab').classList.add('active');
  });
});

// ── Reminders ──────────────────────────────────────────
const remindersList  = document.getElementById('remindersList');
const reminderInput  = document.getElementById('reminderInput');

function saveReminders() {
  const items = Array.from(remindersList.querySelectorAll('.note-item'))
    .map(d => d.dataset.text);
  store('reminders', items);
}

function createReminder(text) {
  const div = document.createElement('div');
  div.className  = 'note-item';
  div.dataset.text = text;

  const content = document.createElement('div');
  content.textContent = text;

  const meta = document.createElement('div');
  meta.className   = 'meta';
  meta.textContent = new Date().toLocaleDateString();

  const del = document.createElement('button');
  del.className   = 'delete-btn';
  del.textContent = '✕';
  del.title       = 'Delete';
  del.addEventListener('click', () => { div.remove(); saveReminders(); });

  div.appendChild(content);
  div.appendChild(meta);
  div.appendChild(del);
  remindersList.appendChild(div);
}

document.getElementById('addReminderBtn').addEventListener('click', () => {
  const text = reminderInput.value.trim();
  if (!text) return;
  createReminder(text);
  reminderInput.value = '';
  saveReminders();
});

// Load saved reminders
load('reminders', []).forEach(createReminder);

// ── Poems ──────────────────────────────────────────────
const poemsList  = document.getElementById('poemsList');
const poemInput  = document.getElementById('poemInput');
const poemDate   = document.getElementById('poemDateInput');

function savePoems() {
  const items = Array.from(poemsList.querySelectorAll('.note-item'))
    .map(d => ({ text: d.dataset.text, date: d.dataset.date }));
  store('poems', items);
}

function createPoem(text, date) {
  const div = document.createElement('div');
  div.className    = 'note-item';
  div.dataset.text = text;
  div.dataset.date = date;

  const content = document.createElement('div');
  content.textContent = text;

  const meta = document.createElement('div');
  meta.className   = 'meta';
  meta.textContent = '📅 ' + date;

  const del = document.createElement('button');
  del.className   = 'delete-btn';
  del.textContent = '✕';
  del.title       = 'Delete';
  del.addEventListener('click', () => { div.remove(); savePoems(); });

  div.appendChild(content);
  div.appendChild(meta);
  div.appendChild(del);
  poemsList.appendChild(div);
}

document.getElementById('addPoemBtn').addEventListener('click', () => {
  const text = poemInput.value.trim();
  const date = poemDate.value || new Date().toISOString().split('T')[0];
  if (!text) return;
  createPoem(text, date);
  poemInput.value = '';
  poemDate.value  = '';
  savePoems();
});

// Load saved poems
load('poems', []).forEach(p => createPoem(p.text, p.date));

// ── Sticky Notes ───────────────────────────────────────
const stickyBoard = document.getElementById('stickyBoard');

const stickyColors = ['#fef08a','#86efac','#93c5fd','#f9a8d4','#fdba74','#c4b5fd'];
let stickyColorIdx = 0;

function saveStickies() {
  const items = Array.from(stickyBoard.querySelectorAll('.sticky-note')).map(d => ({
    text:  d.querySelector('textarea').value,
    x:     parseInt(d.style.left),
    y:     parseInt(d.style.top),
    color: d.style.background
  }));
  store('stickies', items);
}

function createSticky(text = '', x = 10, y = 10, color = null) {
  const bg  = color || stickyColors[stickyColorIdx % stickyColors.length];
  stickyColorIdx++;

  const div = document.createElement('div');
  div.className        = 'sticky-note';
  div.style.left       = x + 'px';
  div.style.top        = y + 'px';
  div.style.background = bg;

  // Drag handle bar at top
  const handle = document.createElement('div');
  handle.className   = 'sticky-drag-handle';
  handle.textContent = '⠿ drag';
  handle.title       = 'Drag to move';

  const ta = document.createElement('textarea');
  ta.value       = text;
  ta.placeholder = 'Note...';

  const del = document.createElement('button');
  del.className   = 'delete-btn';
  del.textContent = '✕';
  del.title       = 'Delete';
  del.addEventListener('click', () => { div.remove(); saveStickies(); });

  div.appendChild(handle);
  div.appendChild(ta);
  div.appendChild(del);
  stickyBoard.appendChild(div);

  ta.addEventListener('input', saveStickies);

  // ── Drag Logic (Mouse + Touch) ─────────────────────
  // FIX: drag only from handle, track offset from sticky note position (not child element)
  // FIX: added full touch support for Android

  let dragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  function startDrag(clientX, clientY) {
    dragging    = true;
    // Offset relative to sticky note's current position
    dragOffsetX = clientX - div.getBoundingClientRect().left;
    dragOffsetY = clientY - div.getBoundingClientRect().top;
    div.style.zIndex = '999';
  }

  function moveDrag(clientX, clientY) {
    if (!dragging) return;
    const boardRect = stickyBoard.getBoundingClientRect();
    let newX = clientX - boardRect.left - dragOffsetX;
    let newY = clientY - boardRect.top  - dragOffsetY;

    // Clamp inside board
    newX = Math.max(0, Math.min(newX, stickyBoard.offsetWidth  - div.offsetWidth));
    newY = Math.max(0, Math.min(newY, stickyBoard.offsetHeight - div.offsetHeight));

    div.style.left = newX + 'px';
    div.style.top  = newY + 'px';
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    div.style.zIndex = '';
    saveStickies();
  }

  // Mouse events (on handle only)
  handle.addEventListener('mousedown', e => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  });
  document.addEventListener('mousemove', e => moveDrag(e.clientX, e.clientY));
  document.addEventListener('mouseup',   endDrag);

  // Touch events (on handle only) — FIX for Android
  handle.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  }, { passive: false });

  handle.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
  }, { passive: false });

  handle.addEventListener('touchend', endDrag);
}

document.getElementById('addStickyBtn').addEventListener('click', () => {
  // Stagger new stickies so they don't all stack on top of each other
  const offset = stickyBoard.querySelectorAll('.sticky-note').length * 20;
  createSticky('', 10 + offset % 120, 10 + offset % 80);
  saveStickies();
});

// Load saved stickies
load('stickies', []).forEach(s => createSticky(s.text, s.x, s.y, s.color));

// ── Service Worker ─────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(r  => console.log('SW registered:', r.scope))
      .catch(e => console.log('SW error:', e));
  });
}
