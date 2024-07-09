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

let windCount = 0;

function startWind() {
  windCount += 1;
  state.windEnabled = windCount > 0;
}

function stopWind() {
  windCount -= 1;
  state.windEnabled = windCount > 0;
}

window.addEventListener("mousedown", startWind);
window.addEventListener("mouseup", stopWind);

window.addEventListener("touchstart", () => {
  setTimeout(() => startWind(), 0);
  setTimeout(() => stopWind(), 2000);
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
