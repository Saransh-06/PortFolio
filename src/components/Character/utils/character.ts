import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import { decryptFile } from "./decrypt";
import { config } from "../../../config";

/**
 * Per-mesh colouring for the avatar.
 *
 * Material 0 in the GLB is called "default" and sits at baseColor
 * [0.8, 0.8, 0.8]. TEN meshes share it: head, ears, neck, hands, shirt,
 * pants, shoes and soles, plus the chair and the desk. That is why the
 * untouched character reads as a grey mannequin wearing nothing — the
 * shirt is the same flat grey as the skin, so there is no boundary between
 * them. Painting the shared material would repaint all ten at once, so
 * every mesh listed here gets its own clone. The chair and the desk are
 * deliberately absent: they stay grey.
 *
 * KEYS ARE THE glTF NODE NAMES, WHICH ARE NOT THE RUNTIME NAMES.
 * GLTFLoader puts every name through PropertyBinding.sanitizeNodeName(),
 * which deletes the characters reserved for animation-track binding
 * syntax — [ ] . : / — and turns whitespace into underscores. The node
 * "Plane.007" therefore arrives as "Plane007", and "BODY.SHIRT" as
 * "BODYSHIRT".
 *
 * That is what silently broke this table on its first outing: it was keyed
 * on the names exactly as they appear in the GLB's JSON chunk, so every key
 * containing a dot matched nothing at all. Neck, Hand, Pant, Shoe, Sole and
 * hair have no dots and did recolour — but the head, the ears and the shirt
 * kept their 0.8 grey, which left precisely the grey mannequin this table
 * exists to fix. The keys are now run through three's own rule at module
 * load, so the file stays readable against the GLB, and applyAppearance()
 * complains in dev if a key ever stops matching again.
 */
const MESH_COLOURS: Record<string, { color: string; roughness: number }> = {
  // "Plane.007" is the head — an unhelpful name, but it is the only mesh
  // whose bounding box sits at face height (y 11.92–14.02).
  "Plane.007": { color: config.character.skin, roughness: config.character.skinRoughness },
  "Ear.001": { color: config.character.skinShadow, roughness: config.character.skinRoughness },
  Neck: { color: config.character.skinShadow, roughness: config.character.skinRoughness },
  Hand: { color: config.character.skinShadow, roughness: config.character.skinRoughness },
  "BODY.SHIRT": { color: config.character.shirt, roughness: config.character.clothRoughness },
  Pant: { color: config.character.pants, roughness: config.character.clothRoughness },
  Shoe: { color: config.character.shoes, roughness: config.character.clothRoughness },
  Sole: { color: config.character.shoes, roughness: config.character.clothRoughness },
  hair: { color: config.character.hair, roughness: 0.72 },
};

/* Sanitised once, at module load, using three's own function rather than a
   copy of its regex — so if three ever changes which characters it strips,
   this follows instead of drifting. */
const COLOURS_BY_RUNTIME_NAME = new Map(
  Object.entries(MESH_COLOURS).map(([gltfName, spec]) => [
    THREE.PropertyBinding.sanitizeNodeName(gltfName),
    spec,
  ])
);

/**
 * Recolours the avatar in place.
 *
 * Called once, after load and before the first render, so nothing flashes
 * grey. Materials are cloned per mesh because the source material is
 * shared; the clones are disposed with the scene like any other material.
 */
const applyAppearance = (character: THREE.Object3D) => {
  const matched = new Set<string>();

  character.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;

    const spec = COLOURS_BY_RUNTIME_NAME.get(mesh.name);
    if (!spec) return;
    // Multi-material meshes aren't in the table; skip rather than guess.
    if (Array.isArray(mesh.material)) return;

    const material = mesh.material as THREE.MeshStandardMaterial;
    if (!material || !("color" in material)) return;

    const recoloured = material.clone() as THREE.MeshStandardMaterial;
    // The GLB's colours are already linear; setStyle's default sRGB
    // conversion is what we want for hex values authored by eye.
    recoloured.color.set(spec.color);
    recoloured.roughness = spec.roughness;
    mesh.material = recoloured;
    matched.add(mesh.name);
  });

  /* A key that matches nothing fails silently — the mesh just keeps its
     grey and the page looks finished. That is exactly how the dotted names
     above shipped unnoticed, so make it loud in dev. */
  if (import.meta.env.DEV) {
    const missed = [...COLOURS_BY_RUNTIME_NAME.keys()].filter((name) => !matched.has(name));
    if (missed.length) {
      const present: string[] = [];
      character.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) present.push(child.name);
      });
      console.warn(
        "[character] these colour keys matched no mesh:",
        missed,
        "\nmeshes actually in the scene:",
        present
      );
    }
  }
};

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      let blobUrl: string | undefined;
      try {
        const encryptedBlob = await decryptFile(
          "/models/character.enc",
          "Character3D#@"
        );
        blobUrl = URL.createObjectURL(new Blob([encryptedBlob]));

        let character: THREE.Object3D;
        loader.load(
          blobUrl,
          async (gltf) => {
            character = gltf.scene;

            /* Recolour BEFORE compileAsync, so the shaders that get
               compiled are the ones actually rendered. Doing it after
               forces a second compile on the first frame. */
            applyAppearance(character);

            await renderer.compileAsync(character, camera, scene);
            character.traverse((child: any) => {
              if (child.isMesh) {
                const mesh = child as THREE.Mesh;
                child.castShadow = false;
                child.receiveShadow = false;
                mesh.frustumCulled = true;
                if (mesh.material && !Array.isArray(mesh.material)) {
                  (mesh.material as THREE.ShaderMaterial).precision = 'mediump';
                }
              }
            });
            resolve(gltf);
            setCharTimeline(character, camera);
            setAllTimeline();
            character!.getObjectByName("footR")!.position.y = 3.36;
            character!.getObjectByName("footL")!.position.y = 3.36;
            dracoLoader.dispose();
            /* The decrypted 1.5 MB blob is held in memory for the life of
               the page unless it is revoked. The parser is done with it. */
            if (blobUrl) URL.revokeObjectURL(blobUrl);
          },
          undefined,
          (error) => {
            console.error("Error loading GLTF model:", error);
            if (blobUrl) URL.revokeObjectURL(blobUrl);
            reject(error);
          }
        );
      } catch (err) {
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        reject(err);
        console.error(err);
      }
    });
  };

  return { loadCharacter };
};

export default setCharacter;
