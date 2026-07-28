/* ── CARTOON CURSOR ── */

const cursor = document.getElementById("cursor");
const canUseCustomCursor = cursor && window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 901px)').matches;

if (canUseCustomCursor) {
  const showCursor = () => cursor.classList.add('is-visible');
  const hideCursor = () => {
    cursor.classList.remove('is-visible', 'on-dark');
  };

  document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
    cursor.classList.toggle('on-dark', Boolean(e.target.closest('footer')));
    showCursor();
  });

  document.documentElement.addEventListener('mouseleave', hideCursor);
  window.addEventListener('blur', hideCursor);
}

/* ── Cursor (desktop only) ── */
// const cursor = document.getElementById('cursor');
// const cursorRing = document.getElementById('cursorRing');
// let mx = 0, my = 0, rx = 0, ry = 0;

// document.addEventListener('mousemove', e => {
//   mx = e.clientX; my = e.clientY;
//   cursor.style.left = mx + 'px';
//   cursor.style.top = my + 'px';
// });

// (function animRing() {
//   rx += (mx - rx) * 0.11;
//   ry += (my - ry) * 0.11;
//   cursorRing.style.left = rx + 'px';
//   cursorRing.style.top = ry + 'px';
//   requestAnimationFrame(animRing);
// })();

/* Differentiate CTA buttons vs regular links for cursor colour */
// function initCursorSelectors() {
//   document.querySelectorAll('.btn-primary, .nav-cta, .talk-big-btn, .companion-btn, .ai-send, .mood-btn, .curated-tab').forEach(el => {
//     el.addEventListener('mouseenter', () => {
//       cursor.classList.remove('cursor-hover');
//       cursorRing.classList.remove('cursor-hover');
//       cursor.classList.add('cursor-cta');
//       cursorRing.classList.add('cursor-cta');
//     });
//     el.addEventListener('mouseleave', () => {
//       cursor.classList.remove('cursor-cta');
//       cursorRing.classList.remove('cursor-cta');
//     });
//   });

//   document.querySelectorAll('a:not(.btn-primary):not(.nav-cta), button:not(.companion-btn):not(.ai-send):not(.mood-btn):not(.curated-tab)').forEach(el => {
//     el.addEventListener('mouseenter', () => {
//       cursor.classList.add('cursor-hover');
//       cursorRing.classList.add('cursor-hover');
//     });
//     el.addEventListener('mouseleave', () => {
//       cursor.classList.remove('cursor-hover');
//       cursorRing.classList.remove('cursor-hover');
//     });
//   });
// }


/* ── Nav scroll ── */
window.addEventListener('scroll', () => {
  document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 30);
});

/* ── Floating chat dark-bg detection ── */
const darkSections = document.querySelectorAll('.cta-banner, .about-hero, .blog-banner');
const wallBg = document.querySelector('.hero-wall-bg');
const floatChat = document.getElementById('floatChat');

function updateFloatChatColor() {
  if (!floatChat) return;
  const onDark = [...darkSections].some(s => {
    const r = s.getBoundingClientRect();
    return r.bottom > window.innerHeight * 0.5 && r.top < window.innerHeight * 0.85;
  });
  let onWall = false;
  if (wallBg && document.getElementById('home').classList.contains('active')) {
    const wRect = wallBg.getBoundingClientRect();
    const fRect = floatChat.getBoundingClientRect();
    onWall = !(fRect.right < wRect.left || fRect.left > wRect.right ||
              fRect.bottom < wRect.top  || fRect.top  > wRect.bottom);
  }
  floatChat.classList.toggle('on-dark', onDark || onWall);
}

if (floatChat) {
  const obs = new IntersectionObserver(updateFloatChatColor, { threshold: 0.2 });
  darkSections.forEach(s => obs.observe(s));
  if (wallBg) obs.observe(wallBg);
  window.addEventListener('scroll', updateFloatChatColor, { passive: true });
}

/* ══════════ PAGE NAVIGATION ══════════ */
let pageTransitionTimer = null;

function showPage(id) {
  const current = document.querySelector('section.active');
  const target = document.getElementById(id);
  updateBottomTabs(id);
  if (!target || current === target) return;

  clearTimeout(pageTransitionTimer);
  document.querySelectorAll('section').forEach(s => s.classList.remove('page-enter', 'page-exit'));

  if (current) current.classList.add('page-exit');

  pageTransitionTimer = setTimeout(() => {
    document.querySelectorAll('section').forEach(s => {
      s.classList.remove('active', 'page-enter', 'page-exit');
    });
    target.classList.add('active', 'page-enter');
    
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    setTimeout(() => target.classList.remove('page-enter'), 360);
    setTimeout(observeReveal, 80);
    
    if (id === 'home') {
      staggerBricks();
      setTimeout(initHeroWordReveal, 60);
    }
    
    // Re-trigger layout engine items for newly exposed sections
    initCardTilt();
    updateFloatChatColor();
  }, current ? 150 : 0);
}

