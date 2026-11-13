import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import type { EnvironmentType } from '../components/EnvironmentCards';
import { THEMES } from './themeTokens';

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
  | 'ankles';

export interface LoadedAnatomyModel {
  rootGroup: THREE.Group;
  regionMap: Map<AnatomicalRegionId, THREE.Mesh[]>;
  raycastTargets: THREE.Mesh[];
  meshToRegion: Map<THREE.Mesh, AnatomicalRegionId>;
  meshNames: Map<THREE.Mesh, string>;
  heartMesh?: THREE.Mesh;
  updateTheme: (env: EnvironmentType) => void;
}

// Global cached instance to prevent re-fetching and re-parsing
let cachedGLTF: LoadedAnatomyModel | null = null;
let loadingPromise: Promise<LoadedAnatomyModel> | null = null;

/**
 * Classifies an anatomical mesh by its anatomical name and 3D centroid
 */
function classifyMesh(
  name: string,
  localPos: THREE.Vector3
): AnatomicalRegionId {
  const n = name.toLowerCase();
  const y = localPos.y;
  const x = Math.abs(localPos.x);
  const z = localPos.z;

  // 1. Specific anatomical nomenclature matching
  if (/head|cran|facial|skull|parietal|frontal|occipital|sphenoid|temporal|nasal|mandib|maxill|zygomat|cervical|atlas|axis|c[1-7]\b|hyoid|foramen magnum/i.test(n)) {
    return 'head';
  }
  if (/scapula|clavicle|acromion|deltoid|pectoral girdle/i.test(n)) {
    return 'shoulders';
  }
  if (/rib|costal|sternum|pectoral|manubrium|xiphoid/i.test(n)) {
    return 'chest';
  }
  if (/thoracic vertebra|t[1-9]\b|t1[0-2]\b|trapezius|rhomboid/i.test(n)) {
    return 'upper_back';
  }
  if (/lumbar|l[1-5]\b|sacrum|coccyx/i.test(n)) {
    return 'lower_back';
  }
  if (/humerus|brachi|radius|ulna/i.test(n)) {
    if (y < 0.98 && y > 0.88 && x > 0.18) return 'elbows';
    return 'arms';
  }
  if (/olecranon|cubit|elbow/i.test(n)) {
    return 'elbows';
  }
  if (/carpal|metacarpal|phalang.*hand|finger|hand|palmar|wrist/i.test(n)) {
    return 'wrists';
  }
  if (/abdomin|rectus abdominis|linea alba|navel|internal oblique/i.test(n)) {
    return 'abdomen';
  }
  if (/pelv|ilium|ischium|pubis|hip|acetabul|sacroiliac/i.test(n)) {
    return 'hips';
  }
  if (/femur|thigh|quadriceps|hamstring/i.test(n)) {
    if (y < 0.52 && y > 0.38) return 'knees';
    return 'thighs';
  }
  if (/patella|knee|menisc/i.test(n)) {
    return 'knees';
  }
  if (/tibia|fibula|gastrocnemius|soleus|calf/i.test(n)) {
    return 'legs';
  }
  if (/tarsal|metatarsal|calcaneus|talus|foot|toe|plantar/i.test(n)) {
    return 'ankles';
  }

  // 2. Spatial centroid fallback for unnamed / grouped meshes
  if (y >= 1.38) return 'head';
  if (y >= 1.15 && y < 1.38) {
    if (x >= 0.16) return 'shoulders';
    if (z < -0.01) return 'upper_back';
    return 'chest';
  }
  if (y >= 0.88 && y < 1.15) {
    if (x >= 0.18) {
      if (y < 0.98 && y > 0.86) return 'elbows';
      return 'arms';
    }
    if (z < -0.01) return 'lower_back';
    return 'abdomen';
  }
  if (y >= 0.70 && y < 0.88) {
    if (x >= 0.20) return 'wrists';
    return 'hips';
  }
  if (y >= 0.48 && y < 0.70) {
    if (x >= 0.22) return 'wrists';
    return 'thighs';
  }
  if (y >= 0.36 && y < 0.48) return 'knees';
  if (y >= 0.10 && y < 0.36) return 'legs';
  return 'ankles';
}

/**
 * Creates theme-specific material for the holographic digital twin
 */
export function createHologramMaterial(env: EnvironmentType = 'Spacecraft'): THREE.MeshPhysicalMaterial {
  const theme = THEMES[env] || THEMES.Spacecraft;
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(theme.modelColor),
    emissive: new THREE.Color(theme.modelEmissive),
    emissiveIntensity: theme.modelEmissiveIntensity,
    roughness: theme.modelRoughness,
    metalness: theme.modelMetalness,
    transparent: true,
    opacity: theme.modelOpacity,
    depthWrite: true,
    side: THREE.DoubleSide,
  });
}

/**
 * Loads the realistic anatomical digital twin with Draco decompression,
 * applies medical holographic shading, and organizes 14-region mapping.
 */
