import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistoryTable } from '../components/HistoryTable';
import type { Measurement } from '../types';

const measurements: Measurement[] = [
  { id: 1, engine: 'mustache', template: 'Hello {{name}}', data: {}, result: 'Hello world', duration_ms: 0.5, created_at: '2026-06-01 10:00:00' },
  { id: 2, engine: 'ejs', template: '<%= name %>', data: {}, result: 'world', duration_ms: 3.2, created_at: '2026-06-01 10:01:00' },
];

describe('HistoryTable', () => {
  it('shows empty state when no measurements', () => {
    render(<HistoryTable measurements={[]} onClear={() => {}} />);
    expect(screen.getByText(/Нет данных/)).toBeInTheDocument();
    expect(screen.queryByTestId('history-table')).not.toBeInTheDocument();
  });

  it('renders a row for each measurement', () => {
    render(<HistoryTable measurements={measurements} onClear={() => {}} />);
    expect(screen.getByTestId('history-table')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3); // header + 2 data rows
  });

  it('displays engine badges', () => {
    render(<HistoryTable measurements={measurements} onClear={() => {}} />);
    expect(screen.getByText('mustache')).toBeInTheDocument();
    expect(screen.getByText('ejs')).toBeInTheDocument();
  });

  it('shows measurement count in header', () => {
    render(<HistoryTable measurements={measurements} onClear={() => {}} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('История замеров (2)');
  });

  it('calls onClear when clear button is clicked', async () => {
    const onClear = vi.fn();
    render(<HistoryTable measurements={measurements} onClear={onClear} />);
    await userEvent.click(screen.getByText('Очистить'));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it('export button is disabled when no measurements', () => {
    render(<HistoryTable measurements={[]} onClear={() => {}} />);
    expect(screen.getByText('Экспорт CSV')).toBeDisabled();
  });
});
