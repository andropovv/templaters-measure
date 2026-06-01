import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EngineSelector } from '../components/EngineSelector';
import type { Engine } from '../types';

const engines: Engine[] = [
  { id: 'mustache', name: 'Mustache', example: { template: '', data: {} } },
  { id: 'handlebars', name: 'Handlebars', example: { template: '', data: {} } },
  { id: 'ejs', name: 'EJS', example: { template: '', data: {} } },
];

describe('EngineSelector', () => {
  it('renders all engine buttons', () => {
    render(<EngineSelector engines={engines} selected="mustache" onChange={() => {}} />);
    expect(screen.getByText('Mustache')).toBeInTheDocument();
    expect(screen.getByText('Handlebars')).toBeInTheDocument();
    expect(screen.getByText('EJS')).toBeInTheDocument();
  });

  it('marks selected engine with "selected" class', () => {
    render(<EngineSelector engines={engines} selected="handlebars" onChange={() => {}} />);
    expect(screen.getByText('Handlebars')).toHaveClass('selected');
    expect(screen.getByText('Mustache')).not.toHaveClass('selected');
  });

  it('calls onChange with correct id on click', async () => {
    const onChange = vi.fn();
    render(<EngineSelector engines={engines} selected="mustache" onChange={onChange} />);
    await userEvent.click(screen.getByText('EJS'));
    expect(onChange).toHaveBeenCalledWith('ejs');
  });
});
