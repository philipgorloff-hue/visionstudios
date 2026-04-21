'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const VERT = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal   = normalize(normalMatrix * normal);
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const FRAG = /* glsl */`
  uniform float uTime;
  uniform vec3  uColA;
  uniform vec3  uColB;
  uniform float uPhase;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.5);
    float band    = sin(vNormal.y * 5.0 + uTime * 0.9 + uPhase) * 0.5 + 0.5;
    vec3  col     = mix(uColA, uColB, band);
    vec3  dark    = vec3(0.015);
    vec3  final   = mix(dark, col, fresnel * 1.6);
    final += col * fresnel * fresnel * 0.5;
    gl_FragColor  = vec4(final, 1.0);
  }
`;

export default function AboutScene() {
  const wrapRef  = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap   = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const W = () => wrap.offsetWidth;
    const H = () => wrap.offsetHeight;

    // ── Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.FogExp2(0x050505, 0.038);

    const camera = new THREE.PerspectiveCamera(58, W() / H(), 0.1, 100);
    camera.position.set(0, 0, 9);

    // ── Sphere factory
    const mkSphere = (r, colA, colB, phase) => {
      const mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(r, 5),
        new THREE.ShaderMaterial({
          vertexShader: VERT, fragmentShader: FRAG,
          uniforms: {
            uTime:  { value: 0 },
            uColA:  { value: new THREE.Color(colA) },
            uColB:  { value: new THREE.Color(colB) },
            uPhase: { value: phase },
          },
        })
      );
      // wireframe halo
      const wire = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(r, 2)),
        new THREE.LineBasicMaterial({ color: colA, transparent: true, opacity: 0.12 })
      );
      mesh.add(wire);
      return mesh;
    };

    // Philip: lime/cyan     Jan: purple/magenta
    const s1 = mkSphere(1.3, 0xc6ff00, 0x00c8ff, 0);
    const s2 = mkSphere(1.05, 0x7733ff, 0xff33aa, Math.PI);
    scene.add(s1, s2);

    // ── Stream of particles connecting the two spheres
    const STREAM = 1400;
    const streamPos = new Float32Array(STREAM * 3);
    const streamGeo = new THREE.BufferGeometry();
    streamGeo.setAttribute('position', new THREE.BufferAttribute(streamPos, 3));
    const streamPts = new THREE.Points(streamGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.022, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    scene.add(streamPts);

    // ── Ambient field
    const FIELD = 1600;
    const fp = new Float32Array(FIELD * 3);
    for (let i = 0; i < FIELD * 3; i++) fp[i] = (Math.random() - 0.5) * 45;
    const fieldGeo = new THREE.BufferGeometry();
    fieldGeo.setAttribute('position', new THREE.BufferAttribute(fp, 3));
    scene.add(new THREE.Points(fieldGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.028, transparent: true, opacity: 0.14 })
    ));

    // ── Lights
    const l1 = new THREE.PointLight(0xc6ff00, 4, 12);
    const l2 = new THREE.PointLight(0x7733ff, 4, 12);
    scene.add(l1, l2);

    // ── Mouse parallax
    let mx = 0, my = 0;
    const onMove = (e) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);

    const onResize = () => {
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
    };
    window.addEventListener('resize', onResize);

    let raf;
    function animate(time) {
      raf = requestAnimationFrame(animate);
      const t = time * 0.001;
      const OR = 2.4, OS = 0.32;

      // Lemniscate (figure-8) orbit
      const denom = 1 + Math.sin(t * OS) ** 2;
      const lx =  OR * Math.cos(t * OS) / denom;
      const ly =  OR * Math.sin(t * OS) * Math.cos(t * OS) / denom * 0.5;
      const lz =  Math.sin(t * OS * 1.3) * 0.7;

      s1.position.set( lx,  ly,  lz);
      s2.position.set(-lx, -ly, -lz);

      s1.rotation.x = t * 0.18; s1.rotation.y = t * 0.28;
      s2.rotation.x = -t * 0.22; s2.rotation.y = t * 0.19;

      s1.material.uniforms.uTime.value = t;
      s2.material.uniforms.uTime.value = t;

      l1.position.copy(s1.position);
      l2.position.copy(s2.position);

      // Particle stream
      const pa = streamGeo.attributes.position;
      const p1 = s1.position, p2 = s2.position;
      for (let i = 0; i < STREAM; i++) {
        const a = i / STREAM;
        const noise  = Math.sin(a * 22 + t * 3.5) * 0.18;
        const noise2 = Math.cos(a * 18 + t * 2.8) * 0.18;
        pa.setXYZ(i,
          p1.x + (p2.x - p1.x) * a + noise,
          p1.y + (p2.y - p1.y) * a + noise2,
          p1.z + (p2.z - p1.z) * a + noise * 0.5
        );
      }
      pa.needsUpdate = true;

      // Slow camera orbit + mouse parallax
      const ca = t * 0.06;
      camera.position.x += (Math.sin(ca) * 1.8 + mx * 0.55 - camera.position.x) * 0.028;
      camera.position.y += (-my * 0.38 - camera.position.y) * 0.028;
      camera.position.z += (9 + Math.cos(ca) * 0.5 - camera.position.z) * 0.02;
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
    <div ref={wrapRef} style={{ position: 'absolute', inset: 0, zIndex: 0, touchAction: 'pan-y' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'pan-y' }} />
    </div>
  );
}