function updateBottomTabs(id) {
  document.querySelectorAll('.bottom-tab').forEach(t => t.classList.remove('active'));
  const tab = document.getElementById('tab-' + id);
  if (tab) tab.classList.add('active');
  
  const tabs = [...document.querySelectorAll('.bottom-tab')];
  const index = Math.max(0, tabs.findIndex(t => t.id === 'tab-' + id));
  const indicator = document.getElementById('bottomTabIndicator');
  if (indicator) indicator.style.transform = `translateX(${index * 100}%)`;

  document.querySelectorAll('.nav-links a:not(.nav-cta)').forEach(a => a.classList.remove('nav-active'));
  const pageMap = { home: 0, about: 1, blog: 2, share: 3, therapy: 4 };
  if (id in pageMap) {
    const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');
    if (navLinks[pageMap[id]]) navLinks[pageMap[id]].classList.add('nav-active');
  }

  // Sync the mobile slide-out menu's active state
  document.querySelectorAll('.mobile-menu-links a').forEach(a => a.classList.remove('mobile-active'));
  const mobileLink = document.getElementById('m-' + id);
  if (mobileLink) mobileLink.classList.add('mobile-active');
}

/* ══════════ MOBILE SLIDE-OUT MENU ══════════ */
function openMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const toggle = document.getElementById('navToggle');
  if (!menu) return;
  menu.classList.add('open');
  menu.setAttribute('aria-hidden', 'false');
  document.body.classList.add('menu-open');
  if (toggle) {
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
  }
}

function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const toggle = document.getElementById('navToggle');
  if (!menu) return;
  menu.classList.remove('open');
  menu.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-open');
  if (toggle) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (!menu) return;
  if (menu.classList.contains('open')) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

// Navigate from the mobile menu: switch page, then close the drawer.
function navigateMobile(id) {
  closeMobileMenu();
  showPage(id);
}

// Close the menu on Escape, or when resizing up to desktop.
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMobileMenu();
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 700) closeMobileMenu();
});

/* ── Scroll reveal ── */
function observeReveal() {
  const activeSection = document.querySelector('section.active');
  if (!activeSection) return;
  const els = activeSection.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  els.forEach(el => { el.classList.remove('visible'); obs.observe(el); });
}

/* ── Hero wall brick stagger ── */
function staggerBricks() {
  document.querySelectorAll('.hero-wall-bg svg rect').forEach((el, i) => {
    const fill = el.getAttribute('fill') || '';
    if (!fill.includes('url')) {
      el.style.opacity = '0';
      el.style.transition = `opacity 0.4s ease ${i * 0.007}s`;
      requestAnimationFrame(() => { el.style.opacity = '1'; });
    }
  });
}

/* ── Parallax hero wall ── */
const heroMotion = {
  targetX: 0, targetY: 0, x: 0, y: 0,
  targetFigX: 0, targetFigY: 0, figX: 0, figY: 0,
  scrollY: 0, raf: null
};

function updateHeroWallTransform() {
  const wall = document.querySelector('.hero-wall-bg');
  const figure = document.getElementById('heroFigure');
  if (!wall) return;
  heroMotion.x += (heroMotion.targetX - heroMotion.x) * 0.08;
  heroMotion.y += (heroMotion.targetY - heroMotion.y) * 0.08;
  heroMotion.figX += (heroMotion.targetFigX - heroMotion.figX) * 0.1;
  heroMotion.figY += (heroMotion.targetFigY - heroMotion.figY) * 0.1;
  wall.style.transform = `translate(${heroMotion.x}px, ${heroMotion.scrollY + heroMotion.y}px)`;
  if (figure) {
    figure.style.setProperty('--figure-x', `${heroMotion.figX}px`);
    figure.style.setProperty('--figure-y', `${heroMotion.figY}px`);
  }
  heroMotion.raf = requestAnimationFrame(updateHeroWallTransform);
}

function initHeroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero || window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
  if (!heroMotion.raf) updateHeroWallTransform();
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    heroMotion.targetX = -nx * 36;
    heroMotion.targetY = -ny * 20;
    heroMotion.targetFigX = nx * 20;
    heroMotion.targetFigY = ny * 20;
  });
  hero.addEventListener('mouseleave', () => {
    heroMotion.targetX = 0;
    heroMotion.targetY = 0;
    heroMotion.targetFigX = 0;
    heroMotion.targetFigY = 0;
  });
}

window.addEventListener('scroll', () => {
  heroMotion.scrollY = document.getElementById('home').classList.contains('active') ? window.scrollY * 0.12 : 0;
});

