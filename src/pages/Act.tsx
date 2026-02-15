import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ActionToolkit from '@/components/simulator/ActionToolkit';

export default function Act() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Take Action
        </h1>
        <p className="mt-2 text-muted-foreground">
          Practical tools and templates to start your post-quantum migration today.
        </p>
      </div>

      <ActionToolkit />

      <div className="text-center py-8">
        <Link
          to="/share"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Share With Your Team
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
