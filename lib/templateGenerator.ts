import type {
  GenerateOptions,
  GeneratedContent,
  GitHubData,
  GitHubRepo,
} from '@/types';

// ─── Badge Color + Logo Mapping ───────────────────────────────────────────────

interface BadgeInfo {
  color: string;
  logo: string;
  category: 'language' | 'framework' | 'tool';
}

const BADGE_MAP: Record<string, BadgeInfo> = {
  // Languages
  TypeScript:  { color: '3178C6', logo: 'typescript',  category: 'language' },
  JavaScript:  { color: 'F7DF1E', logo: 'javascript',  category: 'language' },
  Python:      { color: '3776AB', logo: 'python',      category: 'language' },
  Java:        { color: 'ED8B00', logo: 'openjdk',     category: 'language' },
  Kotlin:      { color: '7F52FF', logo: 'kotlin',      category: 'language' },
  Swift:       { color: 'F05138', logo: 'swift',       category: 'language' },
  Go:          { color: '00ADD8', logo: 'go',           category: 'language' },
  Rust:        { color: '000000', logo: 'rust',         category: 'language' },
  Ruby:        { color: 'CC342D', logo: 'ruby',         category: 'language' },
  PHP:         { color: '777BB4', logo: 'php',          category: 'language' },
  C:           { color: 'A8B9CC', logo: 'c',            category: 'language' },
  'C++':       { color: '00599C', logo: 'cplusplus',    category: 'language' },
  'C#':        { color: '512BD4', logo: 'csharp',       category: 'language' },
  Dart:        { color: '0175C2', logo: 'dart',         category: 'language' },
  Elixir:      { color: '4B275F', logo: 'elixir',       category: 'language' },
  Scala:       { color: 'DC322F', logo: 'scala',        category: 'language' },
  Lua:         { color: '2C2D72', logo: 'lua',          category: 'language' },
  R:           { color: '276DC3', logo: 'r',            category: 'language' },
  Shell:       { color: '4EAA25', logo: 'gnubash',      category: 'language' },
  HTML:        { color: 'E34F26', logo: 'html5',        category: 'language' },
  CSS:         { color: '1572B6', logo: 'css3',         category: 'language' },
  Sass:        { color: 'CC6699', logo: 'sass',         category: 'language' },
  Vue:         { color: '4FC08D', logo: 'vuedotjs',     category: 'language' },
  Svelte:      { color: 'FF3E00', logo: 'svelte',       category: 'language' },
  Perl:        { color: '39457E', logo: 'perl',         category: 'language' },
  Haskell:     { color: '5D4F85', logo: 'haskell',      category: 'language' },
  'Objective-C': { color: '438EFF', logo: 'apple',        category: 'language' },

  // Frameworks & Libraries
  React:       { color: '61DAFB', logo: 'react',        category: 'framework' },
  'Next.js':   { color: '000000', logo: 'nextdotjs',    category: 'framework' },
  'Node.js':   { color: '339933', logo: 'nodedotjs',    category: 'framework' },
  Express:     { color: '000000', logo: 'express',      category: 'framework' },
  Django:      { color: '092E20', logo: 'django',       category: 'framework' },
  Flask:       { color: '000000', logo: 'flask',        category: 'framework' },
  FastAPI:     { color: '009688', logo: 'fastapi',      category: 'framework' },
  'Spring Boot': { color: '6DB33F', logo: 'springboot', category: 'framework' },
  Rails:       { color: 'D30001', logo: 'rubyonrails',  category: 'framework' },
  Laravel:     { color: 'FF2D20', logo: 'laravel',      category: 'framework' },
  Angular:     { color: 'DD0031', logo: 'angular',      category: 'framework' },
  Flutter:     { color: '02569B', logo: 'flutter',      category: 'framework' },
  'React Native': { color: '61DAFB', logo: 'react',     category: 'framework' },
  TailwindCSS: { color: '06B6D4', logo: 'tailwindcss',  category: 'framework' },
  Bootstrap:   { color: '7952B3', logo: 'bootstrap',    category: 'framework' },
  jQuery:      { color: '0769AD', logo: 'jquery',       category: 'framework' },
  '.NET':      { color: '512BD4', logo: 'dotnet',       category: 'framework' },
  Gatsby:      { color: '663399', logo: 'gatsby',       category: 'framework' },
  Nuxt:        { color: '00DC82', logo: 'nuxtdotjs',    category: 'framework' },

  // Tools & Platforms
  Docker:      { color: '2496ED', logo: 'docker',       category: 'tool' },
  Kubernetes:  { color: '326CE5', logo: 'kubernetes',    category: 'tool' },
  AWS:         { color: '232F3E', logo: 'amazonwebservices', category: 'tool' },
  'Google Cloud': { color: '4285F4', logo: 'googlecloud', category: 'tool' },
  Azure:       { color: '0078D4', logo: 'microsoftazure', category: 'tool' },
  Firebase:    { color: 'DD2C00', logo: 'firebase',     category: 'tool' },
  Vercel:      { color: '000000', logo: 'vercel',       category: 'tool' },
  Netlify:     { color: '00C7B7', logo: 'netlify',      category: 'tool' },
  Git:         { color: 'F05032', logo: 'git',          category: 'tool' },
  GitHub:      { color: '181717', logo: 'github',       category: 'tool' },
  'GitHub Actions': { color: '2088FF', logo: 'githubactions', category: 'tool' },
  Linux:       { color: 'FCC624', logo: 'linux',        category: 'tool' },
  PostgreSQL:  { color: '4169E1', logo: 'postgresql',   category: 'tool' },
  MySQL:       { color: '4479A1', logo: 'mysql',        category: 'tool' },
  MongoDB:     { color: '47A248', logo: 'mongodb',      category: 'tool' },
  Redis:       { color: 'DC382D', logo: 'redis',        category: 'tool' },
  GraphQL:     { color: 'E10098', logo: 'graphql',      category: 'tool' },
  Webpack:     { color: '8DD6F9', logo: 'webpack',      category: 'tool' },
  Vite:        { color: '646CFF', logo: 'vite',         category: 'tool' },
  Jest:        { color: 'C21325', logo: 'jest',         category: 'tool' },
  Nginx:       { color: '009639', logo: 'nginx',        category: 'tool' },
  Supabase:    { color: '3FCF8E', logo: 'supabase',     category: 'tool' },
  Terraform:   { color: '7B42BC', logo: 'terraform',    category: 'tool' },
};

