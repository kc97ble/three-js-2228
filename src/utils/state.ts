import * as Ʒ from "three";

const diceAngularVelocity_terminalMagnitude = 2 * Math.PI;

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
    diceAngularAcceleration: new Ʒ.Vector3(0, 0, 1),
  };
}

function fromScaledAxisRepresentation(vec: Ʒ.Vector3): Ʒ.Quaternion {
  const angle = vec.length();
  const axis = vec.clone().normalize();
  return new Ʒ.Quaternion().setFromAxisAngle(axis, angle);
}

export function advanceState(state: State, time: number) {
  if (state.time === undefined) {
    state.time = time;
    return;
  }

  const deltaTime = time - state.time;
  const frictionScalar = Math.max(
    1 -
      state.diceAngularVelocity.lengthSq() /
        diceAngularVelocity_terminalMagnitude ** 2,
    0
  );
  state.diceOrientation.multiply(
    fromScaledAxisRepresentation(
      state.diceAngularVelocity.clone().multiplyScalar(deltaTime)
    )
  );
  state.diceAngularVelocity.addScaledVector(
    state.diceAngularAcceleration,
    frictionScalar * deltaTime
  );
  state.time = time;
}
