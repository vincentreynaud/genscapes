import { random, round } from "lodash";

export function calcMin(value: number, randomisation: number): number {
  return round(value - randomisation * value, 2);
}
export function calcMax(value: number, randomisation: number): number {
  return round(value + randomisation * value, 2);
}

export function getAndFormatRandom(min: number, max: number): number {
  return round(random(min, max, true), 2);
}

export function calcRandom(value: number, randAmount: number) {
  const min = calcMin(value, randAmount);
  const max = calcMax(value, randAmount);
  return getAndFormatRandom(min, max);
}
