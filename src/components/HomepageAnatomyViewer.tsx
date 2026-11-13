import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { loadAnatomicalDigitalTwin } from '../utils/anatomicalModelLoader';
import type { EnvironmentType } from './EnvironmentCards';

interface HomepageAnatomyViewerProps {
  onOpenBodyAssessment?: () => void;
  currentEnv?: EnvironmentType;
}

export function HomepageAnatomyViewer({
  currentEnv = 'Spacecraft',
}: HomepageAnatomyViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isRotatingRef = useRef<boolean>(true);
  const resetCameraRef = useRef<(() => void) | null>(null);

  const isMoon = currentEnv === 'Moon';
  const isMars = currentEnv === 'Mars';

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isDisposed = false;

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 355;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    const initialPos = new THREE.Vector3(0, 0, 3.25);
    camera.position.copy(initialPos);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isMoon ? 1.15 : 1.25;
    container.appendChild(renderer.domElement);

    // 2. Lighting - Customized for Lunar (Silver/Ice) vs Spacecraft (Cyan) vs Mars (Bronze)
    const ambientColor = isMoon ? 0x0a101d : isMars ? 0x1f0d0e : 0x06283d;
    const ambientLight = new THREE.AmbientLight(ambientColor, isMoon ? 2.4 : 1.8);
    scene.add(ambientLight);

    const keyColor = isMoon ? 0xf1f5f9 : isMars ? 0xffc4a3 : 0x29c8ef;
    const keyLight = new THREE.DirectionalLight(keyColor, isMoon ? 2.5 : 2.2);
    keyLight.position.set(3, 4, 4);
    scene.add(keyLight);

    const fillColor = isMoon ? 0x8ccfff : isMars ? 0xff7b54 : 0x04e5d4;
    const fillLight = new THREE.DirectionalLight(fillColor, isMoon ? 1.6 : 1.4);
    fillLight.position.set(-3, -2, -2);
    scene.add(fillLight);

    const topRimColor = isMoon ? 0xb6f0ff : isMars ? 0xffd4b2 : 0x5eead4;
    const topRim = new THREE.PointLight(topRimColor, 1.8, 10);
    topRim.position.set(0, 3, 1);
    scene.add(topRim);

    // Subtle bottom grid plane
    const gridColor1 = isMoon ? 0x8ccfff : 0x18a9d6;
    const gridColor2 = isMoon ? 0x151c27 : 0x083344;
    const grid = new THREE.GridHelper(3.5, 14, gridColor1, gridColor2);
    grid.position.y = -1.25;
    scene.add(grid);

    // 3. Model Container & Async Load
    const modelContainer = new THREE.Group();
    scene.add(modelContainer);

    let animationFrameId: number;
    let heartMeshRef: THREE.Mesh | undefined;

    loadAnatomicalDigitalTwin(currentEnv)
      .then((anatomy) => {
        if (isDisposed) return;
        modelContainer.add(anatomy.rootGroup);
        heartMeshRef = anatomy.heartMesh;
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load anatomical twin:', err);
        if (!isDisposed) {
          setLoadError('Anatomical digital twin stream offline');
          setIsLoading(false);
        }
      });

    // 4. Interaction variables (Rotation & Zoom)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let spherical = {
      radius: 3.25,
      theta: 0,
      phi: Math.PI / 2,
    };

    const minRadius = 1.6;
    const maxRadius = 4.8;
    const minPhi = 0.2;
    const maxPhi = Math.PI - 0.2;

    const updateCamera = () => {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 0, 0);
    };

    resetCameraRef.current = () => {
      spherical.radius = 3.25;
      spherical.theta = 0;
      spherical.phi = Math.PI / 2;
      modelContainer.rotation.y = 0;
      updateCamera();
    };

    // Mouse handlers
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      spherical.theta -= deltaX * 0.008;
      spherical.phi = Math.max(minPhi, Math.min(maxPhi, spherical.phi - deltaY * 0.008));
      updateCamera();

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(minRadius, Math.min(maxRadius, spherical.radius + e.deltaY * 0.0025));
      updateCamera();
    };

    // Touch handlers
    let touchStartDist = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.hypot(dx, dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;

        spherical.theta -= deltaX * 0.01;
        spherical.phi = Math.max(minPhi, Math.min(maxPhi, spherical.phi - deltaY * 0.01));
        updateCamera();

        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2 && touchStartDist > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);
        const distDiff = touchStartDist - currentDist;

        spherical.radius = Math.max(minRadius, Math.min(maxRadius, spherical.radius + distDiff * 0.006));
        updateCamera();
        touchStartDist = currentDist;
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
      touchStartDist = 0;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });
    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (isRotatingRef.current && !isDragging) {
        spherical.theta += 0.0035;
        updateCamera();
      }

      if (heartMeshRef) {
        const pulse = 1.0 + Math.sin(elapsedTime * 6.0) * 0.04;
        heartMeshRef.scale.set(pulse, pulse, pulse);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, [currentEnv, isMoon, isMars]);

  return (
    <div className="relative w-full h-[355px] flex items-center justify-center select-none overflow-hidden">
      {/* Interactive 3D Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden"
      />

      {/* Loading telemetry indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080f1c]/70 backdrop-blur-sm z-30 pointer-events-none">
          <div className="w-8 h-8 border-2 border-[#8ccfff]/30 border-t-[#8ccfff] rounded-full animate-spin mb-2" />
          <p className="text-[11px] font-['Manrope'] text-[#8ccfff] tracking-wider animate-pulse">
            LOADING ANATOMICAL DIGITAL TWIN...
          </p>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#080f1c]/80 z-30 text-[#f2b65d] text-[12px] font-mono">
          {loadError}
        </div>
      )}

      {/* Floating 3D Controls (Minimal Reset Button) */}
      <div className="absolute top-1 right-1 z-10">
        <button
          type="button"
          onClick={() => resetCameraRef.current?.()}
          title="Reset 3D view"
          className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] bg-[rgba(21,28,39,0.85)] hover:bg-[#1a2538] border border-[rgba(140,207,255,0.35)] text-[#a9b5c3] hover:text-white transition-all cursor-pointer shadow-sm"
        >
          ↺
        </button>
      </div>
    </div>
  );
}
