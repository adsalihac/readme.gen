import { useState, useEffect } from 'react';
import type { GenerateOptions, GeneratedContent, TabKey } from '@/types';
import type { UserPlan } from '@/lib/entitlements';
import { MarkdownPreview } from './MarkdownPreview';

interface ResultTabsProps {
  content: GeneratedContent;
  options: GenerateOptions;
  plan: UserPlan;
  onUpgrade: () => void;
  onRegenerate: () => void;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'bio', label: 'Bio' },
  { key: 'readme', label: 'README' },
  { key: 'skills', label: 'Skills' },
  { key: 'sponsor', label: 'Sponsor' },
  { key: 'deploy', label: 'Publish' },
];

function getCurrentFileName(activeTab: TabKey): string {
  if (activeTab === 'bio') return 'plain text';
  if (activeTab === 'readme') return 'README.md';
  if (activeTab === 'skills') return 'skills.md';
  if (activeTab === 'sponsor') return 'sponsor.md';
  return 'publishing settings';
}

export function ResultTabs({
  content,
  options,
  plan,
  onUpgrade,
  onRegenerate,
}: Readonly<ResultTabsProps>) {
  const [activeTab, setActiveTab] = useState<TabKey>('bio');
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  // Deploy States
  const [patToken, setPatToken] = useState('');
  const [deployState, setDeployState] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const [deploySteps, setDeploySteps] = useState<Array<{ label: string; status: 'pending' | 'active' | 'done' | 'failed' }>>([]);
  const [deployError, setDeployError] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const isPro = plan === 'pro';
  const visibleTabs = isPro ? TABS : TABS.filter((tab) => tab.key !== 'deploy');

  // Load PAT from localStorage on mount
  useEffect(() => {
    setTimeout(() => {
      const savedToken = localStorage.getItem('__github_pat_token');
      if (savedToken) setPatToken(savedToken);
    }, 0);
  }, []);

  const contentMap: Record<TabKey, string> = {
    bio: content.bio,
    readme: content.readme,
    skills: content.skills,
    sponsor: content.sponsorPitch,
    deploy: '',
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contentMap[activeTab]);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      // clipboard API not available
    }
  };

  const handleDeploy = async () => {
    if (!patToken.trim()) {
      setDeployError('Please enter a publishing token.');
      setDeployState('error');
      return;
    }

    setDeployState('deploying');
    setDeployError('');
    localStorage.setItem('__github_pat_token', patToken);

    const steps = [
      { label: 'Validating publishing access', status: 'active' as const },
      { label: 'Preparing profile README repository', status: 'pending' as const },
      { label: 'Publishing README.md', status: 'pending' as const },
    ];
    if (content.blogWorkflow) {
      steps.push({ label: 'Connecting writing updates', status: 'pending' as const });
    }
    setDeploySteps(steps);

    const updateStep = (index: number, status: 'done' | 'failed' | 'active') => {
      setDeploySteps((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], status };
        if (status === 'done' && next[index + 1]) {
          next[index + 1] = { ...next[index + 1], status: 'active' };
        }
        return next;
      });
    };

    try {
      // 1. Validate GitHub Token & get user info
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${patToken.trim()}`,
          Accept: 'application/vnd.github+json',
        },
      });

      if (!userRes.ok) {
        throw new Error('Invalid publishing token or insufficient permissions.');
      }

      const userData = await userRes.json();
      const authenticatedUser = userData.login;
      updateStep(0, 'done');

      // 2. Check/create profile repository
      const repoRes = await fetch(`https://api.github.com/repos/${authenticatedUser}/${authenticatedUser}`, {
        headers: {
          Authorization: `Bearer ${patToken.trim()}`,
          Accept: 'application/vnd.github+json',
        },
      });

      if (!repoRes.ok) {
        if (repoRes.status === 404) {
          // Repository username/username does not exist, create it
          const createRes = await fetch('https://api.github.com/user/repos', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${patToken.trim()}`,
              Accept: 'application/vnd.github+json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: authenticatedUser,
              description: 'My professional profile README',
              auto_init: true,
              private: false,
            }),
          });
          if (!createRes.ok) {
            throw new Error(`Failed to prepare the profile README repository "${authenticatedUser}/${authenticatedUser}". Please create it manually first.`);
          }
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } else {
          throw new Error('Failed to read the profile README repository.');
        }
      }
      setRepoUrl(`https://github.com/${authenticatedUser}/${authenticatedUser}`);
      updateStep(1, 'done');

      const commitFile = async (path: string, contentStr: string, message: string) => {
        const fileUrl = `https://api.github.com/repos/${authenticatedUser}/${authenticatedUser}/contents/${path}`;
        const fileMetaRes = await fetch(fileUrl, {
          headers: {
            Authorization: `Bearer ${patToken.trim()}`,
            Accept: 'application/vnd.github+json',
          },
        });

        let sha: string | undefined;
        if (fileMetaRes.ok) {
          const fileMeta = await fileMetaRes.json();
          sha = fileMeta.sha;
        }

        const commitRes = await fetch(fileUrl, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${patToken.trim()}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            content: btoa(unescape(encodeURIComponent(contentStr))),
            ...(sha && { sha }),
          }),
        });

        if (!commitRes.ok) {
          throw new Error(`Failed to publish "${path}".`);
        }
      };

      // 3. Commit README.md
      await commitFile('README.md', content.readme, 'docs: update profile README');
      updateStep(2, 'done');

      // 4. Commit blog post workflow if needed
      if (content.blogWorkflow) {
        await commitFile(
          '.github/workflows/blog-post-workflow.yml',
          content.blogWorkflow,
          'ci: configure writing updates'
        );
        updateStep(3, 'done');
      }

      setDeployState('success');
    } catch (err) {
      setDeployError(err instanceof Error ? err.message : 'An error occurred during deployment.');
      setDeploySteps((prev) => {
        const next = [...prev];
        const activeIdx = next.findIndex((s) => s.status === 'active');
        if (activeIdx !== -1) {
          next[activeIdx] = { ...next[activeIdx], status: 'failed' };
        }
        return next;
      });
      setDeployState('error');
    }
  };

  return (
    <div className="animate-slide-up">
      {/* Tab bar */}
      <div className="mb-3 flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              if (tab.key === 'deploy') {
                setDeployState('idle');
                setDeployError('');
              }
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
        {!isPro && (
          <button
            type="button"
            onClick={onUpgrade}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium text-indigo-700 transition-all hover:bg-white"
          >
            Publish with Pro
          </button>
        )}
      </div>

      {/* Panel */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Toolbar */}
        {activeTab !== 'deploy' && (
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
            <span className="text-xs text-gray-400 font-mono">{getCurrentFileName(activeTab)}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={onRegenerate}
                className="rounded-lg border border-gray-200 bg-transparent px-3 py-1.5 text-xs text-gray-500 transition-all hover:border-gray-300 hover:text-gray-900"
              >
                ↺ Rewrite
              </button>
              <button
                onClick={handleCopy}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  copyState === 'copied'
                    ? 'border-emerald-400/40 bg-emerald-50 text-emerald-600'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                {copyState === 'copied' ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Content area */}
        <div className="p-6">
          {activeTab === 'bio' && (
            <div className="animate-fade-in">
              <p className="text-lg leading-relaxed text-gray-800">{content.bio}</p>
              <p className="mt-4 text-xs text-gray-400">
                Tip: Use this as a concise GitHub profile bio.
              </p>
            </div>
          )}

          {activeTab === 'readme' && (
            <div className="animate-fade-in">
              <MarkdownPreview content={content.readme} />
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="animate-fade-in">
              <MarkdownPreview content={content.skills} />
            </div>
          )}

          {activeTab === 'sponsor' && (
            <div className="animate-fade-in">
              <div className="mb-3 inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] text-gray-500">
                Story style: {options.sponsorNarrative}
              </div>
              <MarkdownPreview content={content.sponsorPitch} />
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="animate-fade-in space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-950 mb-1">Direct publishing</h3>
                <p className="text-xs text-gray-500 leading-normal">
                  Publish your README directly to your GitHub profile repository. It will be prepared automatically when possible.
                </p>
              </div>

              {deployState === 'idle' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Publishing token</label>
                    <input
                      type="password"
                      placeholder="ghp_************************************"
                      value={patToken}
                      onChange={(e) => setPatToken(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-gray-400"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      The token needs permission to read and update your profile README repository. Create one in{' '}
                      <a
                        href="https://github.com/settings/tokens/new?description=readme.gen&scopes=repo"
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-900 underline font-medium"
                      >
                        account settings
                      </a>. Stored locally in your browser.
                    </p>
                  </div>

                  <button
                    onClick={handleDeploy}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5 text-xs font-semibold text-white transition-all hover:bg-gray-700 active:scale-[0.98]"
                  >
                     Publish README
                  </button>
                </div>
              )}

              {deployState === 'deploying' && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="h-4 w-4 animate-spin text-gray-900" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-900">Publishing README...</span>
                  </div>
                  <div className="space-y-2">
                    {deploySteps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs">
                        {step.status === 'done' && (
                          <span className="text-emerald-500 font-semibold">✓</span>
                        )}
                        {step.status === 'failed' && (
                          <span className="text-red-500 font-semibold">✗</span>
                        )}
                        {step.status === 'active' && (
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-900 animate-pulse" />
                        )}
                        {step.status === 'pending' && (
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                        )}
                        <span className={`${
                          step.status === 'done' ? 'text-gray-500 line-through' :
                          step.status === 'active' ? 'text-gray-900 font-medium' :
                          step.status === 'failed' ? 'text-red-600 font-medium' :
                          'text-gray-400'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {deployState === 'success' && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-3 animate-scale-up">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <span className="text-lg">🎉</span>
                    <span className="text-xs font-bold">Successfully published!</span>
                  </div>
                  <p className="text-[11px] text-emerald-700/80 leading-normal">
                    Your README has been published. Visit your profile repository to review the update.
                  </p>
                  <div className="flex gap-3 pt-1">
                    <a
                      href={repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                    >
                      View profile repository
                    </a>
                    <button
                      onClick={() => setDeployState('idle')}
                      className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                    >
                      Publish again
                    </button>
                  </div>
                </div>
              )}

              {deployState === 'error' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-red-800">
                      <span className="text-sm">⚠️</span>
                      <span className="text-xs font-bold">Publishing failed</span>
                    </div>
                    <p className="text-xs text-red-700">{deployError}</p>
                  </div>
                  <button
                    onClick={() => setDeployState('idle')}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-gray-700"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Raw copy hint */}
      {activeTab !== 'deploy' && (
        <p className="mt-3 text-center text-xs text-gray-400">
          Click <strong className="text-gray-600">Copy</strong> to get the content, ready to paste.
        </p>
      )}
    </div>
  );
}
