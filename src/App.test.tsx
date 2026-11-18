// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { translations } from './services/i18n';

describe('App storage feedback', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('shows a warning when the browser cannot save local data', async () => {
    vi.spyOn(window.Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage is full', 'QuotaExceededError');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<App />);

    const warning = await screen.findByRole('alert');
    expect(warning.textContent).toContain(translations.cs.storageSaveError);
  });
});
