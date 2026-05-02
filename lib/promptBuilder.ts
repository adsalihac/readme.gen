import {
  DEFAULT_GENERATE_OPTIONS,
  type GenerateOptions,
  type GitHubData,
} from '@/types';

interface Prompts {
  bioPrompt: string;
  readmePrompt: string;
  skillsPrompt: string;
  sponsorPrompt: string;
}

function voiceInstruction(voice: GenerateOptions['voiceStyle']): string {
  if (voice === 'friendly') {
    return 'Tone: warm, approachable, and collaborative.';
  }

  if (voice === 'bold') {
    return 'Tone: high-conviction, ambitious, and direct while staying professional.';
  }

  return 'Tone: professional, credible, and concise.';
}

function sponsorNarrativeInstruction(
  narrative: GenerateOptions['sponsorNarrative']
): string {
  if (narrative === 'journey') {
    return 'Narrative arc: past -> present -> future trajectory of the maintainer journey.';
  }

  if (narrative === 'milestones') {
    return 'Narrative arc: concrete milestones, outcomes, and next milestones unlocked by sponsorship.';
  }

  return 'Narrative arc: community impact first, then a practical support ask.';
}

export function buildPrompts(
  data: GitHubData,
  inputOptions?: Partial<GenerateOptions>
): Prompts {
  const options: GenerateOptions = {
    ...DEFAULT_GENERATE_OPTIONS,
    ...inputOptions,
  };

  const { user, repos, languages, totalStars } = data;

  const topLanguages = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([lang]) => lang);

  const topRepoLines = repos
    .slice(0, 6)
    .map((r) => {
      const repoDescription = r.description ?? 'No description';
      const languageSuffix = r.language ? ` · ${r.language}` : '';
      return `- ${r.name}: ${repoDescription} (⭐ ${r.stargazers_count}${languageSuffix})`;
    })
    .join('\n');

  const context = `
GitHub Username: ${user.login}
Name: ${user.name ?? user.login}
Existing Bio: ${user.bio ?? 'None'}
Location: ${user.location ?? 'Not specified'}
Company: ${user.company ?? 'None'}
Followers: ${user.followers}
Public Repos: ${user.public_repos}
Total Stars Earned: ${totalStars}
Top Languages (by repo count): ${topLanguages.join(', ') || 'None detected'}
Requested Voice Style: ${options.voiceStyle}
Insight Depth: ${options.insightDepth}
Sponsor Narrative: ${options.sponsorNarrative}
Include Achievements Callouts: ${options.includeAchievements ? 'Yes' : 'No'}
Include Sponsor Call To Action: ${options.includeCallToAction ? 'Yes' : 'No'}
Top Repos:
${topRepoLines || 'No public repos'}
`.trim();

  const bioPrompt = `You are a professional developer branding expert.

Based on the GitHub profile data below, write a punchy, memorable professional bio. Rules:
- 2–3 sentences maximum
- Sound human, confident, and specific — not generic
- Highlight what they actually build, their stack, and their impact
- Do NOT use clichés like "passionate developer" or "love coding"
- Plain text only, no markdown
- ${voiceInstruction(options.voiceStyle)}

${context}

Return ONLY the bio text.`;

  const readmePrompt = `You are an expert at crafting stunning GitHub profile READMEs.

Based on the developer data below, generate a complete, visually appealing README.md. Requirements:
- Start with a bold greeting + name (use h1)
- 2-sentence intro describing who they are and what they do
- "🛠 Tech Stack" section with shield.io badges (use style=for-the-badge)
- "📊 GitHub Stats" section — use placeholder: https://github-readme-stats.vercel.app/api?username=USERNAME&show_icons=true&theme=tokyonight
- "🚀 Featured Projects" section listing their top 3 repos
- "📫 Connect" section with their GitHub link and any other relevant links
- Use emojis tastefully, keep it clean and scannable
- Use real shield.io badge URLs for languages/tools
- ${voiceInstruction(options.voiceStyle)}
- Add a "🔍 Profile Insights" section with 3 bullets about strengths and focus areas${
    options.insightDepth === 'advanced'
      ? ', each bullet with a specific supporting signal from their profile or repositories'
      : ''
  }
- ${
    options.includeAchievements
      ? 'Include a short "🏆 Highlights" list with 2 concrete achievements inferred from data.'
      : 'Do not include a highlights/achievements section.'
  }

${context}

Return ONLY raw markdown — no code fences, no explanations.`;

  const skillsPrompt = `You are a developer tooling expert.

Based on the languages and repos below, generate a well-organized markdown skills section using shield.io badges. Rules:
- Group into: Languages, Frameworks & Libraries, Tools & Platforms
- Only include technologies that are clearly evidenced by their repos/languages
- Use style=for-the-badge and appropriate logo names
- Badge format: ![Name](https://img.shields.io/badge/NAME-HEX?style=for-the-badge&logo=LOGO&logoColor=white)
- Pick appropriate hex colors for each technology (e.g. TypeScript = 3178C6, Python = 3776AB)
- ${voiceInstruction(options.voiceStyle)}

${context}

Return ONLY the markdown badges grouped under h3 headings.`;

  const sponsorPrompt = `You are a developer relations writer specializing in open-source sponsorship.

Based on the GitHub profile below, write a compelling GitHub Sponsors pitch with better storytelling. Structure:
1. Hook: one vivid sentence about the maintainer mission
2. Story body: show real community impact from projects and users
3. Sponsorship outcomes: what support enables in the next phase
4. Closing: warm, personal, and grounded

Tone: authentic, grateful, professional — not salesy. Use markdown formatting with paragraphs.
- ${voiceInstruction(options.voiceStyle)}
- ${sponsorNarrativeInstruction(options.sponsorNarrative)}
- Include at least one concrete impact metric from profile data when possible.
- ${
    options.includeCallToAction
      ? 'End with a clear call to action inviting sponsorship support.'
      : 'Do not include an explicit call-to-action sentence.'
  }

${context}

Return ONLY the sponsor pitch in markdown format.`;

  return { bioPrompt, readmePrompt, skillsPrompt, sponsorPrompt };
}
