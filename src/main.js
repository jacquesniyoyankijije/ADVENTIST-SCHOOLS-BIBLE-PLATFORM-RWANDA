import './styles.css';
import { supabase, supabaseConfigured } from './services/supabase.js';

const app = document.querySelector('#app');
const modules = [
  { id: 'home', icon: '✦', title: 'Home', subtitle: 'Your central Adventist learning space' },
  { id: 'bible', icon: '▤', title: 'Bible Library', subtitle: 'Explore Scripture from Genesis to Revelation' },
  { id: 'egw', icon: '✧', title: 'Ellen G. White', subtitle: 'Browse authorized study and reading resources' },
  { id: 'lessons', icon: '⌁', title: 'Bible Lessons', subtitle: 'Save and organize lessons from your study' },
  { id: 'schools', icon: '⌂', title: 'Schools', subtitle: 'A future workspace for school directories' },
  { id: 'results', icon: '▥', title: 'Academic Results', subtitle: 'Role-protected academic reporting' },
  { id: 'discipline', icon: '◇', title: 'Discipline', subtitle: 'Private, permission-controlled student records' },
  { id: 'bursar', icon: '◎', title: 'Bursar Office', subtitle: 'School finance and fee management' },
  { id: 'messages', icon: '✉', title: 'Communication', subtitle: 'Coordination across school leadership' },
];
let active = 'home';

function render() {
  const current = modules.find(m => m.id === active) || modules[0];
  app.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <a class="brand" href="#" data-page="home" aria-label="Go to home">
          <span class="brand-mark">✦</span><span><b>ADVENTIST</b><small>RWANDA PLATFORM</small></span>
        </a>
        <div class="side-label">WORKSPACE</div>
        <nav class="nav-list" aria-label="Main navigation">
          ${modules.map(m => `<button class="nav-item ${active === m.id ? 'active' : ''}" data-page="${m.id}"><span class="nav-icon">${m.icon}</span><span>${m.title}</span></button>`).join('')}
        </nav>
        <div class="sidebar-bottom">
          <div class="status-dot"></div><span>Platform foundation</span>
          <small>${supabaseConfigured ? 'Supabase configured' : 'Demo mode · connect Supabase'}</small>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <div class="breadcrumb">ADVENTIST RWANDA <span>/</span> <b>${current.title.toUpperCase()}</b></div>
          <div class="top-actions"><span class="secure-tag">◈ Secure workspace</span><div class="avatar">NJ</div></div>
        </header>
        <section class="welcome">
          <div class="welcome-copy">
            <div class="eyebrow"><span class="eyebrow-line"></span> FAITH · EDUCATION · COMMUNITY</div>
            <h1>${active === 'home' ? 'Grow in knowledge.\nLead with purpose.' : current.title + '.'}</h1>
            <p>${active === 'home' ? 'One connected space for Bible study, Adventist learning, and school coordination in Rwanda.' : current.subtitle + '. This section is prepared for phased implementation.'}</p>
            <div class="welcome-buttons">
              <button class="primary-button" data-page="bible">Explore Bible Library <span>↗</span></button>
              <button class="quiet-button" data-page="lessons">My study lessons <span>→</span></button>
            </div>
          </div>
          <div class="verse-card">
            <div class="verse-top"><span>DAILY REFLECTION</span><span class="cross">✝</span></div>
            <div class="verse-mark">“</div>
            <blockquote>Let all that you do be done in love.</blockquote>
            <div class="verse-reference">1 CORINTHIANS 16:14</div>
            <div class="verse-rule"></div><div class="verse-note">A foundation of faith, service and learning.</div>
          </div>
          <div class="orbit orbit-one"></div><div class="orbit orbit-two"></div>
        </section>
        <section class="section-heading"><div><div class="eyebrow">YOUR PLATFORM</div><h2>Explore the workspace</h2></div><span class="section-note">A connected vision for Rwanda</span></section>
        <section class="module-grid">
          ${modules.filter(m => m.id !== 'home').map((m, i) => `<button class="module-card" data-page="${m.id}"><span class="module-symbol symbol-${i % 4}">${m.icon}</span><span class="card-arrow">↗</span><h3>${m.title}</h3><p>${m.subtitle}</p><span class="card-foot">OPEN SECTION <b>→</b></span></button>`).join('')}
        </section>
        <footer><span>© ${new Date().getFullYear()} Adventist Schools & Bible Platform — Rwanda</span><span>Built for faith, learning & service</span></footer>
      </main>
    </div>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
  `;
  app.querySelectorAll('[data-page]').forEach(el => el.addEventListener('click', e => {
    e.preventDefault();
    const page = el.dataset.page;
    if (!modules.some(m => m.id === page)) return;
    active = page;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page !== 'home') {
      const toast = document.querySelector('#toast');
      if (toast) {
        toast.textContent = page === 'bible' || page === 'egw' || page === 'lessons'
          ? 'Reading tools are planned for the next implementation phase.'
          : 'This management module will be connected after authentication and access rules are configured.';
        toast.classList.add('show');
        window.setTimeout(() => toast.classList.remove('show'), 3200);
      }
    }
  }));
}

render();

// Ambient canvas decoration; reduced-motion preferences are respected.
const canvas = document.querySelector('#ambient-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let raf = 0;
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  particles = Array.from({ length: Math.min(50, Math.floor(window.innerWidth / 28)) }, () => ({
    x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
    r: Math.random() * 1.7 + .3, speed: Math.random() * .18 + .04, alpha: Math.random() * .35 + .08
  }));
}
function animate() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (const p of particles) {
    p.y -= p.speed;
    if (p.y < -3) { p.y = window.innerHeight + 3; p.x = Math.random() * window.innerWidth; }
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(128, 187, 177, ${p.alpha})`; ctx.fill();
  }
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) raf = requestAnimationFrame(animate);
}
resizeCanvas();
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) animate();
window.addEventListener('resize', () => { cancelAnimationFrame(raf); resizeCanvas(); animate(); });

console.info('Adventist Rwanda platform frontend ready.', { supabaseConfigured, clientAvailable: Boolean(supabase) });
