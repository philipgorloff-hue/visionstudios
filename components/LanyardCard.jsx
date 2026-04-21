'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ── Card texture ───────────────────────────────────────────────────────────
function buildCardTexture(name, role) {
  const W = 900, H = 1350;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#F6F4F1';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#C6FF00';
  ctx.fillRect(0, 0, W, 14);

  for (let x = 0; x < 6; x++) {
    for (let y = 0; y < 8; y++) {
      ctx.beginPath();
      ctx.arc(W - 80 - x * 52, H - 100 - y * 52, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,0,0,${0.04 + (x + y) * 0.006})`;
      ctx.fill();
    }
  }

  const [firstName, ...rest] = name.split(' ');
  const lastName = rest.join(' ');

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0F0F0F';
  ctx.font = '700 124px system-ui, sans-serif';
  ctx.fillText(firstName, 64, 500);

  ctx.fillStyle = 'rgba(15,15,15,0.50)';
  ctx.font = '700 94px system-ui, sans-serif';
  ctx.fillText(lastName, 64, 618);

  ctx.fillStyle = 'rgba(0,0,0,0.09)';
  ctx.fillRect(64, 668, W - 128, 1);

  ctx.fillStyle = '#0F0F0F';
  ctx.font = '600 36px system-ui, sans-serif';
  ctx.fillText('Co-Founder', 64, 740);

  ctx.fillStyle = 'rgba(15,15,15,0.38)';
  ctx.font = '400 30px system-ui, sans-serif';
  ctx.fillText(role, 64, 790);

  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

// ── Physics constants ──────────────────────────────────────────────────────
const NODES    = 5;
const SEG_LEN  = 0.9;
const GRAVITY  = 0.025;
const DAMPING  = 0.97;
const ROPE_R   = 0.03;
const FIXED_POS = new THREE.Vector3(0, 4, 0);
const UP        = new THREE.Vector3(0, 1, 0);

// ── Component ──────────────────────────────────────────────────────────────
export default function LanyardCard({ name, role, position = [0, 0, 30], fov = 20 }) {
  const wrapRef   = useRef(null);
  const canvasRef = useRef(null);

  // destructure to avoid array-reference churn in deps
  const [px, py, pz] = position;

  useEffect(() => {
    const wrap   = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const W = () => wrap.offsetWidth;
    const H = () => wrap.offsetHeight;
    const isMobile = window.innerWidth < 768;

    // ── Renderer ──────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(W(), H());

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);

    const camera = new THREE.PerspectiveCamera(fov, W() / H(), 0.1, 100);
    camera.position.set(px, py, pz);

    // ── Lights ────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 2.5));
    const dir = new THREE.DirectionalLight(0xffffff, 2);
    dir.position.set(5, 10, 5);
    scene.add(dir);
    const pt = new THREE.PointLight(0xffffff, 3);
    pt.position.set(-5, 5, 8);
    scene.add(pt);

    // ── Verlet nodes ──────────────────────────────────────────
    const pos = Array.from({ length: NODES }, (_, i) =>
      new THREE.Vector3(i * 0.001, 4 - i * SEG_LEN, 0)
    );
    const old = pos.map(p => p.clone());

    const curve = new THREE.CatmullRomCurve3(pos.map(p => p.clone()));
    curve.curveType = 'chordal';

    // ── Rope mesh ─────────────────────────────────────────────
    const ropeMat  = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.7, metalness: 0.1 });
    const ropeMesh = new THREE.Mesh(new THREE.BufferGeometry(), ropeMat);
    scene.add(ropeMesh);

    // ── Card group ────────────────────────────────────────────
    const cardGroup  = new THREE.Group();
    const innerGroup = new THREE.Group();
    innerGroup.scale.setScalar(2.25);
    innerGroup.position.set(0, -1.2, -0.05);
    cardGroup.add(innerGroup);
    scene.add(cardGroup);

    // Invisible hit-box for drag detection (matches card size pre-scale)
    const hitBox = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 2.25, 0.1),
      new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
    );
    innerGroup.add(hitBox);

    // ── Load GLB ──────────────────────────────────────────────
    const cardTexture = buildCardTexture(name, role);
    new GLTFLoader().load('/card.glb', (gltf) => {
      const { nodes, materials } = gltf;
      if (nodes?.card) {
        innerGroup.add(new THREE.Mesh(
          nodes.card.geometry,
          new THREE.MeshStandardMaterial({ map: cardTexture, roughness: 0.45, metalness: 0 })
        ));
      }
      if (nodes?.clip && materials?.metal) {
        const clipMat = materials.metal.clone();
        clipMat.roughness = 0.3;
        innerGroup.add(new THREE.Mesh(nodes.clip.geometry, clipMat));
      }
      if (nodes?.clamp && materials?.metal) {
        innerGroup.add(new THREE.Mesh(nodes.clamp.geometry, materials.metal));
      }
    });

    // ── Pointer drag ──────────────────────────────────────────
    let dragged = false;
    const dragOffset  = new THREE.Vector3();
    const ndcPointer  = new THREE.Vector2();
    const raycaster   = new THREE.Raycaster();
    const _tmp        = new THREE.Vector3();
    const _dir        = new THREE.Vector3();

    const getWorld = (ndc) => {
      _tmp.set(ndc.x, ndc.y, 0.5).unproject(camera);
      _dir.subVectors(_tmp, camera.position).normalize();
      return camera.position.clone().addScaledVector(_dir, camera.position.length());
    };

    const clientToNDC = (clientX, clientY) => {
      const r = canvas.getBoundingClientRect();
      return new THREE.Vector2(
        ((clientX - r.left) / r.width)  *  2 - 1,
        ((clientY - r.top)  / r.height) * -2 + 1
      );
    };

    const onPointerDown = (e) => {
      const ndc = clientToNDC(e.clientX, e.clientY);
      ndcPointer.copy(ndc);
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.intersectObject(hitBox, true).length > 0) {
        dragged = true;
        dragOffset.subVectors(getWorld(ndc), pos[NODES - 1]);
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = 'grabbing';
      }
    };

    const onPointerMove = (e) => {
      ndcPointer.copy(clientToNDC(e.clientX, e.clientY));
      if (!dragged) {
        raycaster.setFromCamera(ndcPointer, camera);
        canvas.style.cursor = raycaster.intersectObject(hitBox, true).length > 0 ? 'grab' : '';
      }
    };

    const onPointerUp = (e) => {
      if (dragged) {
        canvas.releasePointerCapture(e.pointerId);
        dragged = false;
        canvas.style.cursor = '';
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup',   onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    // ── Resize ────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
    };
    window.addEventListener('resize', onResize);

    const ropeSegs = isMobile ? 16 : 32;
    const _orient  = new THREE.Vector3();

    // ── Animation loop ────────────────────────────────────────
    let raf;
    function animate() {
      raf = requestAnimationFrame(animate);

      // Drag: move last node to pointer world position
      if (dragged) {
        pos[NODES - 1].copy(getWorld(ndcPointer).sub(dragOffset));
      }

      // Verlet integration
      for (let i = 1; i < NODES; i++) {
        if (dragged && i === NODES - 1) continue;
        const vx = pos[i].x - old[i].x;
        const vy = pos[i].y - old[i].y;
        const vz = pos[i].z - old[i].z;
        old[i].copy(pos[i]);
        pos[i].x += vx * DAMPING;
        pos[i].y += vy * DAMPING - GRAVITY;
        pos[i].z += vz * DAMPING;
      }

      // Distance constraints — 15 iterations
      for (let iter = 0; iter < 15; iter++) {
        pos[0].copy(FIXED_POS);
        for (let i = 0; i < NODES - 1; i++) {
          const dx = pos[i+1].x - pos[i].x;
          const dy = pos[i+1].y - pos[i].y;
          const dz = pos[i+1].z - pos[i].z;
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) || 0.0001;
          const k  = (dist - SEG_LEN) / dist * 0.5;
          const cx = dx*k, cy = dy*k, cz = dz*k;
          if (i > 0) { pos[i].x += cx; pos[i].y += cy; pos[i].z += cz; }
          if (!(dragged && i + 1 === NODES - 1)) {
            pos[i+1].x -= cx; pos[i+1].y -= cy; pos[i+1].z -= cz;
          }
        }
        pos[0].copy(FIXED_POS);
      }

      // Card: follow last node, orient along rope direction
      cardGroup.position.copy(pos[NODES - 1]);
      _orient.subVectors(pos[NODES-1], pos[NODES-2]).normalize();
      if (_orient.lengthSq() > 0.001) {
        cardGroup.quaternion.setFromUnitVectors(UP, _orient);
      }

      // Rope: rebuild TubeGeometry each frame
      for (let i = 0; i < NODES; i++) curve.points[i].copy(pos[i]);
      const prevGeo = ropeMesh.geometry;
      ropeMesh.geometry = new THREE.TubeGeometry(curve, ropeSegs, ROPE_R, 8, false);
      prevGeo.dispose();

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown',   onPointerDown);
      canvas.removeEventListener('pointermove',   onPointerMove);
      canvas.removeEventListener('pointerup',     onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      cardTexture.dispose();
      ropeMat.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, role, px, py, pz, fov]);

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }}
      />
    </div>
  );
}
