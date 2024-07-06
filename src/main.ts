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

renderer.setAnimationLoop((time) => {
  advanceState(state, time / 1000);
  updateWorld(world, state);
  renderer.render(world.scene, camera);
});
