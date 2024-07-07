import * as Ʒ from "three";
import { State } from "./state";

type World = {
  cube: Ʒ.Object3D;
  scene: Ʒ.Scene;
};

export function createWorld(state: State): World {
  const cube_geometry = new Ʒ.BoxGeometry(1, 1, 1);
  const cube_material = new Ʒ.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new Ʒ.Mesh(cube_geometry, cube_material);
  cube.setRotationFromQuaternion(state.diceOrientation);

  const axesHelper = new Ʒ.AxesHelper(5);

  const scene = new Ʒ.Scene();
  scene.add(cube);
  scene.add(axesHelper);

  return { scene, cube };
}

export function updateWorld(world: World, state: State) {
  world.cube.quaternion.copy(state.diceOrientation);
}
