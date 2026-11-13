import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  loadAnatomicalDigitalTwin,
  type AnatomicalRegionId,
} from '../utils/anatomicalModelLoader';
import type { EnvironmentType } from './EnvironmentCards';
import { getTheme } from '../utils/themeTokens';

export type BodyView = 'anterior' | 'posterior';

export interface AnatomicalRegionData {
  id: AnatomicalRegionId;
  name: string;
  category: string;
  defaultView: BodyView;
  status: 'Nominal' | 'Attention needed' | 'Monitoring';
  statusColor: string;
  description: string;
  commonSymptoms: string[];
  safeGuidance: string[];
}

export const ANATOMICAL_REGIONS: Record<AnatomicalRegionId, AnatomicalRegionData> = {
  head: {
    id: 'head',
    name: 'Head and Neck',
    category: 'Cranial & Cervical Spine (C1-C7)',
    defaultView: 'anterior',
    status: 'Nominal',
    statusColor: '#04e5d4',
    description: 'Encompasses cranial structure, ocular neural pathways (SANS risk), cervical vertebrae C1-C7, and carotid circulation.',
    commonSymptoms: ['Cephalad fluid fullness', 'Mild tension headache', 'Neck muscle stiffness'],
    safeGuidance: [
      'Maintain head-neutral position during sleep restraint use',
      'Hydrate with electrolyte solution if frontal tension persists',
      'Perform gentle slow cervical rotations (5 reps left, 5 reps right)'
    ]
  },
  shoulders: {
    id: 'shoulders',
    name: 'Shoulders',
    category: 'Clavicle, Scapula & Rotator Cuff',
    defaultView: 'anterior',
    status: 'Nominal',
    statusColor: '#04e5d4',
    description: 'Monitors acromioclavicular joints, deltoid stabilization, and rotator cuff tendon integrity during microgravity translation.',
    commonSymptoms: ['Rotator cuff impingement', 'Overhead mobility tightness', 'Anterior shoulder soreness'],
    safeGuidance: [
      'Avoid high-velocity push-offs from handrails',
      'Conduct resistance band external rotations prior to heavy EVA suit use',
      'Apply passive warm towel compress if soreness emerges'
    ]
  },
  chest: {
    id: 'chest',
    name: 'Chest',
    category: 'Thoracic Cage, Sternum & Heart Organ',
    defaultView: 'anterior',
    status: 'Nominal',
    statusColor: '#04e5d4',
    description: 'Monitors ribcage articulation, sternum, pulmonary compliance, and internal cardiac apex rhythm.',
    commonSymptoms: ['Chest tightness', 'Sternocostal joint click', 'Restraint harness pressure'],
    safeGuidance: [
      'Loosen harness tension if superficial bruising is noted',
      'Practice 3 cycles of deep diaphragmatic breathing',
      'Report any sharp or radiating discomfort immediately to medical officer'
    ]
  },
  upper_back: {
    id: 'upper_back',
    name: 'Upper Back',
    category: 'Thoracic Spine (T1-T12) & Trapezius',
    defaultView: 'posterior',
    status: 'Nominal',
    statusColor: '#04e5d4',
    description: 'Encompasses thoracic vertebrae T1-T12, rhomboids, trapezius, and posterior rib attachments.',
    commonSymptoms: ['Inter-scapular fatigue', 'Upper thoracic tightness', 'Post-workout soreness'],
    safeGuidance: [
      'Perform scapular retractions against neutral zero-g resistance',
      'Use crew cabin foam roller along thoracic curve for 5 minutes'
    ]
  },
  lower_back: {
    id: 'lower_back',
    name: 'Lower Back',
    category: 'Lumbar Spine (L1-L5) & Sacroiliac Chain',
    defaultView: 'posterior',
    status: 'Attention needed',
    statusColor: '#ffd48a',
    description: 'Microgravity spinal elongation (+3.4 cm observed) eliminates axial gravitational compression, stretching posterior ligaments.',
    commonSymptoms: ['Lumbar muscle stiffness', 'Deep achiness on waking', 'Sacroiliac joint restriction'],
    safeGuidance: [
      'Assume fetal tuck posture for 10 minutes to relieve intervertebral tension',
      'Adjust sleep restraint foot-straps to reduce lumbar lordosis strain',
      'Complete designated core isometric stabilization drill before evening meal'
    ]
  },
  arms: {
    id: 'arms',
    name: 'Arms',
    category: 'Humerus, Radius & Brachial Musculature',
    defaultView: 'anterior',
    status: 'Nominal',
    statusColor: '#04e5d4',
    description: 'Monitors humerus shaft, biceps/triceps kinetic chain, and microgravity translation pull forces.',
    commonSymptoms: ['Biceps tendon tenderness', 'Triceps fatigue after spacewalk prep', 'Forearm pump'],
    safeGuidance: [
      'Alternate dominant arm during manual cargo bay latch operations',
      'Perform 60 seconds of gentle forearm flexor/extensor stretches'
    ]
  },
  elbows: {
    id: 'elbows',
    name: 'Elbows',
    category: 'Humeroulnar Joint & Olecranon',
    defaultView: 'anterior',
    status: 'Nominal',
    statusColor: '#04e5d4',
    description: 'Tracks medial and lateral epicondyle strain from repetitive tool gripping and airlock latch locking.',
    commonSymptoms: ['Lateral epicondyle discomfort', 'Joint crepitus', 'Terminal extension stiffness'],
    safeGuidance: [
      'Use ergonomic torque grips for manual hex screw tightening',
      'Apply 5-minute cold pack if inflammation is reported after maintenance tasks'
    ]
  },
  wrists: {
    id: 'wrists',
    name: 'Wrists & Hands',
    category: 'Carpal Bones, Metacarpals & Digits',
    defaultView: 'anterior',
    status: 'Nominal',
    statusColor: '#04e5d4',
    description: 'Detailed hand and finger structures, monitoring pressurized EVA glove fatigue and fingernail delamination risks.',
    commonSymptoms: ['Fingertip tenderness', 'Thenar muscle fatigue', 'Carpal tunnel tingling'],
    safeGuidance: [
      'Utilize custom inner glove comfort liners during pressurized trials',
      'Perform finger tendon gliding exercises 3 times daily'
    ]
  },
  abdomen: {
    id: 'abdomen',
    name: 'Abdomen',
    category: 'Abdominal Wall & Core Stabilization',
    defaultView: 'anterior',
    status: 'Nominal',
    statusColor: '#04e5d4',
    description: 'Monitors rectus abdominis, core stabilizers, and gastrointestinal motility in microgravity.',
    commonSymptoms: ['Bloating / delayed gastric emptying', 'Abdominal wall tension', 'Core fatigue'],
    safeGuidance: [
      'Pace meal intake and chew thoroughly to reduce aerophagia',
      'Consume active probiotic ration pack with breakfast'
    ]
  },
  hips: {
    id: 'hips',
    name: 'Hips & Pelvis',
    category: 'Pelvic Girdle, Ilium & Acetabulum',
    defaultView: 'anterior',
    status: 'Nominal',
    statusColor: '#04e5d4',
    description: 'Monitors iliac crest, pubic symphysis, and acetabulofemoral articulation under harness compression.',
    commonSymptoms: ['Treadmill harness chafing', 'Hip flexor tightness', 'Sacroiliac joint stiffness'],
    safeGuidance: [
      'Reposition pelvic loading harness pads prior to high-load resistive cycle',
      'Perform kneeling hip flexor stretch with handrail stabilization'
    ]
  },
  thighs: {
    id: 'thighs',
    name: 'Thighs',
    category: 'Femur & Quadriceps / Hamstring Group',
    defaultView: 'anterior',
    status: 'Nominal',
    statusColor: '#04e5d4',
    description: 'Monitors femur bone mineral density retention, quadriceps muscle volume, and resistive exercise recovery.',
    commonSymptoms: ['Delayed onset muscle soreness (DOMS)', 'Distal quad tightness', 'Hamstring strain'],
    safeGuidance: [
      'Verify flywheel resistance settings match mission prescription',
      'Hydrate with amino acid recovery beverage within 30 min of exercise'
    ]
  },
  knees: {
    id: 'knees',
    name: 'Knees',
    category: 'Patella, Femoral Condyles & Menisci',
    defaultView: 'anterior',
    status: 'Nominal',
    statusColor: '#04e5d4',
    description: 'Tracks patellofemoral loading, joint capsule lubrication, and cartilage health during repetitive resistance exercises.',
    commonSymptoms: ['Anterior patellar ache', 'Quadriceps tendon soreness', 'Joint stiffness after sleep'],
    safeGuidance: [
      'Check cycle ergometer foot pedal alignment and strap tension',
      'Perform gentle passive knee flexion before commencing squat protocols'
    ]
  },
  legs: {
    id: 'legs',
    name: 'Legs & Calves',
    category: 'Tibia, Fibula & Gastrocnemius',
    defaultView: 'posterior',
    status: 'Nominal',
    statusColor: '#04e5d4',
    description: 'Monitors calf muscle volume (soleus/gastrocnemius), shin splint risks, and venous return mechanisms.',
    commonSymptoms: ['Calf cramps during sleep', 'Tibial muscle tightness', 'Venous pooling discomfort'],
    safeGuidance: [
      'Ensure adequate daily magnesium intake via nutrient pack',
      'Execute 20 bilateral calf raises on resistance harness before retiring'
    ]
  },
  ankles: {
    id: 'ankles',
    name: 'Ankles & Feet',
    category: 'Tarsals, Calcaneus & Plantar Fascia',
    defaultView: 'posterior',
    status: 'Nominal',
    statusColor: '#04e5d4',
    description: 'Full ankle and foot structure, monitoring footpad pressure from foot restraints and treadmill cords.',
    commonSymptoms: ['Dorsal foot pain from foot-loops', 'Achilles tendon tightness', 'Plantar tenderness'],
    safeGuidance: [
      'Inspect dorsal foot padding on exercise treadmill harness',
      'Roll tennis ball under plantar fascia for 3 minutes before sleep'
    ]
  }
};

