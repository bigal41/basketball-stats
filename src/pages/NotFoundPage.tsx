import { Link } from 'react-router-dom';
import { StatePanel } from '../ui/StatePanel';

export const NotFoundPage = () => (
  <div className="space-y-6">
    <StatePanel title="Page not found" body="This route does not exist in the current app." />
    <div className="text-center">
      <Link to="/" className="rounded-full bg-[var(--accent)] px-5 py-3 font-semibold text-white">
        Back to dashboard
      </Link>
    </div>
  </div>
);
