'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ContactScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.FogExp2(0x050505, 0.04);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 7);

    // Wireframe dodecahedron — architectural, geometric, calm
    const dodecGeo  = new THREE.DodecahedronGeometry(2.2, 0);
    const edgesGeo  = new THREE.EdgesGeometry(dodecGeo);
    const edgesMat  = new THREE.LineBasicMaterial({
      color: 0xc6ff00, transparent: true, opacity: 0.18,
    });
    const dodec = new THREE.LineSegments(edgesGeo, edgesMat);
    scene.add(dodec);

    // Inner smaller dodec, counter-rotating
    const innerEdges = new THREE.EdgesGeometry(new THREE.DodecahedronGeometry(1.1, 0));
    const innerMat   = new THREE.LineBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.06,
    });
    const innerDodec = new THREE.LineSegments(innerEdges, innerMat);
    scene.add(innerDodec);

    // Ambient particles
    const COUNT = 1800;
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT * 3; i++) pos[i] = (Math.random() - 0.5) * 50;
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const ptMat = new THREE.PointsMaterial({
      color: 0xffffff, size: 0.03, transparent: true, opacity: 0.2,
    });
    scene.add(new THREE.Points(ptGeo, ptMat));

    // Lights
    const orbitLight = new THREE.PointLight(0xc6ff00, 5, 14);
    scene.add(orbitLight);
    const fillLight  = new THREE.PointLight(0x7733ff, 2, 10);
    fillLight.position.set(-4, -2, 2);
    scene.add(fillLight);

    let mx = 0, my = 0;
    window.addEventListener('mousemove', (e) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    let frameId;
    function animate(time) {
      frameId = requestAnimationFrame(animate);
      const t = time * 0.001;

      dodec.rotation.x = t * 0.09;
      dodec.rotation.y = t * 0.14;

      innerDodec.rotation.x = -t * 0.13;
      innerDodec.rotation.y = -t * 0.19;

      orbitLight.position.set(
        Math.cos(t * 0.5) * 4,
        Math.sin(t * 0.35) * 2.5,
        Math.sin(t * 0.5) * 4
      );

      // Subtle mouse parallax
      camera.position.x += (mx * 0.5 - camera.position.x) * 0.04;
      camera.position.y += (-my * 0.3 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }
    animate(0);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        display: 'block',
      }}
    />
  );
}
