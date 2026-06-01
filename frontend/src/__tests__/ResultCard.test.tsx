import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultCard } from '../components/ResultCard';
import type { RenderResult } from '../types';

const makeResult = (duration_ms: number): RenderResult => ({
  id: 1,
  engine: 'mustache',
  engineName: 'Mustache',
  result: 'Привет, Андрей!',
  duration_ms,
  iterations: 100,
});

describe('ResultCard', () => {
  it('displays the rendered result text', () => {
    render(<ResultCard result={makeResult(0.5)} />);
    expect(screen.getByTestId('render-output')).toHaveTextContent('Привет, Андрей!');
  });

  it('shows duration formatted to 3 decimal places', () => {
    render(<ResultCard result={makeResult(0.5)} />);
    expect(screen.getByTestId('timing-value')).toHaveTextContent('0.500 мс');
  });

  it('uses green color for fast renders (< 1ms)', () => {
    render(<ResultCard result={makeResult(0.5)} />);
    expect(screen.getByTestId('timing-value')).toHaveStyle({ color: '#2e7d32' });
  });

  it('uses orange color for medium renders (1-5ms)', () => {
    render(<ResultCard result={makeResult(2)} />);
    expect(screen.getByTestId('timing-value')).toHaveStyle({ color: '#f57c00' });
  });

  it('uses red color for slow renders (>= 5ms)', () => {
    render(<ResultCard result={makeResult(10)} />);
    expect(screen.getByTestId('timing-value')).toHaveStyle({ color: '#c62828' });
  });

  it('shows iteration count', () => {
    render(<ResultCard result={makeResult(0.5)} />);
    expect(screen.getByText(/100 итерациям/)).toBeInTheDocument();
  });
});
