import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { eyebrowBoneNames, typingBoneNames } from "../../../data/boneData";

/**
 * @param reduced under prefers-reduced-motion the perpetual clips are never
 *   started: the keyboard keys, the typing hands and the blink all loop forever
 *   with no way to pause them, which is exactly what WCAG 2.2.2 is about. The
 *   one-shot intro still plays — it is under five seconds, and it is what leaves
 *   the rig in its seated pose. Skipping it too would strand the character in
 *   its authored rest pose, which reads as a broken model rather than a
 *   respected preference.
 */
const setAnimations = (gltf: GLTF, reduced = false) => {
  let character = gltf.scene;
  let mixer = new THREE.AnimationMixer(character);
  if (gltf.animations) {
    const introClip = gltf.animations.find(
      (clip) => clip.name === "introAnimation"
    );
    const introAction = mixer.clipAction(introClip!);
    introAction.setLoop(THREE.LoopOnce, 1);
    introAction.clampWhenFinished = true;
    introAction.play();
    if (!reduced) {
      const clipNames = ["key1", "key2", "key5", "key6"];
      clipNames.forEach((name) => {
        const clip = THREE.AnimationClip.findByName(gltf.animations, name);
        if (clip) {
          const action = mixer?.clipAction(clip);
          action!.play();
          action!.timeScale = 1.2;
        } else {
          console.error(`Animation "${name}" not found`);
        }
      });
      let typingAction: THREE.AnimationAction | null = null;
      typingAction = createBoneAction(gltf, mixer, "typing", typingBoneNames);
      if (typingAction) {
        typingAction.enabled = true;
        typingAction.play();
        typingAction.timeScale = 1.2;
      }
    }
  }
  function startIntro() {
    const introClip = gltf.animations.find(
      (clip) => clip.name === "introAnimation"
    );
    const introAction = mixer.clipAction(introClip!);
    introAction.clampWhenFinished = true;
    introAction.reset().play();
    if (reduced) return;
    setTimeout(() => {
      const blink = gltf.animations.find((clip) => clip.name === "Blink");
      mixer.clipAction(blink!).play().fadeIn(0.5);
    }, 2500);
  }
  function hover(gltf: GLTF, hoverDiv: HTMLDivElement) {
    let eyeBrowUpAction = createBoneAction(
      gltf,
      mixer,
      "browup",
      eyebrowBoneNames
    );
    let isHovering = false;
    if (eyeBrowUpAction) {
      eyeBrowUpAction.setLoop(THREE.LoopOnce, 1);
      eyeBrowUpAction.clampWhenFinished = true;
      eyeBrowUpAction.enabled = true;
    }
    const onHoverFace = () => {
      if (eyeBrowUpAction && !isHovering) {
        isHovering = true;
        eyeBrowUpAction.reset();
        eyeBrowUpAction.enabled = true;
        eyeBrowUpAction.setEffectiveWeight(4);
        eyeBrowUpAction.fadeIn(0.5).play();
      }
    };
    const onLeaveFace = () => {
      if (eyeBrowUpAction && isHovering) {
        isHovering = false;
        eyeBrowUpAction.fadeOut(0.6);
      }
    };
    if (!hoverDiv) return;
    hoverDiv.addEventListener("mouseenter", onHoverFace);
    hoverDiv.addEventListener("mouseleave", onLeaveFace);
    return () => {
      hoverDiv.removeEventListener("mouseenter", onHoverFace);
      hoverDiv.removeEventListener("mouseleave", onLeaveFace);
    };
  }
  return { mixer, startIntro, hover };
};

const createBoneAction = (
  gltf: GLTF,
  mixer: THREE.AnimationMixer,
  clip: string,
  boneNames: string[]
): THREE.AnimationAction | null => {
  const AnimationClip = THREE.AnimationClip.findByName(gltf.animations, clip);
  if (!AnimationClip) {
    console.error(`Animation "${clip}" not found in GLTF file.`);
    return null;
  }

  const filteredClip = filterAnimationTracks(AnimationClip, boneNames);

  return mixer.clipAction(filteredClip);
};

const filterAnimationTracks = (
  clip: THREE.AnimationClip,
  boneNames: string[]
): THREE.AnimationClip => {
  const filteredTracks = clip.tracks.filter((track) =>
    boneNames.some((boneName) => track.name.includes(boneName))
  );

  return new THREE.AnimationClip(
    clip.name + "_filtered",
    clip.duration,
    filteredTracks
  );
};

export default setAnimations;