// Languages → likely related frameworks/tools (inferred from ecosystem)
const LANGUAGE_ECOSYSTEM: Record<string, string[]> = {
  TypeScript:  ['React', 'Next.js', 'Node.js', 'TailwindCSS', 'Vite'],
  JavaScript:  ['React', 'Node.js', 'Express', 'jQuery', 'Webpack'],
  Python:      ['Django', 'Flask', 'FastAPI'],
  Java:        ['Spring Boot'],
  Kotlin:      ['Android', 'Spring Boot'],
  Swift:       ['iOS'],
  Ruby:        ['Rails'],
  PHP:         ['Laravel'],
  Dart:        ['Flutter'],
  Go:          ['Docker', 'Kubernetes'],
  'C#':        ['.NET'],
  Vue:         ['Nuxt', 'TailwindCSS', 'Vite'],
  Svelte:      ['TailwindCSS', 'Vite'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function badge(name: string, color: string, logo: string): string {
  const encoded = encodeURIComponent(name.replace(/-/g, '--'));
  return `![${name}](https://img.shields.io/badge/${encoded}-${color}?style=for-the-badge&logo=${logo}&logoColor=white)`;
}

function getTopLanguages(
  languages: Record<string, number>,
  limit = 8
): string[] {
  return Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([lang]) => lang);
}

function getTopRepos(repos: GitHubRepo[], limit = 3): GitHubRepo[] {
  return [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, limit);
}

function displayName(user: GitHubData['user']): string {
  return user.name ?? user.login;
}

function inferEcosystemTools(languages: string[]): string[] {
  const tools = new Set<string>();
  for (const lang of languages) {
    const related = LANGUAGE_ECOSYSTEM[lang];
    if (related) {
      for (const tool of related) {
        tools.add(tool);
      }
    }
  }
  return Array.from(tools);
}

function detectTopicsFromRepos(repos: GitHubRepo[]): Set<string> {
  const topics = new Set<string>();
  for (const repo of repos) {
    if (repo.topics) {
      for (const topic of repo.topics) {
        topics.add(topic.toLowerCase());
      }
    }
  }
  return topics;
}

// ─── Bio Generator ────────────────────────────────────────────────────────────

function generateBio(
  data: GitHubData,
  options: GenerateOptions
): string {
  const { user, totalStars, repos } = data;
  const name = displayName(user);
  const topLangs = getTopLanguages(data.languages, 3);
  const langText = topLangs.length > 0
    ? topLangs.join(', ')
    : 'multiple technologies';

  const locationPart = user.location ? ` based in ${user.location}` : '';
  const companyPart = user.company ? ` at ${user.company}` : '';

  // Determine the developer's focus area from top repos
  const topRepo = repos[0];
  const focusHint = topRepo?.description
    ? ` with a focus on ${topRepo.description.toLowerCase().replace(/\.$/, '')}`
    : '';

  const starsPhrase = totalStars > 0
    ? ` with ${totalStars.toLocaleString()} stars across ${repos.length} projects`
    : ` maintaining ${repos.length} public repositories`;

  if (options.voiceStyle === 'friendly') {
    return (
      `Hey! I'm ${name}${locationPart}${companyPart}. ` +
      `I love building with ${langText}${focusHint}. ` +
      `Check out my work — ${totalStars > 0 ? `${totalStars.toLocaleString()}+ stars and counting!` : `${repos.length} repos and growing!`}`
    );
  }

  if (options.voiceStyle === 'bold') {
    return (
      `${name} — Software Engineer${companyPart}${locationPart}. ` +
      `Shipping production-grade ${langText} solutions${starsPhrase}. ` +
      `${focusHint ? `Specializing in${focusHint}.` : 'Building the tools developers rely on.'}`
    );
  }

  // Professional (default)
  return (
    `${name} is a software developer${companyPart}${locationPart} ` +
    `specializing in ${langText}${starsPhrase}. ` +
    `${focusHint ? `Currently focused on${focusHint}.` : `Contributing to the open-source ecosystem with ${user.public_repos} public repositories.`}`
  );
}

// ─── README Generator ─────────────────────────────────────────────────────────

function generateReadme(
  data: GitHubData,
  options: GenerateOptions
): string {
  const { user, repos, totalStars } = data;
  const name = displayName(user);
  const topLangs = getTopLanguages(data.languages, 6);
  const topRepos = getTopRepos(repos, 3);
  const locationPart = user.location ? ` from ${user.location}` : '';

  // Greeting
  const greetings: Record<string, string> = {
    professional: `# Hi, I'm ${name} 👋`,
    friendly:     `# Hey there! I'm ${name} 👋😊`,
    bold:         `# ${name}`,
  };
  const greeting = greetings[options.voiceStyle] ?? greetings.professional;

  // Intro
  const intro = options.voiceStyle === 'bold'
    ? `**Software engineer${locationPart} building tools that ship.** I work primarily with ${topLangs.slice(0, 3).join(', ')} and have earned ${totalStars.toLocaleString()} stars across my open-source work.`
    : options.voiceStyle === 'friendly'
    ? `I'm a developer${locationPart} who enjoys creating with ${topLangs.slice(0, 3).join(', ')}. I've got ${user.public_repos} public repos and a growing community of ${user.followers.toLocaleString()} followers!`
    : `Software developer${locationPart} specializing in ${topLangs.slice(0, 3).join(', ')}. Building open-source solutions with ${totalStars.toLocaleString()} stars across ${user.public_repos} repositories.`;

  // Tech Stack badges
  const techBadges = topLangs
    .map((lang) => {
      const info = BADGE_MAP[lang];
      return info ? badge(lang, info.color, info.logo) : null;
    })
    .filter(Boolean)
    .join(' ');

  // Professional Experience
  let experienceSection = '';
  if (options.workExperiences && options.workExperiences.length > 0) {
    const expItems = options.workExperiences.map((exp) => {
      const bulletPoints = exp.description
        .split(/\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => line.startsWith('-') ? line : `- ${line}`)
        .join('\n');
      return `### **${exp.company}** — *${exp.role}*\n\`${exp.period}\`\n${bulletPoints}\n`;
    });
    experienceSection = `## 💼 Experience\n\n${expItems.join('\n')}`;
  }

  // GitHub Stats, Streak and WakaTime
  const statsCard = `![GitHub Stats](https://github-readme-stats.vercel.app/api?username=${user.login}&show_icons=true&theme=tokyonight)`;
  const streakCard = options.includeStreakStats
    ? `\n![GitHub Streak](https://github-readme-streak-stats.herokuapp.com/?user=${user.login}&theme=tokyonight)`
    : '';
  const wakatimeCard = options.wakatimeUsername
    ? `\n![WakaTime Stats](https://github-readme-stats.vercel.app/api/wakatime?username=${options.wakatimeUsername}&layout=compact&theme=tokyonight)`
    : '';
  const statsSection = `${statsCard}${streakCard}${wakatimeCard}`;

  // Featured Projects
  const featuredLines = topRepos.map((r) => {
    const desc = r.description ?? 'No description';
    const langSuffix = r.language ? ` \`${r.language}\`` : '';
    return `- [**${r.name}**](${r.html_url}) — ${desc} ⭐ ${r.stargazers_count}${langSuffix}`;
  });

  // Blog Section
  let blogSection = '';
  if (options.blogFeedUrl) {
    blogSection = `## ✍️ Recent Blog Posts\n\n<!-- START_SECTION:blog-posts -->\n<!-- END_SECTION:blog-posts -->\n`;
  }

  // Connect
  const connectLinks: string[] = [
    `- 🐙 [GitHub](${user.html_url})`,
  ];
  if (user.blog) {
    const blogUrl = user.blog.startsWith('http') ? user.blog : `https://${user.blog}`;
    connectLinks.push(`- 🌐 [Website](${blogUrl})`);
  }
  if (user.twitter_username) {
    connectLinks.push(`- 🐦 [Twitter](https://twitter.com/${user.twitter_username})`);
  }

  // Profile Insights
  const insights = generateInsights(data, options);

  // Achievements
  const achievementsSection = options.includeAchievements
    ? generateAchievements(data)
    : '';

  const sections = [
    greeting,
    '',
    intro,
    '',
    '## 🛠 Tech Stack',
    '',
    techBadges || '_No recognized languages detected_',
    '',
    ...(experienceSection ? [experienceSection, ''] : []),
    '## Featured Projects',
    '',
    ...(featuredLines.length > 0 ? featuredLines : ['_No public repositories yet_']),
    '',
    '## 📊 GitHub Stats',
    '',
    statsSection,
    '',
    ...(blogSection ? [blogSection, ''] : []),
    '## 🔍 Profile Insights',
    '',
    ...insights,
    '',
    ...(achievementsSection ? [achievementsSection, ''] : []),
    '## 📫 Connect',
    '',
    ...connectLinks,
  ];

  const brandingFooter = options.includeBranding
    ? '\n\n---\n\n<p align="center">Generated with ❤️ using <a href="https://github.com/adsalihac/readme.gen">readme.gen</a></p>'
    : '';

  return sections.join('\n') + brandingFooter;
}

function generateInsights(
  data: GitHubData,
  options: GenerateOptions
): string[] {
  const { user, repos, totalStars, languages } = data;
  const topLangs = getTopLanguages(languages, 3);
  const insights: string[] = [];

  // Language focus
  if (topLangs.length > 0) {
    const detail = options.insightDepth === 'advanced'
      ? ` — ${topLangs[0]} appears in ${languages[topLangs[0]]} of ${repos.length} repositories`
      : '';
    insights.push(`- **Primary stack**: ${topLangs.join(', ')}${detail}`);
  }

  // Community impact
  if (user.followers > 0 || totalStars > 0) {
    const detail = options.insightDepth === 'advanced'
      ? ` — averaging ${repos.length > 0 ? (totalStars / repos.length).toFixed(1) : '0'} stars per repository`
      : '';
    insights.push(
      `- **Community reach**: ${user.followers.toLocaleString()} followers, ${totalStars.toLocaleString()} total stars${detail}`
    );
  }

  // Activity breadth
  const uniqueLangs = Object.keys(languages).length;
  if (uniqueLangs > 0) {
    const detail = options.insightDepth === 'advanced'
      ? ` — demonstrating versatility across frontend, backend, and tooling`
      : '';
    insights.push(
      `- **Technical breadth**: Active across ${uniqueLangs} language${uniqueLangs === 1 ? '' : 's'} with ${user.public_repos} public repositories${detail}`
    );
  }

  // Ensure at least 3 insights
  if (insights.length < 3) {
    const accountAge = Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    if (accountAge > 0) {
      insights.push(
        `- **Experience**: Active on GitHub for ${accountAge}+ year${accountAge === 1 ? '' : 's'}`
      );
    }
  }

  return insights.slice(0, 3);
}

function generateAchievements(data: GitHubData): string {
  const { repos, totalStars, user } = data;
  const achievements: string[] = [];

  if (totalStars >= 100) {
    achievements.push(`- 🌟 Earned **${totalStars.toLocaleString()} stars** across open-source projects`);
  } else if (totalStars > 0) {
    achievements.push(`- ⭐ Growing open-source presence with **${totalStars} stars** earned`);
  }

  if (user.followers >= 50) {
    achievements.push(`- 👥 Built a community of **${user.followers.toLocaleString()} followers**`);
  } else if (repos.length >= 10) {
    achievements.push(`- 📦 Shipped **${repos.length} public repositories** and counting`);
  }

  const topRepo = repos[0];
  if (topRepo && topRepo.stargazers_count > 0) {
    achievements.push(
      `- 🏅 Top project **${topRepo.name}** with **${topRepo.stargazers_count} stars**`
    );
  }

  if (achievements.length === 0) {
    return '';
  }

  return `## 🏆 Highlights\n\n${achievements.slice(0, 3).join('\n')}`;
}

// ─── Skills Generator ─────────────────────────────────────────────────────────

function generateSkills(data: GitHubData): string {
  const topLangs = getTopLanguages(data.languages, 10);
  const topics = detectTopicsFromRepos(data.repos);
  const ecosystemTools = inferEcosystemTools(topLangs);

  const languageBadges: string[] = [];
  const frameworkBadges: string[] = [];
  const toolBadges: string[] = [];

  // Add detected languages
  for (const lang of topLangs) {
    const info = BADGE_MAP[lang];
    if (info) {
      languageBadges.push(badge(lang, info.color, info.logo));
    }
  }

  // Add ecosystem-inferred frameworks & tools, plus topic-matched ones
  const added = new Set<string>(topLangs);

  for (const tool of ecosystemTools) {
    if (added.has(tool)) continue;
    const info = BADGE_MAP[tool];
    if (info) {
      added.add(tool);
      if (info.category === 'framework') {
        frameworkBadges.push(badge(tool, info.color, info.logo));
      } else if (info.category === 'tool') {
        toolBadges.push(badge(tool, info.color, info.logo));
      }
    }
  }

  // Check repo topics for additional tools/frameworks
  for (const [name, info] of Object.entries(BADGE_MAP)) {
    if (added.has(name)) continue;
    const normalized = name.toLowerCase().replace(/[.\s]/g, '');
    if (topics.has(normalized) || topics.has(name.toLowerCase())) {
      added.add(name);
      if (info.category === 'framework') {
        frameworkBadges.push(badge(name, info.color, info.logo));
      } else if (info.category === 'tool') {
        toolBadges.push(badge(name, info.color, info.logo));
      }
    }
  }

  // Always add Git & GitHub to tools if they have repos
  if (data.repos.length > 0) {
    if (!added.has('Git')) {
      toolBadges.push(badge('Git', BADGE_MAP.Git.color, BADGE_MAP.Git.logo));
      added.add('Git');
    }
    if (!added.has('GitHub')) {
      toolBadges.push(badge('GitHub', BADGE_MAP.GitHub.color, BADGE_MAP.GitHub.logo));
      added.add('GitHub');
    }
  }

  const sections: string[] = [];

  if (languageBadges.length > 0) {
    sections.push(`### Languages\n\n${languageBadges.join(' ')}`);
  }
  if (frameworkBadges.length > 0) {
    sections.push(`### Frameworks & Libraries\n\n${frameworkBadges.join(' ')}`);
  }
  if (toolBadges.length > 0) {
    sections.push(`### Tools & Platforms\n\n${toolBadges.join(' ')}`);
  }

  return sections.join('\n\n') || '_No recognized technologies detected_';
}

// ─── Sponsor Pitch Generator ─────────────────────────────────────────────────

function generateSponsorPitch(
  data: GitHubData,
  options: GenerateOptions
): string {
  const { user, repos, totalStars } = data;
  const name = displayName(user);
  const topLangs = getTopLanguages(data.languages, 3);
  const topRepo = repos[0];

  // Hook
  let hook: string;
  if (options.voiceStyle === 'bold') {
    hook = `**${name} is building the open-source infrastructure developers depend on.**`;
  } else if (options.voiceStyle === 'friendly') {
    hook = `Hi! I'm ${name}, and I spend my time building free, open-source tools that help developers ship better software.`;
  } else {
    hook = `${name} is an open-source contributor dedicated to building reliable, community-driven tools for the developer ecosystem.`;
  }

  // Story body — adapts to narrative style
  let storyBody: string;
  if (options.sponsorNarrative === 'journey') {
    const accountAge = Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    storyBody = [
      `Over the past ${accountAge > 0 ? `${accountAge}+ years` : 'year'} on GitHub, ` +
        `I've grown from an early contributor to maintaining ${user.public_repos} public repositories. ` +
        (topRepo
          ? `Projects like **${topRepo.name}** (⭐ ${topRepo.stargazers_count}) `
          : 'My projects ') +
        `have become resources that developers around the world rely on.`,
      '',
      totalStars > 0
        ? `Today, my work has earned ${totalStars.toLocaleString()} stars and the support of ${user.followers.toLocaleString()} followers who trust these tools in their workflows.`
        : `I continue to ship and improve tools that make development easier for everyone.`,
    ].join('\n');
  } else if (options.sponsorNarrative === 'milestones') {
    const milestones: string[] = [];
    milestones.push(`- 📦 **${user.public_repos} repositories** published and maintained`);
    if (totalStars > 0) {
      milestones.push(`- ⭐ **${totalStars.toLocaleString()} stars** earned across projects`);
    }
    if (user.followers > 0) {
      milestones.push(`- 👥 **${user.followers.toLocaleString()} followers** in the community`);
    }
    if (topRepo) {
      milestones.push(
        `- 🏆 **${topRepo.name}** — top project with ${topRepo.stargazers_count} stars`
      );
    }
    storyBody = `### Milestones achieved\n\n${milestones.join('\n')}\n\n` +
      `### What sponsorship unlocks next\n\n` +
      `- Dedicated time for feature development and bug fixes\n` +
      `- Better documentation and onboarding resources\n` +
      `- Long-term maintenance and security updates`;
  } else {
    // Impact (default)
    storyBody = [
      topRepo
        ? `My most impactful project, **${topRepo.name}**, has earned ${topRepo.stargazers_count} stars and is actively used by developers in the ${topLangs.join(', ')} ecosystem.`
        : `I contribute ${topLangs.length > 0 ? topLangs.join(', ') : ''} tools to the open-source ecosystem.`,
      '',
      `With ${user.public_repos} public repositories and ${user.followers.toLocaleString()} followers, ` +
        `this work serves a real community of developers who depend on reliable, well-maintained open-source software.`,
    ].join('\n');
  }

  // Sponsorship outcomes
  const outcomes =
    `Your sponsorship directly enables continued development, faster response times on issues, and the creation of new tools that benefit the entire community.`;

  // Closing
  let closing: string;
  if (options.voiceStyle === 'friendly') {
    closing = `Every bit of support means the world and helps keep this work going. Thank you for being part of the journey! 💙`;
  } else if (options.voiceStyle === 'bold') {
    closing = `Open source runs on trust and support. Back the projects you rely on.`;
  } else {
    closing = `Thank you for considering sponsorship. Your support makes a meaningful difference in sustaining this work.`;
  }

  // CTA
  const cta = options.includeCallToAction
    ? `\n\n---\n\n💖 **[Become a sponsor](https://github.com/sponsors/${user.login})** and help keep these projects alive and growing.`
    : '';

  return [hook, '', storyBody, '', outcomes, '', closing, cta]
    .join('\n')
    .trim();
}

function generateBlogWorkflow(feedUrl: string): string {
  return `name: Latest Blog Posts Workflow
on:
  schedule:
    # Runs every hour
    - cron: '0 * * * *'
  workflow_dispatch:

jobs:
  update-readme:
    name: Update this README with latest blog posts
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: gautamkrishnar/blog-post-workflow@master
        with:
          feed_list: "${feedUrl}"
`;
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function generateFromTemplate(
  data: GitHubData,
  options: GenerateOptions
): GeneratedContent {
  return {
    bio: generateBio(data, options),
    readme: generateReadme(data, options),
    skills: generateSkills(data),
    sponsorPitch: generateSponsorPitch(data, options),
    blogWorkflow: options.blogFeedUrl ? generateBlogWorkflow(options.blogFeedUrl) : undefined,
  };
}
