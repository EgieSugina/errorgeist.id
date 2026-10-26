import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import App from '../../src/App';

afterEach(cleanup);

it('renders the dossier with StyleX-compiled styles', () => {
  render(<App />);
  const name = screen.getByRole('heading', { level: 1, name: 'Egie Sugina' });
  expect(name).toBeInTheDocument();
  // stylex.props only yields className when the compiler ran
  expect(name.className).not.toBe('');
});
