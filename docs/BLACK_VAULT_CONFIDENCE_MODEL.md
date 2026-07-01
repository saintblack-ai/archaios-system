# Black Vault Confidence Model

## Purpose

Confidence measures support for a claim given its evidence; it does not measure importance, popularity, spiritual meaning, or certainty of an author. Score individual claims when possible and do not let a high-confidence minor fact imply confidence in a broader interpretation.

## Score bands

| Score | Band | Meaning |
| --- | --- | --- |
| 90–100 | established | Strong, direct, independently corroborated evidence; limitations remain documented. |
| 75–89 | well supported | Reliable evidence supports the claim, with limited material uncertainty. |
| 50–74 | plausible | Some credible support, but gaps, ambiguity, or competing explanations remain. |
| 25–49 | speculative | Limited, indirect, disputed, or low-quality support; retain as a hypothesis or lead. |
| 0–24 | unsupported | No reliable support located, or evidence materially contradicts the claim. |

`unknown` is allowed when evidence has not yet been assessed. It is not equivalent to 0.

## Scoring rules

Begin at 50 only after at least one traceable source is recorded. Adjust using documented judgment rather than false precision:

- increase for direct primary evidence, independent corroboration, sound provenance, methodological quality, and successful reproduction/verification where applicable;
- decrease for source anonymity, circular citation, translation uncertainty, missing context, conflicts of interest, anachronism, weak chain of custody, and credible contradictory evidence;
- cap at 49 when the central evidence is unverified, singular, or materially disputed;
- cap at 74 for a forecast, metaphysical assertion, or interpretive synthesis unless its underlying limited claim—not the broader conclusion—has stronger corroboration;
- reduce or reassess a score when new evidence arrives. Preserve the previous score, rationale, reviewer, and date in the canonical record.

Scores require a short `confidence_rationale` naming the key evidence, limitations, and counterevidence. Do not calculate or display a score without that rationale.

## Confidence and research status

- `collecting` and `analyzing` records may use any score or `unknown`.
- `review` requires a rationale and source check.
- `published` requires explicit uncertainty language for scores below 75 and must preserve material disputes at every score.
- `archived` scores remain historical assessments until a reviewed update changes them.

## Presentation conventions

Use calibrated language: “documented” (90+), “well supported” (75–89), “plausible” (50–74), “speculative” (25–49), and “unsupported by reliable evidence located” (0–24). Do not use certainty language such as “proven” for claims whose evidence does not justify it.

For a future ARCHIVIST integration, every generated synthesis must carry the source citations, classification constraints, score/band, rationale, and explicit distinction between facts, interpretations, and open questions.
