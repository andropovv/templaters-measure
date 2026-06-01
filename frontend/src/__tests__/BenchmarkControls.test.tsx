import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BenchmarkControls } from '../components/BenchmarkControls';

const defaultProps = {
  iterations: 100,
  loading: false,
  comparing: false,
  onIterationsChange: vi.fn(),
  onRun: vi.fn(),
  onCompareAll: vi.fn(),
};

describe('BenchmarkControls', () => {
  it('shows iteration count', () => {
    render(<BenchmarkControls {...defaultProps} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('calls onRun when Запустить clicked', async () => {
    const onRun = vi.fn();
    render(<BenchmarkControls {...defaultProps} onRun={onRun} />);
    await userEvent.click(screen.getByTestId('run-btn'));
    expect(onRun).toHaveBeenCalledOnce();
  });

  it('calls onCompareAll when Сравнить все clicked', async () => {
    const onCompareAll = vi.fn();
    render(<BenchmarkControls {...defaultProps} onCompareAll={onCompareAll} />);
    await userEvent.click(screen.getByTestId('compare-btn'));
    expect(onCompareAll).toHaveBeenCalledOnce();
  });

  it('disables buttons while loading', () => {
    render(<BenchmarkControls {...defaultProps} loading={true} />);
    expect(screen.getByTestId('run-btn')).toBeDisabled();
    expect(screen.getByTestId('compare-btn')).toBeDisabled();
  });

  it('shows "Измерение..." while loading', () => {
    render(<BenchmarkControls {...defaultProps} loading={true} />);
    expect(screen.getByText('Измерение...')).toBeInTheDocument();
  });

  it('disables buttons while comparing', () => {
    render(<BenchmarkControls {...defaultProps} comparing={true} />);
    expect(screen.getByTestId('run-btn')).toBeDisabled();
    expect(screen.getByTestId('compare-btn')).toBeDisabled();
  });
});
