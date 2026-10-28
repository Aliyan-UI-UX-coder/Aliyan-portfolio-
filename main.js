/**
 * Aliyan - Frontend Developer & UI/UX Designer Portfolio
 * 3D Video & Motion UI Engine, Web Audio Synthesizer, 3D Canvas Showcase & Terminal Kernel
 */

(function () {
  'use strict';

  // Global Application State
  const state = {
    soundEnabled: false,
    audioCtx: null,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    cinema: {
      playing: true,
      currentScene: 'cyber',
      currentTime: 42,
      duration: 120,
      wireframe: false,
      speed: 1.0,
      fps: 60
    },
    heroMode: 'cyber'
  };

  // =========================================================================
  // Web Audio Synthesizer (Modern Tactile Tech Audio)
  // =========================================================================
  function initAudio() {
    if (!state.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        state.audioCtx = new AudioCtx();
      }
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.04) {
    if (!state.soundEnabled) return;
    try {
      initAudio();
      if (!state.audioCtx) return;
      const osc = state.audioCtx.createOscillator();
      const gain = state.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, state.audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, state.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, state.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(state.audioCtx.destination);
      osc.start();
      osc.stop(state.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  function playHoverTone() {
    playTone(520, 'sine', 0.05, 0.015);
  }

  function playClickTone() {
    playTone(880, 'triangle', 0.08, 0.04);
  }

  function playSuccessTone() {
    if (!state.soundEnabled) return;
    playTone(659.25, 'sine', 0.08, 0.04);
    setTimeout(() => playTone(880, 'sine', 0.12, 0.04), 80);
  }

  // =========================================================================
  // Toast Notification
  // =========================================================================
  function showToast(message) {
    let toast = document.querySelector('.toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
    toast.classList.add('show');
    playSuccessTone();

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // =========================================================================
  // Background Three.js 3D Particle Galaxy Engine
  // =========================================================================
  function init3DBackground() {
    const canvas = document.getElementById('canvas-3d-bg');
    if (!canvas) return;

    if (window.THREE) {
      initThreeBgScene(canvas);
    } else {
      initCanvasFallback(canvas);
    }
  }

  function initThreeBgScene(canvas) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 28;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Floating Wireframe Icosahedron
    const geoIco = new THREE.IcosahedronGeometry(11, 2);
    const matIco = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const meshIco = new THREE.Mesh(geoIco, matIco);
    mainGroup.add(meshIco);

    // 2. Torus Knot
    const geoTorus = new THREE.TorusKnotGeometry(7, 1.8, 100, 16);
    const matTorus = new THREE.MeshBasicMaterial({
      color: 0x8a2be2,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });
    const meshTorus = new THREE.Mesh(geoTorus, matTorus);
    mainGroup.add(meshTorus);

    // 3. Ambient Star Particles
    const particleCount = 450;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 80;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.65
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Mouse tracking
    window.addEventListener('mousemove', (e) => {
      state.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      state.mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Resize handler
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);

      state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.05;
      state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.05;

      meshIco.rotation.x += 0.002;
      meshIco.rotation.y += 0.003;

      meshTorus.rotation.x -= 0.003;
      meshTorus.rotation.z += 0.002;

      particleSystem.rotation.y += 0.0006;

      mainGroup.rotation.y = state.mouse.x * 0.4;
      mainGroup.rotation.x = -state.mouse.y * 0.4;

      renderer.render(scene, camera);
    }
    animate();
  }

  function initCanvasFallback(canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2 + 1
    }));

    function loop() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(0, 242, 254, 0.4)';

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(loop);
    }
    loop();
  }

  // =========================================================================
  // Hero Section 3D Reel Canvas
  // =========================================================================
  function initHeroCanvas() {
    const canvas = document.getElementById('hero-reel-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.parentElement.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement.clientHeight || 300);

    window.addEventListener('resize', () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    });

    let angle = 0;
    const modeBtns = document.querySelectorAll('.hud-mode-btn');

    modeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        modeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.heroMode = btn.getAttribute('data-mode') || 'cyber';
        playClickTone();
      });
    });

    function drawHeroScene() {
      ctx.fillStyle = '#05070e';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      angle += 0.02;

      if (state.heroMode === 'cyber') {
        // Rotating 3D wireframe cube
        const size = Math.min(width, height) * 0.28;
        ctx.save();
        ctx.translate(cx, cy);

        // Draw glowing circular radar ring
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.35, 0, Math.PI * 2);
        ctx.stroke();

        // 3D Wireframe Cube points
        const points = [
          [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
          [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ];

        const projected = points.map(([x, y, z]) => {
          // Rotate Y and X
          const radY = angle;
          const radX = angle * 0.6;
          let x1 = x * Math.cos(radY) + z * Math.sin(radY);
          let z1 = -x * Math.sin(radY) + z * Math.cos(radY);
          let y1 = y * Math.cos(radX) - z1 * Math.sin(radX);
          let z2 = y * Math.sin(radX) + z1 * Math.cos(radX);

          const fov = 3;
          const scale = fov / (fov + z2);
          return [x1 * size * scale, y1 * size * scale];
        });

        const edges = [
          [0, 1], [1, 2], [2, 3], [3, 0],
          [4, 5], [5, 6], [6, 7], [7, 4],
          [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 15;

        edges.forEach(([i, j]) => {
          ctx.beginPath();
          ctx.moveTo(projected[i][0], projected[i][1]);
          ctx.lineTo(projected[j][0], projected[j][1]);
          ctx.stroke();
        });

        // Glowing center core
        ctx.fillStyle = '#8a2be2';
        ctx.shadowColor = '#8a2be2';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, 0, 8 + Math.sin(angle * 2) * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (state.heroMode === 'uiux') {
        // Floating 3D UI planes / Figma artboards
        ctx.save();
        ctx.translate(cx, cy);

        for (let i = 2; i >= 0; i--) {
          const offset = Math.sin(angle + i * 0.8) * 15;
          const alpha = 0.3 + i * 0.25;

          ctx.fillStyle = `rgba(18, 24, 38, ${alpha})`;
          ctx.strokeStyle = i === 2 ? '#00f2fe' : 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = i === 2 ? 15 : 0;
          ctx.shadowColor = '#00f2fe';

          const cardW = 160;
          const cardH = 95;
          const px = -cardW / 2 + (i - 1) * 25;
          const py = -cardH / 2 + (i - 1) * 20 + offset;

          ctx.beginPath();
          ctx.roundRect(px, py, cardW, cardH, 8);
          ctx.fill();
          ctx.stroke();

          // Mock UI elements inside
          if (i === 2) {
            ctx.fillStyle = '#00f2fe';
            ctx.fillRect(px + 12, py + 12, 45, 8);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(px + 12, py + 26, 80, 5);
            ctx.fillRect(px + 12, py + 36, 60, 5);
            ctx.fillStyle = '#8a2be2';
            ctx.beginPath();
            ctx.roundRect(px + 12, py + 55, 50, 18, 4);
            ctx.fill();
          }
        }
        ctx.restore();
      } else {
        // Particle Vortex
        ctx.save();
        ctx.translate(cx, cy);
        for (let i = 0; i < 70; i++) {
          const t = angle * 2 + i * 0.15;
          const r = (i * 2.2) % 110;
          const x = Math.cos(t) * r;
          const y = Math.sin(t) * r * 0.7;

          ctx.fillStyle = i % 2 === 0 ? '#00f2fe' : '#8a2be2';
          ctx.shadowBlur = 8;
          ctx.shadowColor = ctx.fillStyle;
          ctx.beginPath();
          ctx.arc(x, y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      requestAnimationFrame(drawHeroScene);
    }
    drawHeroScene();

    // Trigger modal from hero
    const heroPlay = document.getElementById('hero-mini-play-btn');
    const heroExpand = document.getElementById('btn-hero-expand');
    const heroBtnWatch = document.getElementById('btn-hero-watch-reel');

    [heroPlay, heroExpand, heroBtnWatch].forEach((el) => {
      if (el) {
        el.addEventListener('click', () => {
          openCinemaModal('cyber');
        });
      }
    });
  }

  // =========================================================================
  // Featured 3D Video & Motion UI Cinema Theater (`#motion-reels`)
  // =========================================================================
  function initCinemaTheater() {
    const canvas = document.getElementById('cinema-interactive-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.parentElement.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement.clientHeight || 450);

    window.addEventListener('resize', () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    });

    let frame = 0;
    let cameraOrbit = { x: 0, y: 0, isDragging: false, startX: 0, startY: 0 };

    // Interactive mouse drag to rotate 3D scene
    canvas.addEventListener('mousedown', (e) => {
      cameraOrbit.isDragging = true;
      cameraOrbit.startX = e.clientX - cameraOrbit.x;
      cameraOrbit.startY = e.clientY - cameraOrbit.y;
    });
    window.addEventListener('mousemove', (e) => {
      if (!cameraOrbit.isDragging) return;
      cameraOrbit.x = (e.clientX - cameraOrbit.startX) * 0.01;
      cameraOrbit.y = (e.clientY - cameraOrbit.startY) * 0.01;
    });
    window.addEventListener('mouseup', () => {
      cameraOrbit.isDragging = false;
    });

    // Scene definitions
    const scenes = {
      cyber: {
        title: 'CyberMatrix 3D E-Commerce Reel',
        desc: 'Interactive 3D geometry with dynamic camera orbit, particle field, and specular reflections.'
      },
      spatial: {
        title: 'Spatial Glass Floating Interface Reel',
        desc: 'Volumetric glassmorphic cards floating in 3D perspective space with interactive depth parallax.'
      },
      fintech: {
        title: 'Holographic Cyber Card & Crypto Flow',
        desc: 'Metallic credit card with mouse specular reflections, animated live candlestick chart, and pay flows.'
      },
      neura: {
        title: 'NeuraTech 3D Neural Network Dashboard',
        desc: 'Pulsing interactive synaptic node visualization, live animated data streams, and modular glass widgets.'
      }
    };

    function updateSceneMeta(sceneKey) {
      const data = scenes[sceneKey];
      if (!data) return;
      const titleEl = document.getElementById('cinema-active-title');
      const descEl = document.getElementById('cinema-active-desc');
      if (titleEl) titleEl.textContent = data.title;
      if (descEl) descEl.textContent = data.desc;
    }

    // Scene chips buttons
    const sceneChips = document.querySelectorAll('.scene-chip');
    sceneChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        sceneChips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        state.cinema.currentScene = chip.getAttribute('data-scene') || 'cyber';
        updateSceneMeta(state.cinema.currentScene);
        playClickTone();
      });
    });

    // Play / Pause controls
    const btnPlay = document.getElementById('cinema-btn-play');
    const bigPlay = document.getElementById('cinema-big-play-btn');
    const playIcon = document.getElementById('cinema-play-icon');

    function togglePlayback() {
      state.cinema.playing = !state.cinema.playing;
      if (playIcon) {
        playIcon.innerHTML = state.cinema.playing
          ? '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>'
          : '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
      }
      if (bigPlay) {
        bigPlay.style.display = state.cinema.playing ? 'none' : 'flex';
      }
      playClickTone();
    }

    if (btnPlay) btnPlay.addEventListener('click', togglePlayback);
    if (bigPlay) bigPlay.addEventListener('click', togglePlayback);

    // Wireframe toggle
    const btnWire = document.getElementById('cinema-btn-wire');
    if (btnWire) {
      btnWire.addEventListener('click', () => {
        state.cinema.wireframe = !state.cinema.wireframe;
        btnWire.classList.toggle('active', state.cinema.wireframe);
        showToast(state.cinema.wireframe ? 'Wireframe Mode: ON' : 'Solid Shader Mode: ON');
      });
    }

    // Speed toggle
    const btnSpeed = document.getElementById('cinema-btn-speed');
    const speedLabel = document.getElementById('cinema-speed-label');
    const speeds = [1.0, 1.5, 2.0, 0.5];
    let speedIdx = 0;
    if (btnSpeed && speedLabel) {
      btnSpeed.addEventListener('click', () => {
        speedIdx = (speedIdx + 1) % speeds.length;
        state.cinema.speed = speeds[speedIdx];
        speedLabel.textContent = `${state.cinema.speed.toFixed(1)}x`;
        playClickTone();
      });
    }

    // Fullscreen / Modal trigger
    const btnFullscreen = document.getElementById('cinema-btn-fullscreen');
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        openCinemaModal(state.cinema.currentScene);
      });
    }

    // Timeline Scrubber
    const scrubber = document.getElementById('cinema-scrubber');
    const currTimeDisp = document.getElementById('cinema-current-time');
    if (scrubber) {
      scrubber.addEventListener('input', (e) => {
        state.cinema.currentTime = (e.target.value / 100) * state.cinema.duration;
      });
    }

    // Main 3D Render Loop for the Cinema Canvas
    function renderCinema() {
      if (state.cinema.playing) {
        frame += 0.02 * state.cinema.speed;
        state.cinema.currentTime = (state.cinema.currentTime + 0.016 * state.cinema.speed) % state.cinema.duration;

        if (scrubber) {
          scrubber.value = (state.cinema.currentTime / state.cinema.duration) * 100;
        }
        if (currTimeDisp) {
          const mins = Math.floor(state.cinema.currentTime / 60).toString().padStart(2, '0');
          const secs = Math.floor(state.cinema.currentTime % 60).toString().padStart(2, '0');
          currTimeDisp.textContent = `${mins}:${secs}`;
        }
      }

      ctx.fillStyle = '#030508';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const current = state.cinema.currentScene;

      ctx.save();
      ctx.translate(cx, cy);

      // Render respective scene
      if (current === 'cyber') {
        renderCyberScene(ctx, frame, cameraOrbit, state.cinema.wireframe);
      } else if (current === 'spatial') {
        renderSpatialScene(ctx, frame, cameraOrbit, state.cinema.wireframe);
      } else if (current === 'fintech') {
        renderFintechScene(ctx, frame, cameraOrbit, state.cinema.wireframe);
      } else {
        renderNeuraScene(ctx, frame, cameraOrbit, state.cinema.wireframe);
      }

      ctx.restore();

      requestAnimationFrame(renderCinema);
    }
    renderCinema();

    // Reel cards launch buttons
    const launchBtns = document.querySelectorAll('.btn-reel-launch, .reel-play-overlay-btn');
    launchBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const card = btn.closest('.reel-card');
        const sceneKey = card?.getAttribute('data-scene') || 'cyber';
        openCinemaModal(sceneKey);
      });
    });
  }

  // --- 3D Scene 1: CyberMatrix Product Render ---
  function renderCyberScene(ctx, frame, orbit, wireframe) {
    const rotY = frame + orbit.x;
    const rotX = orbit.y;
    const radius = 100;

    // Draw coordinate grid floor in 3D
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.12)';
    ctx.lineWidth = 1;
    for (let x = -150; x <= 150; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 120);
      ctx.lineTo(x * 1.5, 200);
      ctx.stroke();
    }

    // 3D Icosahedron wireframe
    const numPoints = 14;
    const vertices = [];
    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi + rotY;

      const px = radius * Math.sin(phi) * Math.cos(theta);
      const py = radius * Math.sin(phi) * Math.sin(theta) * Math.cos(rotX) - radius * Math.cos(phi) * Math.sin(rotX);
      const pz = radius * Math.cos(phi);

      const scale = 300 / (300 + pz);
      vertices.push({ x: px * scale, y: py * scale });
    }

    // Connect vertices
    ctx.strokeStyle = wireframe ? '#00f2fe' : 'rgba(0, 242, 254, 0.6)';
    ctx.lineWidth = wireframe ? 1.5 : 2;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#00f2fe';

    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        const dist = Math.hypot(vertices[i].x - vertices[j].x, vertices[i].y - vertices[j].y);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(vertices[i].x, vertices[i].y);
          ctx.lineTo(vertices[j].x, vertices[j].y);
          ctx.stroke();
        }
      }
    }

    // Glowing core
    ctx.fillStyle = '#8a2be2';
    ctx.shadowColor = '#8a2be2';
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(0, 0, 16 + Math.sin(frame * 3) * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- 3D Scene 2: Spatial Vision OS Interface ---
  function renderSpatialScene(ctx, frame, orbit, wireframe) {
    const count = 3;
    for (let i = 0; i < count; i++) {
      const zOffset = (i - 1) * 40;
      const wave = Math.sin(frame * 1.5 + i) * 12;

      ctx.save();
      const cardW = 220 - i * 20;
      const cardH = 130 - i * 15;
      const x = (i - 1) * 35 + orbit.x * 20;
      const y = (i - 1) * 20 + wave + orbit.y * 20;

      ctx.fillStyle = wireframe ? 'rgba(7, 10, 18, 0.2)' : 'rgba(18, 24, 38, 0.65)';
      ctx.strokeStyle = i === 1 ? '#00f2fe' : '#8a2be2';
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 15;
      ctx.shadowColor = ctx.strokeStyle;

      ctx.beginPath();
      ctx.roundRect(x - cardW / 2, y - cardH / 2, cardW, cardH, 12);
      ctx.fill();
      ctx.stroke();

      if (i === 1) {
        // Mock floating volume control
        ctx.fillStyle = '#fff';
        ctx.fillRect(x - 60, y - 20, 120, 6);
        ctx.fillStyle = '#00f2fe';
        ctx.fillRect(x - 60, y - 20, 70, 6);
        ctx.beginPath();
        ctx.arc(x + 10, y - 17, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // --- 3D Scene 3: Fintech 3D Metallic Card ---
  function renderFintechScene(ctx, frame, orbit, wireframe) {
    ctx.save();
    const rot = Math.sin(frame) * 0.25 + orbit.x;
    const cardW = 250;
    const cardH = 155;

    ctx.rotate(rot);

    // Card background
    const grad = ctx.createLinearGradient(-cardW / 2, -cardH / 2, cardW / 2, cardH / 2);
    grad.addColorStop(0, wireframe ? '#07090e' : '#0d1527');
    grad.addColorStop(0.5, wireframe ? '#0a101f' : '#14203d');
    grad.addColorStop(1, wireframe ? '#07090e' : '#0a0d17');

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00f2fe';

    ctx.beginPath();
    ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 14);
    ctx.fill();
    ctx.stroke();

    // Specular sheen sweep
    const sheenX = ((frame * 60) % (cardW * 1.5)) - cardW * 0.75;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(sheenX, -cardH / 2);
    ctx.lineTo(sheenX + 40, cardH / 2);
    ctx.stroke();

    // Chip & text
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.roundRect(-cardW / 2 + 25, -cardH / 2 + 30, 36, 26, 4);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('ALIYAN // PLATINUM', -cardW / 2 + 25, cardH / 2 - 25);
    ctx.fillStyle = '#34d399';
    ctx.fillText('$128,450.00', cardW / 2 - 100, cardH / 2 - 25);

    ctx.restore();
  }

  // --- 3D Scene 4: NeuraTech Synaptic Graph ---
  function renderNeuraScene(ctx, frame, orbit, wireframe) {
    const nodes = [];
    const count = 18;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + frame * 0.5 + orbit.x;
      const r = 85 + Math.sin(frame * 2 + i) * 35;
      nodes.push({
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r * 0.65 + orbit.y * 30,
        color: i % 2 === 0 ? '#00f2fe' : '#c084fc'
      });
    }

    // Connect synaptic nodes
    ctx.lineWidth = wireframe ? 1 : 1.5;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (d < 95) {
          ctx.strokeStyle = `rgba(0, 242, 254, ${1 - d / 95})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw glowing nodes
    nodes.forEach((n) => {
      ctx.fillStyle = n.color;
      ctx.shadowColor = n.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // =========================================================================
  // Cinematic 3D Video Modal Overlay
  // =========================================================================
  function openCinemaModal(sceneKey = 'cyber') {
    const modal = document.getElementById('video-cinema-modal');
    if (!modal) return;

    modal.classList.add('open');
    playSuccessTone();

    const titleEl = document.getElementById('modal-reel-title');
    const descEl = document.getElementById('modal-reel-description');

    const meta = {
      cyber: {
        title: 'CyberMatrix 3D E-Commerce WebGL Reel',
        desc: 'Interactive 3D product showcase built with Three.js custom shaders, dynamic mouse velocity tracking, and high-conversion UI/UX checkout flow.'
      },
      spatial: {
        title: 'Spatial Vision OS Glass Interface Reel',
        desc: 'Futuristic spatial UI experiment featuring depth-based layering, real-time glassmorphism blurs, and volumetric sound effects.'
      },
      fintech: {
        title: 'Holographic Cyber Card & Crypto Flow Reel',
        desc: 'Fintech digital banking interface with 3D tilt physics, live candlestick graph updates, and seamless biometric authentication UI.'
      },
      neura: {
        title: 'NeuraTech AI SaaS 3D Dashboard Reel',
        desc: 'Real-time AI data visualization engine with synaptic node graphs, canvas animations, and responsive dashboard widgets.'
      }
    };

    if (titleEl && meta[sceneKey]) titleEl.textContent = meta[sceneKey].title;
    if (descEl && meta[sceneKey]) descEl.textContent = meta[sceneKey].desc;

    // Start modal canvas loop
    initModalCanvas(sceneKey);
  }

  function closeCinemaModal() {
    const modal = document.getElementById('video-cinema-modal');
    if (modal) {
      modal.classList.remove('open');
      playClickTone();
    }
  }

  function initModalCanvas(sceneKey) {
    const canvas = document.getElementById('modal-interactive-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.parentElement.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement.clientHeight || 400);

    let frame = 0;
    let orbit = { x: 0, y: 0, isDragging: false, startX: 0, startY: 0 };

    canvas.onmousedown = (e) => {
      orbit.isDragging = true;
      orbit.startX = e.clientX - orbit.x;
      orbit.startY = e.clientY - orbit.y;
    };
    window.onmousemove = (e) => {
      if (!orbit.isDragging) return;
      orbit.x = (e.clientX - orbit.startX) * 0.01;
      orbit.y = (e.clientY - orbit.startY) * 0.01;
    };
    window.onmouseup = () => {
      orbit.isDragging = false;
    };

    function loop() {
      const modal = document.getElementById('video-cinema-modal');
      if (!modal || !modal.classList.contains('open')) return;

      frame += 0.02;
      ctx.fillStyle = '#020306';
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2, height / 2);

      if (sceneKey === 'cyber') renderCyberScene(ctx, frame, orbit, false);
      else if (sceneKey === 'spatial') renderSpatialScene(ctx, frame, orbit, false);
      else if (sceneKey === 'fintech') renderFintechScene(ctx, frame, orbit, false);
      else renderNeuraScene(ctx, frame, orbit, false);

      ctx.restore();
      requestAnimationFrame(loop);
    }
    loop();
  }

  // Modal close handlers
  const btnCloseModal = document.getElementById('btn-close-modal');
  const modalBackdrop = document.querySelector('.cinema-modal-backdrop');
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeCinemaModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeCinemaModal);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCinemaModal();
  });

  // =========================================================================
  // Interactive UI/UX Design Studio Switcher & Tilt Sandbox
  // =========================================================================
  function initUIUXStudio() {
    const tabBtns = document.querySelectorAll('.uiux-tab-btn');
    const tabContents = document.querySelectorAll('.uiux-tab-content');

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabBtns.forEach((b) => b.classList.remove('active'));
        tabContents.forEach((c) => c.classList.remove('active'));

        btn.classList.add('active');
        const targetTab = document.getElementById(`tab-${btn.getAttribute('data-tab')}`);
        if (targetTab) {
          targetTab.classList.add('active');
        }
        playClickTone();
      });
    });

    // 3D Tilt Sandbox Preview
    const tiltBox = document.getElementById('uiux-tilt-preview');
    const coordsDisp = document.getElementById('tilt-coords-disp');

    if (tiltBox && coordsDisp) {
      tiltBox.addEventListener('mousemove', (e) => {
        const rect = tiltBox.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const rotX = -(y / (rect.height / 2)) * 16;
        const rotY = (x / (rect.width / 2)) * 16;

        tiltBox.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03, 1.03, 1.03)`;
        coordsDisp.textContent = `RotX: ${rotX.toFixed(2)}° | RotY: ${rotY.toFixed(2)}°`;
      });

      tiltBox.addEventListener('mouseleave', () => {
        tiltBox.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        coordsDisp.textContent = 'RotX: 0.00° | RotY: 0.00°';
      });
    }
  }

  // =========================================================================
  // 3D Card Tilt Physics (Projects & Skills)
  // =========================================================================
  function init3DCardTilt() {
    const cards = document.querySelectorAll('.skill-card-3d, .project-card-3d, .about-card-3d, .reel-card');

    cards.forEach((card) => {
      card.addEventListener('mouseenter', () => playHoverTone());

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotX = -((y - centerY) / centerY) * 7;
        const rotY = ((x - centerX) / centerX) * 7;

        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  // =========================================================================
  // Interactive MacOS Developer Terminal
  // =========================================================================
  function initTerminal() {
    const input = document.getElementById('terminal-input-cmd');
    const screen = document.getElementById('terminal-screen');
    const chips = document.querySelectorAll('.t-chip');
    if (!input || !screen) return;

    const commands = {
      help: () => `
        <div style="color:var(--accent-cyan); font-weight:600; margin-bottom:0.4rem;">AVAILABLE COMMANDS:</div>
        <div>&bull; <strong style="color:#fff;">uiux</strong> - Aliyan's UI/UX design workflow & Figma architecture</div>
        <div>&bull; <strong style="color:#fff;">video</strong> - Launch 3D Video & Motion UI Cinema</div>
        <div>&bull; <strong style="color:#fff;">about</strong> - Professional bio, creative mindset, education</div>
        <div>&bull; <strong style="color:#fff;">skills</strong> - Comprehensive technical & design arsenal</div>
        <div>&bull; <strong style="color:#fff;">projects</strong> - Production web apps & interactive 3D concepts</div>
        <div>&bull; <strong style="color:#fff;">education</strong> - Matriculation, Intermediate, certifications</div>
        <div>&bull; <strong style="color:#fff;">contact</strong> - Direct WhatsApp (+92 314 3215619) & phone</div>
        <div>&bull; <strong style="color:#fff;">hire</strong> - Availability status & quick collaboration link</div>
        <div>&bull; <strong style="color:#fff;">clear</strong> - Clear terminal screen</div>
      `,
      uiux: () => `
        <div style="color:#c084fc; font-weight:700; margin-bottom:0.3rem;">🎨 UI/UX DESIGN PROCESS & PHILOSOPHY:</div>
        <div>1. Empathy & Discovery: User research, heuristics, personas</div>
        <div>2. Wireframing: 8pt grid, layout hierarchies, rapid sketches</div>
        <div>3. High-Fi in Figma: Component tokens, auto-layout, glassmorphism</div>
        <div>4. 3D & Micro-Motion: Spring physics, bezier easing, Three.js shaders</div>
        <div>5. Code Translation: Direct React + Tailwind pixel-perfect output!</div>
      `,
      video: () => {
        openCinemaModal('cyber');
        return '<span style="color:#22c55e;">[SUCCESS]</span> Launched 3D Cinema Video Modal!';
      },
      reel: () => {
        openCinemaModal('cyber');
        return '<span style="color:#22c55e;">[SUCCESS]</span> Launched 3D Cinema Video Modal!';
      },
      about: () => `
        <div style="margin-bottom:0.3rem;"><strong style="color:#fff;">Aliyan</strong> - Frontend Developer & UI/UX Designer</div>
        <div style="color:var(--text-secondary);">Currently in Intermediate studies with strong self-driven mastery in web engineering. Passionate about 3D WebGL, Figma systems, clean code, and blazing performance.</div>
      `,
      skills: () => `
        <div style="color:var(--accent-cyan); font-weight:600;">CORE CAPABILITIES:</div>
        <div>&bull; UI/UX: Figma (95%), Wireframing (92%), Micro-Interactions (90%)</div>
        <div>&bull; Frontend: HTML5 (95%), CSS3/Tailwind (92%), JS ES6+ (90%), React (88%), Next.js (85%)</div>
        <div>&bull; 3D & Motion: Three.js WebGL (85%), Canvas APIs, Web Audio</div>
      `,
      projects: () => `
        <div>1. <strong>Aura 3D Web Experience</strong> - WebGL particle field & shaders</div>
        <div>2. <strong>Pulse Modern Store</strong> - Headless React e-commerce</div>
        <div>3. <strong>DevSphere Analytics UI</strong> - Glassmorphic SaaS console</div>
        <div>4. <strong>CyberCrypt Web3 Tracker</strong> - Realtime crypto monitor</div>
        <div>5. <strong>Aliyan's 3D Digital Canvas</strong> - This interactive portfolio!</div>
      `,
      education: () => `
        <div>&bull; <strong>Intermediate</strong> (Higher Secondary) - Currently Enrolled</div>
        <div>&bull; <strong>Matriculation</strong> (Secondary Schooling) - Completed</div>
        <div>&bull; <strong>Self-Driven Mastery</strong> - Continuous modern frontend & UI/UX specialization</div>
      `,
      contact: () => `
        <div>Direct Phone: <a href="tel:03143215619" style="color:var(--accent-cyan);">0314-3215619</a></div>
        <div>WhatsApp: <a href="https://wa.me/923143215619" target="_blank" style="color:#25d366;">+92 314 3215619</a></div>
        <div>Location: Pakistan &bull; Worldwide Remote Ready</div>
      `,
      hire: () => `
        <div style="color:#10b981; font-weight:700;">STATUS: AVAILABLE FOR WORK!</div>
        <div>Looking for a Frontend Developer or UI/UX Designer for your project?</div>
        <div><a href="https://wa.me/923143215619?text=Hi%20Aliyan%2C%20I%20want%20to%20hire%20you!" target="_blank" style="color:var(--accent-cyan); font-weight:600;">Click here to chat directly on WhatsApp &rarr;</a></div>
      `,
      clear: () => {
        screen.innerHTML = '';
        return null;
      }
    };

    function executeCommand(rawCmd) {
      const cmd = rawCmd.trim().toLowerCase();
      if (!cmd) return;

      playClickTone();

      const cmdLine = document.createElement('div');
      cmdLine.innerHTML = `<span style="color:var(--accent-cyan);">aliyan@portfolio:~$</span> <span>${rawCmd}</span>`;
      screen.appendChild(cmdLine);

      if (commands[cmd]) {
        const res = commands[cmd]();
        if (res !== null) {
          const resLine = document.createElement('div');
          resLine.style.margin = '0.4rem 0 1rem 0';
          resLine.innerHTML = res;
          screen.appendChild(resLine);
        }
      } else {
        const errorLine = document.createElement('div');
        errorLine.style.color = '#ef4444';
        errorLine.style.margin = '0.3rem 0 0.8rem 0';
        errorLine.textContent = `Command not recognized: '${rawCmd}'. Type 'help' for options.`;
        screen.appendChild(errorLine);
      }

      screen.scrollTop = screen.scrollHeight;
      input.value = '';
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeCommand(input.value);
    });

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const cmd = chip.getAttribute('data-cmd');
        if (cmd) executeCommand(cmd);
      });
    });
  }

  // =========================================================================
  // Filtering Logic (Skills & Projects)
  // =========================================================================
  function initFilters() {
    // Skills Filter
    const skillBtns = document.querySelectorAll('.skills-filter .filter-btn');
    const skillCards = document.querySelectorAll('.skills-grid .skill-card-3d');

    skillBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        skillBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.getAttribute('data-filter');

        skillCards.forEach((card) => {
          if (cat === 'all' || card.getAttribute('data-category') === cat) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.4s ease';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // Projects Filter
    const projBtns = document.querySelectorAll('.projects-filter .filter-btn');
    const projCards = document.querySelectorAll('.projects-grid .project-card-3d');

    projBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        projBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.getAttribute('data-filter');

        projCards.forEach((card) => {
          if (cat === 'all' || card.getAttribute('data-category') === cat) {
            card.style.display = 'flex';
            card.style.animation = 'fadeIn 0.4s ease';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // =========================================================================
  // Contact Form & Direct WhatsApp Integration
  // =========================================================================
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('c-name')?.value.trim() || 'Visitor';
      const email = document.getElementById('c-email')?.value.trim() || '';
      const subject = document.getElementById('c-subject')?.value.trim() || 'UI/UX & Frontend Project';
      const msg = document.getElementById('c-message')?.value.trim() || '';

      const whatsappText = encodeURIComponent(
        `Hi Aliyan! My name is ${name} (${email}).\nService Needed: ${subject}\n\nProject Details:\n${msg}`
      );

      const targetUrl = `https://wa.me/923143215619?text=${whatsappText}`;

      showToast('Opening WhatsApp to send your message to Aliyan...');
      setTimeout(() => {
        window.open(targetUrl, '_blank');
      }, 700);

      form.reset();
    });
  }

  // =========================================================================
  // Navigation & Scroll Tracking
  // =========================================================================
  function initNavigation() {
    const header = document.querySelector('.site-header');
    const menuBtn = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }

      const sections = document.querySelectorAll('section[id]');
      const scrollY = window.pageYOffset;

      sections.forEach((sec) => {
        const sectionHeight = sec.offsetHeight;
        const sectionTop = sec.offsetTop - 120;
        const sectionId = sec.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          links.forEach((l) => {
            if (l.getAttribute('href') === `#${sectionId}`) {
              l.classList.add('active');
            } else {
              l.classList.remove('active');
            }
          });
        }
      });
    });

    if (menuBtn && navLinks) {
      menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('open');
      });

      links.forEach((link) => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('open');
        });
      });
    }
  }

  // =========================================================================
  // Custom Cursor Engine
  // =========================================================================
  function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const dot = document.querySelector('.custom-cursor-dot');
    if (!cursor || !dot) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    });

    function loopCursor() {
      cursorX += (mouseX - cursorX) * 0.18;
      cursorY += (mouseY - cursorY) * 0.18;

      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;

      requestAnimationFrame(loopCursor);
    }
    loopCursor();

    const hoverables = document.querySelectorAll('a, button, input, textarea, .glass-panel, .t-chip');
    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width = '38px';
        cursor.style.height = '38px';
        cursor.style.backgroundColor = 'rgba(0, 242, 254, 0.15)';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width = '20px';
        cursor.style.height = '20px';
        cursor.style.backgroundColor = 'transparent';
      });
    });
  }

  // =========================================================================
  // Sound FX Toggle
  // =========================================================================
  function initToggles() {
    const soundToggle = document.getElementById('btn-sound-toggle');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        if (state.soundEnabled) {
          initAudio();
          soundToggle.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
          `;
          showToast('Sound Effects Enabled 🔊');
        } else {
          soundToggle.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
          `;
          showToast('Sound Effects Muted 🔇');
        }
      });
    }
  }

  // =========================================================================
  // Initialize Application on DOM Ready
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    init3DBackground();
    initHeroCanvas();
    initCinemaTheater();
    initUIUXStudio();
    initCustomCursor();
    init3DCardTilt();
    initTerminal();
    initFilters();
    initContactForm();
    initNavigation();
    initToggles();
  });
})();
