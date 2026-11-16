# The Silent Machine — Portfolio of Agrim Jain

A brutalist luxury portfolio website built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step — opens by double-clicking `index.html`.

![Monochrome](https://img.shields.io/badge/Design-Brutalist%20Luxury-050505?style=flat-square&labelColor=EDEDE8)

## Quick Start

1. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari)
2. That's it — no installation, no build step, no server required

> **Note**: An internet connection is needed on first load to fetch Google Fonts and CDN libraries (Three.js, GSAP, Lenis).

## Editing Content

All site content lives in a single `content` object in `script.js` (and `js/main.js`). Open `script.js` and edit:

```javascript
const content = {
  meta: { name: '...', tagline: '...', email: '...' },
  about: { text: '...', stats: [...] },
  projects: [ { title: '...', description: '...', link: '...' }, ... ],
  skills: ['Python', 'JavaScript', ...],
  achievements: [ { year: '2026', title: '...', description: '...' } ],
  links: { github: '...', linkedin: '...' },
};
```

The HTML structure in `index.html` also contains some static content (achievements, skills marquee) that can be edited directly.

## File Structure

```
portfolio/
├── index.html              # Main page — semantic HTML5
├── script.js               # Clean content object for rapid editing
├── README.md               # Documentation & setup guide
├── css/
│   └── style.css           # Design system, layout, animations
│                            # (custom properties, fluid type, 12-col grid)
└── js/
    ├── main.js             # Site controller — preloader, cursor, scroll
    │                        # animations, Lenis, GSAP ScrollTrigger
    ├── three-scene.js      # Three.js chrome sculpture (hero section)
    └── agents.js           # Canvas-based multi-agent visualization
```

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--c-black` | `#050505` | Page background |
| `--c-off-white` | `#EDEDE8` | Primary text |
| `--c-grey-dark` | `#333333` | Borders, muted elements |
| `--c-silver` | `#888888` | Hover states, accents |
| `--f-display` | Space Grotesk | Headings |
| `--f-body` | Inter | Body text |
| `--f-mono` | JetBrains Mono | Labels, code |

## Libraries (CDN)

- **Three.js** r160 — 3D chrome sculpture
- **GSAP** 3.12 + ScrollTrigger — Scroll-driven animations
- **Lenis** 1.1 — Smooth scrolling

## Features

- Preloader with counter and cinematic clip-path reveal
- Three.js liquid-metal 3D sculpture with studio lighting & PMREM environment
- Featured project: **CyberSentinel** by NexAI (Multi-Agent Intrusion Detection & Adaptive Defense, 1st Runner-Up at JAI Jaypee Hackathon) with interface screenshot & architectural schematics
- Scroll-scrubbed word reveal (about section)
- Custom cursor with project hover state
- Interactive multi-agent constellation visualization (Canvas 2D) simulating CyberSentinel's 5-agent mesh (A1 Threat Detect, A2 Anomaly, Orchestrator, A3 Fusion, A5 Adaptive Defense)
- Infinite skills marquee
- Magnetic button effects
- Film grain overlay
- Local time clock
- Fully responsive (mobile/tablet/desktop)
- Respects `prefers-reduced-motion`
- 60fps animations (transform/opacity only)

## Browser Support

Chrome 90+, Firefox 90+, Edge 90+, Safari 15+

## License

Made by Agrim Jain. All rights reserved.
