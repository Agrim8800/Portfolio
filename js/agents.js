/**
 * AgentVisualization — Interactive multi-agent network canvas
 * 
 * Renders 5 agent nodes in an asymmetric constellation with animated
 * message-passing dots travelling along connection lines.
 * Architectural / mission-control aesthetic. Monochrome palette.
 */
(function () {
  'use strict';

  // ─── Color Palette ───────────────────────────────────────────────
  var COLORS = {
    node:       '#EDEDE8',
    nodeBorder: '#EDEDE8',
    line:       '#333333',
    lineHover:  '#666666',
    messageDot: '#EDEDE8',
    label:      '#666666',
    labelHover: '#999999'
  };

  // ─── Layout: positions as fractions of canvas width/height ───────
  // Asymmetric, editorial arrangement — not a circle or grid
  var AGENT_POSITIONS = [
    { x: 0.18, y: 0.28 },   // AGENT 01 — upper-left area
    { x: 0.72, y: 0.18 },   // AGENT 02 — upper-right, higher
    { x: 0.44, y: 0.52 },   // AGENT 03 — center, slightly left
    { x: 0.82, y: 0.62 },   // AGENT 04 — right, lower
    { x: 0.28, y: 0.78 }    // AGENT 05 — lower-left
  ];

  // ─── Topology: partial mesh (index pairs) ───────────────────────
  // Intentional structure — hub-and-spoke from AGENT 03 plus a few cross-links
  var CONNECTIONS = [
    [0, 2],  // 01 ↔ 03
    [1, 2],  // 02 ↔ 03
    [2, 3],  // 03 ↔ 04
    [2, 4],  // 03 ↔ 05
    [0, 1],  // 01 ↔ 02
    [3, 4]   // 04 ↔ 05
  ];

  // ─── Node visual style ──────────────────────────────────────────
  var NODE_SIZE       = 5;     // half-size of the square / crosshair arm
  var NODE_LINE_WIDTH = 1;
  var CONN_LINE_WIDTH = 0.5;

  // ─── Interaction ─────────────────────────────────────────────────
  var REPULSION_RADIUS  = 80;   // px — hover detection range
  var REPULSION_FORCE   = 12;   // px max displacement

  // ─── Messages ────────────────────────────────────────────────────
  var MSG_SPAWN_MIN  = 1800;   // ms
  var MSG_SPAWN_MAX  = 3000;   // ms
  var MSG_DURATION   = 1400;   // ms travel time
  var MSG_DOT_RADIUS = 2;
  var MAX_INFLIGHT   = 4;

  // ─── Easing: cubic ease-in-out ───────────────────────────────────
  function easeInOut(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // ─── Label config ────────────────────────────────────────────────
  var LABEL_FONT     = '10px "SF Mono", "Fira Code", "Cascadia Code", Consolas, monospace';
  var LABEL_OFFSET_X = 12;
  var LABEL_OFFSET_Y = -12;

  // ════════════════════════════════════════════════════════════════
  //  AgentVisualization Class
  // ════════════════════════════════════════════════════════════════

  function AgentVisualization() {
    this.canvas      = null;
    this.ctx         = null;
    this.container   = null;
    this.width       = 0;
    this.height      = 0;
    this.dpr         = 1;
    this.animFrameId = null;
    this.paused      = false;
    this.destroyed   = false;

    // Resolved node positions (px)
    this.nodes = [];

    // Active message dots in flight
    this.messages = [];

    // Timestamp of last message spawn
    this.lastSpawn   = 0;
    this.nextSpawnIn = 0;

    // Mouse position (canvas-space)
    this.mouseX = -9999;
    this.mouseY = -9999;

    // Reduced-motion preference
    this.reducedMotion = false;

    // Bound handlers for cleanup
    this._boundResize    = null;
    this._boundMouseMove = null;
    this._boundMouseLeave = null;
  }

  // ─── Initialise ──────────────────────────────────────────────────
  AgentVisualization.prototype.init = function (containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn('[AgentViz] Container not found:', containerId);
      return;
    }

    // Detect reduced-motion preference
    this.reducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Get or create canvas inside the container
    this.canvas = this.container.querySelector('canvas');
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.style.display = 'block';
      this.canvas.style.width   = '100%';
      this.canvas.style.height  = '100%';
      this.container.appendChild(this.canvas);
    }

    this.ctx = this.canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;

    // Initial sizing
    this._resize();

    // Schedule first message spawn
    this.lastSpawn   = performance.now();
    this.nextSpawnIn = this._randomSpawnDelay();

    // Event listeners
    this._boundResize = this._resize.bind(this);
    window.addEventListener('resize', this._boundResize);

    this._boundMouseMove = function (e) {
      var rect = this.canvas.getBoundingClientRect();
      this.onMouseMove(e.clientX - rect.left, e.clientY - rect.top);
    }.bind(this);
    this.canvas.addEventListener('mousemove', this._boundMouseMove);

    this._boundTouchMove = function (e) {
      if (e.touches && e.touches.length > 0) {
        var rect = this.canvas.getBoundingClientRect();
        this.onMouseMove(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
      }
    }.bind(this);
    this.canvas.addEventListener('touchmove', this._boundTouchMove, { passive: true });
    this.canvas.addEventListener('touchstart', this._boundTouchMove, { passive: true });

    this._boundMouseLeave = function () {
      this.mouseX = -9999;
      this.mouseY = -9999;
    }.bind(this);
    this.canvas.addEventListener('mouseleave', this._boundMouseLeave);
    this.canvas.addEventListener('touchend', this._boundMouseLeave);

    // Start loop
    this.animate();
  };

  // ─── Resize handler ──────────────────────────────────────────────
  AgentVisualization.prototype._resize = function () {
    var rect   = this.container.getBoundingClientRect();
    this.width  = rect.width;
    this.height = rect.height;

    this.canvas.width  = this.width  * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width  = this.width  + 'px';
    this.canvas.style.height = this.height + 'px';

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Recalculate absolute node positions
    this._resolveNodes();
  };

  AgentVisualization.prototype.onResize = function () {
    this._resize();
  };

  // ─── CyberSentinel Agent Nodes & Roles (from NexAI architecture) ──
  var AGENT_METADATA = [
    { label: 'A1: THREAT DETECT', role: 'Threat Detection' },
    { label: 'A2: ANOMALY DETECT', role: 'Anomaly Detection' },
    { label: 'ORCHESTRATOR',       role: 'Command Orchestrator' },
    { label: 'A3: EVIDENCE FUSION', role: 'Evidence Fusion' },
    { label: 'A5: ADAPTIVE DEFENSE', role: 'Adaptive Defense (Agrim)' }
  ];

  // ─── Resolve node layout to pixels ───────────────────────────────
  AgentVisualization.prototype._resolveNodes = function () {
    this.nodes = [];
    for (var i = 0; i < AGENT_POSITIONS.length; i++) {
      var p = AGENT_POSITIONS[i];
      var meta = AGENT_METADATA[i] || { label: 'AGENT 0' + (i + 1) };
      this.nodes.push({
        baseX: p.x * this.width,
        baseY: p.y * this.height,
        // Rendered position (may differ from base due to repulsion)
        x: p.x * this.width,
        y: p.y * this.height,
        label: meta.label,
        hovered: false
      });
    }
  };

  // ─── Mouse move ──────────────────────────────────────────────────
  AgentVisualization.prototype.onMouseMove = function (x, y) {
    this.mouseX = x;
    this.mouseY = y;
  };

  // ─── Pause / Resume ──────────────────────────────────────────────
  AgentVisualization.prototype.pause = function () {
    this.paused = true;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  };

  AgentVisualization.prototype.resume = function () {
    if (!this.paused) return;
    this.paused = false;
    this.lastSpawn = performance.now();
    this.animate();
  };

  // ─── Destroy ─────────────────────────────────────────────────────
  AgentVisualization.prototype.destroy = function () {
    this.destroyed = true;
    this.pause();

    if (this._boundResize) {
      window.removeEventListener('resize', this._boundResize);
    }
    if (this._boundMouseMove && this.canvas) {
      this.canvas.removeEventListener('mousemove', this._boundMouseMove);
    }
    if (this._boundTouchMove && this.canvas) {
      this.canvas.removeEventListener('touchmove', this._boundTouchMove);
      this.canvas.removeEventListener('touchstart', this._boundTouchMove);
    }
    if (this._boundMouseLeave && this.canvas) {
      this.canvas.removeEventListener('mouseleave', this._boundMouseLeave);
      this.canvas.removeEventListener('touchend', this._boundMouseLeave);
    }

    this.messages = [];
    this.nodes    = [];
  };

  // ─── Random spawn delay ──────────────────────────────────────────
  AgentVisualization.prototype._randomSpawnDelay = function () {
    return MSG_SPAWN_MIN + Math.random() * (MSG_SPAWN_MAX - MSG_SPAWN_MIN);
  };

  // ─── Spawn a message along a random connection ───────────────────
  AgentVisualization.prototype._spawnMessage = function (now) {
    if (this.messages.length >= MAX_INFLIGHT) return;

    // Pick a random connection
    var idx  = Math.floor(Math.random() * CONNECTIONS.length);
    var conn = CONNECTIONS[idx];

    // Randomly pick direction
    var fromIdx = conn[0];
    var toIdx   = conn[1];
    if (Math.random() > 0.5) {
      fromIdx = conn[1];
      toIdx   = conn[0];
    }

    this.messages.push({
      fromIdx:   fromIdx,
      toIdx:     toIdx,
      startTime: now,
      duration:  MSG_DURATION
    });
  };

  // ════════════════════════════════════════════════════════════════
  //  Main Animation Loop
  // ════════════════════════════════════════════════════════════════

  AgentVisualization.prototype.animate = function () {
    if (this.destroyed || this.paused) return;

    var self = this;
    var now  = performance.now();

    // — Update node positions (mouse repulsion) ——————————————————
    for (var i = 0; i < this.nodes.length; i++) {
      var node = this.nodes[i];
      var dx   = node.baseX - this.mouseX;
      var dy   = node.baseY - this.mouseY;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < REPULSION_RADIUS && dist > 0) {
        var factor = 1 - (dist / REPULSION_RADIUS);
        var pushX  = (dx / dist) * REPULSION_FORCE * factor;
        var pushY  = (dy / dist) * REPULSION_FORCE * factor;
        // Smooth interpolation towards repelled position
        node.x += (node.baseX + pushX - node.x) * 0.12;
        node.y += (node.baseY + pushY - node.y) * 0.12;
        node.hovered = true;
      } else {
        // Ease back to base position
        node.x += (node.baseX - node.x) * 0.08;
        node.y += (node.baseY - node.y) * 0.08;
        node.hovered = false;
      }
    }

    // — Spawn messages periodically ─────────────────────────────
    if (!this.reducedMotion && now - this.lastSpawn > this.nextSpawnIn) {
      this._spawnMessage(now);
      this.lastSpawn   = now;
      this.nextSpawnIn = this._randomSpawnDelay();
    }

    // — Prune completed messages ────────────────────────────────
    this.messages = this.messages.filter(function (m) {
      return (now - m.startTime) < m.duration;
    });

    // — Draw ────────────────────────────────────────────────────
    this._draw(now);

    // — Schedule next frame ─────────────────────────────────────
    this.animFrameId = requestAnimationFrame(function () {
      self.animate();
    });
  };

  // ════════════════════════════════════════════════════════════════
  //  Drawing
  // ════════════════════════════════════════════════════════════════

  AgentVisualization.prototype._draw = function (now) {
    var ctx = this.ctx;

    // Clear (transparent background)
    ctx.clearRect(0, 0, this.width, this.height);

    // ── 1. Connection lines ─────────────────────────────────────
    for (var c = 0; c < CONNECTIONS.length; c++) {
      var conn = CONNECTIONS[c];
      var nA   = this.nodes[conn[0]];
      var nB   = this.nodes[conn[1]];

      // Brighten if either endpoint is hovered
      var hover = nA.hovered || nB.hovered;

      ctx.beginPath();
      ctx.moveTo(nA.x, nA.y);
      ctx.lineTo(nB.x, nB.y);
      ctx.strokeStyle = hover ? COLORS.lineHover : COLORS.line;
      ctx.lineWidth   = hover ? 0.8 : CONN_LINE_WIDTH;
      ctx.stroke();
    }

    // ── 2. Message dots ─────────────────────────────────────────
    if (!this.reducedMotion) {
      for (var m = 0; m < this.messages.length; m++) {
        var msg = this.messages[m];
        var t   = (now - msg.startTime) / msg.duration;
        if (t < 0 || t > 1) continue;

        var eased = easeInOut(t);
        var from  = this.nodes[msg.fromIdx];
        var to    = this.nodes[msg.toIdx];

        var mx = from.x + (to.x - from.x) * eased;
        var my = from.y + (to.y - from.y) * eased;

        // Fade in at start, fade out at end
        var alpha = 1;
        if (t < 0.15) alpha = t / 0.15;
        else if (t > 0.85) alpha = (1 - t) / 0.15;

        ctx.beginPath();
        ctx.arc(mx, my, MSG_DOT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.messageDot;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // ── 3. Nodes — crosshair style (+) ──────────────────────────
    for (var n = 0; n < this.nodes.length; n++) {
      var node = this.nodes[n];
      var s    = NODE_SIZE;

      ctx.strokeStyle = COLORS.nodeBorder;
      ctx.lineWidth   = NODE_LINE_WIDTH;

      // Horizontal bar
      ctx.beginPath();
      ctx.moveTo(node.x - s, node.y);
      ctx.lineTo(node.x + s, node.y);
      ctx.stroke();

      // Vertical bar
      ctx.beginPath();
      ctx.moveTo(node.x, node.y - s);
      ctx.lineTo(node.x, node.y + s);
      ctx.stroke();

      // Small square outline around center (2px half-size)
      var sq = 2;
      ctx.strokeRect(node.x - sq, node.y - sq, sq * 2, sq * 2);

      // ── 4. Labels ─────────────────────────────────────────────
      ctx.font      = LABEL_FONT;
      ctx.fillStyle = node.hovered ? COLORS.labelHover : COLORS.label;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x + LABEL_OFFSET_X, node.y + LABEL_OFFSET_Y);
    }
  };

  // ── Expose on window ─────────────────────────────────────────────
  window.AgentVisualization = AgentVisualization;

})();
