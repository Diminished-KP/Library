// @vitest-environment jsdom
import { render, screen, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ScannerComponent } from './Scanner';
import { translations } from '../services/i18n';

let mockStart = vi.fn();
let mockStop = vi.fn();
let mockClear = vi.fn();
let mockPause = vi.fn();
let mockResume = vi.fn();
let mockGetState = vi.fn();

vi.mock('html5-qrcode', () => {
  return {
    Html5QrcodeSupportedFormats: {
      EAN_13: 0,
      EAN_8: 1,
      CODE_128: 2,
      UPC_A: 3,
      UPC_E: 4,
    },
    Html5QrcodeScannerState: {
      UNKNOWN: 0,
      NOT_STARTED: 1,
      SCANNING: 2,
      PAUSED: 3,
    },
    Html5Qrcode: class {
      start = mockStart;
      stop = mockStop;
      clear = mockClear;
      pause = mockPause;
      resume = mockResume;
      getState = mockGetState;
    },
  };
});

describe('ScannerComponent', () => {
  const defaultProps = {
    isBatchMode: false,
    onToggleBatchMode: vi.fn(),
    batchCount: 0,
    onScanSuccess: vi.fn(),
    onOpenManualEntry: vi.fn(),
    onFinishBatch: vi.fn(),
    libraries: [{ id: 'default', name: 'Moje knihovna', description: '', createdAt: 0 }],
    selectedLibraryId: 'default',
    onSelectLibrary: vi.fn(),
    t: translations.cs,
  };

  beforeEach(() => {
    mockStart.mockReset().mockResolvedValue(undefined);
    mockStop.mockReset().mockResolvedValue(undefined);
    mockClear.mockReset();
    mockPause.mockReset();
    mockResume.mockReset();
    mockGetState.mockReset().mockReturnValue(2);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders scanner component and starts camera', async () => {
    await act(async () => {
      render(<ScannerComponent {...defaultProps} />);
    });

    expect(screen.getByText(translations.cs.singleScanning)).toBeDefined();
    expect(mockStart).toHaveBeenCalled();
  });

  it('stops and clears scanner on unmount without errors', async () => {
    let unmountFn: () => void = () => {};
    await act(async () => {
      const { unmount } = render(<ScannerComponent {...defaultProps} />);
      unmountFn = unmount;
    });

    await act(async () => {
      unmountFn();
    });

    expect(mockStop).toHaveBeenCalled();
    expect(mockClear).toHaveBeenCalled();
  });

  it('handles stop throwing an error gracefully without crashing on unmount', async () => {
    mockStop.mockRejectedValueOnce(new Error('removeChild: not a child of this node'));

    let unmountFn: () => void = () => {};
    await act(async () => {
      const { unmount } = render(<ScannerComponent {...defaultProps} />);
      unmountFn = unmount;
    });

    await act(async () => {
      unmountFn();
    });

    expect(mockStop).toHaveBeenCalled();
    expect(mockClear).toHaveBeenCalled();
  });
});
