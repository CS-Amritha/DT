
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Code, BarChart2 } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center max-w-3xl px-4">
        <h1 className="text-5xl font-extrabold text-kubernetes-purple mb-4">Kubeboom</h1>
        <p className="text-xl text-gray-600 mb-8">A DevTrails Project for Kubernetes Monitoring</p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/pods">
              <BarChart2 className="h-5 w-5" />
              Go to Dashboard
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="gap-2">
            <a 
              href="https://github.com/CS-Amritha/DT" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Code className="h-5 w-5" />
              View Code
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
