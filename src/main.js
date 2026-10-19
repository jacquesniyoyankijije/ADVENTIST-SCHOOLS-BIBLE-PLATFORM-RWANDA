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
let authMode = 'signin';
let currentSession = null;
let currentProfile = null;
let authMessage = '';

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3600);
}

function roleName() {
  const role = currentProfile?.role;
  if (Array.isArray(role)) return role[0]?.name || 'Signed-in user';
  return role?.name || 'Signed-in user';
}

async function loadProfile() {
  if (!supabase || !currentSession?.user?.id) return;
  const userId = currentSession.user.id;
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, role:roles(name)')
    .eq('id', userId)
    .maybeSingle();

  if (currentSession?.user?.id !== userId) return;
  currentProfile = error ? null : data;
  render();
}

function authPanel() {
  const signingUp = authMode === 'signup';
  return `
    <form class="auth-form" id="auth-form" novalidate>
      ${signingUp ? `
        <label for="auth-name">Full name</label>
        <input id="auth-name" name="full_name" type="text" autocomplete="name" maxlength="100" placeholder="Enter your full name" required />
      ` : ''}
      <label for="auth-email">Email address</label>
      <input id="auth-email" name="email" type="email" autocomplete="email" maxlength="254" placeholder="you@example.com" required />
      <label for="auth-password">Password</label>
      <input id="auth-password" name="password" type="password" autocomplete="${signingUp ? 'new-password' : 'current-password'}" minlength="8" placeholder="${signingUp ? 'At least 8 characters' : 'Enter your password'}" required />
      <button class="primary-button auth-submit" type="submit">${signingUp ? 'Create account' : 'Sign in'} <span>↗</span></button>
      <p class="auth-message" id="auth-message" role="status" aria-live="polite">${escapeHTML(authMessage)}</p>
      <p class="auth-switch">${signingUp ? 'Already registered?' : 'New to the platform?'}
        <button type="button" class="text-button" data-auth-mode="${signingUp ? 'signin' : 'signup'}">${signingUp ? 'Sign in' : 'Create an account'}</button>
      </p>
      <p class="auth-footnote">New accounts receive the Ordinary User role by default. Administrator access must be granted securely by the system administrator.</p>
    </form>
  `;
}

function render() {
  const authPage = active === 'auth';
  const current = modules.find(m => m.id === active) || modules[0];
  const pageTitle = authPage ? 'ACCOUNT ACCESS' : current.title.toUpperCase();
  const displayName = currentProfile?.full_name || currentSession?.user?.email || '';
  const initials = (currentProfile?.full_name || currentSession?.user?.email || 'NJ')
    .split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('');
  const accountActions = currentSession
    ? `<div class="account-summary"><span class="account-name">${escapeHTML(displayName)}</span><span class="role-chip">${escapeHTML(roleName())}</span></div><button class="signout-button" id="signout-button" type="button">Sign out</button>`
    : '<button class="sign-in-button" type="button" data-page="auth">Sign in <span>↗</span></button>';

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
          <div class="breadcrumb">ADVENTIST RWANDA <span>/</span> <b>${pageTitle}</b></div>
          <div class="top-actions">${accountActions}<div class="avatar" title="${currentSession ? escapeHTML(roleName()) : 'Platform'}">${escapeHTML(initials || 'NJ')}</div></div>
        </header>
        <section class="welcome ${authPage ? 'auth-welcome' : ''}">
          <div class="welcome-copy">
            <div class="eyebrow"><span class="eyebrow-line"></span> ${authPage ? 'SECURE ACCOUNT ACCESS' : 'FAITH · EDUCATION · COMMUNITY'}</div>
            <h1>${authPage ? (authMode === 'signup' ? 'Join the learning community.' : 'Welcome back.') : (active === 'home' ? 'Grow in knowledge.\nLead with purpose.' : current.title + '.')}</h1>
            <p>${authPage ? 'Sign in to continue to your workspace, or create an account to begin. Access to school management records depends on your assigned role.' : (active === 'home' ? 'One connected space for Bible study, Adventist learning, and school coordination in Rwanda.' : current.subtitle + '. This section is prepared for phased implementation.')}</p>
            ${authPage ? authPanel() : `
              <div class="welcome-buttons">
                <button class="primary-button" data-page="bible">Explore Bible Library <span>↗</span></button>
                <button class="quiet-button" data-page="lessons">My study lessons <span>→</span></button>
              </div>
            `}
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
    if (page === 'auth' || modules.some(m => m.id === page)) {
      active = page;
      authMessage = '';
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (page !== 'home' && page !== 'auth') {
        showToast(page === 'bible' || page === 'egw' || page === 'lessons'
          ? 'Reading tools are planned for the next implementation phase.'
          : 'This management module will be connected after its database and access rules are ready.');
      }
    }
  }));

  app.querySelectorAll('[data-auth-mode]').forEach(el => el.addEventListener('click', () => {
    authMode = el.dataset.authMode;
    authMessage = '';
    render();
  }));

  const authFormEl = document.querySelector('#auth-form');
  if (authFormEl) authFormEl.addEventListener('submit', handleAuthSubmit);

  const signout = document.querySelector('#signout-button');
  if (signout) signout.addEventListener('click', handleSignOut);
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const fullName = String(formData.get('full_name') || '').trim();

  if (!supabaseConfigured || !supabase) {
    authMessage = 'Supabase is not connected yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Render Environment settings, then redeploy.';
    render();
    return;
  }
  if (!email || !password || password.length < 8 || (authMode === 'signup' && !fullName)) {
    authMessage = 'Enter a valid email, a password of at least 8 characters, and your full name when creating an account.';
    render();
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Please wait…'; }

  try {
    if (authMode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      if (error) throw error;
      if (data.session) {
        currentSession = data.session;
        await loadProfile();
        active = 'home';
        authMessage = '';
        render();
        showToast('Account created. Welcome to the platform.');
      } else {
        authMessage = 'Registration started. Check your email for the confirmation link, then return here to sign in.';
        render();
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      currentSession = data.session;
      await loadProfile();
      active = 'home';
      authMessage = '';
      render();
      showToast('You are signed in.');
    }
  } catch (error) {
    authMessage = error?.message || 'Authentication failed. Please try again.';
    render();
  }
}

async function handleSignOut() {
  if (!supabase) {
    currentSession = null;
    currentProfile = null;
    render();
    return;
  }
  const { error } = await supabase.auth.signOut();
  if (error) {
    showToast(error.message || 'Could not sign out. Please try again.');
    return;
  }
  currentSession = null;
  currentProfile = null;
  active = 'home';
  render();
  showToast('You have signed out.');
}

render();

if (supabase) {
  supabase.auth.onAuthStateChange((_event, session) => {
    currentSession = session;
    if (!session) currentProfile = null;
    render();
    if (session) window.setTimeout(() => loadProfile(), 0);
  });
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.warn('Could not restore Supabase session.');
      return;
    }
    currentSession = data.session;
    render();
    if (currentSession) loadProfile();
  });
}

// Ambient canvas decoration; reduced-motion preferences are respected.
const canvas = document.querySelector('#ambient-canvas');
if (canvas) {
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
}

console.info('Adventist Rwanda platform frontend ready.', { supabaseConfigured, clientAvailable: Boolean(supabase) });
