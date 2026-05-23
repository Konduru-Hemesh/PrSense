import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-base/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm text-text-secondary sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="font-semibold text-text-primary">PRSense</p>
          <p className="mt-1 max-w-xl">Two-layer code intelligence for teams that want instant feedback and deeper reasoning in one workflow.</p>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="transition hover:text-text-primary">Features</a>
          <a href="#architecture" className="transition hover:text-text-primary">Architecture</a>
          <Link to="/dashboard" className="transition hover:text-text-primary">Dashboard</Link>
        </div>
      </div>
    </footer>
  );
}
