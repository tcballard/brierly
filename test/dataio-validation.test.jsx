import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import DataIO from '../src/components/DataIO.jsx';

afterEach(cleanup);

function makeFile(content) {
  return new File([JSON.stringify(content)], 'test.json', {
    type: 'application/json',
  });
}

function getFileInput() {
  return document.querySelector('input[type="file"]');
}

describe('DataIO import validation', () => {
  it('rejects non-array JSON', async () => {
    const onImport = vi.fn();
    render(<DataIO predictions={[]} onImport={onImport} />);

    fireEvent.change(getFileInput(), { target: { files: [makeFile({ foo: 1 })] } });

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain(
        'expected a JSON array',
      );
    });
    expect(onImport).not.toHaveBeenCalled();
  });

  it('rejects items with missing id', async () => {
    const onImport = vi.fn();
    render(<DataIO predictions={[]} onImport={onImport} />);

    const data = [{ text: 'hello', probability: 0.5 }];
    fireEvent.change(getFileInput(), { target: { files: [makeFile(data)] } });

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('missing or invalid "id"');
    });
    expect(onImport).not.toHaveBeenCalled();
  });

  it('rejects items with missing text', async () => {
    const onImport = vi.fn();
    render(<DataIO predictions={[]} onImport={onImport} />);

    const data = [{ id: 'abc', probability: 0.5 }];
    fireEvent.change(getFileInput(), { target: { files: [makeFile(data)] } });

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('missing or invalid "text"');
    });
    expect(onImport).not.toHaveBeenCalled();
  });

  it('rejects items with probability out of range', async () => {
    const onImport = vi.fn();
    render(<DataIO predictions={[]} onImport={onImport} />);

    const data = [{ id: 'abc', text: 'test', probability: 1.5 }];
    fireEvent.change(getFileInput(), { target: { files: [makeFile(data)] } });

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain(
        'missing or invalid "probability"',
      );
    });
    expect(onImport).not.toHaveBeenCalled();
  });

  it('accepts valid data and calls onImport', async () => {
    const onImport = vi.fn().mockResolvedValue(undefined);
    render(<DataIO predictions={[]} onImport={onImport} />);

    const data = [
      { id: 'abc', text: 'Will it rain?', probability: 0.7 },
      { id: 'def', text: 'Markets up?', probability: 0.4 },
    ];
    fireEvent.change(getFileInput(), { target: { files: [makeFile(data)] } });

    await waitFor(() => {
      expect(onImport).toHaveBeenCalledWith(data);
    });
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
