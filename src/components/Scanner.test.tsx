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

    expect(screen.getByText(translations.cs.barcodeScannerTab)).toBeDefined();
    expect(screen.getByText(translations.cs.textIsbnScannerTab)).toBeDefined();
    expect(screen.getByText(translations.cs.singleScanning)).toBeDefined();
    expect(mockStart).toHaveBeenCalled();
  });

  it('switches to Text ISBN mode and shows capture button', async () => {
    await act(async () => {
      render(<ScannerComponent {...defaultProps} />);
    });

    const textTab = screen.getByText(translations.cs.textIsbnScannerTab);
    await act(async () => {
      textTab.click();
    });

    expect(screen.getByText(translations.cs.captureTextIsbnButton)).toBeDefined();
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

  it('renders in-camera loading spinner overlay when isProcessing is true', async () => {
    await act(async () => {
      render(<ScannerComponent {...defaultProps} isProcessing={true} />);
    });

    expect(screen.getByTestId('scanner-processing-overlay')).toBeDefined();
    expect(screen.getByText(translations.cs.scannerProcessing)).toBeDefined();
    // Ready pill and laser shouldn't show while processing
    expect(screen.queryByText(translations.cs.scannerReady)).toBeNull();
  });

  it('renders ready indicator pill when scanner is scanning and not processing', async () => {
    await act(async () => {
      render(<ScannerComponent {...defaultProps} isProcessing={false} />);
    });

    expect(screen.getByText(translations.cs.scannerReady)).toBeDefined();
    expect(screen.queryByTestId('scanner-processing-overlay')).toBeNull();
  });

  it('renders corner success checkmark when showSuccessCheck is true', async () => {
    await act(async () => {
      render(<ScannerComponent {...defaultProps} showSuccessCheck={true} />);
    });

    expect(screen.getByTestId('scanner-success-checkmark')).toBeDefined();
    expect(screen.getByText(translations.cs.bookAddedCheck)).toBeDefined();
  });

  it('ignores scanned codes while isProcessing is true', async () => {
    const onScanSuccess = vi.fn();
    let scanCallback: (decodedText: string) => void = () => {};

    mockStart.mockImplementation((_facing, _config, successCb) => {
      scanCallback = successCb;
      return Promise.resolve();
    });

    const { rerender } = render(
      <ScannerComponent {...defaultProps} onScanSuccess={onScanSuccess} isProcessing={true} />
    );

    // Camera has started, attempt scan while isProcessing is true
    await act(async () => {
      scanCallback('9788000058825');
    });

    expect(onScanSuccess).not.toHaveBeenCalled();

    // Now scanner becomes ready (isProcessing: false)
    await act(async () => {
      rerender(
        <ScannerComponent {...defaultProps} onScanSuccess={onScanSuccess} isProcessing={false} />
      );
    });

    await act(async () => {
      scanCallback('9788000058825');
    });

    expect(onScanSuccess).toHaveBeenCalledWith('9788000058825');
  });
});
