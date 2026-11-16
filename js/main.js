/* ============================================================
   THE SILENT MACHINE — Main Controller
   Portfolio of Agrim Jain (BTech CSE, KIET)
   ============================================================ */

/* ── Content Object (edit all site content here or in script.js) ─────── */
var content = window.content || {
  meta: {
    name: 'Agrim Jain',
    title: 'Agrim Jain — AI & Agentic Systems Builder',
    tagline: 'Building agentic systems.',
    email: 'jain.agrim1510@gmail.com',
    location: 'Delhi NCR / India',
  },

  nav: [
    { label: 'About', href: '#about' },
    { label: 'Work', href: '#work' },
    { label: 'Systems', href: '#agents' },
    { label: 'Skills', href: '#skills' },
    { label: 'Timeline', href: '#achievements' },
    { label: 'Contact', href: '#contact' },
  ],

  about: {
    text: 'I am a builder at the intersection of artificial intelligence and agentic systems. Currently a first-year BTech Computer Science student at KIET, I design and develop multi-agent architectures that think, collaborate, and act autonomously. My focus is on pushing the boundaries of what autonomous systems can accomplish — from intelligent orchestration to real-time decision-making at scale.',
    stats: [
      { label: 'Currently', value: 'BTech CSE — Year 1' },
      { label: 'Institution', value: 'KIET' },
      { label: 'Focus', value: 'AI / Agentic Systems' },
    ],
  },

  projects: [
    {
      id: 'cybersentinel',
      title: 'CyberSentinel',
      subtitle: 'Multi-Agent Intrusion Detection & Adaptive Defense',
      year: '2026',
      category: 'Agentic Cybersecurity',
      image: 'assets/command-centre.png',
      zip: 'assets/cybersentinel-nexai.zip',
      description: 'International Agentic AI Hackathon 2026 (Track 1) 1st Runner-Up. An autonomous 5-agent network intrusion defense platform achieving 99.996% accuracy and 0.99990 Macro-F1 across 114,185 validation flows. Agrim built and benchmarked Agent 5 (Adaptive Defense): the autonomous policy engine responsible for stateful policy activation, IP block mitigation, temporal expiry, and causal replay intervention.',
      link: 'https://github.com/zorobuilds/Jaypee.git',
      linkText: 'View Hackathon Repo',
      tech: ['Python', 'LangChain', 'Agent 5: Adaptive Defense', 'CatBoost', 'Causal Replay', 'FastAPI'],
    },
  ],

  skills: [
    'Python', 'JavaScript', 'AI/ML', 'LangChain', 'Multi-Agent Systems',
    'LLM Engineering', 'Prompt Design', 'Systems Architecture',
    'Node.js', 'Git', 'Problem Solving', 'C++',
  ],

  achievements: [
    {
      year: '2026',
      title: '1st Runner-Up — JAI Jaypee Agentic AI Hackathon',
      description: 'Built CyberSentinel (featuring Agent 5: Adaptive Defense), an autonomous multi-agent network intrusion detection system orchestrating five coordinated agents under a central Command Orchestrator. Won 1st Runner-Up among top regional teams.',
      badge: '1st Runner-Up',
    },
    {
      year: '2026',
      title: 'Began BTech CSE at KIET',
      description: 'Started the journey into Computer Science Engineering, immediately diving deep into artificial intelligence and autonomous systems development.',
      badge: null,
    },
  ],

  links: {
    github: 'https://github.com/Agrim8800',
    linkedin: 'https://www.linkedin.com/in/agrim-jain-381364422/',
    hackathon: 'https://github.com/zorobuilds/Jaypee.git',
  },
};


/* ── Globals ────────────────────────────────────────────── */
let lenis;
let cursorDot, cursorRing, cursorText;
let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;
let isMobile = window.innerWidth < 768;
const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ── Initialization Bootstrap ───────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

function bootstrap() {
  renderDynamicContent();
  initPreloader();
}


