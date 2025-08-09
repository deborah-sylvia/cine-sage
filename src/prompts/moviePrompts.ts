import { Movie } from "../types/movie";

type RecStyle = "concise" | "detailed";
type NoveltyMix = "balanced" | "safer" | "spicier";

interface RecOptions {
  count?: number; // default 5
  style?: RecStyle; // default 'concise'
  novelty?: NoveltyMix; // default 'balanced'
  region?: string; // e.g., 'US', 'ID', 'UK' for availability note (optional)
  exclude?: string[]; // titles to exclude (seen or disliked)
  hardLimits?: {
    // optional content limits
    violence?: "low" | "ok";
    horror?: "none" | "ok";
    runtime?: { maxMinutes?: number };
    languages?: string[]; // preferred languages
    decades?: number[]; // preferred decades, e.g., [1990, 2000, 2010]
  };
}

const formatMovie = (m: Movie) =>
  `- ${m.title}${m.year ? ` (${m.year})` : ""}${
    m.genre ? ` — ${m.genre}` : ""
  }`;

export const generateRecPrompt = (
  selectedTitles: Movie[], // could be movies or series
  opts: RecOptions = {}
): string => {
  const {
    count = 5,
    style = "concise",
    novelty = "balanced",
    region,
    exclude = [],
    hardLimits,
  } = opts;

  const titleList = selectedTitles
    .map(
      (m) =>
        `- ${m.title}${m.year ? ` (${m.year})` : ""}${
          m.genre ? ` — ${m.genre}` : ""
        }`
    )
    .join("\n");

  const exclusions = exclude.length
    ? `\nDo NOT recommend: ${exclude.join(", ")}.`
    : "";

  const constraints = hardLimits
    ? `
  Constraints:
  ${hardLimits.violence ? `- Violence tolerance: ${hardLimits.violence}` : ""}
  ${hardLimits.horror ? `- Horror tolerance: ${hardLimits.horror}` : ""}
  ${
    hardLimits.runtime?.maxMinutes
      ? `- Max runtime: ${hardLimits.runtime.maxMinutes} minutes`
      : ""
  }
  ${
    hardLimits.languages?.length
      ? `- Preferred languages: ${hardLimits.languages.join(", ")}`
      : ""
  }
  ${
    hardLimits.decades?.length
      ? `- Preferred decades: ${hardLimits.decades.join(", ")}`
      : ""
  }`.trim()
    : "";

  const availability = region
    ? `If confidently known, add a short "Where to watch (${region})" note.`
    : `Skip availability unless you’re certain.`;

  const detailHint =
    style === "detailed"
      ? `Each explanation ~2 sentences, mentioning 1–2 craft specifics if relevant.`
      : `Use a single crisp sentence per pick.`;

  return `
  Analyze the user's taste from these liked titles (movies or series):
  
  ${titleList}
  
  Task:
  Recommend ${count} items — mix of movies and TV/streaming series — with **at least 2 being series**.
  Use a novelty mix = ${novelty}:
  - 3 Safe Bets
  - 1 Deep Cut
  - 1 Curveball
  
  ${detailHint}
  Tie each pick to specific liked titles and shared elements.
  Avoid spoilers. Be concrete, not generic. ${availability}${exclusions}
  ${constraints ? "\n" + constraints : ""}
  
  Output format (markdown list). For each item:
  
  - **Movie Title (Year)** [Movie|Series] — *[Safe Bet|Deep Cut|Curveball]*
    - Why you'll like it: <1–2 sentence rationale referencing liked titles>
    - Similar elements: <comma-separated themes/tones/craft>
    - Content note: <optional>
    ${region ? `- Where to watch (${region}): <optional>` : ""}
  
  End with:
  **If you want more like any single pick above, say "more like: <title>" and I'll expand.**
  `.trim();
};
