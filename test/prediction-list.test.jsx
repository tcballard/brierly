import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import PredictionList from '../src/components/PredictionList.jsx';

afterEach(cleanup);

const past = '2020-01-01';
const future = '2099-12-31';

function makePrediction(overrides) {
  return {
    id: crypto.randomUUID(),
    text: 'Test',
    probability: 0.7,
    category: 'work',
    createdAt: new Date().toISOString(),
    resolveBy: future,
    resolvedAt: null,
    outcome: null,
    notes: '',
    ...overrides,
  };
}

describe('PredictionList sorting/filtering', () => {
  it('shows due items before non-due items', () => {
    const predictions = [
      makePrediction({ id: '1', text: 'Not due', resolveBy: future }),
      makePrediction({ id: '2', text: 'Due item', resolveBy: past }),
      makePrediction({ id: '3', text: 'Also not due', resolveBy: future }),
    ];

    render(
      <PredictionList
        predictions={predictions}
        onResolve={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const openSection = screen.getByText(/Open \(/).closest('section');
    const items = openSection.querySelectorAll('li');
    expect(items[0].textContent).toContain('Due item');
  });

  it('sorts due items by resolveBy ascending', () => {
    const predictions = [
      makePrediction({ id: '1', text: 'Later due', resolveBy: '2023-06-01' }),
      makePrediction({ id: '2', text: 'Earlier due', resolveBy: '2022-01-01' }),
    ];

    render(
      <PredictionList
        predictions={predictions}
        onResolve={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const openSection = screen.getByText(/Open \(/).closest('section');
    const items = openSection.querySelectorAll('li');
    expect(items[0].textContent).toContain('Earlier due');
    expect(items[1].textContent).toContain('Later due');
  });

  it('separates open and resolved predictions', () => {
    const predictions = [
      makePrediction({ id: '1', text: 'Open one' }),
      makePrediction({
        id: '2',
        text: 'Resolved one',
        outcome: true,
        resolvedAt: new Date().toISOString(),
      }),
    ];

    render(
      <PredictionList
        predictions={predictions}
        onResolve={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText(/Open \(1/)).toBeTruthy();
    expect(screen.getByText(/Resolved \(1\)/)).toBeTruthy();
  });

  it('shows due count in header', () => {
    const predictions = [
      makePrediction({ id: '1', resolveBy: past }),
      makePrediction({ id: '2', resolveBy: past }),
      makePrediction({ id: '3', resolveBy: future }),
    ];

    render(
      <PredictionList
        predictions={predictions}
        onResolve={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText(/2 due/)).toBeTruthy();
  });
});