interface Examination3DViewerProps {
  selectedRegion: AnatomicalRegionId;
  onSelectRegion: (id: AnatomicalRegionId) => void;
  currentView: BodyView;
  onViewChange: (view: BodyView) => void;
  currentEnv?: EnvironmentType;
}

export function Examination3DViewer({
  selectedRegion,
  onSelectRegion,
  currentView,
  onViewChange,
  currentEnv = 'Spacecraft',
}: Examination3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hoveredStructure, setHoveredStructure] = useState<string | null>(null);
  const resetCameraRef = useRef<(() => void) | null>(null);
  const setViewCameraRef = useRef<((view: BodyView) => void) | null>(null);

  const isMoon = currentEnv === 'Moon';
  const isMars = currentEnv === 'Mars';
  const theme = getTheme(currentEnv);

  // References for Raycasting & Highlighting
  const regionMeshesRef = useRef<Map<AnatomicalRegionId, THREE.Mesh[]>>(new Map());
  const selectedRegionRef = useRef<AnatomicalRegionId>(selectedRegion);
  selectedRegionRef.current = selectedRegion;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isDisposed = false;

    // 1. Scene setup
    const scene = new THREE.Scene();
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 560;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    const initialZ = currentView === 'anterior' ? 3.3 : -3.3;
    camera.position.set(0, 0, initialZ);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isMoon ? 1.2 : 1.3;
    container.appendChild(renderer.domElement);

    // 2. Lights adapted to environment
    const ambientColor = isMoon ? 0x0a101d : isMars ? 0x1f0d0e : 0x06283d;
    const ambientLight = new THREE.AmbientLight(ambientColor, isMoon ? 2.4 : 2.0);
    scene.add(ambientLight);

    const frontColor = isMoon ? 0xf1f5f9 : isMars ? 0xffc4a3 : 0x29c8ef;
    const frontLight = new THREE.DirectionalLight(frontColor, isMoon ? 2.6 : 2.8);
    frontLight.position.set(2, 3, 3);
    scene.add(frontLight);

    const backColor = isMoon ? 0x8ccfff : isMars ? 0xff7b54 : 0x04e5d4;
    const backLight = new THREE.DirectionalLight(backColor, isMoon ? 1.8 : 2.4);
    backLight.position.set(-2, 2, -3);
    scene.add(backLight);

    const topRimColor = isMoon ? 0xb6f0ff : isMars ? 0xffd4b2 : 0x5eead4;
    const topRim = new THREE.PointLight(topRimColor, 2.0, 10);
    topRim.position.set(0, 3.5, 0);
    scene.add(topRim);

    // Subtle bottom grid
    const grid1 = isMoon ? 0x8ccfff : isMars ? 0xff9d71 : 0x18a9d6;
    const grid2 = isMoon ? 0x151c27 : isMars ? 0x281216 : 0x083344;
    const grid = new THREE.GridHelper(3.5, 14, grid1, grid2);
    grid.position.y = -1.25;
    scene.add(grid);

    // 3. Materials for selection/hover highlighting
    const normalCyanMat = new THREE.MeshPhysicalMaterial({
      color: theme.modelColor,
      emissive: theme.modelEmissive,
      emissiveIntensity: theme.modelEmissiveIntensity,
      transparent: true,
      opacity: theme.modelOpacity,
      depthWrite: true,
      side: THREE.DoubleSide,
    });

    const selectedAmberMat = new THREE.MeshPhysicalMaterial({
      color: isMoon ? 0xf2b65d : isMars ? 0xffd48a : 0xffd48a,
      emissive: isMoon ? 0x8a5410 : isMars ? 0xa84210 : 0xff9900,
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0.95,
      depthWrite: true,
      side: THREE.DoubleSide,
    });

    const hoverCyanMat = new THREE.MeshPhysicalMaterial({
      color: isMoon ? 0x8ccfff : isMars ? 0xff9d71 : 0x00f0ff,
      emissive: isMoon ? 0x3d6688 : isMars ? 0x7a301a : 0x00b4d8,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.9,
      depthWrite: true,
      side: THREE.DoubleSide,
    });

    let raycastTargets: THREE.Mesh[] = [];
    let regionMap: Map<AnatomicalRegionId, THREE.Mesh[]> = new Map();
    let meshToRegion: Map<THREE.Mesh, AnatomicalRegionId> = new Map();
    let meshNames: Map<THREE.Mesh, string> = new Map();
    let heartMeshRef: THREE.Mesh | undefined;

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Load authentic 3D anatomical twin
    loadAnatomicalDigitalTwin(currentEnv)
      .then((anatomy) => {
        if (isDisposed) return;
        modelGroup.add(anatomy.rootGroup);
        regionMap = anatomy.regionMap;
        regionMeshesRef.current = regionMap;
        raycastTargets = anatomy.raycastTargets;
        meshToRegion = anatomy.meshToRegion;
        meshNames = anatomy.meshNames;
        heartMeshRef = anatomy.heartMesh;
        setIsLoading(false);
        updateMeshHighlights();
      })
      .catch((err) => {
        console.error('Failed to load examination model:', err);
        if (!isDisposed) setIsLoading(false);
      });

    // Raycaster for mouse/touch inspection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Spherical orbit parameters
    let spherical = {
      radius: 3.3,
      theta: currentView === 'anterior' ? 0 : Math.PI,
      phi: Math.PI / 2,
    };
    let targetSpherical = { ...spherical };
    let isDragging = false;
    let dragDistance = 0;
    let previousMousePosition = { x: 0, y: 0 };

    const updateCameraFromSpherical = () => {
      targetSpherical.radius = Math.max(1.6, Math.min(4.8, targetSpherical.radius));
      targetSpherical.phi = Math.max(0.2, Math.min(Math.PI - 0.2, targetSpherical.phi));

      spherical.radius += (targetSpherical.radius - spherical.radius) * 0.1;
      spherical.theta += (targetSpherical.theta - spherical.theta) * 0.1;
      spherical.phi += (targetSpherical.phi - spherical.phi) * 0.1;

      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 0, 0);

      // Check whether camera is primarily viewing anterior or posterior
      const normAngle = ((spherical.theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const isBack = normAngle > Math.PI / 2 && normAngle < (3 * Math.PI) / 2;
      const detectedView: BodyView = isBack ? 'posterior' : 'anterior';
      if (detectedView !== currentView) {
        onViewChange(detectedView);
      }
    };

    resetCameraRef.current = () => {
      targetSpherical.radius = 3.3;
      targetSpherical.theta = currentView === 'anterior' ? 0 : Math.PI;
      targetSpherical.phi = Math.PI / 2;
    };

    setViewCameraRef.current = (view: BodyView) => {
      targetSpherical.theta = view === 'anterior' ? 0 : Math.PI;
      targetSpherical.phi = Math.PI / 2;
    };

    let hoveredMesh: THREE.Mesh | null = null;

    // Apply color highlights to regionMap
    const updateMeshHighlights = () => {
      if (regionMap.size === 0) return;

      regionMap.forEach((meshes, regId) => {
        const isSel = regId === selectedRegionRef.current;
        for (const m of meshes) {
          if (m === heartMeshRef) continue; // Keep vibrant heart appearance
          if (isSel) {
            m.material = selectedAmberMat;
          } else if (m === hoveredMesh) {
            m.material = hoverCyanMat;
          } else {
            m.material = normalCyanMat;
          }
        }
      });
    };

    // Mouse handlers
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      dragDistance = 0;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        dragDistance += Math.abs(deltaX) + Math.abs(deltaY);

        targetSpherical.theta -= deltaX * 0.008;
        targetSpherical.phi -= deltaY * 0.008;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      } else {
        // Raycasting for hover highlight
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(raycastTargets, false);
        if (intersects.length > 0) {
          hoveredMesh = intersects[0].object as THREE.Mesh;
          const structName = meshNames.get(hoveredMesh) || 'Anatomical Structure';
          const reg = meshToRegion.get(hoveredMesh);
          const regName = reg ? ANATOMICAL_REGIONS[reg]?.name : '';
          setHoveredStructure(`${structName} (${regName})`);
          container.style.cursor = 'pointer';
        } else {
          hoveredMesh = null;
          setHoveredStructure(null);
          container.style.cursor = 'grab';
        }
        updateMeshHighlights();
      }
    };

    const onMouseUp = () => {
      if (dragDistance < 8) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(raycastTargets, false);
        if (intersects.length > 0) {
          const hitMesh = intersects[0].object as THREE.Mesh;
          const hitRegion = meshToRegion.get(hitMesh);
          if (hitRegion) {
            onSelectRegion(hitRegion);
          }
        }
      }
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetSpherical.radius = Math.max(1.6, Math.min(4.8, targetSpherical.radius + e.deltaY * 0.0025));
    };

    // Touch controls
    let initialPinchDistance = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        dragDistance = 0;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDistance = Math.hypot(dx, dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;
        dragDistance += Math.abs(deltaX) + Math.abs(deltaY);

        targetSpherical.theta -= deltaX * 0.01;
        targetSpherical.phi -= deltaY * 0.01;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2 && initialPinchDistance > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDistance = Math.hypot(dx, dy);
        const diff = initialPinchDistance - currentDistance;

        targetSpherical.radius = Math.max(1.6, Math.min(4.8, targetSpherical.radius + diff * 0.006));
        initialPinchDistance = currentDistance;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (dragDistance < 10 && e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const rect = container.getBoundingClientRect();
        mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(raycastTargets, false);
        if (intersects.length > 0) {
          const hitMesh = intersects[0].object as THREE.Mesh;
          const hitRegion = meshToRegion.get(hitMesh);
          if (hitRegion) {
            onSelectRegion(hitRegion);
          }
        }
      }
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });
    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(container);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Pulse selected region gently
      const glow = 0.8 + Math.sin(elapsedTime * 5.0) * 0.25;
      selectedAmberMat.emissiveIntensity = glow;

      // Heart pulse
      if (heartMeshRef) {
        const pulse = 1.0 + Math.sin(elapsedTime * 6.0) * 0.05;
        heartMeshRef.scale.set(pulse, pulse, pulse);
      }

      updateCameraFromSpherical();
      updateMeshHighlights();
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

  // Update view when changed from parent toggle
  useEffect(() => {
    setViewCameraRef.current?.(currentView);
  }, [currentView]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between select-none overflow-hidden rounded-xl">
      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden"
      />

      {/* Loading telemetry overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm z-30 pointer-events-none">
          <div
            className="w-12 h-12 border-2 rounded-full animate-spin mb-3"
            style={{
              borderColor: `${theme.accent}30`,
              borderTopColor: theme.accent,
            }}
          />
          <p className="text-[12px] font-mono tracking-wider animate-pulse" style={{ color: theme.accent }}>
            INITIALIZING 3D ANATOMICAL DIGITAL TWIN...
          </p>
          <p className="text-[10px] font-mono text-[#a9bcd2]/60 mt-1">
            PARSING 826 SKELETAL & MUSCULAR MESHES · DRACO ACCELERATED
          </p>
        </div>
      )}

      {/* Repositioned & Resized Active Region HUD & Instruction Overlay (Top-Left, away from chips) */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 pointer-events-none max-w-[calc(100%-140px)]">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgba(2,11,32,0.88)] border border-[#285776]/70 backdrop-blur-md shadow-md text-[10.5px] font-mono text-[#a9bcd2]">
          <span className="w-2 h-2 rounded-full bg-[#ffd48a] animate-pulse shrink-0" />
          <span className="truncate">
            ACTIVE REGION: <strong className="text-[#ffd48a]">{ANATOMICAL_REGIONS[selectedRegion].name.toUpperCase()}</strong>
          </span>
        </div>

        {hoveredStructure ? (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#061e38]/95 border border-[#29c8ef]/70 backdrop-blur-md shadow-lg text-[10.5px] font-mono text-[#00f0ff] animate-fadeIn">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping shrink-0" />
            <span className="truncate">{hoveredStructure}</span>
          </div>
        ) : (
          <span className="text-[9.5px] font-mono text-[#8ba7c2]/80 px-1 hidden sm:inline-block">
            DRAG TO ROTATE 360° · CLICK TO INSPECT
          </span>
        )}
      </div>

      {/* Camera Controls & Preset Toggles (Top-Right) */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
        <button
          type="button"
          onClick={() => {
            const nextView: BodyView = currentView === 'anterior' ? 'posterior' : 'anterior';
            onViewChange(nextView);
            setViewCameraRef.current?.(nextView);
          }}
          className="px-2.5 py-1 text-[11px] font-semibold bg-[rgba(8,24,45,0.85)] hover:bg-[#123860] border border-[#29c8ef]/60 text-[#29c8ef] rounded-lg shadow-md transition-all cursor-pointer backdrop-blur-md flex items-center gap-1"
        >
          <span className="hidden sm:inline">{currentView === 'anterior' ? 'Flip to Posterior' : 'Flip to Anterior'}</span>
          <span className="sm:hidden">{currentView === 'anterior' ? 'Posterior' : 'Anterior'}</span>
          <span>↺</span>
        </button>

        <button
          type="button"
          onClick={() => resetCameraRef.current?.()}
          title="Reset Camera Position"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] bg-[rgba(8,24,45,0.85)] hover:bg-[#123860] border border-[#40688a]/60 text-[#29c8ef] backdrop-blur-md transition-all cursor-pointer shadow-sm"
        >
          ↺
        </button>
      </div>
    </div>
  );
}
