'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Thread draws itself — electric shimmer along the leading edge
const THREAD_VERT = /* glsl */`
  uniform float uTime;
  varying float vAlong;
  varying vec2  vUv;
  void main() {
    vAlong = uv.y;
    vUv    = uv;
    // Micro electric jitter on the thread body
    vec3 pos = position;
    float jitter = sin(uv.y * 40.0 + uTime * 14.0) * 0.008;
    pos.x += jitter;
    pos.y += cos(uv.y * 35.0 + uTime * 11.0) * 0.008;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;
const THREAD_FRAG = /* glsl */`
  uniform float uTime;
  uniform float uProgress; // 0→1 how far the thread has drawn
  varying float vAlong;
  void main() {
    if (vAlong > uProgress + 0.001) discard;

    float distHead = uProgress - vAlong;

    // Bright white head burst
    float head = exp(-distHead * 120.0);
    // Softer trailing glow
    float body = exp(-distHead * 18.0);
    // Electric sparkle along drawn body
    float sparkle = sin(vAlong * 80.0 - uTime * 18.0) * 0.5 + 0.5;
    sparkle = pow(sparkle, 5.0) * 0.55 * (1.0 - head);

    vec3 lime  = vec3(0.776, 1.0,  0.0);
    vec3 white = vec3(1.0,   1.0,  1.0);
    vec3 col   = lime * (0.55 + sparkle) + body * lime * 0.5 + head * white * 2.8;

    float alpha = clamp(0.55 + body * 0.35 + head * 0.5, 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`;

// Ring pulse shader
const RING_VERT = /* glsl */`void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const RING_FRAG = /* glsl */`
  uniform float uActive;  // 0→1
  uniform float uTime;
  uniform vec3  uColor;
  void main() {
    float pulse = 0.75 + sin(uTime * 5.0) * 0.25;
    float a = mix(0.12, 0.85 * pulse, uActive);
    vec3  c = mix(vec3(0.15), uColor, uActive);
    gl_FragColor = vec4(c, a);
  }
`;

// 6 ring positions forming a flowing helix in 3D
const RING_POS = [
  new THREE.Vector3(-1.8,  2.6,  0.4),
  new THREE.Vector3( 1.6,  1.5, -0.6),
  new THREE.Vector3(-1.0,  0.4,  0.9),
  new THREE.Vector3( 1.4, -0.7, -0.3),
  new THREE.Vector3(-1.6, -1.7,  0.6),
  new THREE.Vector3( 0.5, -2.7,  0.0),
];
const RING_ROT = [
  [0.35, 0.2, 0], [-0.25, 0.4, 0.1], [0.1, -0.3, 0.2],
  [-0.4, 0.15, -0.1], [0.25, 0.3, -0.2], [0, -0.2, 0.3],
];
// Where along the thread (0→1) each ring sits
const RING_T = [0.08, 0.26, 0.44, 0.62, 0.79, 0.95];
const RING_COLORS = [
  new THREE.Color(0xc6ff00), new THREE.Color(0xc6ff00),
  new THREE.Color(0x00c8ff), new THREE.Color(0xc6ff00),
  new THREE.Color(0x9966ff), new THREE.Color(0xc6ff00),
];

export default function HowScene({ progressRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.7, 7.5);

    // ── Thread path
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 4, 0), ...RING_POS, new THREE.Vector3(0, -3.8, 0),
    ]);
    const tubeGeo = new THREE.TubeGeometry(curve, 260, 0.028, 8, false);
    const threadMat = new THREE.ShaderMaterial({
      vertexShader: THREAD_VERT, fragmentShader: THREAD_FRAG,
      uniforms: { uTime: { value: 0 }, uProgress: { value: 0 } },
      transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const thread = new THREE.Mesh(tubeGeo, threadMat);
    scene.add(thread);

    // ── Orb at the thread head
    const orbGeo = new THREE.IcosahedronGeometry(0.12, 3);
    const orbMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const orb    = new THREE.Mesh(orbGeo, orbMat);
    scene.add(orb);
    const orbGlow = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.28, 2),
      new THREE.MeshBasicMaterial({ color: 0xc6ff00, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    orb.add(orbGlow);
    const orbLight = new THREE.PointLight(0xc6ff00, 3, 3);
    orb.add(orbLight);

    // ── Rings
    const rings = RING_POS.map((pos, i) => {
      const mat = new THREE.ShaderMaterial({
        vertexShader: RING_VERT, fragmentShader: RING_FRAG,
        uniforms: {
          uActive: { value: 0 },
          uTime:   { value: 0 },
          uColor:  { value: RING_COLORS[i] },
        },
        transparent: true, side: THREE.DoubleSide, depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.025, 8, 48), mat);
      ring.position.copy(pos);
      ring.rotation.set(...RING_ROT[i]);
      scene.add(ring);
      return { mesh: ring, mat };
    });

    // ── Ring shockwave particles (shared pool, repositioned per activation)
    const SHOCK = 280;
    const shockPos = new Float32Array(SHOCK * 3);
    const shockVel = [];
    for (let i = 0; i < SHOCK; i++) {
      const theta = (i / SHOCK) * Math.PI * 2;
      const r     = 0.4 + Math.random() * 0.3;
      shockVel.push(new THREE.Vector3(
        Math.cos(theta) * r + (Math.random() - 0.5) * 0.3,
        Math.sin(theta) * r + (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.4
      ));
    }
    const shockGeo = new THREE.BufferGeometry();
    shockGeo.setAttribute('position', new THREE.BufferAttribute(shockPos, 3));
    const shockMat = new THREE.PointsMaterial({
      color: 0xc6ff00, size: 0.05, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const shockPts = new THREE.Points(shockGeo, shockMat);
    scene.add(shockPts);

    let shockOrigin = new THREE.Vector3();
    let shockAge    = 999; // seconds since last shock (999 = inactive)

    // ── Ambient stars
    const STARS = 1200;
    const sp = new Float32Array(STARS * 3);
    for (let i = 0; i < STARS * 3; i++) sp[i] = (Math.random() - 0.5) * 50;
    const starsGeo = new THREE.BufferGeometry();
    starsGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    scene.add(new THREE.Points(starsGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.025, transparent: true, opacity: 0.18 })
    ));

    // ── Mouse parallax
    let mx = 0, my = 0;
    const onMove = (e) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    let lastActivated = -1;
    let raf;
    let lastT = 0;

    function animate(time) {
      raf = requestAnimationFrame(animate);
      const t  = time * 0.001;
      const dt = t - lastT;
      lastT = t;

      const p = progressRef?.current ?? 0;

      // Thread draw progress
      threadMat.uniforms.uTime.value     = t;
      threadMat.uniforms.uProgress.value = p;

      // Orb position — lerp along the curve
      const curvePoint = curve.getPoint(Math.min(p + 0.01, 1));
      orb.position.lerp(curvePoint, 0.12);
      orb.rotation.y = t * 2;

      // Ring activation
      rings.forEach(({ mat }, i) => {
        const active = p >= RING_T[i] ? 1 : 0;
        mat.uniforms.uActive.value += (active - mat.uniforms.uActive.value) * 0.06;
        mat.uniforms.uTime.value    = t;
        // Scale pulse on active rings
        const s = 1 + mat.uniforms.uActive.value * (Math.sin(t * 4 + i) * 0.06);
        rings[i].mesh.scale.setScalar(s);

        // Trigger shockwave on first activation
        if (active === 1 && i > lastActivated) {
          lastActivated = i;
          shockOrigin.copy(RING_POS[i]);
          shockAge = 0;
          shockMat.color.set(RING_COLORS[i]);
        }
      });

      // Shockwave animation
      shockAge += dt;
      if (shockAge < 1.8) {
        const fade = Math.max(0, 1 - shockAge / 1.8);
        shockMat.opacity = fade * 0.75;
        const pa = shockGeo.attributes.position;
        for (let i = 0; i < SHOCK; i++) {
          pa.setXYZ(i,
            shockOrigin.x + shockVel[i].x * shockAge * 1.4,
            shockOrigin.y + shockVel[i].y * shockAge * 1.4,
            shockOrigin.z + shockVel[i].z * shockAge * 0.8
          );
        }
        pa.needsUpdate = true;
      } else {
        shockMat.opacity = 0;
      }

      // Camera — slow orbit + mouse parallax
      const ca = t * 0.045;
      camera.position.x += (Math.sin(ca) * 1.2 + mx * 0.4 - camera.position.x) * 0.03;
      camera.position.y += (-my * 0.3 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }
    animate(0);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  );
}
