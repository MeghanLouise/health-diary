export const QUOTES = [
  'Healing isn\'t linear, and that\'s okay.',
  'Small steps still count as progress.',
  'You know your body better than anyone else.',
  'Rest is productive too.',
  'One rough day doesn\'t undo your progress.',
  'Be as kind to yourself as you would be to a friend.',
  'Tracking today helps future-you understand patterns.',
  'It\'s okay to not be okay today.',
  'Your feelings are valid, even on the hard days.',
  'Every flare-up passes, even when it doesn\'t feel like it.',
  'You\'re allowed to rest without justifying it.',
  'Progress can be quiet and invisible — it still counts.',
  'Listening to your body is a form of self-respect.',
  'You are doing the best you can with what you have today.',
  'Noticing a pattern is already a step toward feeling better.',
];

// Deterministic "quote of the day" so it only changes once per day.
export function quoteForDate(date: string): string {
  let hash = 0;
  for (let i = 0; i < date.length; i++) hash = (hash * 31 + date.charCodeAt(i)) | 0;
  return QUOTES[Math.abs(hash) % QUOTES.length];
}
