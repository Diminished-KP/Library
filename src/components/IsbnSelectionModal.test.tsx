// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { IsbnSelectionModal } from './IsbnSelectionModal';
import { translations } from '../services/i18n';

describe('IsbnSelectionModal', () => {
  const t = translations.cs;

  afterEach(() => {
    cleanup();
  });

  it('renders single ISBN with review input and allows submit', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();
    const handleRetake = vi.fn();

    render(
      <IsbnSelectionModal
        isOpen={true}
        isbns={['9788020418005']}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onRetake={handleRetake}
        t={t}
      />
    );

    expect(screen.getByText(t.isbnSelectionTitle)).toBeDefined();
    expect(screen.getByText(t.singleIsbnFound)).toBeDefined();

    const input = screen.getByPlaceholderText(t.manualEntryPlaceholder) as HTMLInputElement;
    expect(input.value).toBe('9788020418005');

    fireEvent.click(screen.getByText(t.confirmAndSearch));
    expect(handleConfirm).toHaveBeenCalledWith('9788020418005');
  });

  it('renders multiple ISBNs and switches active choice on click', () => {
    const handleConfirm = vi.fn();

    render(
      <IsbnSelectionModal
        isOpen={true}
        isbns={['9788020418005', '8085983443']}
        onConfirm={handleConfirm}
        onCancel={vi.fn()}
        onRetake={vi.fn()}
        t={t}
      />
    );

    expect(screen.getByText(t.multipleIsbnsFound)).toBeDefined();
    const candidate2 = screen.getByText('8085983443');
    fireEvent.click(candidate2);

    const input = screen.getByPlaceholderText(t.manualEntryPlaceholder) as HTMLInputElement;
    expect(input.value).toBe('8085983443');

    fireEvent.click(screen.getByText(t.confirmAndSearch));
    expect(handleConfirm).toHaveBeenCalledWith('8085983443');
  });

  it('shows no ISBN found notice when list is empty and allows retake', () => {
    const handleRetake = vi.fn();

    render(
      <IsbnSelectionModal
        isOpen={true}
        isbns={[]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        onRetake={handleRetake}
        t={t}
      />
    );

    expect(screen.getByText(t.noIsbnFoundInImage)).toBeDefined();
    fireEvent.click(screen.getByText(t.retakePhoto));
    expect(handleRetake).toHaveBeenCalledTimes(1);
  });
});
