import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  main: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    fontFamily: 'monospace',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
  },
});

export default function App() {
  return <main {...stylex.props(styles.main)}>dossier</main>;
}