/* ── Render Dynamic Content from `content` Object ───────── */
function renderDynamicContent() {
  // 1. About section word spans
  const aboutText = document.querySelector('.about__text');
  if (aboutText && content.about && content.about.text) {
    const words = content.about.text.trim().split(/\s+/);
    aboutText.innerHTML = words
      .map(w => '<span class="word">' + w + '</span>')
      .join(' ');
  }

  // 2. Work / Projects items
  const workList = document.querySelector('.work__list');
  if (workList && content.projects && content.projects.length) {
    workList.innerHTML = '';
    content.projects.forEach((project, i) => {
      const num = String(i + 1).padStart(2, '0');
      const item = document.createElement('div');
      item.className = 'work__item';
      item.dataset.project = project.id;
      item.setAttribute('role', 'listitem');
      item.innerHTML =
        '<div class="work__item-link">' +
          '<span class="work__item-number">' + num + '</span>' +
          '<h3 class="work__item-title">' + project.title + '</h3>' +
          '<div class="work__item-meta">' +
            '<div>' + project.subtitle + '</div>' +
            '<div>' + project.year + '</div>' +
          '</div>' +
          '<span class="work__item-arrow">↗</span>' +
        '</div>';
      workList.appendChild(item);
    });
  }

  // 3. Navigation smooth scroll hooks
  initAnchorScroll();
}


/* ── Preloader ──────────────────────────────────────────── */
function initPreloader() {
  const preloader = document.querySelector('.preloader');
  const counter = document.querySelector('.preloader__counter');
  const lineFill = document.querySelector('.preloader__line-fill');

  // Fallback if GSAP is unavailable
  if (typeof gsap === 'undefined') {
    if (preloader) preloader.style.display = 'none';
    initSite();
    return;
  }

  if (!preloader || !counter) {
    initSite();
    return;
  }

  const duration = reducedMotion ? 0.4 : 2.0;
  const obj = { val: 0 };

  gsap.to(obj, {
    val: 100,
    duration: duration,
    ease: 'power2.inOut',
    onUpdate: () => {
      counter.textContent = Math.round(obj.val);
    },
  });

  if (lineFill) {
    gsap.to(lineFill, {
      scaleX: 1,
      duration: duration,
      ease: 'power2.inOut',
    });
  }

  gsap.to(preloader, {
    clipPath: 'inset(0 0 100% 0)',
    duration: 1.0,
    ease: 'expo.inOut',
    delay: duration + 0.25,
    onComplete: () => {
      preloader.style.display = 'none';
      initSite();
    },
  });
}


/* ── Site Init (after preloader reveal) ──────────────────── */
function initSite() {
  initLenis();
  initCursor();
  initHeroAnimations();
  initThreeScene();
  initAboutReveal();
  initWorkSection();
  initAgentsVisualization();
  initSkillsMarquee();
  initAchievementsReveal();
  initContactAnimations();
  initScrollProgress();
  initMagneticButtons();
  initSectionReveals();
  initFooterClock();
}


/* ── Lenis Smooth Scroll ────────────────────────────────── */
function initLenis() {
  if (typeof Lenis === 'undefined') return;

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });

  if (typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }
}


/* ── Anchor Smooth Scrolling ────────────────────────────── */
function initAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') {
        e.preventDefault();
        if (lenis) lenis.scrollTo(0, { duration: 1.2 });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { duration: 1.2 });
        else target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}


/* ── Custom Cursor ──────────────────────────────────────── */
function initCursor() {
  if (isMobile) return;

  cursorDot = document.querySelector('.cursor-dot');
  cursorRing = document.querySelector('.cursor-ring');
  cursorText = document.querySelector('.cursor-text');

  if (!cursorDot || !cursorRing) return;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    gsap.set(cursorDot, { x: mouseX, y: mouseY });

    // Pass normalized coordinates to Three.js sculpture
    if (window.HeroScene && typeof window.HeroScene.onMouseMove === 'function') {
      const nx = (mouseX / window.innerWidth) * 2 - 1;
      const ny = -(mouseY / window.innerHeight) * 2 + 1;
      window.HeroScene.onMouseMove(nx, ny);
    }
  });

  // Smooth lagging ring with rAF lerp
  function updateCursor() {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    gsap.set(cursorRing, { x: ringX, y: ringY });
    if (cursorText) {
      gsap.set(cursorText, { x: ringX, y: ringY });
    }
    requestAnimationFrame(updateCursor);
  }
  updateCursor();

  // Hover states for links and interactive buttons
  const hoverTargets = document.querySelectorAll('a, button, .nav__link, .contact__link, .magnetic-btn, .project-detail__close');
  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}


