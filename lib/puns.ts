// Loading-screen pun bank — football × git. Pure data + a deterministic
// rotation helper so the loading screen stays lively without randomness.
export const PUNS: readonly string[] = [
  "Counting your subs (Super-Sub Impact)…",
  "Calculating your xG (eXpected Greatness)…",
  "Checking VAR (Video Assistant Rater)…",
  "Counting clean sheets (zero-dislike uploads)…",
  "Reviewing the tape (your upload history)…",
  "Assessing first touch (thumbnail CTR)…",
  "Timing your sprints (upload schedule)…",
  "Rating your set pieces (collab videos)…",
  "Weighing your transfer fee (channel value)…",
  "Inspecting your stamina (upload streak)…",
  "Reading your through-balls (reach & impressions)…",
  "Grading your work rate (uploads per week)…",
];

// Stable line for a given tick — callers advance `tick` on an interval.
export function punAt(tick: number): string {
  return PUNS[((tick % PUNS.length) + PUNS.length) % PUNS.length];
}
