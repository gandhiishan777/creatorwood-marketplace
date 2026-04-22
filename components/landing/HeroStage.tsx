'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Types ───────────────────────────────────────────────────────────────────

interface HeroStageProps {
  images: string[];
  onShattered: () => void;
  onHeroGone?: () => void;
  scrollerRef: React.RefObject<HTMLDivElement>;
}

interface CardUserData {
  base: { pos: THREE.Vector3; rot: THREE.Euler };
  phase: number;
  speed: number;
  amp: number;
  orbitR: number;
  orbitSpeed: number;
  spinX: number;
  spinY: number;
  spinZ: number;
  morphing?: boolean;
}

interface FragmentData {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  ry: number;
  rz: number;
}

interface GlassUniforms {
  uTime: THREE.IUniform<number>;
  uMouse: THREE.IUniform<THREE.Vector2>;
  uOpacity: THREE.IUniform<number>;
  uCrackMask: THREE.IUniform<number>;
  uRes: THREE.IUniform<THREE.Vector2>;
}

interface BgUniforms {
  uTime: THREE.IUniform<number>;
}

interface Seed {
  x: number;
  y: number;
  origin?: boolean;
  frame?: boolean;
}

interface VoronoiCell {
  seed: Seed;
  poly: Array<{ x: number; y: number }>;
}

type Point2D = { x: number; y: number };

// ─── Fallback image URLs ──────────────────────────────────────────────────────

const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=900&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=900&q=80',
  'https://images.unsplash.com/photo-1481487196290-c152efe083f5?w=900&q=80',
  'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=900&q=80',
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=900&q=80',
  'https://images.unsplash.com/photo-1493514789931-586cb221d7a7?w=900&q=80',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900&q=80',
  'https://images.unsplash.com/photo-1520262454473-a1a82276a574?w=900&q=80',
];

const CARD_LAYOUT = [
  { pos: [-3.0,  1.3, -2.0] as [number, number, number], rot: [-0.05,  0.18, -0.02] as [number, number, number], scale: 1.6 },
  { pos: [ 2.6,  1.6, -2.4] as [number, number, number], rot: [ 0.04, -0.22,  0.03] as [number, number, number], scale: 1.8 },
  { pos: [-2.2, -1.6, -1.4] as [number, number, number], rot: [ 0.07,  0.14, -0.04] as [number, number, number], scale: 1.3 },
  { pos: [ 2.9, -1.2, -1.8] as [number, number, number], rot: [-0.06, -0.12,  0.02] as [number, number, number], scale: 1.5 },
  { pos: [ 0.1,  0.2, -3.2] as [number, number, number], rot: [ 0.02,  0.06,  0.0 ] as [number, number, number], scale: 2.2 },
  { pos: [-1.1,  2.4, -2.8] as [number, number, number], rot: [-0.12,  0.2,  -0.05] as [number, number, number], scale: 1.4 },
  { pos: [ 1.5, -2.6, -2.2] as [number, number, number], rot: [ 0.1 , -0.18,  0.04] as [number, number, number], scale: 1.3 },
  { pos: [-3.6, -0.2, -2.6] as [number, number, number], rot: [-0.04,  0.26,  0.01] as [number, number, number], scale: 1.5 },
  { pos: [ 3.6,  0.3, -3.0] as [number, number, number], rot: [ 0.05, -0.28, -0.02] as [number, number, number], scale: 1.55 },
] as const;

const GLASS_Z = 3.0;

// ─── Voronoi helpers (pure functions, no DOM side effects) ────────────────────

function clipPolygon(poly: Point2D[], a: Point2D, b: Point2D): Point2D[] {
  const out: Point2D[] = [];
  const n = poly.length;
  const bxa = b.x - a.x;
  const bya = b.y - a.y;
  const rhs = b.x * b.x + b.y * b.y - (a.x * a.x + a.y * a.y);
  function side(p: Point2D) { return 2 * (p.x * bxa + p.y * bya) - rhs; }
  for (let i = 0; i < n; i++) {
    const cur = poly[i];
    const nxt = poly[(i + 1) % n];
    const sC = side(cur);
    const sN = side(nxt);
    if (sC < 0) {
      out.push(cur);
      if (sN > 0) {
        const t = sC / (sC - sN);
        out.push({ x: cur.x + (nxt.x - cur.x) * t, y: cur.y + (nxt.y - cur.y) * t });
      }
    } else if (sC > 0 && sN < 0) {
      const t = sC / (sC - sN);
      out.push({ x: cur.x + (nxt.x - cur.x) * t, y: cur.y + (nxt.y - cur.y) * t });
    } else if (sC === 0) {
      out.push(cur);
    }
  }
  return out;
}

