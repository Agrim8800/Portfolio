/* ============================================================
   THE SILENT MACHINE — Portfolio Content
   Agrim Jain — BTech CSE (1st Year, KIET)
   ============================================================
   All site copy, links, projects, and configurations can be
   edited directly below in the `content` object.
   ============================================================ */

window.content = {
  // ── Personal & Metadata ────────────────────────────────────
  meta: {
    name: 'Agrim Jain',
    title: 'Agrim Jain — AI & Agentic Systems Builder',
    tagline: 'Building agentic systems.',
    email: 'jain.agrim1510@gmail.com',
    location: 'Delhi NCR / India',
  },

  // ── Navigation Bar Links ───────────────────────────────────
  nav: [
    { label: 'About', href: '#about' },
    { label: 'Work', href: '#work' },
    { label: 'Systems', href: '#agents' },
    { label: 'Skills', href: '#skills' },
    { label: 'Timeline', href: '#achievements' },
    { label: 'Contact', href: '#contact' },
  ],

  // ── About Section ──────────────────────────────────────────
  about: {
    text: 'I am a builder at the intersection of artificial intelligence and agentic systems. Currently a first-year BTech Computer Science student at KIET, I design and develop multi-agent architectures that think, collaborate, and act autonomously. My focus is on pushing the boundaries of what autonomous systems can accomplish — from intelligent orchestration to real-time decision-making at scale.',
    stats: [
      { label: 'Currently', value: 'BTech CSE — Year 1' },
      { label: 'Institution', value: 'KIET' },
      { label: 'Focus', value: 'AI / Agentic Systems' },
    ],
  },

  // ── Featured Projects (CyberSentinel) ──────────────────────
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

  // ── Technical Skills ───────────────────────────────────────
  skills: [
    'Python', 'JavaScript', 'AI/ML', 'LangChain', 'Multi-Agent Systems',
    'LLM Engineering', 'Prompt Design', 'Systems Architecture',
    'Node.js', 'Git', 'Problem Solving', 'C++',
  ],

  // ── Timeline / Achievements ────────────────────────────────
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

  // ── External Links ─────────────────────────────────────────
  links: {
    github: 'https://github.com/Agrim8800',
    linkedin: 'https://www.linkedin.com/in/agrim-jain-381364422/',
    hackathon: 'https://github.com/zorobuilds/Jaypee.git',
  },
};

// Export for Node/CommonJS environments if ever imported
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.content;
}