/* ── Hero Animations ────────────────────────────────────── */
function initHeroAnimations() {
  const nameWords = document.querySelectorAll('.hero__name .word-inner');
  const tagline = document.querySelector('.hero__tagline .line-inner');
  const scrollIndicator = document.querySelector('.hero__scroll-indicator');

  if (reducedMotion || typeof gsap === 'undefined') {
    nameWords.forEach((w) => (w.style.transform = 'translateY(0)'));
    if (tagline) tagline.style.transform = 'translateY(0)';
    if (scrollIndicator) scrollIndicator.style.opacity = '1';
    return;
  }

  const tl = gsap.timeline({ delay: 0.15 });

  tl.to(nameWords, {
    y: 0,
    duration: 1.2,
    ease: 'power4.out',
    stagger: 0.08,
  });

  if (tagline) {
    tl.to(tagline, {
      y: 0,
      duration: 0.8,
      ease: 'power4.out',
    }, '-=0.6');
  }

  if (scrollIndicator) {
    tl.fromTo(scrollIndicator,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      '-=0.3'
    );
  }
}


/* ── Three.js Scene ─────────────────────────────────────── */
function initThreeScene() {
  if (typeof THREE === 'undefined' || !window.HeroScene) return;

  try {
    window.HeroScene.init();
    window.HeroScene.animate();
  } catch (e) {
    console.warn('[HeroScene] Init failed:', e);
    return;
  }

  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => window.HeroScene.resume(),
      onLeave: () => window.HeroScene.pause(),
      onEnterBack: () => window.HeroScene.resume(),
      onLeaveBack: () => window.HeroScene.pause(),
    });
  }
}


/* ── About Section — Word-by-Word Scroll Scrub ──────────── */
function initAboutReveal() {
  const aboutWords = document.querySelectorAll('.about__text .word');
  if (!aboutWords.length) return;

  if (reducedMotion || typeof ScrollTrigger === 'undefined') {
    aboutWords.forEach((w) => w.classList.add('is-revealed'));
    return;
  }

  ScrollTrigger.create({
    trigger: '.about__text',
    start: 'top 75%',
    end: 'bottom 40%',
    scrub: true,
    onUpdate: (self) => {
      const totalWords = aboutWords.length;
      const wordsToReveal = Math.floor(self.progress * totalWords);
      aboutWords.forEach((word, i) => {
        if (i <= wordsToReveal) {
          word.classList.add('is-revealed');
        } else {
          word.classList.remove('is-revealed');
        }
      });
    },
  });

  const metaItems = document.querySelectorAll('.about__meta-item');
  if (typeof gsap !== 'undefined') {
    gsap.from(metaItems, {
      scrollTrigger: {
        trigger: '.about__meta',
        start: 'top 85%',
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power4.out',
      stagger: 0.1,
    });
  }
}


/* ── Helper: Rich Project Previews for Cursor Hover ────── */
function getProjectPreviewHtml(projectId) {
  return `
    <div class="work__preview-card">
      <div class="work__preview-header">
        <span>CYBERSENTINEL // NEXAI</span>
        <span class="work__preview-tag">AGENT 5: ADAPTIVE DEFENSE</span>
      </div>
      <div class="work__preview-body">
        <img src="assets/command-centre.png" alt="CyberSentinel Command Centre" class="work__preview-img">
      </div>
      <div class="work__preview-footer">
        <span>ACCURACY: 99.996% · 114K FLOWS</span>
        <span style="color:#EDEDE8">1ST RUNNER-UP</span>
      </div>
    </div>
  `;
}

/* ── Work / Projects & Cursor Preview ───────────────────── */
function initWorkSection() {
  const workItems = document.querySelectorAll('.work__item');
  const preview = document.querySelector('.work__preview');
  const previewMedia = document.querySelector('.work__preview-media');

  let previewTarget = { x: 0, y: 0 };
  let previewCurrent = { x: 0, y: 0 };
  let currentActiveId = null;

  if (!workItems.length) return;

  workItems.forEach((item, i) => {
    // Scroll reveal
    if (!reducedMotion && typeof gsap !== 'undefined') {
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power4.out',
        delay: i * 0.1,
      });
    }

    // Hover state & cursor preview
    item.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-project');
      if (cursorText) cursorText.textContent = 'VIEW';

      if (!isMobile && preview && previewMedia) {
        const projectId = item.dataset.project;
        if (projectId !== currentActiveId) {
          currentActiveId = projectId;
          const html = getProjectPreviewHtml(projectId);
          if (html) {
            previewMedia.innerHTML = html;
          }
        }
        preview.classList.add('is-visible');
      }
    });

    item.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-project');
      if (!isMobile && preview) {
        preview.classList.remove('is-visible');
      }
    });

    item.addEventListener('mousemove', (e) => {
      // Offset preview slightly to the top-right of cursor with boundary bounds
      const desiredX = e.clientX + 35;
      const desiredY = e.clientY - 120;
      const maxX = window.innerWidth - 400;
      const maxY = window.innerHeight - 260;

      previewTarget.x = Math.max(20, Math.min(desiredX, maxX));
      previewTarget.y = Math.max(20, Math.min(desiredY, maxY));
    });

    // Click to open detail modal
    item.addEventListener('click', (e) => {
      e.preventDefault();
      openProjectDetail(item.dataset.project);
    });
  });

  // Smooth lerp update for cursor follower
  if (!isMobile && preview) {
    function updatePreviewFollower() {
      previewCurrent.x += (previewTarget.x - previewCurrent.x) * 0.14;
      previewCurrent.y += (previewTarget.y - previewCurrent.y) * 0.14;
      preview.style.left = previewCurrent.x + 'px';
      preview.style.top = previewCurrent.y + 'px';
      requestAnimationFrame(updatePreviewFollower);
    }
    updatePreviewFollower();
  }
}


