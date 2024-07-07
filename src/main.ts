import * as Ʒ from "three";
import "./style.css";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { createRenderer } from "./utils/renderer";
import { createWorld, updateWorld } from "./utils/world";
import { createState, advanceState } from "./utils/state";

const aspect = 5 / 4;

const canvas = document.querySelector("#canvas");
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("canvas not found");
}

const renderer = createRenderer(canvas, aspect);

const camera = new Ʒ.PerspectiveCamera(75, aspect, 0.1, 1000);
camera.position.z = 5;

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

const state = createState();
const world = createWorld(state);

window.addEventListener("mousedown", () => {
  // state.diceOrientation.setFromAxisAngle(
  //   new Ʒ.Vector3(0, 1, 0).normalize(),
  //   Math.random() * 10 - 5
  // );
  // state.diceAngularVelocity.set(0, 0, 0);
  // state.diceAngularAcceleration.set(0, 0, 0);
  state.diceAngularAcceleration.randomDirection().multiplyScalar(10);
  console.log(state.diceAngularAcceleration);
});

window.addEventListener("mouseup", () => {
  state.diceAngularAcceleration.set(0, 0, 0);
  console.log(state.diceAngularAcceleration);
});

// setInterval(() => {
//   advanceState(state, Date.now() / 10000);
//   updateWorld(world, state);
//   renderer.render(world.scene, camera);
// }, 1000);

renderer.setAnimationLoop((time) => {
  advanceState(state, time / 1000);
  updateWorld(world, state);
  renderer.render(world.scene, camera);
});
