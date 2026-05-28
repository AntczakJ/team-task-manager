import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProjectTasks from '../components/ProjectTasks';

vi.mock('../services/api', () => ({
  taskService: {
    getByProject: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    updateStatus: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ProjectTasks', () => {
  it('renderuje nagłówek i trzy kolumny statusów', async () => {
    render(<ProjectTasks projectId={1} />);

    expect(await screen.findByText('Zadania w projekcie')).toBeInTheDocument();
    expect(screen.getByText('Do zrobienia')).toBeInTheDocument();
    expect(screen.getByText('W toku')).toBeInTheDocument();
    expect(screen.getByText('Zrobione')).toBeInTheDocument();
  });

  it('pokazuje informację o braku zadań dla pustego projektu', async () => {
    render(<ProjectTasks projectId={1} />);

    const empty = await screen.findAllByText('Brak zadań');
    expect(empty.length).toBeGreaterThan(0);
  });
});