export async function loadAnatomicalDigitalTwin(env: EnvironmentType = 'Spacecraft'): Promise<LoadedAnatomyModel> {
  if (cachedGLTF) {
    const cloned = cloneLoadedAnatomy(cachedGLTF);
    cloned.updateTheme(env);
    return cloned;
  }

  if (loadingPromise) {
    const original = await loadingPromise;
    const cloned = cloneLoadedAnatomy(original);
    cloned.updateTheme(env);
    return cloned;
  }

  loadingPromise = (async () => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    // Load body.glb
    const bodyGltf = await gltfLoader.loadAsync('/models/body.glb');
    const bodyScene = bodyGltf.scene;

    const bbox = new THREE.Box3().setFromObject(bodyScene);
    const height = bbox.max.y - bbox.min.y || 1.7;
    const center = new THREE.Vector3();
    bbox.getCenter(center);

    const scaleFactor = 2.3 / height;

    const initialMat = createHologramMaterial(env);
    const regionMap = new Map<AnatomicalRegionId, THREE.Mesh[]>();
    const raycastTargets: THREE.Mesh[] = [];
    const meshToRegion = new Map<THREE.Mesh, AnatomicalRegionId>();
    const meshNames = new Map<THREE.Mesh, string>();

    bodyScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = initialMat.clone();
        mesh.castShadow = false;
        mesh.receiveShadow = false;

        const meshBbox = new THREE.Box3().setFromObject(mesh);
        const centroid = new THREE.Vector3();
        meshBbox.getCenter(centroid);

        const cleanName = mesh.name
          .replace(/\.\d+$/, '')
          .replace(/_/g, ' ')
          .trim();

        const region = classifyMesh(mesh.name, centroid);

        mesh.userData.region = region;
        mesh.userData.anatomicalName = cleanName || 'Anatomical Structure';
        mesh.userData.defaultMaterial = mesh.material;

        if (!regionMap.has(region)) {
          regionMap.set(region, []);
        }
        regionMap.get(region)!.push(mesh);
        raycastTargets.push(mesh);
        meshToRegion.set(mesh, region);
        meshNames.set(mesh, mesh.userData.anatomicalName);
      }
    });

    // Optional Heart Organ
    let heartMesh: THREE.Mesh | undefined;
    try {
      const heartGltf = await gltfLoader.loadAsync('/models/heart.glb');
      const heartScene = heartGltf.scene;
      heartScene.scale.setScalar(0.045);
      heartScene.position.set(0.02, 1.25, 0.03);

      const heartMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x04e5d4),
        emissive: new THREE.Color(0xe02d5e),
        emissiveIntensity: 0.65,
        roughness: 0.2,
        transparent: true,
        opacity: 0.9,
      });

      heartScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.material = heartMat;
          mesh.userData.region = 'chest';
          mesh.userData.anatomicalName = 'Heart & Cardiac Chambers';
          regionMap.get('chest')?.push(mesh);
          raycastTargets.push(mesh);
          meshToRegion.set(mesh, 'chest');
          meshNames.set(mesh, 'Heart & Cardiac Chambers');
          heartMesh = mesh;
        }
      });
      bodyScene.add(heartScene);
    } catch (e) {
      console.warn('Heart model load skipped:', e);
    }

    const rootGroup = new THREE.Group();
    rootGroup.name = 'ASTRA_Digital_Twin';
    bodyScene.position.set(-center.x, -center.y, -center.z);
    rootGroup.add(bodyScene);
    rootGroup.scale.setScalar(scaleFactor);

    const updateTheme = (targetEnv: EnvironmentType) => {
      const newMat = createHologramMaterial(targetEnv);
      rootGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && child !== heartMesh) {
          const mesh = child as THREE.Mesh;
          mesh.material = newMat.clone();
          mesh.userData.defaultMaterial = mesh.material;
        }
      });
    };

    cachedGLTF = {
      rootGroup,
      regionMap,
      raycastTargets,
      meshToRegion,
      meshNames,
      heartMesh,
      updateTheme,
    };

    return cachedGLTF;
  })();

  const result = await loadingPromise;
  const cloned = cloneLoadedAnatomy(result);
  cloned.updateTheme(env);
  return cloned;
}

/**
 * Creates an independent clone of the anatomy model for independent rendering viewports
 */
function cloneLoadedAnatomy(source: LoadedAnatomyModel): LoadedAnatomyModel {
  const rootGroup = source.rootGroup.clone(true);
  const regionMap = new Map<AnatomicalRegionId, THREE.Mesh[]>();
  const raycastTargets: THREE.Mesh[] = [];
  const meshToRegion = new Map<THREE.Mesh, AnatomicalRegionId>();
  const meshNames = new Map<THREE.Mesh, string>();
  let heartMesh: THREE.Mesh | undefined;

  rootGroup.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((m) => m.clone());
      } else if (mesh.material) {
        mesh.material = (mesh.material as THREE.Material).clone();
      }
      mesh.userData.defaultMaterial = mesh.material;

      const region = mesh.userData.region as AnatomicalRegionId | undefined;
      const name = mesh.userData.anatomicalName as string | undefined;

      if (region) {
        if (!regionMap.has(region)) {
          regionMap.set(region, []);
        }
        regionMap.get(region)!.push(mesh);
        raycastTargets.push(mesh);
        meshToRegion.set(mesh, region);
        meshNames.set(mesh, name || 'Anatomical Structure');

        if (name?.includes('Heart')) {
          heartMesh = mesh;
        }
      }
    }
  });

  const updateTheme = (targetEnv: EnvironmentType) => {
    const newMat = createHologramMaterial(targetEnv);
    rootGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && child !== heartMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = newMat.clone();
        mesh.userData.defaultMaterial = mesh.material;
      }
    });
  };

  return {
    rootGroup,
    regionMap,
    raycastTargets,
    meshToRegion,
    meshNames,
    heartMesh,
    updateTheme,
  };
}
