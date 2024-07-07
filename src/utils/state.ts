import * as Ʒ from "three";

const DAMPER_COEF = 0.25;
const MAGNET_COEF = 0.5;

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

// const MAGNET_PULL_VERTICES = [
//   new Ʒ.Vector3(-0.7, -0.7, -0.7),
//   new Ʒ.Vector3(+0.7, -0.7, -0.7),
//   new Ʒ.Vector3(+0.7, +0.7, -0.7),
//   new Ʒ.Vector3(-0.7, +0.7, -0.7),
//   // new Ʒ.Vector3(-0.7, -0.7, +0.7),
//   // new Ʒ.Vector3(+0.7, -0.7, +0.7),
//   // new Ʒ.Vector3(+0.7, +0.7, +0.7),
//   // new Ʒ.Vector3(-0.7, +0.7, +0.7),
// ];

// const MAGNET_PUSH_VERTICES = [
//   new Ʒ.Vector3(0, -1, -0.7),
//   new Ʒ.Vector3(0, +1, -0.7),
//   new Ʒ.Vector3(-1, 0, -0.7),
//   new Ʒ.Vector3(+1, 0, -0.7),
//   // new Ʒ.Vector3(-0.7, -0.7, +0.7),
//   // new Ʒ.Vector3(+0.7, -0.7, +0.7),
//   // new Ʒ.Vector3(+0.7, +0.7, +0.7),
//   // new Ʒ.Vector3(-0.7, +0.7, +0.7),
// ];

export type State = {
  time: number | undefined;
  diceOrientation: Ʒ.Quaternion;
  diceAngularVelocity: Ʒ.Vector3;
  diceAngularAcceleration: Ʒ.Vector3;
};

export function createState(): State {
  return {
    time: undefined,
    diceOrientation: new Ʒ.Quaternion(),
    diceAngularVelocity: new Ʒ.Vector3(),
    diceAngularAcceleration: new Ʒ.Vector3(),
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

export function advanceState(state: State, time: number) {
  if (state.time === undefined) {
    state.time = time;
    return;
  }

  const deltaTime = time - state.time;

  state.diceAngularVelocity.addScaledVector(
    state.diceAngularAcceleration,
    deltaTime
  );

  // {
  //   const totalAngularAcceleration = new Ʒ.Vector3(0, 0, 0);

  //   for (const vertex of UNIT_CUBE_VERTICES) {
  //     for (const magnet of MAGNET_PULL_VERTICES) {
  //       const actualVertex = vertex
  //         .clone()
  //         .applyQuaternion(state.diceOrientation);
  //       const force = magnet.clone().sub(actualVertex);
  //       force.setLength(MAGNET_COEF / force.lengthSq());
  //       totalAngularAcceleration.add(actualVertex.clone().cross(force));
  //     }
  //   }

  //   for (const vertex of UNIT_CUBE_VERTICES) {
  //     for (const magnet of MAGNET_PUSH_VERTICES) {
  //       const actualVertex = vertex
  //         .clone()
  //         .applyQuaternion(state.diceOrientation);
  //       const force = magnet.clone().sub(actualVertex);
  //       force.setLength(MAGNET_COEF / force.lengthSq());
  //       totalAngularAcceleration.sub(actualVertex.clone().cross(force));
  //     }
  //   }

  //   state.diceAngularVelocity.addScaledVector(
  //     totalAngularAcceleration,
  //     deltaTime
  //   );
  // }

  const SPRING_COEF = 30.0;
  const totalAngularAcceleration = new Ʒ.Vector3();
  for (const vertex of UNIT_CUBE_VERTICES) {
    const actualVertex = vertex.clone().applyQuaternion(state.diceOrientation);
    if (actualVertex.z < -0.5) {
      const displacement = -0.5 - actualVertex.z;
      const force = new Ʒ.Vector3(0, 0, displacement * SPRING_COEF);
      totalAngularAcceleration.add(actualVertex.clone().cross(force));
      console.log(
        "totalAngularAcceleration += ",
        actualVertex.clone().cross(force)
      );
    }
  }
  state.diceAngularVelocity.addScaledVector(
    totalAngularAcceleration,
    deltaTime
  );
  console.log("totalAngularAcceleration = ", totalAngularAcceleration);
  console.log("state.diceAngularVelocity = ", state.diceAngularVelocity);

  state.diceAngularVelocity.setLength(
    state.diceAngularVelocity.length() * DAMPER_COEF ** deltaTime
  );

  // state.diceOrientation.premultiply(
  //   fromScaledAxisRepresentation(
  //     state.diceAngularVelocity.clone().multiplyScalar(deltaTime)
  //   )
  // );
  // state.diceOrientation.normalize();

  rotateByVector(state.diceOrientation, state.diceAngularVelocity, deltaTime);

  // const q0 = state.diceOrientation.clone();
  // const d = new Ʒ.Quaternion(
  //   state.diceAngularVelocity.x * 0.5 * deltaTime,
  //   state.diceAngularVelocity.y * 0.5 * deltaTime,
  //   state.diceAngularVelocity.z * 0.5 * deltaTime,
  //   0
  // ).multiply(q0);

  // q0.x += d.x;
  // q0.y += d.y;
  // q0.z += d.z;
  // q0.w += d.w;

  // q0.normalize();
  // state.diceOrientation.copy(q0);

  console.log(
    UNIT_CUBE_VERTICES.map((v) =>
      v
        .clone()
        .applyQuaternion(state.diceOrientation)
        .toArray()
        .map((x) => x.toFixed(2))
        .join(":")
    )
  );

  state.time = time;
}