/* ══════════ THERAPY CORNER DATA ══════════ */
const CURATED = {
  anxious:{
    label:'Anxious',subtitle:'Things that calm the nervous system and quiet the mind.',
    books:[
      {icon:'📖',title:'The Anxiety and Worry Workbook',desc:'Aaron Beck & Clark — practical CBT tools to defuse anxious thoughts.',tag:'Self-help'},
      {icon:'📖',title:'Dare',desc:'Barry McDonagh — reframe anxiety as excitement, not threat.',tag:'Psychology'},
      {icon:'📖',title:'Full Catastrophe Living',desc:'Jon Kabat-Zinn — mindfulness for stress and anxiety.',tag:'Mindfulness'},
    ],
    music:[
      {icon:'🎵',title:'Weightless — Marconi Union',desc:'Scientifically designed to reduce anxiety by 65%.',tag:'Ambient'},
      {icon:'🎵',title:'Spiegel im Spiegel — Arvo Pärt',desc:'Piano and violin piece with a deeply calming pulse.',tag:'Classical'},
      {icon:'🎵',title:'Breathe — Pink Floyd',desc:'Gentle, grounding classic for anxious minds.',tag:'Rock'},
    ],
    movies:[
      {icon:'🎬',title:'Inside Out',desc:'Pixar\'s masterpiece on understanding your own emotions.',tag:'Animation'},
      {icon:'🎬',title:'Wild',desc:'Reese Witherspoon walking through fear toward herself.',tag:'Drama'},
      {icon:'🎬',title:'The Secret Life of Walter Mitty',desc:'A gentle reminder to stop imagining and start living.',tag:'Adventure'},
    ],
    podcasts:[
      {icon:'🎙️',title:'Calm Masterclass',desc:'Daily 10-min meditations for anxiety relief.',tag:'Meditation'},
      {icon:'🎙️',title:'The Anxiety Coaches Podcast',desc:'Practical tools for managing anxiety every day.',tag:'Self-help'},
      {icon:'🎙️',title:'Ten Percent Happier',desc:'Dan Harris on making meditation approachable.',tag:'Mindfulness'},
    ],
  },
  lonely:{
    label:'Lonely',subtitle:'Stories and sounds that remind you — you are not alone.',
    books:[
      {icon:'📖',title:'Eleanor Oliphant is Completely Fine',desc:'A tender novel about isolation and unexpected connection.',tag:'Fiction'},
      {icon:'📖',title:'Lost Connections',desc:'Johann Hari on the real causes of loneliness and how to heal.',tag:'Non-fiction'},
      {icon:'📖',title:'The Lonely City',desc:'Olivia Laing exploring loneliness through art.',tag:'Essay'},
    ],
    music:[
      {icon:'🎵',title:'Let Her Go — Passenger',desc:'A song that makes loneliness feel universally shared.',tag:'Indie'},
      {icon:'🎵',title:'The Night Will Always Win — Manchester Orchestra',desc:'Raw and beautiful aloneness.',tag:'Alternative'},
      {icon:'🎵',title:'Holocene — Bon Iver',desc:'Introspective and achingly beautiful.',tag:'Folk'},
    ],
    movies:[
      {icon:'🎬',title:'Her',desc:'A film about connection, loneliness, and what it means to be heard.',tag:'Drama'},
      {icon:'🎬',title:'Castaway',desc:'The deepest human desire: to be known by another.',tag:'Drama'},
      {icon:'🎬',title:'Nomadland',desc:'Quiet, profound, and strangely comforting.',tag:'Drama'},
    ],
    podcasts:[
      {icon:'🎙️',title:'The Human Experience',desc:'Stories from real people about real loneliness and belonging.',tag:'Stories'},
      {icon:'🎙️',title:'Unlonely Planet',desc:'Research and stories on the loneliness epidemic.',tag:'Wellness'},
      {icon:'🎙️',title:'Where Should We Begin? — Esther Perel',desc:'Real couples — real human connection.',tag:'Relationships'},
    ],
  },
  grieving:{
    label:'Grieving',subtitle:'Gentle companions for when loss feels too big to hold alone.',
    books:[
      {icon:'📖',title:'The Year of Magical Thinking',desc:'Joan Didion\'s raw, honest account of grief after loss.',tag:'Memoir'},
      {icon:'📖',title:'Option B — Sheryl Sandberg',desc:'On resilience and finding joy after grief.',tag:'Non-fiction'},
      {icon:'📖',title:'It\'s OK That You\'re Not OK',desc:'Megan Devine rejects the idea that grief needs to be fixed.',tag:'Grief'},
    ],
    music:[
      {icon:'🎵',title:'Fix You — Coldplay',desc:'One of the most comforting songs ever written.',tag:'Alternative'},
      {icon:'🎵',title:'Blackbird — The Beatles',desc:'A song of quiet encouragement through darkness.',tag:'Classic'},
      {icon:'🎵',title:'Tears in Heaven — Eric Clapton',desc:'Written from grief, offering solace to others.',tag:'Rock'},
    ],
    movies:[
      {icon:'🎬',title:'Manchester by the Sea',desc:'One of the most honest portrayals of grief in cinema.',tag:'Drama'},
      {icon:'🎬',title:'Coco',desc:'A beautiful, tear-filled celebration of love and remembrance.',tag:'Animation'},
      {icon:'🎬',title:'A Monster Calls',desc:'A child\'s grief, told with breathtaking honesty.',tag:'Drama'},
    ],
    podcasts:[
      {icon:'🎙️',title:'Good Grief',desc:'Tender conversations about loss, healing, and hope.',tag:'Grief'},
      {icon:'🎙️',title:'Griefcast',desc:'Comedian Cariad Lloyd talks honestly about death.',tag:'Stories'},
      {icon:'🎙️',title:'The Grief Recovery Method',desc:'Practical steps through the pain of loss.',tag:'Self-help'},
    ],
  },
  burnout:{
    label:'Burnt Out',subtitle:'Rest first. Then gently, these might help you find yourself again.',
    books:[
      {icon:'📖',title:'Burnout — Emily & Amelia Nagoski',desc:'Why burnout happens and how to complete the stress cycle.',tag:'Science'},
      {icon:'📖',title:'Do Nothing — Celeste Headlee',desc:'A manifesto for rest in an always-on world.',tag:'Self-help'},
      {icon:'📖',title:'Rest — Alex Soojung-Kim Pang',desc:'Why you get more done when you work less.',tag:'Productivity'},
    ],
    music:[
      {icon:'🎵',title:'Clair de Lune — Debussy',desc:'Close your eyes. Let your shoulders drop.',tag:'Classical'},
      {icon:'🎵',title:'Breathe (In the Air) — Pink Floyd',desc:'An invitation to simply exist.',tag:'Rock'},
      {icon:'🎵',title:'Comptine d\'un autre été — Yann Tiersen',desc:'Delicate piano that asks nothing of you.',tag:'Film score'},
    ],
    movies:[
      {icon:'🎬',title:'About Time',desc:'A beautiful reminder of what actually matters.',tag:'Drama'},
      {icon:'🎬',title:'Chef',desc:'A man walks away from pressure and rediscovers joy.',tag:'Drama'},
      {icon:'🎬',title:'Julie & Julia',desc:'Two women finding meaning outside the grind.',tag:'Comedy'},
    ],
    podcasts:[
      {icon:'🎙️',title:'The Lazy Genius Podcast',desc:'Be a genius about things that matter, lazy about things that don\'t.',tag:'Lifestyle'},
      {icon:'🎙️',title:'Feel Better Live More',desc:'Dr Rangan Chatterjee on sustainable energy and rest.',tag:'Health'},
      {icon:'🎙️',title:'Nothing Much Happens',desc:'Deeply boring, deeply soothing bedtime stories for adults.',tag:'Sleep'},
    ],
  },
  low:{
    label:'Feeling Low',subtitle:'Small lights for dark days.',
    books:[
      {icon:'📖',title:'Reasons to Stay Alive — Matt Haig',desc:'A brutally honest and deeply hopeful memoir on depression.',tag:'Memoir'},
      {icon:'📖',title:'The Bell Jar — Sylvia Plath',desc:'You are not alone in what you\'re feeling.',tag:'Fiction'},
      {icon:'📖',title:'Lost Connections — Johann Hari',desc:'Understanding depression beyond the chemical imbalance myth.',tag:'Non-fiction'},
    ],
    music:[
      {icon:'🎵',title:'Mad World — Gary Jules',desc:'Sits with you in the sadness instead of rushing you out.',tag:'Melancholy'},
      {icon:'🎵',title:'The Night — Disturbed',desc:'Permission to feel everything.',tag:'Rock'},
      {icon:'🎵',title:'Someone Like You — Adele',desc:'Beautiful, cathartic, and deeply human.',tag:'Pop'},
    ],
    movies:[
      {icon:'🎬',title:'Silver Linings Playbook',desc:'Mess and recovery and unexpected love.',tag:'Drama'},
      {icon:'🎬',title:'Good Will Hunting',desc:'Being seen is the beginning of healing.',tag:'Drama'},
      {icon:'🎬',title:'Eternal Sunshine of the Spotless Mind',desc:'Pain is part of what makes us whole.',tag:'Drama'},
    ],
    podcasts:[
      {icon:'🎙️',title:'The Hilarious World of Depression',desc:'Comedians talk honestly about depression — surprisingly healing.',tag:'Comedy'},
      {icon:'🎙️',title:'Unlocking Us — Brené Brown',desc:'On vulnerability, shame, and what it means to be human.',tag:'Psychology'},
      {icon:'🎙️',title:'Therapy for Black Girls',desc:'Accessible mental health conversations for everyone.',tag:'Wellness'},
    ],
  },
  lost:{
    label:'Feeling Lost',subtitle:'Companions for the in-between, uncertain, searching times.',
    books:[
      {icon:'📖',title:'The Alchemist — Paulo Coelho',desc:'A timeless story about trusting the journey.',tag:'Fiction'},
      {icon:'📖',title:'Designing Your Life — Burnett & Evans',desc:'Practical tools for building a life when you have no idea what you want.',tag:'Self-help'},
      {icon:'📖',title:'Man\'s Search for Meaning — Viktor Frankl',desc:'Finding purpose even in the darkest circumstances.',tag:'Philosophy'},
    ],
    music:[
      {icon:'🎵',title:'Fast Car — Tracy Chapman',desc:'About wanting more, and not knowing how.',tag:'Folk'},
      {icon:'🎵',title:'Lost! — Coldplay',desc:'A gentle anthem for anyone who can\'t find their way.',tag:'Alternative'},
      {icon:'🎵',title:'Road Trippin\' — Red Hot Chili Peppers',desc:'The beauty of not knowing where you\'re going.',tag:'Rock'},
    ],
    movies:[
      {icon:'🎬',title:'Eat Pray Love',desc:'A woman dismantles her life to find herself — messy and honest.',tag:'Drama'},
      {icon:'🎬',title:'The Secret Life of Walter Mitty',desc:'A dreamer who finally takes the leap.',tag:'Adventure'},
      {icon:'🎬',title:'Paterson',desc:'A quiet film about finding meaning in everyday life.',tag:'Drama'},
    ],
    podcasts:[
      {icon:'🎙️',title:'How I Built This — Guy Raz',desc:'People who had no idea what they were doing — and figured it out.',tag:'Stories'},
      {icon:'🎙️',title:'The Tim Ferriss Show',desc:'Conversations with people who redefined their paths.',tag:'Inspiration'},
      {icon:'🎙️',title:'What Should I Read Next?',desc:'For when even knowing where to start feels overwhelming.',tag:'Books'},
    ],
  }
};

