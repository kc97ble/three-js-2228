import * as Ʒ from "three";
import { State } from "./state";
import matcap from "../matcaps/DFDFD6_58544E_81766A_989288-256px.png";

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

function apply(
  unary: (point: Ʒ.Vector3Tuple) => Ʒ.Vector3Tuple,
  geom: Ʒ.BufferGeometry
) {
  const p = geom.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const [x0, y0, z0] = [p.getX(i), p.getY(i), p.getZ(i)];
    const [x1, y1, z1] = unary([x0, y0, z0]);
    p.setXYZ(i, x1, y1, z1);
  }
  p.needsUpdate = true;
}

function getInflatedSphereGeometry(r: number) {
  const getR = (x: number, y: number, z: number) => {
    const p = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
    const boxR = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
    const sphereR = Math.sqrt(x ** 2 + y ** 2 + z ** 2) * 0.75;
    if (p >= 0.78) {
      return boxR;
    } else if (p <= 0.75) {
      return sphereR;
    } else {
      const t = (p - 0.75) / (0.78 - 0.75);
      return t * boxR + (1 - t) * sphereR;
    }
  };

  const sphereGeometry = new Ʒ.SphereGeometry(1, 256, 256);
  apply(([x, y, z]) => {
    const R = getR(x, y, z);
    return [(x / R) * r, (y / R) * r, (z / R) * r];
  }, sphereGeometry);
  return sphereGeometry;
}

export function createWorld(state: State): World {
  const textureLoader = new Ʒ.TextureLoader();
  const scene = new Ʒ.Scene();

  const sphereGeometry = getInflatedSphereGeometry(0.5);
  const diceMaterial = new Ʒ.MeshMatcapMaterial({
    matcap: textureLoader.load(matcap),
  });
  const dice = new Ʒ.Mesh(sphereGeometry, diceMaterial);

  dice.setRotationFromQuaternion(state.diceOrientation);
  scene.add(dice);

  const face1 = createFace([[0, 0]], {
    color: 0x990011,
    radius: 0.2,
    scale: 1,
  });
  face1.position.set(0, 0, 0.501);
  dice.add(face1);

  const face2 = createFace(
    [
      [0, -0.5],
      [0, +0.5],
    ],
    { color: 0x150e06, radius: 0.1, scale: 0.35 }
  );
  face2.position.set(0, -0.501, 0);
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
  face3.position.set(0.501, 0, 0);
  face3.rotateY(0.5 * Math.PI);
  dice.add(face3);

  const face4 = createFace(
    [
      [-1, -1],
      [-1, +1],
      [+1, +1],
      [+1, -1],
    ],
    { color: 0x990011, radius: 0.1, scale: 0.15 }
  );
  face4.position.set(-0.501, 0, 0);
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
  face5.position.set(0, 0.501, 0);
  face5.rotateX(-0.5 * Math.PI);
  dice.add(face5);

  const face6 = createFace(
    [
      [-0.7, -1],
      [-0.7, 0],
      [-0.7, +1],
      [+0.7, -1],
      [+0.7, 0],
      [+0.7, +1],
    ],
    { color: 0x150e06, radius: 0.1, scale: 0.225 }
  );
  face6.position.set(0, 0, -0.501);
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
