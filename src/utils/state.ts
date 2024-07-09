import * as Ʒ from "three";

const DAMPER_COEF = 0.15; // how much velocity remains after one second
const SPRING_COEF = 10.0; // how strong the springs are

const UNIT_CUBE_VERTICES = [
  new Ʒ.Vector3(-0.5, -0.5, -0.5),
  new Ʒ.Vector3(+0.5, -0.5, -0.5),
  new Ʒ.Vector3(+0.5, +0.5, -0.5),
  new Ʒ.Vector3(-0.5, +0.5, -0.5),
  new Ʒ.Vector3(-0.5, -0.5, +0.5),
  new Ʒ.Vector3(+0.5, -0.5, +0.5),
  new Ʒ.Vector3(+0.5, +0.5, +0.5),
  new Ʒ.Vector3(-0.5, +0.5, +0.5),
];

const CUSHIONS = [
  new Ʒ.Plane(new Ʒ.Vector3(+1, 0, 0), +0.5),
  new Ʒ.Plane(new Ʒ.Vector3(0, +1, 0), +0.5),
  new Ʒ.Plane(new Ʒ.Vector3(0, 0, +1), +0.5),
  new Ʒ.Plane(new Ʒ.Vector3(-1, 0, 0), +0.5),
  new Ʒ.Plane(new Ʒ.Vector3(0, -1, 0), +0.5),
  new Ʒ.Plane(new Ʒ.Vector3(0, 0, -1), +0.5),
];

export type State = {
  elapsedTime: number;
  diceOrientation: Ʒ.Quaternion;
  diceAngularVelocity: Ʒ.Vector3;
  windEnabled: boolean;
};

export function createState(): State {
  return {
    elapsedTime: 0,
    diceOrientation: new Ʒ.Quaternion(),
    diceAngularVelocity: new Ʒ.Vector3(),
    windEnabled: false,
  };
}

function rotateByVector(
  orientation: Ʒ.Quaternion,
  vector: Ʒ.Vector3,
  scale: number
) {
  const q = new Ʒ.Quaternion(
    vector.x * scale * 0.5,
    vector.y * scale * 0.5,
    vector.z * scale * 0.5,
    0
  ).multiply(orientation);

  orientation.x += q.x;
  orientation.y += q.y;
  orientation.z += q.z;
  orientation.w += q.w;

  orientation.normalize();
}

function generateRandomSineWave(n: number) {
  const ks = Array.from(Array(n), () => Math.random());

  return function (t: number) {
    return ks
      .map((k) => k * Math.sin(t / k + 2 * k * Math.PI))
      .reduce((a, b) => a + b, 0);
  };
}

function generateRandomWind() {
  const fx = generateRandomSineWave(8);
  const fy = generateRandomSineWave(8);
  const fz = generateRandomSineWave(8);
  return function (t: number) {
    return new Ʒ.Vector3(fx(t), fy(t), fz(t)).normalize();
  };
}

const wind = generateRandomWind();

export function advanceState(state: State, deltaTime: number) {
  // 1. Orientation
  rotateByVector(state.diceOrientation, state.diceAngularVelocity, deltaTime);

  // 2. Angular Velocity
  if (state.windEnabled) {
    state.diceAngularVelocity.addScaledVector(
      wind(state.elapsedTime).multiplyScalar(60),
      deltaTime
    );
  }

  state.diceAngularVelocity.setLength(
    state.diceAngularVelocity.length() * DAMPER_COEF ** deltaTime
  );

  // 3. Angular Acceleration
  const totalAngularAcceleration = new Ʒ.Vector3();
  for (const vertex of UNIT_CUBE_VERTICES) {
    const actualVertex = vertex.clone().applyQuaternion(state.diceOrientation);

    for (const cushion of CUSHIONS) {
      const displacement = cushion.distanceToPoint(actualVertex);
      if (displacement >= 0) continue;
      const force = cushion.normal
        .clone()
        .multiplyScalar(-displacement * SPRING_COEF);
      totalAngularAcceleration.add(actualVertex.clone().cross(force));
    }
  }

  state.diceAngularVelocity.addScaledVector(
    totalAngularAcceleration,
    deltaTime
  );

  // 4. Elapsed Time
  state.elapsedTime += deltaTime;
}
