// Cue points for the bundled 12-second gesture: contact at 6s, withdrawal
// from 7s, fully separated by 11.5s. Both sides of the loop remain fully open.
export const HANDS_OPENING_PROGRESS = 0.5;

function smoothstep(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

export function getHeroReveal(progress: number) {
  if (progress < HANDS_OPENING_PROGRESS) {
    return 1 - smoothstep((progress - 0.5 / 12) / (3.5 / 12));
  }
  return smoothstep((progress - 7 / 12) / (4.5 / 12));
}
