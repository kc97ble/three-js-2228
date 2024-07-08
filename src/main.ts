import { OrbitControls } from "three/examples/jsm/Addons.js";
import * as Ʒ from "three";
import "./style.css";
import { createRenderer } from "./utils/renderer";
import { createWorld, updateWorld } from "./utils/world";
import { createState, advanceState } from "./utils/state";

const aspect = 2 / 3;

const canvas = document.querySelector("#canvas");
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("canvas not found");
}

const renderer = createRenderer(canvas, aspect);

const camera = new Ʒ.PerspectiveCamera(25, aspect, 0.1, 1000);
camera.position.z = 10;

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableRotate = false;
orbit.mouseButtons.LEFT = Ʒ.MOUSE.PAN;
orbit.update();

const state = createState();
state.diceAngularVelocity.randomDirection().multiplyScalar(50);
const world = createWorld(state);

let numTouches = 0;

function updateDiceAngularAcceleration() {
  if (numTouches > 0) {
    state.diceAngularAcceleration.randomDirection().multiplyScalar(30);
  } else {
    state.diceAngularAcceleration.set(0, 0, 0);
  }
}

window.addEventListener("mousedown", () => {
  numTouches += 1;
  updateDiceAngularAcceleration();
});

window.addEventListener("mouseup", () => {
  numTouches -= 1;
  updateDiceAngularAcceleration();
});

window.addEventListener("touchstart", () => {
  numTouches += 1;
  updateDiceAngularAcceleration();
  setTimeout(() => {
    numTouches -= 1;
    updateDiceAngularAcceleration();
  }, 2000);
});

let now: DOMHighResTimeStamp | undefined = undefined;

renderer.setAnimationLoop((time) => {
  if (now === undefined) {
    now = time;
  } else {
    advanceState(state, Math.min(time - now, 250) / 1000);
    now = time;
  }

  updateWorld(world, state);
  renderer.render(world.scene, camera);
});
