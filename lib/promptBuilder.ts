import type { GitHubData } from '@/types';

interface Prompts {
  bioPrompt: string;
  readmePrompt: string;
  skillsPrompt: string;
  sponsorPrompt: string;
}

export function buildPrompts(data: GitHubData): Prompts {
  const { user, repos, languages, totalStars } = data;

  const topLanguages = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([lang]) => lang);

  const topRepoLines = repos
    .slice(0, 6)
    .map(
      (r) =>
        `- ${r.name}: ${r.description ?? 'No description'} (⭐ ${r.stargazers_count}${r.language ? ` · ${r.language}` : ''})`
    )
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

${context}

Return ONLY raw markdown — no code fences, no explanations.`;

  const skillsPrompt = `You are a developer tooling expert.

Based on the languages and repos below, generate a well-organized markdown skills section using shield.io badges. Rules:
- Group into: Languages, Frameworks & Libraries, Tools & Platforms
- Only include technologies that are clearly evidenced by their repos/languages
- Use style=for-the-badge and appropriate logo names
- Badge format: ![Name](https://img.shields.io/badge/NAME-HEX?style=for-the-badge&logo=LOGO&logoColor=white)
- Pick appropriate hex colors for each technology (e.g. TypeScript = 3178C6, Python = 3776AB)

${context}

Return ONLY the markdown badges grouped under h3 headings.`;

  const sponsorPrompt = `You are a developer relations writer specializing in open-source sponsorship.

Based on the GitHub profile below, write a compelling GitHub Sponsors pitch. Structure:
1. Opening paragraph: who they are and what they build (specific, not generic)
2. Community impact paragraph: what their repos enable for others
3. What sponsorship enables: tools, time, infrastructure
4. Warm, personal closing

Tone: authentic, grateful, professional — not salesy. Use markdown formatting with paragraphs.

${context}

Return ONLY the sponsor pitch in markdown format.`;

  return { bioPrompt, readmePrompt, skillsPrompt, sponsorPrompt };
}
