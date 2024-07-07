import * as Ʒ from "three";
import { State } from "./state";
import matcapPorcelainWhite from "../matcaps/porcelain-white.jpg";

type World = {
  cube: Ʒ.Object3D;
  scene: Ʒ.Scene;
};

function createFace(
  positions: Ʒ.Vector2Tuple[],
  {
    color,
    radius,
    scale,
  }: { color: Ʒ.ColorRepresentation; radius: number; scale: number }
) {
  const group = new Ʒ.Group();

  for (const [x, y] of positions) {
    const dotGeometry = new Ʒ.CircleGeometry(radius, 32);
    const dotMaterial = new Ʒ.MeshPhongMaterial({ color });
    const dot = new Ʒ.Mesh(dotGeometry, dotMaterial);
    dot.position.set(x * scale, y * scale, 0);
    group.add(dot);
  }

  return group;
}

export function createWorld(state: State): World {
  const textureLoader = new Ʒ.TextureLoader();

  const scene = new Ʒ.Scene();
  scene.background = new Ʒ.Color(0xffffff);

  const cubeGeometry = new Ʒ.BoxGeometry(1, 1, 1);
  const cubeMaterial = new Ʒ.MeshMatcapMaterial({
    matcap: textureLoader.load(matcapPorcelainWhite),
  });
  const cube = new Ʒ.Mesh(cubeGeometry, cubeMaterial);
  cube.setRotationFromQuaternion(state.diceOrientation);
  scene.add(cube);

  const face1 = createFace([[0, 0]], {
    color: 0x990011,
    radius: 0.2,
    scale: 1,
  });
  face1.position.set(0, 0, 0.5001);
  cube.add(face1);

  const face2 = createFace(
    [
      [0, -0.5],
      [0, +0.5],
    ],
    { color: 0x150e06, radius: 0.15, scale: 0.35 }
  );
  face2.position.set(0, -0.5001, 0);
  face2.rotateX(0.5 * Math.PI);
  cube.add(face2);

  const face3 = createFace(
    [
      [-1, -1],
      [0, 0],
      [+1, +1],
    ],
    { color: 0x150e06, radius: 0.1, scale: 0.18 }
  );
  face3.position.set(0.5001, 0, 0);
  face3.rotateY(0.5 * Math.PI);
  cube.add(face3);

  const face4 = createFace(
    [
      [-1, -1],
      [-1, +1],
      [+1, +1],
      [+1, -1],
    ],
    { color: 0x990011, radius: 0.125, scale: 0.15 }
  );
  face4.position.set(-0.5001, 0, 0);
  face4.rotateY(-0.5 * Math.PI);
  cube.add(face4);

  const face5 = createFace(
    [
      [-1, -1],
      [-1, +1],
      [0, 0],
      [+1, +1],
      [+1, -1],
    ],
    { color: 0x150e06, radius: 0.1, scale: 0.18 }
  );
  face5.position.set(0, 0.5001, 0);
  face5.rotateX(-0.5 * Math.PI);
  cube.add(face5);

  const face6 = createFace(
    [
      [-0.5, -1],
      [-0.5, 0],
      [-0.5, +1],
      [+0.5, -1],
      [+0.5, 0],
      [+0.5, +1],
    ],
    { color: 0x150e06, radius: 0.1, scale: 0.225 }
  );
  face6.position.set(0, 0, -0.5001);
  face6.rotateX(Math.PI);
  cube.add(face6);

  // const axesHelper = new Ʒ.AxesHelper(2);
  // scene.add(axesHelper);

  // const gridHelper = new Ʒ.GridHelper(2, 20);
  // gridHelper.rotateX(0.5 * Math.PI);
  // scene.add(gridHelper);

  const ambientLight = new Ʒ.AmbientLight(0xcccccc, 0.5);
  scene.add(ambientLight);

  const directionalLight = new Ʒ.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(0, 0, 1);
  scene.add(directionalLight);

  return { scene, cube };
}

export function updateWorld(world: World, state: State) {
  world.cube.quaternion.copy(state.diceOrientation);
}
