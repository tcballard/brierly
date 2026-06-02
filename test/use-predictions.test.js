import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('../src/db', () => {
  let store = [];
  return {
    loadAll: vi.fn(() => Promise.resolve([...store])),
    put: vi.fn((item) => {
      store = store.filter((s) => s.id !== item.id).concat(item);
      return Promise.resolve();
    }),
    remove: vi.fn((id) => {
      store = store.filter((s) => s.id !== id);
      return Promise.resolve();
    }),
    __setStore: (items) => {
      store = [...items];
    },
  };
});

import usePredictions from '../src/hooks/usePredictions.js';
import { loadAll, put, remove, __setStore } from '../src/db';

beforeEach(() => {
  __setStore([]);
  vi.clearAllMocks();
});

describe('usePredictions', () => {
  it('loads predictions on mount', async () => {
    __setStore([
      { id: '1', text: 'Test', probability: 0.7, outcome: null },
    ]);

    const { result } = renderHook(() => usePredictions());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.predictions).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('sets error state when loadAll fails', async () => {
    loadAll.mockRejectedValueOnce(new Error('DB corrupt'));

    const { result } = renderHook(() => usePredictions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('DB corrupt');
    expect(result.current.predictions).toHaveLength(0);
  });

  it('adds a prediction', async () => {
    const { result } = renderHook(() => usePredictions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addPrediction({
        text: 'Will it rain?',
        probability: 0.7,
        category: 'personal',
        resolveBy: '2025-01-01',
      });
    });

    expect(result.current.predictions).toHaveLength(1);
    expect(result.current.predictions[0].text).toBe('Will it rain?');
    expect(put).toHaveBeenCalledTimes(1);
  });

  it('resolves a prediction', async () => {
    __setStore([
      {
        id: 'abc',
        text: 'Test',
        probability: 0.7,
        outcome: null,
        resolvedAt: null,
      },
    ]);

    const { result } = renderHook(() => usePredictions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.resolvePrediction('abc', true);
    });

    expect(result.current.predictions[0].outcome).toBe(true);
    expect(result.current.predictions[0].resolvedAt).toBeTruthy();
  });

  it('deletes a prediction', async () => {
    __setStore([
      { id: 'abc', text: 'Test', probability: 0.7, outcome: null },
    ]);

    const { result } = renderHook(() => usePredictions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deletePrediction('abc');
    });

    expect(result.current.predictions).toHaveLength(0);
    expect(remove).toHaveBeenCalledWith('abc');
  });

  it('imports predictions using batched writes', async () => {
    const incoming = [
      { id: '1', text: 'A', probability: 0.5 },
      { id: '2', text: 'B', probability: 0.6 },
    ];

    const { result } = renderHook(() => usePredictions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.importPredictions(incoming);
    });

    expect(put).toHaveBeenCalledTimes(2);
    expect(result.current.predictions).toHaveLength(2);
  });

  it('computes resolvedItems from predictions', async () => {
    __setStore([
      { id: '1', text: 'A', probability: 0.7, outcome: true },
      { id: '2', text: 'B', probability: 0.3, outcome: null },
      { id: '3', text: 'C', probability: 0.9, outcome: false },
    ]);

    const { result } = renderHook(() => usePredictions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.resolvedItems).toEqual([
      { p: 0.7, o: true },
      { p: 0.9, o: false },
    ]);
  });
});
