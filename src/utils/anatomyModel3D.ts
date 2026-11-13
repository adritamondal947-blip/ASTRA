import * as THREE from 'three';

export type AnatomicalRegionId =
  | 'head'
  | 'shoulders'
  | 'chest'
  | 'upper_back'
  | 'lower_back'
  | 'arms'
  | 'elbows'
  | 'wrists'
  | 'abdomen'
  | 'hips'
  | 'thighs'
  | 'knees'
  | 'legs'
  | 'feet';

export interface AnatomicalMeshDefinition {
  id: AnatomicalRegionId;
  name: string;
  category: 'head_neck' | 'torso' | 'upper_limbs' | 'lower_limbs';
  mesh: THREE.Object3D;
  center: THREE.Vector3;
}

/**
 * Creates a high-fidelity, full-body anatomical figure with realistic proportions (head-to-feet),
 * visible translucent cyan-holographic muscle/fascia, skeletal core, and separately queryable
 * raycasting collision volumes for each anatomical region.
 */
export function createHolographicHumanBody(_interactive: boolean = false): {
  rootGroup: THREE.Group;
  regionMap: Map<AnatomicalRegionId, THREE.Mesh[]>;
  raycastTargets: THREE.Mesh[];
  hologramMaterials: THREE.Material[];
} {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'HolographicHumanBody';

  const regionMap = new Map<AnatomicalRegionId, THREE.Mesh[]>();
  const raycastTargets: THREE.Mesh[] = [];
  const hologramMaterials: THREE.Material[] = [];

  // 1. Holographic Materials
  const cyanHologramMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x18a9d6),
    emissive: new THREE.Color(0x064d73),
    emissiveIntensity: 0.45,
    roughness: 0.25,
    metalness: 0.1,
    transmission: 0.65,
    ior: 1.25,
    transparent: true,
    opacity: 0.72,
    wireframe: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  hologramMaterials.push(cyanHologramMat);

  const cyanWireframeMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x40e7ff),
    wireframe: true,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  hologramMaterials.push(cyanWireframeMat);

  const skeletonMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x9bf0ff),
    transparent: true,
    opacity: 0.85,
  });
  hologramMaterials.push(skeletonMat);

  const spineGlowMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xffd48a),
    transparent: true,
    opacity: 0.8,
  });
  hologramMaterials.push(spineGlowMat);

  // Helper function to register body parts
  const registerPart = (
    id: AnatomicalRegionId,
    geometry: THREE.BufferGeometry,
    position: THREE.Vector3,
    scale: THREE.Vector3 = new THREE.Vector3(1, 1, 1),
    rotation: THREE.Euler = new THREE.Euler(0, 0, 0),
    customMat?: THREE.Material
  ) => {
    // Outer holographic volume
    const mesh = new THREE.Mesh(geometry, customMat || cyanHologramMat);
    mesh.position.copy(position);
    mesh.scale.copy(scale);
    mesh.rotation.copy(rotation);
    mesh.userData = { regionId: id };

    // Wireframe contour overlay
    const wire = new THREE.Mesh(geometry, cyanWireframeMat);
    wire.position.copy(position);
    wire.scale.copy(scale).multiplyScalar(1.008);
    wire.rotation.copy(rotation);

    rootGroup.add(mesh);
    rootGroup.add(wire);

    if (!regionMap.has(id)) {
      regionMap.set(id, []);
    }
    regionMap.get(id)!.push(mesh);
    raycastTargets.push(mesh);

    return mesh;
  };

  // -------------------------------------------------------------
  // HEAD & NECK (Y: ~1.7m to 2.05m)
  // -------------------------------------------------------------
  // Cranium / Head
  registerPart(
    'head',
    new THREE.SphereGeometry(0.18, 24, 20),
    new THREE.Vector3(0, 1.88, 0),
    new THREE.Vector3(1, 1.25, 1.15)
  );
  // Neck
  registerPart(
    'head',
    new THREE.CylinderGeometry(0.09, 0.11, 0.16, 18),
    new THREE.Vector3(0, 1.66, -0.01)
  );
  // Brain core sphere
  const brainCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.55 })
  );
  brainCore.position.set(0, 1.89, 0.02);
  rootGroup.add(brainCore);

  // -------------------------------------------------------------
  // SHOULDERS (Left & Right)
  // -------------------------------------------------------------
  registerPart(
    'shoulders',
    new THREE.SphereGeometry(0.12, 18, 16),
    new THREE.Vector3(-0.35, 1.52, 0),
    new THREE.Vector3(1.15, 0.95, 1)
  );
  registerPart(
    'shoulders',
    new THREE.SphereGeometry(0.12, 18, 16),
    new THREE.Vector3(0.35, 1.52, 0),
    new THREE.Vector3(1.15, 0.95, 1)
  );
  // Clavicle bar
  const clavicle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.65, 12),
    skeletonMat
  );
  clavicle.position.set(0, 1.55, 0.03);
  clavicle.rotation.z = Math.PI / 2;
  rootGroup.add(clavicle);

  // -------------------------------------------------------------
  // CHEST & UPPER BACK
  // -------------------------------------------------------------
  // Chest / Thorax (Anterior emphasis)
  registerPart(
    'chest',
    new THREE.CylinderGeometry(0.28, 0.24, 0.32, 22),
    new THREE.Vector3(0, 1.38, 0.03),
    new THREE.Vector3(1.15, 1, 0.9)
  );
  // Pectoral contours
  registerPart(
    'chest',
    new THREE.SphereGeometry(0.12, 16, 14),
    new THREE.Vector3(-0.13, 1.41, 0.1),
    new THREE.Vector3(1.1, 0.9, 0.8)
  );
  registerPart(
    'chest',
    new THREE.SphereGeometry(0.12, 16, 14),
    new THREE.Vector3(0.13, 1.41, 0.1),
    new THREE.Vector3(1.1, 0.9, 0.8)
  );

  // Upper Back / Scapular zone (Posterior emphasis)
  registerPart(
    'upper_back',
    new THREE.BoxGeometry(0.48, 0.3, 0.12),
    new THREE.Vector3(0, 1.39, -0.07),
    new THREE.Vector3(1, 1, 1)
  );

  // Internal Heart Node (pulsing visual)
  const heartMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.065, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x00f7d5, transparent: true, opacity: 0.9 })
  );
  heartMesh.position.set(0.04, 1.40, 0.04);
  heartMesh.name = 'heartCore';
  rootGroup.add(heartMesh);

  // -------------------------------------------------------------
  // ABDOMEN & LOWER BACK
  // -------------------------------------------------------------
  // Abdomen (Anterior)
  registerPart(
    'abdomen',
    new THREE.CylinderGeometry(0.23, 0.22, 0.26, 20),
    new THREE.Vector3(0, 1.13, 0.02),
    new THREE.Vector3(1.05, 1, 0.85)
  );

  // Lower Back / Lumbar spine
  registerPart(
    'lower_back',
    new THREE.BoxGeometry(0.38, 0.24, 0.13),
    new THREE.Vector3(0, 1.12, -0.06),
    new THREE.Vector3(1, 1, 1)
  );

  // Vertebral Column Backbone (Cervical down through Lumbar)
  for (let i = 0; i < 18; i++) {
    const yPos = 1.62 - i * 0.035;
    const isLumbar = i >= 11;
    const vert = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.02, 10),
      isLumbar ? spineGlowMat : skeletonMat
    );
    vert.position.set(0, yPos, -0.05);
    vert.rotation.x = Math.PI / 2;
    rootGroup.add(vert);
  }

  // -------------------------------------------------------------
  // HIPS & PELVIS
  // -------------------------------------------------------------
  registerPart(
    'hips',
    new THREE.CylinderGeometry(0.22, 0.25, 0.22, 20),
    new THREE.Vector3(0, 0.91, 0),
    new THREE.Vector3(1.15, 1, 0.95)
  );

  // -------------------------------------------------------------
  // UPPER LIMBS (Arms, Elbows, Wrists, Hands)
  // -------------------------------------------------------------
  // Left Upper Arm
  registerPart(
    'arms',
    new THREE.CylinderGeometry(0.075, 0.065, 0.32, 16),
    new THREE.Vector3(-0.38, 1.28, 0)
  );
  // Right Upper Arm
  registerPart(
    'arms',
    new THREE.CylinderGeometry(0.075, 0.065, 0.32, 16),
    new THREE.Vector3(0.38, 1.28, 0)
  );

  // Left Elbow
  registerPart(
    'elbows',
    new THREE.SphereGeometry(0.065, 16, 14),
    new THREE.Vector3(-0.40, 1.09, -0.01)
  );
  // Right Elbow
  registerPart(
    'elbows',
    new THREE.SphereGeometry(0.065, 16, 14),
    new THREE.Vector3(0.40, 1.09, -0.01)
  );

  // Left Forearm
  registerPart(
    'arms',
    new THREE.CylinderGeometry(0.06, 0.048, 0.28, 16),
    new THREE.Vector3(-0.42, 0.91, 0.02)
  );
  // Right Forearm
  registerPart(
    'arms',
    new THREE.CylinderGeometry(0.06, 0.048, 0.28, 16),
    new THREE.Vector3(0.42, 0.91, 0.02)
  );

  // Wrists & Hands
  registerPart(
    'wrists',
    new THREE.SphereGeometry(0.05, 14, 12),
    new THREE.Vector3(-0.44, 0.74, 0.02)
  );
  registerPart(
    'wrists',
    new THREE.SphereGeometry(0.05, 14, 12),
    new THREE.Vector3(0.44, 0.74, 0.02)
  );
  // Palms / Hands
  registerPart(
    'wrists',
    new THREE.BoxGeometry(0.06, 0.12, 0.03),
    new THREE.Vector3(-0.45, 0.65, 0.02)
  );
  registerPart(
    'wrists',
    new THREE.BoxGeometry(0.06, 0.12, 0.03),
    new THREE.Vector3(0.45, 0.65, 0.02)
  );

  // -------------------------------------------------------------
  // LOWER LIMBS (Thighs, Knees, Legs/Calves, Feet)
  // -------------------------------------------------------------
  // Left Thigh
  registerPart(
    'thighs',
    new THREE.CylinderGeometry(0.12, 0.09, 0.42, 18),
    new THREE.Vector3(-0.15, 0.64, 0),
    new THREE.Vector3(1, 1, 1.05)
  );
  // Right Thigh
  registerPart(
    'thighs',
    new THREE.CylinderGeometry(0.12, 0.09, 0.42, 18),
    new THREE.Vector3(0.15, 0.64, 0),
    new THREE.Vector3(1, 1, 1.05)
  );

  // Left Knee (Patella)
  registerPart(
    'knees',
    new THREE.SphereGeometry(0.08, 16, 14),
    new THREE.Vector3(-0.15, 0.40, 0.02)
  );
  // Right Knee (Patella)
  registerPart(
    'knees',
    new THREE.SphereGeometry(0.08, 16, 14),
    new THREE.Vector3(0.15, 0.40, 0.02)
  );

  // Left Lower Leg (Calf & Shin)
  registerPart(
    'legs',
    new THREE.CylinderGeometry(0.082, 0.058, 0.38, 18),
    new THREE.Vector3(-0.15, 0.19, -0.01),
    new THREE.Vector3(1, 1, 1.1)
  );
  // Right Lower Leg (Calf & Shin)
  registerPart(
    'legs',
    new THREE.CylinderGeometry(0.082, 0.058, 0.38, 18),
    new THREE.Vector3(0.15, 0.19, -0.01),
    new THREE.Vector3(1, 1, 1.1)
  );

  // Ankles and Feet
  registerPart(
    'feet',
    new THREE.BoxGeometry(0.09, 0.07, 0.22),
    new THREE.Vector3(-0.15, -0.04, 0.04)
  );
  registerPart(
    'feet',
    new THREE.BoxGeometry(0.09, 0.07, 0.22),
    new THREE.Vector3(0.15, -0.04, 0.04)
  );

  // Base Pedestal Hologram Ring
  const pedestalRing = new THREE.Mesh(
    new THREE.RingGeometry(0.45, 0.58, 36),
    new THREE.MeshBasicMaterial({
      color: 0x29c8ef,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    })
  );
  pedestalRing.rotation.x = Math.PI / 2;
  pedestalRing.position.y = -0.08;
  rootGroup.add(pedestalRing);

  // Outer Coordinate Axis Marks on Floor
  const outerRing = new THREE.Mesh(
    new THREE.RingGeometry(0.7, 0.72, 48),
    new THREE.MeshBasicMaterial({
      color: 0x09829f,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    })
  );
  outerRing.rotation.x = Math.PI / 2;
  outerRing.position.y = -0.08;
  rootGroup.add(outerRing);

  // Adjust center of model so center of mass sits at y = 0
  rootGroup.position.y = -0.92;

  return { rootGroup, regionMap, raycastTargets, hologramMaterials };
}
