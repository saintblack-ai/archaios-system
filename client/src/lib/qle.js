const FACTOR_KEYS = ["vision", "knowledge", "action", "ethics", "noise", "resistance"];
const POSITIVE_KEYS = ["vision", "knowledge", "action", "ethics"];
const LIMITING_KEYS = ["noise", "resistance"];

function clamp01(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export function normalizeQleInputs(input = {}) {
  return FACTOR_KEYS.reduce((acc, key) => {
    acc[key] = clamp01(input[key]);
    return acc;
  }, {});
}

export function calculateQle(input = {}) {
  const values = normalizeQleInputs(input);
  const numerator = values.vision * values.knowledge * values.action * values.ethics;
  const denominator = 1 + values.noise + values.resistance;
  const light = numerator / denominator;

  const strongestPositive = POSITIVE_KEYS.reduce((best, key) =>
    values[key] > values[best] ? key : best
  , POSITIVE_KEYS[0]);

  const weakestPositive = POSITIVE_KEYS.reduce((worst, key) =>
    values[key] < values[worst] ? key : worst
  , POSITIVE_KEYS[0]);

  const strongestLimiter = LIMITING_KEYS.reduce((worst, key) =>
    values[key] > values[worst] ? key : worst
  , LIMITING_KEYS[0]);

  return {
    id: "QLE-001",
    name: "The Quandrix Light Equation",
    values,
    light,
    lightIndex: light * 100,
    strongestPositive,
    weakestPositive,
    strongestLimiter,
    interpretation: "Archaios conceptual/system metric; not a measure of human worth or a law of physics."
  };
}

export function getQleRecommendation(result) {
  const qle = result?.values ? result : calculateQle(result);
  const weakest = qle.weakestPositive;
  const limiter = qle.strongestLimiter;

  if (qle.values[limiter] >= 0.5) {
    return `Reduce ${limiter} before adding complexity; it is the strongest limiting factor.`;
  }

  return `Strengthen ${weakest}; it is the lowest constructive factor in the current QLE-001 profile.`;
}