let currentMood = null;
let currentTab = 'books';

function selectMood(btn, mood) {
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  currentMood = mood;
  currentTab = 'books';
  document.querySelectorAll('.curated-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.curated-tab')[0].classList.add('active');
  renderCurated();
  const section = document.getElementById('curatedSection');
  section.classList.add('visible');
  setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  const aiInput = document.getElementById('aiInput');
  if (aiInput && !aiInput.value) {
    aiInput.value = `I'm feeling ${CURATED[mood].label.toLowerCase()} right now.`;
    autoResize(aiInput);
  }
}

function switchTab(btn, tab) {
  document.querySelectorAll('.curated-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  currentTab = tab;
  renderCurated();
}

function renderCurated() {
  if (!currentMood) return;
  const data = CURATED[currentMood];
  document.getElementById('curatedTitle').textContent = `For when you're feeling ${data.label.toLowerCase()}`;
  document.getElementById('curatedSubtitle').textContent = data.subtitle;
  const items = data[currentTab];
  const grid = document.getElementById('curatedCards');
  grid.innerHTML = items.map(item => `
    <div class="curated-card">
      <div class="curated-card-icon">${item.icon}</div>
      <div class="curated-card-info">
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
        <span class="tag">${item.tag}</span>
      </div>
    </div>
  `).join('');
  initCursorSelectors(); // Re-bind custom cursors on dynamically injected cards
}

/* ── AI CHAT (Wally) ── */
const aiMessages = document.getElementById('aiMessages');
let chatHistory = [];
let aiResponseCount = 0;

const WALLY_SYSTEM = `You are Wally, a warm and compassionate AI companion for "The Wall and Us". You help users explore emotions and suggest resources. Keep responses concise (2-4 sentences). Validate feelings first.`;

async function sendAiMessage() {
  const input = document.getElementById('aiInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  autoResize(input);
  appendMsg('user', text);
  chatHistory.push({ role: 'user', content: text });
  const typingEl = appendTyping();
  
  // Simulated fallback response handler for front-end demonstration since Anthropic API key is absent here
  setTimeout(() => {
    typingEl.remove();
    let reply = "Thank you for sharing that with me. Your feelings are entirely valid, and it takes courage to put them into words. What else is on your mind?";
    if(currentMood && aiResponseCount === 0) {
      reply = `I hear you completely. Feeling ${CURATED[currentMood].label.toLowerCase()} can feel overwhelming. I've updated the cards above with some custom content that might offer support. Would you like to talk more about what triggered this feeling?`;
    } else if (aiResponseCount >= 1) {
      reply = "I'm incredibly glad you're breaking down your walls with me. If things feel heavy, remember that one of our real human listeners is on the other side right now, ready to match your step. Whenever you're ready, click 'Talk to Us'. What more would you like to unpack?";
    }
    appendMsg('ai', reply);
    chatHistory.push({ role: 'assistant', content: reply });
    aiResponseCount += 1;
  }, 1000);
}

function appendMsg(role, text) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.innerHTML = `<div class="msg-avatar">${role === 'ai' ? '🌿' : '🫂'}</div><div class="msg-bubble">${text.replace(/\n/g, '<br>')}</div>`;
  aiMessages.appendChild(div);
  aiMessages.scrollTop = aiMessages.scrollHeight;
  return div;
}

function appendTyping() {
  const div = document.createElement('div');
  div.className = 'msg ai';
  div.innerHTML = `<div class="msg-avatar">🌿</div><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  aiMessages.appendChild(div);
  aiMessages.scrollTop = aiMessages.scrollHeight;
  return div;
}

function handleAiKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAiMessage(); }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function scrollToWally() {
  document.querySelector('.ai-panel-wrapper')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function initStepRings() {
  document.querySelectorAll('.step-num').forEach(num => {
    if (num.querySelector('.step-ring')) return;
    const value = num.textContent.trim();
    num.innerHTML = `<svg class="step-ring" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="28"></circle></svg><span>${value}</span>`;
  });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('drawn');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.45 });
  document.querySelectorAll('.step-num').forEach(num => obs.observe(num));
}

function initCardTilt() {
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
  document.querySelectorAll('.blog-card, .value-card, .wwd-card, .talk-card, .curated-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const rotateX = y * -16;
      const rotateY = x * 16;
      card.style.transition = 'transform 0.08s ease, box-shadow 0.3s';
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.35s ease, box-shadow 0.3s';
      card.style.transform = '';
    });
  });
}

function initMoodRipples() {
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const r = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'mood-ripple';
      ripple.style.left = `${e.clientX - r.left - 14}px`;
      ripple.style.top = `${e.clientY - r.top - 14}px`;
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

function initHeroWordReveal() {
  const hero = document.querySelector('.hero');
  const title = document.querySelector('.hero-title');
  if (!hero || !title) return;
  hero.classList.remove('hero-copy-visible');
  hero.classList.add('word-reveal-ready');
  const words = ['Someone', 'is', 'here', 'to', 'listen', 'to', 'your', 'story'];
  let i = 0;
  const word = text => `<span class="hero-word" style="--word-delay:${(i++ * 0.08).toFixed(2)}s">${text}</span>`;
  title.classList.add('word-ready');
  title.innerHTML = `${word(words[0])} ${word(words[1])} ${word(words[2])}<br>${word(words[3])} <em>${word(words[4])}</em> ${word(words[5])}<br><span class="underline-sketch">${word(words[6])} ${word(words[7])}</span>`;
  setTimeout(() => hero.classList.add('hero-copy-visible'), (i * 80) + 520);
}

function initCtaParticles() {
  document.querySelectorAll('.cta-banner').forEach((banner, bannerIndex) => {
    if (banner.querySelector('.cta-particles')) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'cta-particles';
    banner.prepend(canvas);
    const ctx = canvas.getContext('2d');
    const colors = ['196,96,58', '122,158,135'];
    const particles = Array.from({ length: 20 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      r: 1.8 + Math.random() * 2.8,
      speed: 0.00022 + Math.random() * 0.00028,
      drift: (Math.random() - 0.5) * 0.00018,
      color: colors[(i + bannerIndex) % colors.length],
      opacity: 0.12 + Math.random() * 0.06
    }));
    function sizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = banner.getBoundingClientRect();
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw() {
      const rect = banner.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      particles.forEach(p => {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -0.08) p.y = 1.08;
        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
        ctx.arc(p.x * rect.width, p.y * rect.height, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
    draw();
  });
}

/* ══════════ SHARE YOUR EXPERIENCE — FORM SUBMISSION ══════════ */

// 1) Deploy the Google Apps Script web app (see the README the deployment guide gave you).
// 2) Paste the resulting "Web app URL" below, between the quotes.
// 3) That's it — submissions will start landing as new rows in your Google Sheet.
const SHARE_FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbwnuNJRIpDkc5wOzpQhdxM6OYrXwSgHYOPtduAXWI7uDq0iLPJwZDbKW6gGEYXXi6QD/exec";

function initShareForm() {
  const form = document.getElementById('shareForm');
  if (!form) return;

  const submitBtn = document.getElementById('shareSubmitBtn');
  const submitLabel = document.getElementById('shareSubmitLabel');
  const statusBox = document.getElementById('shareFormStatus');

  function setStatus(message, type) {
    statusBox.textContent = message;
    statusBox.className = 'form-status visible ' + type;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const story = document.getElementById('shareStory').value.trim();
    if (!story) {
      setStatus('Please share at least a few words before submitting.', 'error');
      document.getElementById('shareStory').focus();
      return;
    }

    // Honeypot check — if this hidden field has a value, a bot filled the form. Quietly stop.
    const honeypot = document.getElementById('shareWebsite');
    if (honeypot && honeypot.value) {
      setStatus("Thank you for sharing. We've received your story.", 'success');
      form.reset();
      return;
    }

    if (!SHARE_FORM_ENDPOINT || SHARE_FORM_ENDPOINT.indexOf('PASTE_YOUR') === 0) {
      setStatus('This form is not connected to a Google Sheet yet. Please follow the setup steps to add your Apps Script URL.', 'error');
      return;
    }

    const payload = new URLSearchParams({
      name: document.getElementById('shareName').value.trim(),
      email: document.getElementById('shareEmail').value.trim(),
      story: story,
      consent: document.getElementById('shareConsent').checked ? 'Yes' : 'No',
      submittedAt: new Date().toISOString(),
      pageUrl: window.location.href
    });

    submitBtn.disabled = true;
    submitLabel.textContent = 'Sending…';
    statusBox.className = 'form-status';

    fetch(SHARE_FORM_ENDPOINT, {
      method: 'POST',
      // Sending the URLSearchParams object directly (not .toString()) lets the browser set
      // Content-Type: application/x-www-form-urlencoded automatically. This avoids a CORS
      // preflight request AND lets Apps Script correctly populate e.parameter on the other end.
      body: payload
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.result === 'success') {
          setStatus("Thank you for trusting us with your story. We've received it. 💛", 'success');
          form.reset();
        } else {
          throw new Error((data && data.message) || 'Unknown error');
        }
      })
      .catch(() => {
        setStatus("Something went wrong sending your story. Please try again, or reach out via Talk to Us.", 'error');
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitLabel.textContent = 'Share My Story';
      });
  });
}

// Global execution wrapper on initial layout load
document.addEventListener("DOMContentLoaded", () => {
  updateBottomTabs('home');
  staggerBricks();
//   initCursorSelectors();
  initStepRings();
  initCardTilt();
  initMoodRipples();
  initHeroWordReveal();
  initHeroParallax();
  initCtaParticles();
  initShareForm();
  observeReveal();
});



/* ══════════ TAWK.TO LIVE CHAT (embedded, in-page) ══════════ */
// The chat opens directly on the page in a small chat window instead of
// navigating away to a tawk.to page.
//
// We load tawk's official embed widget but hide its default floating bubble,
// because this site uses its own "Talk to Us" buttons + floating button as the
// launcher. Clicking any of those calls openTawk(), which opens the chat inline.
//
// tawk ships no pop-out control of its own, so we inject one into its header
// (see injectPopoutButton) which calls Tawk_API.popup().
var Tawk_API = Tawk_API || {};
var Tawk_LoadStart = new Date();

var TAWK_CHAT_URL = 'https://tawk.to/chat/58b7d7955b8fe5150ee9ed59/default';
var TAWK_EMBED_URL = 'https://embed.tawk.to/58b7d7955b8fe5150ee9ed59/default';

/* ── Unread replies ──
 * Because the widget is hidden while minimized, tawk's own bubble and unread
 * counter never show. Without this, a listener replying after the visitor
 * minimizes produces no signal at all.
 */
var chatUnread = 0;
var chatBaseTitle = document.title;

function paintChatUnread() {
  [document.getElementById('floatChat'), document.getElementById('tab-talk')]
    .forEach(function (el) {
      if (!el) return;
      el.classList.toggle('has-unread', chatUnread > 0);
      el.setAttribute('data-unread', chatUnread > 9 ? '9+' : String(chatUnread));
    });
  document.title = chatUnread > 0 ? '(' + chatUnread + ') ' + chatBaseTitle : chatBaseTitle;
}

function setChatUnread(n) {
  n = Math.max(0, n | 0);
  if (n === chatUnread) return;
  chatUnread = n;
  paintChatUnread();
}

function clearChatUnread() { setChatUnread(0); }

// Undocumented but present in tawk's bundle — the authoritative count.
Tawk_API.onUnreadCountChanged = function (count) {
  setChatUnread(typeof count === 'number' ? count : parseInt(count, 10) || 0);
};

// Fallback for if that callback ever disappears.
Tawk_API.onChatMessageAgent = function () {
  var maximized = typeof Tawk_API.isChatMaximized === 'function' && Tawk_API.isChatMaximized();
  if (!maximized) setChatUnread(chatUnread + 1);
};

// Hide tawk's own bubble on load — our buttons are the launchers.
Tawk_API.onLoad = function () {
  if (typeof Tawk_API.hideWidget === 'function') Tawk_API.hideWidget();
};

Tawk_API.onChatMaximized = function () {
  document.body.classList.add('chat-maximized');
  ensurePopoutControl();
  clearChatUnread();
};

// When the visitor minimizes or closes the chat, tuck tawk's bubble away again
// so it never lingers on top of the site's own UI (e.g. the mobile bottom nav).
Tawk_API.onChatMinimized = function () {
  document.body.classList.remove('chat-maximized');
  if (typeof Tawk_API.hideWidget === 'function') Tawk_API.hideWidget();
};
Tawk_API.onChatHidden = function () {
  document.body.classList.remove('chat-maximized');
  if (typeof Tawk_API.hideWidget === 'function') Tawk_API.hideWidget();
};

(function () {
  var s1 = document.createElement("script");
  var s0 = document.getElementsByTagName("script")[0];
  s1.async = true;
  s1.src = TAWK_EMBED_URL;
  s1.charset = 'UTF-8';
  s1.setAttribute('crossorigin', '*');
  s0.parentNode.insertBefore(s1, s0);
})();

// Open the chat in-page. Falls back to the hosted chat page only if the widget
// hasn't finished loading yet (rare — the embed loads asynchronously).
function openTawk() {
  clearChatUnread();
  if (window.Tawk_API && typeof Tawk_API.maximize === 'function') {
    try {
      if (typeof Tawk_API.showWidget === 'function') Tawk_API.showWidget();
      Tawk_API.maximize();
      return;
    } catch (e) {
      // fall through to the fallback below
    }
  }
  window.open(TAWK_CHAT_URL, '_blank', 'noopener');
}

// Open the conversation in its own window. This MUST run directly inside a click
// handler — window.open outside a user gesture gets eaten by the popup blocker,
// which is why there is no "wait for tawk to load" path here.
function openTawkPopup() {
  if (window.Tawk_API && typeof Tawk_API.popup === 'function') {
    try {
      Tawk_API.popup();
      if (typeof Tawk_API.minimize === 'function') Tawk_API.minimize();
      if (typeof Tawk_API.hideWidget === 'function') Tawk_API.hideWidget();
      return;
    } catch (e) {
      // fall through to the plain window.open below
    }
  }
  window.open(TAWK_CHAT_URL, 'twau_chat', 'width=420,height=680');
}

/* ── Pop-out button, injected into tawk's own chat header ── */
// tawk v4 mounts its widget straight into this document (no iframe, no shadow
// root), so its header is ordinary DOM we can append to. The class names are
// undocumented though, so try several and fall back to a docked pill of our own
// (see .chat-popout) if none of them match.
var POPOUT_BTN_ID = 'twauPopoutBtn';
var popoutObserver = null;

var TAWK_HEADER_SELECTORS = [
  '[class*="tawk-header"]',
  '[class*="tawk-overlay-header"]',
  '[class*="tawk-card-header"]',
  '[class*="tawk-min-container"] [class*="header"]'
];

function findTawkHeader() {
  for (var i = 0; i < TAWK_HEADER_SELECTORS.length; i++) {
    var el = document.querySelector(TAWK_HEADER_SELECTORS[i]);
    if (el && el.offsetParent !== null) return el;
  }
  return null;
}

function buildPopoutButton() {
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.id = POPOUT_BTN_ID;
  btn.className = 'twau-popout-btn';
  btn.title = 'Open this chat in its own window';
  btn.setAttribute('aria-label', 'Open this chat in its own window');
  btn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>' +
    '<polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    openTawkPopup();
  });
  return btn;
}

function injectPopoutButton() {
  if (document.getElementById(POPOUT_BTN_ID)) return true;
  var header = findTawkHeader();
  if (!header) return false;
  header.appendChild(buildPopoutButton());
  // Vue re-renders the header on state changes and can drop our node, so watch
  // for it disappearing while the chat is still open.
  if (!popoutObserver && window.MutationObserver) {
    popoutObserver = new MutationObserver(function () {
      if (document.body.classList.contains('chat-maximized') &&
          !document.getElementById(POPOUT_BTN_ID)) {
        injectPopoutButton();
      }
    });
    popoutObserver.observe(document.body, { childList: true, subtree: true });
  }
  return true;
}

// The header animates in, so retry for ~2s before giving up and showing the pill.
function ensurePopoutControl() {
  var tries = 0;
  (function attempt() {
    if (injectPopoutButton()) {
      document.body.classList.remove('chat-popout-fallback');
      return;
    }
    if (++tries > 20) {
      document.body.classList.add('chat-popout-fallback');
      return;
    }
    setTimeout(attempt, 100);
  })();
}