function computeVoronoiCells(seeds: Seed[], bounds: [number, number, number, number]): VoronoiCell[] {
  const poly0: Point2D[] = [
    { x: bounds[0], y: bounds[1] },
    { x: bounds[2], y: bounds[1] },
    { x: bounds[2], y: bounds[3] },
    { x: bounds[0], y: bounds[3] },
  ];
  const cells: VoronoiCell[] = [];
  for (let i = 0; i < seeds.length; i++) {
    if (seeds[i].frame) continue;
    let poly = poly0.slice();
    for (let j = 0; j < seeds.length; j++) {
      if (i === j) continue;
      poly = clipPolygon(poly, seeds[i], seeds[j]);
      if (poly.length === 0) break;
    }
    if (poly.length >= 3) cells.push({ seed: seeds[i], poly });
  }
  return cells;
}

function polyCentroid(poly: Point2D[]): Point2D {
  let cx = 0, cy = 0;
  for (const p of poly) { cx += p.x; cy += p.y; }
  return { x: cx / poly.length, y: cy / poly.length };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function HeroStage({ images, onShattered, onHeroGone, scrollerRef }: HeroStageProps) {
  const stageRef       = useRef<HTMLDivElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const crackSvgRef    = useRef<SVGSVGElement>(null);
  const cursorDotRef   = useRef<HTMLDivElement>(null);
  const cursorRingRef  = useRef<HTMLDivElement>(null);
  const eyebrowRef     = useRef<HTMLDivElement>(null);
  const titleRef       = useRef<HTMLHeadingElement>(null);
  const subRef         = useRef<HTMLDivElement>(null);
  const postShatterRef = useRef<HTMLDivElement>(null);
  const rendererRef    = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    // ── Inject @keyframes cwPulse ─────────────────────────────────────────
    const styleId = 'cw-hero-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes cwPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.55; transform: scale(1.35); }
        }
      `;
      document.head.appendChild(style);
    }

    const stage       = stageRef.current;
    const canvas      = canvasRef.current;
    const crackSvg    = crackSvgRef.current;
    const cd          = cursorDotRef.current;
    const cr          = cursorRingRef.current;
    const eyebrowEl   = eyebrowRef.current;
    const titleEl     = titleRef.current;
    const subEl       = subRef.current;
    const postShatterEl = postShatterRef.current;

    if (!stage || !canvas || !crackSvg || !cd || !cr || !eyebrowEl || !titleEl || !subEl || !postShatterEl) return;

    // Resolve image list (use prop images, fall back to FALLBACK_IMGS)
    const IMGS: string[] = Array.from({ length: 9 }, (_, i) =>
      (images && images[i]) ? images[i] : FALLBACK_IMGS[i]
    );

    // ── State ─────────────────────────────────────────────────────────────
    const state = {
      clicks: 0,
      shattered: false,
      revealed: false,
      mouse: { x: 0.5, y: 0.5 },
      mouseRaw: { x: 0, y: 0 },
    };

    // ── Custom cursor ─────────────────────────────────────────────────────
    let rx = 0, ry = 0;
    let cursorAnimId: number;

    function onMouseMove(e: MouseEvent) {
      state.mouseRaw.x = e.clientX;
      state.mouseRaw.y = e.clientY;
      state.mouse.x = e.clientX / window.innerWidth;
      state.mouse.y = e.clientY / window.innerHeight;
      cd.style.left = e.clientX + 'px';
      cd.style.top  = e.clientY + 'px';
    }
    window.addEventListener('mousemove', onMouseMove);

    function animCursor() {
      rx += (state.mouseRaw.x - rx) * 0.12;
      ry += (state.mouseRaw.y - ry) * 0.12;
      cr.style.left = rx + 'px';
      cr.style.top  = ry + 'px';
      cursorAnimId = requestAnimationFrame(animCursor);
    }
    animCursor();

    // ── Three.js renderer / scene / camera ────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x050505, 1);
    rendererRef.current = renderer;

    const scene  = new THREE.Scene();
    scene.fog    = new THREE.Fog(0x050505, 6, 22);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 7);

    // ── Lights ────────────────────────────────────────────────────────────
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.7);
    keyLight.position.set(3, 5, 6);
    scene.add(keyLight);

    const violetLight = new THREE.PointLight(0xaa88ff, 2.2, 22);
    violetLight.position.set(-3, 2, 5);
    scene.add(violetLight);

    const ambLight = new THREE.AmbientLight(0x202028, 1.2);
    scene.add(ambLight);

    // ── Background gradient shader plane ──────────────────────────────────
    const bgGeo = new THREE.PlaneGeometry(40, 24);
    const bgUniforms: BgUniforms = { uTime: { value: 0 } };
    const bgMat = new THREE.ShaderMaterial({
      depthWrite: false,
      uniforms: bgUniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        void main() {
          vec2 p = vUv - 0.5;
          float r = length(p * vec2(1.6, 1.0));
          vec3 deep = vec3(0.018, 0.015, 0.025);
          vec3 glow = vec3(0.18, 0.10, 0.35);
          float v = smoothstep(0.85, 0.05, r);
          vec3 col = mix(deep, glow * 0.35, v);
          float band = sin((vUv.y * 6.0) + uTime * 0.15) * 0.5 + 0.5;
          col += vec3(0.05, 0.03, 0.09) * band * 0.1;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    const bg = new THREE.Mesh(bgGeo, bgMat);
    bg.position.z = -6;
    scene.add(bg);

    // ── Portfolio cards ───────────────────────────────────────────────────
    function placeholderTexture(hue: number): THREE.CanvasTexture {
      const c = document.createElement('canvas');
      c.width = 4; c.height = 4;
      const ctx = c.getContext('2d')!;
      const g = ctx.createLinearGradient(0, 0, 4, 4);
      g.addColorStop(0, `hsl(${hue}, 30%, 25%)`);
      g.addColorStop(1, `hsl(${hue}, 40%, 12%)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 4, 4);
      return new THREE.CanvasTexture(c);
    }

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    const cards: THREE.Mesh[] = [];
    const cardGroup = new THREE.Group();
    scene.add(cardGroup);

    for (let i = 0; i < CARD_LAYOUT.length; i++) {
      const info = CARD_LAYOUT[i];
      const hue  = 260 + (i * 18) % 60;
      const w    = 1.8 * info.scale;
      const h    = 1.2 * info.scale;

      const geo = new THREE.PlaneGeometry(w, h, 1, 1);
      const mat = new THREE.MeshBasicMaterial({
        map: placeholderTexture(hue),
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(info.pos[0], info.pos[1], info.pos[2]);
      mesh.rotation.set(info.rot[0], info.rot[1], info.rot[2]);

      const ud: CardUserData = {
        base: { pos: mesh.position.clone(), rot: mesh.rotation.clone() },
        phase: Math.random() * Math.PI * 2,
        speed: 0.15 + Math.random() * 0.2,
        amp: 0.12 + Math.random() * 0.18,
        orbitR: 0.25 + Math.random() * 0.5,
        orbitSpeed: 0.18 + Math.random() * 0.25,
        spinX: (Math.random() - 0.5) * 0.15,
        spinY: (Math.random() - 0.5) * 0.22,
        spinZ: (Math.random() - 0.5) * 0.08,
      };
      mesh.userData = ud;

      cardGroup.add(mesh);
      cards.push(mesh);

      // Edge outline
      const edges = new THREE.EdgesGeometry(geo);
      mesh.add(new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 })
      ));

      // Async texture load
      const url = IMGS[i % IMGS.length];
      loader.load(
        url,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 4;
          (mat as THREE.MeshBasicMaterial).map = tex;
          mat.needsUpdate = true;
        },
        undefined,
        () => { /* silently fall back to placeholder */ }
      );
    }

    // ── Frosted-glass overlay shader ──────────────────────────────────────
    const glassGeo = new THREE.PlaneGeometry(30, 18, 1, 1);
    const glassUniforms: GlassUniforms = {
      uTime:      { value: 0 },
      uMouse:     { value: new THREE.Vector2(0.5, 0.5) },
      uOpacity:   { value: 1.0 },
      uCrackMask: { value: 0.0 },
      uRes:       { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    };
    const glassMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: glassUniforms as unknown as { [key: string]: THREE.IUniform },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPos;
        void main() {
          vUv  = uv;
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        uniform vec2  uMouse;
        uniform float uOpacity;
        uniform float uCrackMask;
        uniform vec2  uRes;

        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          float a = hash(i), b = hash(i + vec2(1,0)), c = hash(i + vec2(0,1)), d = hash(i + vec2(1,1));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
        float fbm(vec2 p) {
          float v = 0.0, a = 0.5;
          for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
          return v;
        }
        void main() {
          vec2 uv     = vUv;
          vec2 aspect = vec2(uRes.x / uRes.y, 1.0);
          vec2 m      = uMouse * aspect;
          vec2 p      = uv * aspect;
          float d     = length(p - m);

          float lens  = smoothstep(0.28, 0.0, d) * 0.35;
          float halo  = smoothstep(0.6,  0.2, d) * 0.12;

          float n     = fbm(uv * 3.0 + vec2(0.0, uTime * 0.03));
          float n2    = fbm(uv * 8.0 - vec2(uTime * 0.04, 0.0));
          float hair  = smoothstep(0.72, 0.78, n2) * 0.25;

          vec3 base   = mix(vec3(0.10, 0.08, 0.16), vec3(0.20, 0.16, 0.32), n * 0.9);
          base += vec3(0.35, 0.25, 0.55) * (lens + halo);
          base += vec3(0.9,  0.85, 1.0 ) * hair * 0.3;

          float streak = smoothstep(0.02, 0.0, abs((uv.x - uMouse.x) - (uv.y - uMouse.y) * 0.2)) * 0.04;
          base += streak;

          float vig  = smoothstep(1.1, 0.3, length(vUv - 0.5));
          base *= mix(0.7, 1.0, vig);

          float alpha = uOpacity * (0.93 - uCrackMask * 0.45);
          gl_FragColor = vec4(base, alpha);
        }
      `,
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.z = GLASS_Z;
    scene.add(glass);

    // ── Voronoi crack data ────────────────────────────────────────────────
    const crackSeeds: Seed[] = [];
    const scatterSeeds: Seed[] = [];

    function seedScatter() {
      scatterSeeds.length = 0;
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        scatterSeeds.push({ x: 50 + Math.cos(a) * 140, y: 50 + Math.sin(a) * 140, frame: true });
      }
    }
    seedScatter();

    function addCrackAt(cx: number, cy: number) {
      crackSeeds.push({ x: cx, y: cy, origin: true });
      const rays = 12 + Math.floor(Math.random() * 4);
      for (let r = 0; r < rays; r++) {
        const angle = (r / rays) * Math.PI * 2 + Math.random() * 0.15;
        const steps = 6 + Math.floor(Math.random() * 3);
        for (let s = 1; s <= steps; s++) {
          const radius = (s / steps) * 70 * (0.4 + Math.random() * 0.8);
          crackSeeds.push({
            x: cx + Math.cos(angle) * radius + (Math.random() - 0.5) * 6,
            y: cy + Math.sin(angle) * radius + (Math.random() - 0.5) * 6,
          });
        }
      }
      for (let k = 0; k < 28; k++) {
        const ang = Math.random() * Math.PI * 2;
        const rad = Math.random() * 18;
        crackSeeds.push({ x: cx + Math.cos(ang) * rad, y: cy + Math.sin(ang) * rad });
      }
    }

    let lastClick = { x: 50, y: 50 };
    let voronoiCells: VoronoiCell[] = [];

    function pulseRipple(x: number, y: number) {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', String(x));
      c.setAttribute('cy', String(y));
      c.setAttribute('r', '0');
      c.setAttribute('fill', 'none');
      c.setAttribute('stroke', 'rgba(200,180,255,0.6)');
      c.setAttribute('stroke-width', '0.3');
      c.setAttribute('vector-effect', 'non-scaling-stroke');
      crackSvg.appendChild(c);
      gsap.to(c, {
        attr: { r: 80 },
        opacity: 0,
        duration: 1.2,
        ease: 'power2.out',
        onComplete: () => c.remove(),
      });
    }

    function redrawCracks(animate: boolean) {
      const seeds = crackSeeds.concat(scatterSeeds);
      voronoiCells = computeVoronoiCells(seeds, [-40, -40, 140, 140]);

      crackSvg.innerHTML = '';
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      for (const cell of voronoiCells) {
        const poly = cell.poly;
        for (let j = 0; j < poly.length; j++) {
          const a = poly[j];
          const b = poly[(j + 1) % poly.length];
          // Skip edges that are entirely outside the viewport
          if ((a.x < -2 && b.x < -2) || (a.x > 102 && b.x > 102) ||
              (a.y < -2 && b.y < -2) || (a.y > 102 && b.y > 102)) continue;
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', String(a.x));
          line.setAttribute('y1', String(a.y));
          line.setAttribute('x2', String(b.x));
          line.setAttribute('y2', String(b.y));
          line.setAttribute('stroke', 'rgba(255,255,255,0.62)');
          line.setAttribute('stroke-width', state.clicks >= 2 ? '0.18' : '0.12');
          line.setAttribute('vector-effect', 'non-scaling-stroke');
          line.setAttribute('stroke-linecap', 'round');
          line.style.opacity = '0';
          g.appendChild(line);
        }
      }

      crackSvg.appendChild(g);

      if (animate) {
        gsap.to(g.querySelectorAll('line'), {
          opacity: 1,
          duration: 0.35,
          stagger: { from: 'random', amount: 0.3 },
          ease: 'power2.out',
        });
        pulseRipple(lastClick.x, lastClick.y);
      } else {
        g.querySelectorAll('line').forEach((l) => ((l as SVGLineElement).style.opacity = '1'));
      }
    }

    // ── Shatter ───────────────────────────────────────────────────────────
    function shatter() {
      if (state.shattered) return;
      state.shattered = true;

      // BUG FIX #2: unlock scroll IMMEDIATELY on 3rd click
      onShattered();

      // Make both the div and the Three.js canvas transparent so LandingSections
      // shows through as the user scrolls the cards away
      if (stage) stage.style.background = 'transparent';
      rendererRef.current?.setClearColor(0x000000, 0);

      // BUG FIX #3: hide intro copy, show post-shatter headline + CTAs
      gsap.to([titleEl, subEl, eyebrowEl], {
        opacity: 0,
        y: -14,
        duration: 0.45,
        ease: 'power2.in',
        onComplete: () => {
          titleEl.style.display     = 'none';
          subEl.style.display       = 'none';
          eyebrowEl.style.display   = 'none';
          postShatterEl.style.display = 'flex';
          gsap.fromTo(
            postShatterEl,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
          );
        },
      });

      // BUG FIX #1: fade out crack SVG, then fully remove from layout
      gsap.to(crackSvg, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => { crackSvg.style.display = 'none'; },
      });

      // Fade glass shader out
      gsap.to(glassUniforms.uOpacity, { value: 0, duration: 0.2 });

      // Build fragment meshes from Voronoi cells
      const cells = voronoiCells;
      const frags: FragmentData[] = [];

      const vertHalf = Math.tan((camera.fov * Math.PI / 180) / 2) * (camera.position.z - GLASS_Z);
      const visH     = vertHalf * 2;
      const visW     = visH * (window.innerWidth / window.innerHeight);

      function pctToWorld(px: number, py: number): THREE.Vector3 {
        return new THREE.Vector3(
          (px / 100 - 0.5) * visW,
          (0.5 - py / 100) * visH,
          GLASS_Z
        );
      }

      const fragVertShader = `
        varying vec3 vN;
        varying vec3 vW;
        void main() {
          vN = normalize(normalMatrix * normal);
          vec4 w = modelMatrix * vec4(position, 1.0);
          vW = w.xyz;
          gl_Position = projectionMatrix * viewMatrix * w;
        }
      `;
      const fragFragShader = `
        varying vec3 vN;
        varying vec3 vW;
        uniform float uTime;
        void main() {
          vec3 view  = normalize(cameraPosition - vW);
          float f    = pow(1.0 - max(dot(vN, view), 0.0), 2.5);
          vec3 c1    = vec3(0.75, 0.55, 1.0);
          vec3 c2    = vec3(0.4,  0.7,  1.0);
          vec3 c3    = vec3(1.0,  0.9,  1.0);
          vec3 irid  = mix(mix(c2, c1, f), c3, f * f);
          vec3 col   = irid * (0.35 + 0.9 * f);
          gl_FragColor = vec4(col, 0.78 + 0.22 * f);
        }
      `;

      let built = 0;
      for (let i = 0; i < cells.length && built < 140; i++) {
        const cell = cells[i];
        const poly = cell.poly;
        if (poly.length < 3) continue;

        const cen = polyCentroid(poly);
        if (cen.x < -10 || cen.x > 110 || cen.y < -10 || cen.y > 110) continue;

        const cenWorld = pctToWorld(cen.x, cen.y);
        const worldPts = poly.map(p => pctToWorld(p.x, p.y));

        const shape = new THREE.Shape();
        shape.moveTo(worldPts[0].x - cenWorld.x, worldPts[0].y - cenWorld.y);
        for (let k = 1; k < worldPts.length; k++) {
          shape.lineTo(worldPts[k].x - cenWorld.x, worldPts[k].y - cenWorld.y);
        }
        shape.closePath();

        let geo: THREE.ExtrudeGeometry;
        try {
          geo = new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false, curveSegments: 1 });
        } catch {
          continue;
        }

        const fragMat = new THREE.ShaderMaterial({
          transparent: true,
          uniforms: { uTime: { value: 0 } },
          vertexShader: fragVertShader,
          fragmentShader: fragFragShader,
        });

        const fragMesh = new THREE.Mesh(geo, fragMat);
        fragMesh.position.copy(cenWorld);

        const dirX = cenWorld.x + (Math.random() - 0.5) * 0.6;
        const dirY = cenWorld.y + (Math.random() - 0.5) * 0.6;
        const len  = Math.hypot(dirX, dirY) || 1;
        const vx   = (dirX / len) * (1.2 + Math.random() * 1.6);
        const vy   = (dirY / len) * (1.2 + Math.random() * 1.6);
        const vz   = 0.4 + Math.random() * 1.4;

        scene.add(fragMesh);
        frags.push({
          mesh: fragMesh,
          vx, vy, vz,
          rx: (Math.random() - 0.5) * 4,
          ry: (Math.random() - 0.5) * 4,
          rz: (Math.random() - 0.5) * 4,
        });
        built++;
      }

      scene.remove(glass);

      // Fragment physics loop
      const start = performance.now();
      let fragAnimId: number;
      function fragTick() {
        const t  = (performance.now() - start) / 1000;
        const dt = 1 / 60;
        for (const f of frags) {
          f.mesh.position.x += f.vx * dt;
          f.mesh.position.y += f.vy * dt;
          f.mesh.position.z += f.vz * dt;
          f.vy -= 2.2 * dt;
          f.mesh.rotation.x += f.rx * dt;
          f.mesh.rotation.y += f.ry * dt;
          f.mesh.rotation.z += f.rz * dt;
          (f.mesh.material as THREE.ShaderMaterial).opacity = Math.max(0, 0.95 - t * 0.9);
        }
        if (t < 2.2) {
          fragAnimId = requestAnimationFrame(fragTick);
        } else {
          for (const f of frags) {
            scene.remove(f.mesh);
            f.mesh.geometry.dispose();
            (f.mesh.material as THREE.ShaderMaterial).dispose();
          }
        }
      }
      fragTick();

      // Ballet: boost card motion for 3 s then settle
      gsap.from(
        cards.map(c => c.material as THREE.MeshBasicMaterial),
        { opacity: 0.0, duration: 1.2, delay: 0.15, ease: 'power2.out' }
      );
      for (const c of cards) {
        const ud = c.userData as CardUserData;
        ud.spinY       *= 2.4;
        ud.spinX       *= 2.0;
        ud.spinZ       *= 2.5;
        ud.orbitSpeed  *= 1.9;
        ud.amp         *= 1.4;
      }

      const camTl = gsap.timeline();
      camTl.to(camera.position, { z: 4.2, duration: 1.3, ease: 'power2.inOut' }, 0);
      camTl.to(camera.position, { z: 3.2, duration: 1.0, ease: 'power2.out'   }, 1.3);
      camTl.to(camera.position, { z: 7.0, duration: 0.8, ease: 'power2.inOut' }, 2.3);
      camTl.call(() => {
        state.revealed = true;
        setupScrollAnimation();
      });
    }

    // ── Scroll-driven transition (set up after shatter settles) ────────────
    function setupScrollAnimation() {
      const scrollerEl = scrollerRef.current;
      if (!scrollerEl) return;

      // Remove fog so cards stay bright against transparent bg
      scene.fog = null;

      const overlay = document.getElementById('hero-overlay');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollerEl,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
        },
      });

      // Headline fades immediately
      tl.to(postShatterEl, { opacity: 0, ease: 'power2.in', duration: 1.5 }, 0);

      // Cards stay centered for most of the scroll, gentle drift
      tl.to(cardGroup.position, { y: -1.5, ease: 'none', duration: 7 }, 2)
        .to(camera.position, { z: 8.5, ease: 'none', duration: 7 }, 2);

      // Last 30%: cards drift down more noticeably
      tl.to(cardGroup.position, { y: -5, ease: 'power2.in', duration: 3 }, 7)
        .to(cardGroup.rotation, { x: 0.1, ease: 'power1.in', duration: 3 }, 7);

      // Fade the overlay out when the ReelSection (#reel) is halfway through the viewport.
      // Section 1 content is already visible underneath while the hero dissolves.
      ScrollTrigger.create({
        trigger: '#reel',
        start: 'top 80%',
        end: 'center center',
        scrub: 1,
        onUpdate: (self) => {
          if (overlay) {
            overlay.style.opacity = String(1 - self.progress);
          }
        },
        onLeave: () => {
          if (overlay) overlay.style.display = 'none';
          onHeroGone?.();
        },
        onEnterBack: () => {
          if (overlay) {
            overlay.style.removeProperty('display');
            overlay.style.opacity = '1';
          }
        },
      });
    }

    // ── Click handler ─────────────────────────────────────────────────────
    function onClick(e: MouseEvent) {
      if (state.shattered) return;
      const rect = stage.getBoundingClientRect();
      const xPct = ((e.clientX - rect.left)  / rect.width)  * 100;
      const yPct = ((e.clientY - rect.top)   / rect.height) * 100;
      lastClick = { x: xPct, y: yPct };
      state.clicks += 1;

      gsap.fromTo(cr, { scale: 1 }, { scale: 1.8, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' });

      if (state.clicks === 1) {
        addCrackAt(xPct, yPct);
        redrawCracks(true);
        glassUniforms.uCrackMask.value = 0.33;
        subEl.innerHTML = '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:oklch(0.68 0.19 275);box-shadow:0 0 10px oklch(0.68 0.19 275 / 0.45);animation:cwPulse 1.6s ease-in-out infinite;margin-right:6px;vertical-align:middle"></span> Almost there. Click again.';
      } else if (state.clicks === 2) {
        addCrackAt(xPct, yPct);
        redrawCracks(true);
        glassUniforms.uCrackMask.value = 0.66;
        subEl.innerHTML = '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:oklch(0.68 0.19 275);box-shadow:0 0 10px oklch(0.68 0.19 275 / 0.45);animation:cwPulse 1.6s ease-in-out infinite;margin-right:6px;vertical-align:middle"></span> One more.';
      } else if (state.clicks >= 3) {
        addCrackAt(xPct, yPct);
        redrawCracks(true);
        glassUniforms.uCrackMask.value = 1.0;
        shatter();
      }
    }
    stage.addEventListener('click', onClick);

    // ── Render loop ───────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let animId: number;

    function render() {
      const t = clock.getElapsedTime();

      glassUniforms.uTime.value = t;
      glassUniforms.uMouse.value.set(state.mouse.x, 1.0 - state.mouse.y);
      bgUniforms.uTime.value = t;

      for (const c of cards) {
        const ud = c.userData as CardUserData;
        if (ud.morphing) continue;

        const orbit  = t * ud.orbitSpeed + ud.phase;
        c.position.x = ud.base.pos.x + Math.cos(orbit)         * ud.orbitR       + Math.cos(t * ud.speed * 0.7 + ud.phase) * ud.amp * 0.5;
        c.position.y = ud.base.pos.y + Math.sin(orbit * 1.1)   * ud.orbitR * 0.7 + Math.sin(t * ud.speed       + ud.phase) * ud.amp;
        c.position.z = ud.base.pos.z + Math.sin(t * ud.speed * 0.4 + ud.phase)   * 0.6;
        c.rotation.x = ud.base.rot.x + t * ud.spinX + (state.mouse.y - 0.5) * -0.12;
        c.rotation.y = ud.base.rot.y + t * ud.spinY + (state.mouse.x - 0.5) *  0.18;
        c.rotation.z = ud.base.rot.z + t * ud.spinZ * 0.3;
      }

      // Gentle mouse parallax on camera — active post-shatter while cards are orbiting.
      // Scroll-driven animation is handled by the GSAP ScrollTrigger timeline instead.
      if (state.shattered) {
        const tx = (state.mouse.x - 0.5) * 0.8;
        const ty = (state.mouse.y - 0.5) * -0.4;
        camera.position.x += (tx - camera.position.x) * 0.04;
        camera.position.y += (ty - camera.position.y) * 0.04;
      }

      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    }
    render();

    // ── Resize ────────────────────────────────────────────────────────────
    function doResize() {
      const r = stage.getBoundingClientRect();
      const w = Math.round(r.width  || window.innerWidth);
      const h = Math.round(r.height || window.innerHeight);
      if (w < 2 || h < 2) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      glassUniforms.uRes.value.set(w, h);
    }
    window.addEventListener('resize', doResize);
    doResize();

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      cancelAnimationFrame(cursorAnimId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', doResize);
      stage.removeEventListener('click', onClick);

      renderer.dispose();
      bgGeo.dispose();
      bgMat.dispose();
      glassGeo.dispose();
      glassMat.dispose();
      for (const c of cards) {
        c.geometry.dispose();
        (c.material as THREE.MeshBasicMaterial).dispose();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── JSX ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={stageRef}
      style={{
        position: 'absolute',
        inset: 0,
        background: '#050505',
        cursor: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Three.js canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* SVG Voronoi crack overlay */}
      <svg
        ref={crackSvgRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      />

      {/* Custom cursor – dot */}
      <div
        ref={cursorDotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(180,150,255,0.9) 0%, rgba(140,90,255,0.45) 50%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1000,
          mixBlendMode: 'screen',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Custom cursor – ring */}
      <div
        ref={cursorRingRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1px solid rgba(180,150,255,0.5)',
          pointerEvents: 'none',
          zIndex: 999,
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Hero center content */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 10,
          width: 'min(90vw, 1000px)',
        }}
      >
        <div
          ref={eyebrowRef}
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'oklch(0.68 0.19 275)',
            marginBottom: 18,
          }}
        >
          The AI creator marketplace
        </div>

        <h1
          ref={titleRef}
          style={{
            fontFamily: 'var(--font-display, "Instrument Serif", serif)',
            fontWeight: 400,
            fontSize: 'clamp(48px, 8vw, 112px)',
            lineHeight: 0.98,
            letterSpacing: '-0.02em',
            color: '#fff',
            margin: 0,
          }}
        >
          The world&apos;s best
          <br />
          <em style={{ color: '#eadfff' }}>AI creators.</em>
        </h1>

        <div
          ref={subRef}
          style={{
            marginTop: 18,
            fontSize: 15,
            color: 'rgba(255,255,255,0.72)',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'oklch(0.68 0.19 275)',
              boxShadow: '0 0 10px oklch(0.68 0.19 275 / 0.45)',
              animation: 'cwPulse 1.6s ease-in-out infinite',
              marginRight: 6,
              verticalAlign: 'middle',
            }}
          />
          Click anywhere to see through the glass.
        </div>
      </div>

      {/* Post-shatter: headline + CTAs (hidden until shatter completes) */}
      <div
        ref={postShatterRef}
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '14vh',
          transform: 'translateX(-50%)',
          display: 'none',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          zIndex: 11,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div
            style={{
              fontFamily: 'var(--font-display, "Instrument Serif", serif)',
              fontSize: 'clamp(32px, 4vw, 56px)',
              fontWeight: 400,
              color: '#fff',
              lineHeight: 1,
            }}
          >
            Hire the world&apos;s best
            <br />
            <em style={{ color: '#eadfff' }}>AI creators.</em>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          <a
            href="#reel"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '13px 28px',
              borderRadius: 9999,
              background: 'oklch(0.68 0.19 275)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 500,
              textDecoration: 'none',
              letterSpacing: '-0.01em',
              boxShadow: '0 0 28px oklch(0.68 0.19 275 / 0.45)',
              transition: 'opacity 0.2s',
            }}
          >
            Find a Creator →
          </a>
          <a
            href="#cta"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '13px 28px',
              borderRadius: 9999,
              background: 'transparent',
              color: 'rgba(255,255,255,0.82)',
              fontSize: 15,
              fontWeight: 400,
              textDecoration: 'none',
              letterSpacing: '-0.01em',
              border: '1px solid rgba(180,150,255,0.35)',
              backdropFilter: 'blur(8px)',
              transition: 'border-color 0.2s, color 0.2s',
            }}
          >
            Join as a Creator →
          </a>
        </div>

        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 10,
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          Scroll
          <span
            style={{
              display: 'block',
              width: 1,
              height: 32,
              background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.5))',
              margin: '8px auto 0',
            }}
          />
        </div>
      </div>
    </div>
  );
}