/* ── Project Detail Overlay Modal ───────────────────────── */
function openProjectDetail(projectId) {
  const project = content.projects.find((p) => p.id === projectId);
  if (!project) return;

  const detail = document.querySelector('.project-detail');
  if (!detail) return;

  detail.querySelector('.project-detail__title').textContent = project.title;
  detail.querySelector('.project-detail__description').textContent = project.description;

  const metaValues = detail.querySelectorAll('.project-detail__meta-value');
  if (metaValues[0]) metaValues[0].textContent = project.year;
  if (metaValues[1]) metaValues[1].textContent = project.category;
  if (metaValues[2]) metaValues[2].textContent = project.tech.join(', ');

  const link = detail.querySelector('.project-detail__primary-link') || detail.querySelector('.project-detail__link');
  if (link) {
    link.href = project.link;
    const span = link.querySelector('span');
    if (span) span.textContent = project.linkText || 'View Project';
  }

  // Handle download zip button
  const downloadBtn = detail.querySelector('.project-detail__download');
  if (downloadBtn) {
    if (project.zip) {
      downloadBtn.href = project.zip;
      downloadBtn.style.display = 'inline-flex';
    } else {
      downloadBtn.style.display = 'none';
    }
  }

  // Handle project media / screenshot
  const mediaContainer = detail.querySelector('.project-detail__media');
  const imgEl = detail.querySelector('.project-detail__image');
  if (imgEl && mediaContainer) {
    if (project.image) {
      imgEl.src = project.image;
      imgEl.alt = project.title + ' — Architecture & Interface';
      mediaContainer.style.display = 'block';
    } else {
      mediaContainer.style.display = 'none';
      imgEl.src = '';
    }
  }

  detail.scrollTop = 0;
  detail.classList.add('is-open');

  if (!reducedMotion && typeof gsap !== 'undefined') {
    gsap.fromTo(detail,
      { clipPath: 'inset(100% 0 0 0)' },
      { clipPath: 'inset(0% 0 0 0)', duration: 0.8, ease: 'expo.inOut' }
    );
  }

  // Stop Lenis background scrolling and allow native touchpad scrolling inside detail
  if (lenis) lenis.stop();
  document.body.style.overflow = 'hidden';

  // Prevent touchpad wheel and touch gestures from being intercepted by window Lenis
  if (!detail._hasScrollGuards) {
    detail.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });
    detail.addEventListener('touchmove', (e) => e.stopPropagation(), { passive: true });
    detail._hasScrollGuards = true;
  }
}

function closeProjectDetail() {
  const detail = document.querySelector('.project-detail');
  if (!detail) return;

  if (!reducedMotion && typeof gsap !== 'undefined') {
    gsap.to(detail, {
      clipPath: 'inset(0 0 100% 0)',
      duration: 0.6,
      ease: 'expo.inOut',
      onComplete: () => {
        detail.classList.remove('is-open');
        detail.style.clipPath = '';
      },
    });
  } else {
    detail.classList.remove('is-open');
  }

  if (lenis) lenis.start();
  document.body.style.overflow = '';
}

