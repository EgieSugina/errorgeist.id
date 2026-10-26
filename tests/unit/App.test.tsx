import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import App from '../../src/App';

it('renders the placeholder with StyleX-compiled styles', () => {
  render(<App />);
  const el = screen.getByText('dossier');
  expect(el).toBeInTheDocument();
  // stylex.props only yields className when the compiler ran
  expect(el.className).not.toBe('');
});
