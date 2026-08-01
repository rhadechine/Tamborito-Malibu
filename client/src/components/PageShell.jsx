import Navbar from './Navbar';

export default function PageShell({ children, variant = 'foundation' }) {
  const shellClass =
    variant === 'museum'
      ? 'app-shell museo'
      : variant === 'ecosystem'
        ? 'app-shell ecosystem'
        : 'app-shell foundation';

  return (
    <div className={shellClass}>
      <Navbar variant={variant} />
      {children}
    </div>
  );
}