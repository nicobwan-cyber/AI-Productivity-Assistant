export type QualityScore = {
  overall: number;
  clarity: number;
  tone: number;
  completeness: number;
  actionability: number;
  suggestions: string[];
};

// Lightweight heuristic scoring — deterministic, no API call.
export function scoreOutput(text: string): QualityScore {
  const t = text.trim();
  const words = t.split(/\s+/).filter(Boolean);
  const sentences = t.split(/[.!?]+\s/).filter((s) => s.trim().length > 0);
  const wc = words.length;
  const avgSentLen = wc / Math.max(1, sentences.length);
  const hasStructure = /(^|\n)\s*(#{1,3}|[-*•]|\d+\.)\s/.test(t);
  const hasActions = /(will|next steps|action items?|owner|deadline|todo|by\s+\w+day)/i.test(t);
  const hasGreeting = /(hi|hello|dear|hey|team)\b/i.test(t.slice(0, 80));
  const exclam = (t.match(/!/g) || []).length;
  const allCaps = (t.match(/\b[A-Z]{4,}\b/g) || []).length;

  // Clarity: penalize very long sentences
  const clarity = clamp(
    100 - Math.max(0, avgSentLen - 22) * 3 - (avgSentLen < 6 ? 10 : 0),
    30,
    100,
  );
  // Tone: penalize exclamations and shouting
  const tone = clamp(95 - exclam * 6 - allCaps * 8 + (hasGreeting ? 5 : 0), 30, 100);
  // Completeness: reward word count up to 220
  const completeness = clamp(40 + Math.min(60, Math.round((wc / 220) * 60)), 30, 100);
  // Actionability: structure + action language
  const actionability = clamp(
    50 + (hasStructure ? 25 : 0) + (hasActions ? 25 : 0),
    30,
    100,
  );

  const overall = Math.round((clarity + tone + completeness + actionability) / 4);

  const suggestions: string[] = [];
  if (avgSentLen > 24) suggestions.push("Shorten long sentences to improve readability.");
  if (wc < 60) suggestions.push("Add more context or examples to feel more complete.");
  if (!hasStructure) suggestions.push("Use bullet points or short paragraphs to scan faster.");
  if (!hasActions) suggestions.push("Make next steps and owners explicit.");
  if (exclam > 1) suggestions.push("Reduce exclamation marks for a more professional tone.");
  if (allCaps > 0) suggestions.push("Avoid ALL-CAPS words — they read as shouting.");
  if (!suggestions.length) suggestions.push("Looks great — review facts before sending.");

  return { overall, clarity, tone, completeness, actionability, suggestions };
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}
