// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ManualEntryWithoutIsbnModal } from './ManualEntryWithoutIsbnModal';
import { translations } from '../services/i18n';
import type { Library } from '../types/book';

const mockLibraries: Library[] = [
  { id: 'lib1', name: 'Domácí knihovna', description: 'Hlavní', createdAt: 1 },
];

describe('ManualEntryWithoutIsbnModal', () => {
  it('allows filling title and author and submitting new book without manual genre', () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();

    render(
      <ManualEntryWithoutIsbnModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        libraries={mockLibraries}
        selectedLibraryId="lib1"
        onSelectLibrary={vi.fn()}
        t={translations.cs}
      />
    );

    expect(screen.getByText('Přidat knihu ručně bez ISBN')).toBeDefined();

    const titleInput = screen.getByPlaceholderText('Válka s Mloky');
    const authorInput = screen.getByPlaceholderText('Karel Čapek');
    expect(screen.queryByPlaceholderText('Sci-Fi, Román')).toBeNull();

    fireEvent.change(titleInput, { target: { value: 'R.U.R.' } });
    fireEvent.change(authorInput, { target: { value: 'Karel Čapek' } });

    const submitBtn = screen.getByText('Přidat knihu do knihovny');
    fireEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      title: 'R.U.R.',
      authors: 'Karel Čapek',
      libraryId: 'lib1',
      readingStatus: 'unread',
    });
  });
});
