import * as Ʒ from "three";
import { State } from "./state";
import matcapPorcelainWhite from "../matcaps/porcelain-white.jpg";
import { CSG } from "three-csg-ts";

type World = {
  dice: Ʒ.Object3D;
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
  let dice: Ʒ.Mesh = cube;

  const sphere = new Ʒ.Mesh(new Ʒ.SphereGeometry(0.7, 32, 32));
  dice = CSG.intersect(dice, sphere);

  const cylinderY = new Ʒ.Mesh(new Ʒ.CylinderGeometry(0.64, 0.64, 1));
  dice = CSG.intersect(dice, cylinderY);

  const cylinderZ = new Ʒ.Mesh(new Ʒ.CylinderGeometry(0.64, 0.64, 1));
  cylinderZ.rotateX(0.5 * Math.PI).updateMatrix();
  dice = CSG.intersect(dice, cylinderZ);

  const cylinderX = new Ʒ.Mesh(new Ʒ.CylinderGeometry(0.64, 0.64, 1));
  cylinderX.rotateZ(0.5 * Math.PI).updateMatrix();
  dice = CSG.intersect(dice, cylinderX);

  dice.setRotationFromQuaternion(state.diceOrientation);
  scene.add(dice);

  const face1 = createFace([[0, 0]], {
    color: 0x990011,
    radius: 0.2,
    scale: 1,
  });
  face1.position.set(0, 0, 0.5001);
  dice.add(face1);

  const face2 = createFace(
    [
      [0, -0.5],
      [0, +0.5],
    ],
    { color: 0x150e06, radius: 0.15, scale: 0.35 }
  );
  face2.position.set(0, -0.5001, 0);
  face2.rotateX(0.5 * Math.PI);
  dice.add(face2);

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
  dice.add(face3);

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
  dice.add(face4);

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
  dice.add(face5);

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
  dice.add(face6);

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

  return { scene, dice };
}

export function updateWorld(world: World, state: State) {
  world.dice.quaternion.copy(state.diceOrientation);
}
