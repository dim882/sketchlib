export type PseudoRandomNumberGenerator = () => number;

export const getFloat = (generateNumber: PseudoRandomNumberGenerator, lower: number = 0, upper: number = 1) => {
  return (upper - lower) * generateNumber() + lower;
};

export const getInteger = (generateNumber: PseudoRandomNumberGenerator, lower: number = 0, upper: number = 1) => {
  return Math.floor(getFloat(generateNumber, lower, upper));
};

export const getBoolean = (generateNumber: PseudoRandomNumberGenerator, probabilityTrue: number = 0.5) => {
  return generateNumber() < probabilityTrue;
};

type PRNG = () => number;

export const createPRNG = (seed: number): PRNG => {
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;

  let state = seed;

  const prng: PRNG = () => {
    state = (a * state + c) % m;
    return state / m;
  };

  return prng;
};
