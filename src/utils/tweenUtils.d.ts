export interface Tween {
  object: any;
  property: string;
  propertyBeginValue: number;
  target: number;
  easing: (t: number) => number;
  time: number;
  change: ((t: Tween) => void) | null;
  complete: ((t: Tween) => void) | null;
  start: number;
}

export function tweenTo(
  object: any,
  property: string,
  target: number,
  time: number,
  easing: (t: number) => number,
  onchange: ((t: Tween) => void) | null,
  oncomplete: ((t: Tween) => void) | null
): Tween;

export function updateTweens(now: number): void;

export function backout(amount: number): (t: number) => number;