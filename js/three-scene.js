/**
 * HeroScene — Brutalist Luxury Portfolio
 * 
 * Renders a chrome / liquid-metal abstract sculpture inside #hero-canvas-container.
 * The sculpture is a heavily-displaced icosahedron with real-time vertex animation,
 * PBR physical material, and a PMREM studio environment map for hyper-realistic
 * metallic reflections.
 *
 * Public API (all on window.HeroScene):
 *   init()              — bootstrap renderer, scene, camera, geometry, lights, env
 *   animate()           — kick off the rAF loop
 *   onResize()          — respond to viewport changes
 *   onMouseMove(x, y)   — normalised mouse coords (-1 … 1)
 *   destroy()           — tear down everything
 *   pause() / resume()  — freeze / restart the render loop
 */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  Constants                                                         */
  /* ------------------------------------------------------------------ */

  var GEO_DETAIL_DESKTOP = 35;          // icosahedron detail on desktop
  var GEO_DETAIL_MOBILE  = 15;          // reduced for mobile
  var MOBILE_BREAKPOINT  = 768;         // px

  var DISPLACEMENT_AMP   = 0.18;        // base noise displacement amplitude
  var UNDULATION_AMP     = 0.035;       // per-frame vertex animation amplitude
  var UNDULATION_SPEED   = 0.6;         // time multiplier for undulation

  var AUTO_ROTATE_SPEED  = 0.12;        // radians / second
  var MOUSE_TILT_MAX     = 0.25;        // max tilt in radians
  var LERP_FACTOR        = 0.05;        // smoothing for mouse tilt

  /* ------------------------------------------------------------------ */
  /*  Simplex-like 3D noise  (compact implementation)                   */
  /* ------------------------------------------------------------------ */

  /**
   * Classic 3D value/gradient noise – good enough for organic displacement.
   * Uses a permutation table seeded once.
   */
  var _perm = (function () {
    var p = [];
    for (var i = 0; i < 256; i++) p[i] = i;
    // Fisher-Yates shuffle with a fixed seed for determinism
    var seed = 42;
    function rand() {
      seed = (seed * 16807 + 0) % 2147483647;
      return (seed - 1) / 2147483646;
    }
    for (var i = 255; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var tmp = p[i]; p[i] = p[j]; p[j] = tmp;
    }
    // Double to avoid wrapping
    return p.concat(p);
  })();

  function _fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function _lerp(a, b, t) { return a + t * (b - a); }
  function _grad3(hash, x, y, z) {
    var h = hash & 15;
    var u = h < 8 ? x : y;
    var v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  function noise3D(x, y, z) {
    var X = Math.floor(x) & 255;
    var Y = Math.floor(y) & 255;
    var Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    var u = _fade(x), v = _fade(y), w = _fade(z);
    var A  = _perm[X] + Y,     AA = _perm[A] + Z,   AB = _perm[A + 1] + Z;
    var B  = _perm[X + 1] + Y, BA = _perm[B] + Z,   BB = _perm[B + 1] + Z;
    return _lerp(
      _lerp(
        _lerp(_grad3(_perm[AA],     x,     y,     z),
              _grad3(_perm[BA],     x - 1, y,     z), u),
        _lerp(_grad3(_perm[AB],     x,     y - 1, z),
              _grad3(_perm[BB],     x - 1, y - 1, z), u), v),
      _lerp(
        _lerp(_grad3(_perm[AA + 1], x,     y,     z - 1),
              _grad3(_perm[BA + 1], x - 1, y,     z - 1), u),
        _lerp(_grad3(_perm[AB + 1], x,     y - 1, z - 1),
              _grad3(_perm[BB + 1], x - 1, y - 1, z - 1), u), v), w);
  }

  /* ------------------------------------------------------------------ */
  /*  HeroScene class                                                   */
  /* ------------------------------------------------------------------ */

  function HeroScene() {
    // Core Three objects
    this.renderer     = null;
    this.scene        = null;
    this.camera       = null;
    this.container    = null;

    // Sculpture
    this.mesh         = null;
    this.geometry     = null;
    this.material     = null;

    // Original (noise-displaced) positions — baseline for undulation
    this.basePositions = null;
    // Original *unit sphere* normals for displacement direction
    this.vertexNormals = null;

    // Animation state
    this.clock        = typeof THREE !== 'undefined' ? new THREE.Clock() : null;
    this.rafId        = null;
    this.running      = false;

    // Mouse target & current (for lerped tilt)
    this.mouseTarget  = typeof THREE !== 'undefined' ? new THREE.Vector2(0, 0) : { x: 0, y: 0, set: function(x,y){ this.x=x; this.y=y; } };
    this.mouseCurrent = typeof THREE !== 'undefined' ? new THREE.Vector2(0, 0) : { x: 0, y: 0 };

    // Flags
    this.isMobile         = false;
    this.reducedMotion    = false;
    this.animateVertices  = true;
  }

  /* ------------------------------------------------------------------ */
  /*  init                                                              */
  /* ------------------------------------------------------------------ */

  HeroScene.prototype.init = function () {
    var self = this;

    if (typeof THREE === 'undefined') {
      console.warn('[HeroScene] THREE.js is not loaded');
      return;
    }

    if (!this.clock) this.clock = new THREE.Clock();
    if (!this.mouseTarget || !this.mouseTarget.set) this.mouseTarget = new THREE.Vector2(0, 0);
    if (!this.mouseCurrent) this.mouseCurrent = new THREE.Vector2(0, 0);

    /* ---- container ------------------------------------------------- */
    this.container = document.getElementById('hero-canvas-container');
    if (!this.container) {
      console.warn('[HeroScene] #hero-canvas-container not found');
      return;
    }

    /* ---- feature flags --------------------------------------------- */
    this.isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    this.reducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.animateVertices = !this.isMobile && !this.reducedMotion;

    /* ---- renderer -------------------------------------------------- */
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    // Set output color space — r152+ uses outputColorSpace, older uses outputEncoding
    if ('outputColorSpace' in this.renderer) {
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else if ('outputEncoding' in this.renderer) {
      this.renderer.outputEncoding = THREE.sRGBEncoding;
    }
    this.container.appendChild(this.renderer.domElement);

    /* ---- scene (transparent) --------------------------------------- */
    this.scene = new THREE.Scene();
    // No background — alpha: true handles transparency

    /* ---- camera ---------------------------------------------------- */
    var aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    this.camera.position.set(0, 0, 4.5);

    /* ---- environment map (PMREM studio) ----------------------------- */
    var envMap = this._generateStudioEnvMap();

    /* ---- material -------------------------------------------------- */
    this.material = new THREE.MeshPhysicalMaterial({
      color:               new THREE.Color(0x888888),
      metalness:           1.0,
      roughness:           0.08,
      clearcoat:           1.0,
      clearcoatRoughness:  0.1,
      envMap:              envMap,
      envMapIntensity:     1.8,
      reflectivity:        1.0
    });

    /* ---- geometry & displacement ----------------------------------- */
    var detail = this.isMobile ? GEO_DETAIL_MOBILE : GEO_DETAIL_DESKTOP;
    this.geometry = new THREE.IcosahedronGeometry(1.2, detail);
    this._applyNoiseDisplacement();

    /* ---- mesh ------------------------------------------------------ */
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    /* ---- lights (soft studio) -------------------------------------- */
    this._setupLights();

    /* ---- event listeners ------------------------------------------- */
    this._boundResize = function () { self.onResize(); };
    this._boundMouse  = function (e) {
      var nx = (e.clientX / window.innerWidth)  * 2 - 1;
      var ny = (e.clientY / window.innerHeight) * 2 - 1;
      self.onMouseMove(nx, ny);
    };
    window.addEventListener('resize', this._boundResize);
    window.addEventListener('mousemove', this._boundMouse);
  };

  /* ------------------------------------------------------------------ */
  /*  Studio environment map via PMREMGenerator                         */
  /* ------------------------------------------------------------------ */

  HeroScene.prototype._generateStudioEnvMap = function () {
    var envScene = new THREE.Scene();

    // Soft monochrome gradient background hemisphere
    envScene.background = new THREE.Color(0x080808);

    // Helper: emissive light plane (strictly monochrome values)
    function addLightPlane(color, intensity, w, h, pos, rot) {
      var geo = new THREE.PlaneGeometry(w, h);
      var mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).multiplyScalar(intensity),
        side:  THREE.DoubleSide
      });
      var m = new THREE.Mesh(geo, mat);
      m.position.set(pos.x, pos.y, pos.z);
      if (rot) m.rotation.set(rot.x, rot.y, rot.z);
      envScene.add(m);
    }

    // Key light — large, high-intensity silver-white, above-right
    addLightPlane(0xffffff, 3.2, 12, 12,
      { x: 5, y: 6, z: -3 },
      { x: -0.5, y: -0.4, z: 0 });

    // Fill light — neutral silver, left
    addLightPlane(0xcccccc, 2.0, 10, 10,
      { x: -6, y: 2, z: 2 },
      { x: 0, y: 1.2, z: 0 });

    // Rim / accent — pure off-white strip behind for razor-sharp specular horizon
    addLightPlane(0xededed, 2.8, 14, 3,
      { x: 0, y: -1, z: -8 },
      { x: 0.3, y: 0, z: 0 });

    // Top soft panel — neutral white
    addLightPlane(0xffffff, 1.6, 16, 16,
      { x: 0, y: 10, z: 0 },
      { x: Math.PI / 2, y: 0, z: 0 });

    // Floor bounce — deep charcoal
    addLightPlane(0x222222, 1.0, 16, 16,
      { x: 0, y: -10, z: 0 },
      { x: -Math.PI / 2, y: 0, z: 0 });

    // Specular accent strip — crisp silver hairline reflection
    addLightPlane(0x888888, 1.5, 2, 8,
      { x: 8, y: -2, z: 4 },
      { x: 0, y: -1.0, z: 0.15 });

    try {
      // Generate PMREM
      var pmrem = new THREE.PMREMGenerator(this.renderer);
      if (typeof pmrem.compileCubemapShader === 'function') {
        pmrem.compileCubemapShader();
      }
      var envMapRT = pmrem.fromScene(envScene, 0.04);
      pmrem.dispose();
      return envMapRT ? envMapRT.texture : null;
    } catch (err) {
      console.warn('[HeroScene] Studio env map generation failed, using fallback lighting', err);
      return null;
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Noise displacement (applied once to establish the organic shape)  */
  /* ------------------------------------------------------------------ */

  HeroScene.prototype._applyNoiseDisplacement = function () {
    var pos = this.geometry.attributes.position;
    var count = pos.count;

    // Store unit-sphere normals for displacement direction
    var normals = new Float32Array(count * 3);
    var v = new THREE.Vector3();

    for (var i = 0; i < count; i++) {
      v.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize();
      normals[i * 3]     = v.x;
      normals[i * 3 + 1] = v.y;
      normals[i * 3 + 2] = v.z;
    }
    this.vertexNormals = normals;

    // Displace along normal by layered noise (3 octaves)
    var noiseScale1 = 1.5;
    var noiseScale2 = 3.0;
    var noiseScale3 = 6.0;

    for (var i = 0; i < count; i++) {
      var ox = pos.getX(i);
      var oy = pos.getY(i);
      var oz = pos.getZ(i);

      // Multi-octave noise for organic detail
      var n  = noise3D(ox * noiseScale1, oy * noiseScale1, oz * noiseScale1) * 1.0;
      n += noise3D(ox * noiseScale2, oy * noiseScale2, oz * noiseScale2) * 0.4;
      n += noise3D(ox * noiseScale3, oy * noiseScale3, oz * noiseScale3) * 0.15;

      var disp = n * DISPLACEMENT_AMP;

      pos.setXYZ(i,
        ox + normals[i * 3]     * disp,
        oy + normals[i * 3 + 1] * disp,
        oz + normals[i * 3 + 2] * disp
      );
    }

    pos.needsUpdate = true;
    this.geometry.computeVertexNormals();

    // Store displaced positions as the baseline for undulation
    this.basePositions = new Float32Array(pos.array);
  };

  /* ------------------------------------------------------------------ */
  /*  Lighting                                                          */
  /* ------------------------------------------------------------------ */

  HeroScene.prototype._setupLights = function () {
    // Ambient — very low neutral grey, lifts harsh shadows
    var ambient = new THREE.AmbientLight(0x222222, 0.4);
    this.scene.add(ambient);

    // Key light — pure high-specular white, upper right
    var key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(3, 4, 2);
    this.scene.add(key);

    // Fill — neutral silver, left
    var fill = new THREE.DirectionalLight(0xaaaaaa, 0.9);
    fill.position.set(-4, 1, 3);
    this.scene.add(fill);

    // Rim — pure off-white behind & above for razor-sharp edge contrast
    var rim = new THREE.DirectionalLight(0xededed, 1.2);
    rim.position.set(0, 3, -4);
    this.scene.add(rim);

    // Subtle bottom fill — dark charcoal bounce
    var bottom = new THREE.DirectionalLight(0x333333, 0.3);
    bottom.position.set(0, -3, 1);
    this.scene.add(bottom);
  };

  /* ------------------------------------------------------------------ */
  /*  Per-frame vertex undulation                                       */
  /* ------------------------------------------------------------------ */

  HeroScene.prototype._updateVertices = function (elapsed) {
    if (!this.animateVertices || !this.basePositions) return;

    var pos   = this.geometry.attributes.position;
    var base  = this.basePositions;
    var norms = this.vertexNormals;
    var count = pos.count;
    var t     = elapsed * UNDULATION_SPEED;

    for (var i = 0; i < count; i++) {
      var i3 = i * 3;
      var bx = base[i3];
      var by = base[i3 + 1];
      var bz = base[i3 + 2];

      // Time-varying sinusoidal displacement along original normal
      // Use a combination of frequencies keyed to vertex position for organic feel
      var wave = Math.sin(bx * 3.0 + t * 1.1)
               + Math.sin(by * 4.0 - t * 0.9)
               + Math.sin(bz * 2.5 + t * 1.3);
      wave *= (1.0 / 3.0); // normalise to roughly -1..1

      var disp = wave * UNDULATION_AMP;

      pos.array[i3]     = bx + norms[i3]     * disp;
      pos.array[i3 + 1] = by + norms[i3 + 1] * disp;
      pos.array[i3 + 2] = bz + norms[i3 + 2] * disp;
    }

    pos.needsUpdate = true;
    this.geometry.computeVertexNormals();
  };

  /* ------------------------------------------------------------------ */
  /*  animate (rAF loop)                                                */
  /* ------------------------------------------------------------------ */

  HeroScene.prototype.animate = function () {
    var self = this;
    this.running = true;
    this.clock.start();

    function loop() {
      if (!self.running) return;
      self.rafId = requestAnimationFrame(loop);

      var delta   = self.clock.getDelta();
      var elapsed = self.clock.getElapsedTime();

      /* Auto-rotation */
      if (!self.reducedMotion && self.mesh) {
        self.mesh.rotation.y += AUTO_ROTATE_SPEED * delta;
      }

      /* Smooth mouse tilt */
      self.mouseCurrent.x += (self.mouseTarget.x - self.mouseCurrent.x) * LERP_FACTOR;
      self.mouseCurrent.y += (self.mouseTarget.y - self.mouseCurrent.y) * LERP_FACTOR;

      if (self.mesh) {
        self.mesh.rotation.x = -self.mouseCurrent.y * MOUSE_TILT_MAX;
        // Preserve accumulated Y rotation; only add mouse offset as a small delta
        self.mesh.rotation.z = self.mouseCurrent.x * MOUSE_TILT_MAX * 0.5;
      }

      /* Vertex animation */
      self._updateVertices(elapsed);

      /* Render */
      self.renderer.render(self.scene, self.camera);
    }

    loop();
  };

  /* ------------------------------------------------------------------ */
  /*  onResize                                                          */
  /* ------------------------------------------------------------------ */

  HeroScene.prototype.onResize = function () {
    if (!this.container || !this.renderer || !this.camera) return;

    var w = this.container.clientWidth;
    var h = this.container.clientHeight;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);

    // Re-evaluate mobile flag (in case of orientation change)
    var wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    this.animateVertices = !this.isMobile && !this.reducedMotion;

    // If crossing the mobile threshold, rebuild geometry at appropriate detail
    if (wasMobile !== this.isMobile && this.mesh) {
      this.geometry.dispose();
      var detail = this.isMobile ? GEO_DETAIL_MOBILE : GEO_DETAIL_DESKTOP;
      this.geometry = new THREE.IcosahedronGeometry(1.2, detail);
      this._applyNoiseDisplacement();
      this.mesh.geometry = this.geometry;
    }
  };

  /* ------------------------------------------------------------------ */
  /*  onMouseMove                                                       */
  /* ------------------------------------------------------------------ */

  HeroScene.prototype.onMouseMove = function (x, y) {
    this.mouseTarget.set(x, y);
  };

  /* ------------------------------------------------------------------ */
  /*  pause / resume                                                    */
  /* ------------------------------------------------------------------ */

  HeroScene.prototype.pause = function () {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.clock.stop();
  };

  HeroScene.prototype.resume = function () {
    if (this.running) return; // already running
    this.animate();
  };

  /* ------------------------------------------------------------------ */
  /*  destroy                                                           */
  /* ------------------------------------------------------------------ */

  HeroScene.prototype.destroy = function () {
    this.pause();

    // Remove event listeners
    if (this._boundResize) window.removeEventListener('resize', this._boundResize);
    if (this._boundMouse)  window.removeEventListener('mousemove', this._boundMouse);

    // Dispose Three.js resources
    if (this.geometry) this.geometry.dispose();
    if (this.material) {
      if (this.material.envMap) this.material.envMap.dispose();
      this.material.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }

    // Null out references
    this.renderer     = null;
    this.scene        = null;
    this.camera       = null;
    this.mesh         = null;
    this.geometry     = null;
    this.material     = null;
    this.basePositions = null;
    this.vertexNormals = null;
  };

  /* ------------------------------------------------------------------ */
  /*  Expose on window                                                  */
  /* ------------------------------------------------------------------ */

  window.HeroScene = new HeroScene();

})();
