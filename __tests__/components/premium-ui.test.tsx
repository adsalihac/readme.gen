// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { GenerateModal } from '@/components/GenerateModal';
import { ResultTabs } from '@/components/ResultTabs';
import { DEFAULT_GENERATE_OPTIONS, type GeneratedContent } from '@/types';

const content: GeneratedContent = {
  bio: 'Test bio',
  readme: '# Test README',
  skills: 'TypeScript',
  sponsorPitch: 'Sponsor me',
};

describe('premium UI gating', () => {
  it('shows locked advanced controls and upgrade CTA for free users', () => {
    render(
      <GenerateModal
        isOpen
        plan="free"
        onClose={vi.fn()}
        onGenerate={vi.fn()}
        onUpgrade={vi.fn()}
      />
    );

    expect(screen.getByText(/Pro unlocks tone control/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Upgrade once' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Experience Pro' })).toHaveProperty('disabled', true);
  });

  it('shows deploy as an upgrade action for free users', () => {
    render(
      <ResultTabs
        content={content}
        options={DEFAULT_GENERATE_OPTIONS}
        plan="free"
        onRegenerate={vi.fn()}
        onUpgrade={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: 'Publish' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Publish with Pro' })).toBeTruthy();
  });

  it('shows the deploy tab for Pro users', () => {
    render(
      <ResultTabs
        content={content}
        options={DEFAULT_GENERATE_OPTIONS}
        plan="pro"
        onRegenerate={vi.fn()}
        onUpgrade={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Publish' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Publish with Pro' })).toBeNull();
  });
});