// Expose globally for HTML inline onclick
window.closeProjectDetail = closeProjectDetail;

// Keyboard navigation (Escape key closes modal)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const detail = document.querySelector('.project-detail');
    if (detail && detail.classList.contains('is-open')) {
      closeProjectDetail();
    }
  }
});


/* ── Agents Visualization ───────────────────────────────── */
function initAgentsVisualization() {
  if (!window.AgentVisualization) return;

  try {
    window.agentViz = new AgentVisualization();
    window.agentViz.init('agents-canvas');

    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.create({
        trigger: '#agents',
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => window.agentViz.resume(),
        onLeave: () => window.agentViz.pause(),
        onEnterBack: () => window.agentViz.resume(),
        onLeaveBack: () => window.agentViz.pause(),
      });
    }
  } catch (err) {
    console.warn('[AgentVisualization] Failed to initialize:', err);
  }
}


/* ── Skills Marquee ─────────────────────────────────────── */
function initSkillsMarquee() {
  const skillsSection = document.querySelector('.skills');
  if (!skillsSection || reducedMotion || typeof gsap === 'undefined') return;

  gsap.from(skillsSection, {
    scrollTrigger: {
      trigger: skillsSection,
      start: 'top 90%',
    },
    opacity: 0,
    duration: 1,
    ease: 'power2.out',
  });
}


/* ── Achievements Reveal ────────────────────────────────── */
function initAchievementsReveal() {
  const items = document.querySelectorAll('.timeline__item');
  if (!items.length || reducedMotion || typeof gsap === 'undefined') return;

  items.forEach((item, i) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 85%',
      },
      x: -30,
      opacity: 0,
      duration: 0.8,
      ease: 'power4.out',
      delay: i * 0.15,
    });
  });
}


/* ── Contact Animations ─────────────────────────────────── */
function initContactAnimations() {
  const heading = document.querySelector('.contact__heading');
  if (!heading || reducedMotion || typeof gsap === 'undefined') return;

  const chars = heading.querySelectorAll('.word-inner');
  if (chars.length) {
    gsap.from(chars, {
      scrollTrigger: {
        trigger: heading,
        start: 'top 80%',
      },
      y: '110%',
      duration: 1,
      ease: 'power4.out',
      stagger: 0.05,
    });
  }

  const contactRow = document.querySelector('.contact__row');
  if (contactRow) {
    gsap.from(contactRow, {
      scrollTrigger: {
        trigger: contactRow,
        start: 'top 85%',
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power4.out',
    });
  }
}


/* ── Scroll Progress ────────────────────────────────────── */
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress__bar');
  if (!bar || typeof ScrollTrigger === 'undefined') return;

  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      document.documentElement.style.setProperty('--scroll-progress', self.progress);
    },
  });
}


/* ── Magnetic Buttons ───────────────────────────────────── */
function initMagneticButtons() {
  if (isMobile || reducedMotion || typeof gsap === 'undefined') return;

  const magnetics = document.querySelectorAll('.magnetic-btn');

  magnetics.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.35,
        y: y * 0.35,
        duration: 0.4,
        ease: 'power2.out',
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)',
      });
    });
  });
}


/* ── Section Reveals ────────────────────────────────────── */
function initSectionReveals() {
  if (reducedMotion || typeof gsap === 'undefined') {
    document.querySelectorAll('.reveal-up').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    document.querySelectorAll('.reveal-line .line-inner').forEach((el) => {
      el.style.transform = 'none';
    });
    return;
  }

  const revealUps = document.querySelectorAll('.reveal-up');
  revealUps.forEach((el) => {
    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power4.out',
    });
  });

  const labels = document.querySelectorAll('.section-label');
  labels.forEach((label) => {
    gsap.from(label, {
      scrollTrigger: {
        trigger: label,
        start: 'top 90%',
      },
      x: -20,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out',
    });
  });
}


/* ── Footer Clock (Indian Standard Time) ─────────────────── */
function initFooterClock() {
  const clockEl = document.querySelector('.footer__clock');
  if (!clockEl) return;

  function updateClock() {
    const now = new Date();
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    clockEl.textContent = now.toLocaleTimeString('en-IN', options) + ' IST';
  }

  updateClock();
  setInterval(updateClock, 1000);
}


/* ── Resize Handler ─────────────────────────────────────── */
window.addEventListener('resize', () => {
  isMobile = window.innerWidth < 768;
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
});
