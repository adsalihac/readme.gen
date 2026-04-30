'use client';

import { useState } from 'react';
import type { GeneratedContent, TabKey } from '@/types';
import { MarkdownPreview } from './MarkdownPreview';

interface ResultTabsProps {
  content: GeneratedContent;
  onRegenerate: () => void;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'bio', label: 'Bio' },
  { key: 'readme', label: 'README' },
  { key: 'skills', label: 'Skills' },
  { key: 'sponsor', label: 'Sponsor' },
];

export function ResultTabs({ content, onRegenerate }: ResultTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('bio');
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  const contentMap: Record<TabKey, string> = {
    bio: content.bio,
    readme: content.readme,
    skills: content.skills,
    sponsor: content.sponsorPitch,
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contentMap[activeTab]);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      // clipboard API not available (e.g. HTTP in older browsers)
    }
  };

  return (
    <div className="animate-slide-up">
      {/* Tab bar */}
      <div className="mb-3 flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
          <span className="text-xs text-gray-400 font-mono">
            {activeTab === 'bio'
              ? 'plain text'
              : activeTab === 'readme'
              ? 'README.md'
              : activeTab === 'skills'
              ? 'skills.md'
              : 'SPONSOR.md'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onRegenerate}
              className="rounded-lg border border-gray-200 bg-transparent px-3 py-1.5 text-xs text-gray-500 transition-all hover:border-gray-300 hover:text-gray-900"
            >
              ↺ Regenerate
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

        {/* Content area */}
        <div className="p-6">
          {activeTab === 'bio' && (
            <div className="animate-fade-in">
              <p className="text-lg leading-relaxed text-gray-800">{content.bio}</p>
              <p className="mt-4 text-xs text-gray-400">
                Tip: Use this as your GitHub profile bio (max 160 chars)
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
              <MarkdownPreview content={content.sponsorPitch} />
            </div>
          )}
        </div>
      </div>

      {/* Raw copy hint */}
      <p className="mt-3 text-center text-xs text-gray-400">
        Click <strong className="text-gray-600">Copy</strong> to get the raw markdown, ready to paste.
      </p>
    </div>
  );
}
