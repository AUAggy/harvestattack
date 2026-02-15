import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SelfAssessment from '@/components/simulator/SelfAssessment';

export default function Assess() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Assess Your Risk
        </h1>
        <p className="mt-2 text-muted-foreground">
          Answer a few honest questions to understand how exposed your organization is to quantum threats.
        </p>
      </div>

      <SelfAssessment />

      <div className="text-center py-8">
        <Link
          to="/act"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          See What To Do
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
