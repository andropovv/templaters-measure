import { describe, it, expect, vi, afterEach } from 'vitest';
import { msColor, exportToCSV } from '../utils';
import type { Measurement } from '../types';

describe('msColor', () => {
  it('returns green for ms < 1', () => {
    expect(msColor(0)).toBe('#2e7d32');
    expect(msColor(0.5)).toBe('#2e7d32');
    expect(msColor(0.999)).toBe('#2e7d32');
  });

  it('returns orange for 1 <= ms < 5', () => {
    expect(msColor(1)).toBe('#f57c00');
    expect(msColor(3)).toBe('#f57c00');
    expect(msColor(4.999)).toBe('#f57c00');
  });

  it('returns red for ms >= 5', () => {
    expect(msColor(5)).toBe('#c62828');
    expect(msColor(100)).toBe('#c62828');
  });
});

describe('exportToCSV', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('creates a download link and clicks it', () => {
    const measurements: Measurement[] = [
      { id: 1, engine: 'mustache', template: 'Hello {{name}}', data: {}, result: 'Hello world', duration_ms: 0.5, created_at: '2026-06-01' },
    ];

    const mockClick = vi.fn();
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:url');
    const mockRevokeObjectURL = vi.fn();
    vi.spyOn(URL, 'createObjectURL').mockImplementation(mockCreateObjectURL);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(mockRevokeObjectURL);
    vi.spyOn(document, 'createElement').mockReturnValue({ click: mockClick, href: '', download: '' } as unknown as HTMLAnchorElement);

    exportToCSV(measurements);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:url');
  });

  it('escapes double quotes in template', async () => {
    const measurements: Measurement[] = [
      { id: 1, engine: 'ejs', template: 'Say "hi"', data: {}, result: 'Say "hi"', duration_ms: 1, created_at: '2026-06-01' },
    ];

    let capturedBlob: Blob | null = null;
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => { capturedBlob = blob as Blob; return 'blob:url'; });
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockReturnValue({ click: vi.fn(), href: '', download: '' } as unknown as HTMLAnchorElement);

    exportToCSV(measurements);

    expect(capturedBlob).not.toBeNull();
    const text = await (capturedBlob as unknown as Blob).text();
    expect(text).toContain('"Say ""hi"""');
  });
});
