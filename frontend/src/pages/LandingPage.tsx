
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Code, BarChart2 } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center max-w-4xl px-6">
        <img 
          src="/src/assets/kubeboom.png" 
          alt="Kubeboom Logo" 
          className="w-64 h-64 mx-auto mb-1"
        />
        <h1 className="text-7xl font-extrabold text-kubernetes-purple mb-4">Kubeboom</h1>
        <p className="text-3xl text-gray-600 mb-10">A Guidewire DevTrails Project for Kubernetes Monitoring</p>
        <p className="text-xl text-gray-500 italic mb-8">
          Your cluster’s sixth sense—capturing real-time data and using AI to predict trouble before it hits. Backed by LLM-powered insights, it doesn’t just monitor status—it reveals the why behind every warning.
        </p>
        <div className="flex flex-wrap gap-6 justify-center">
          <Button asChild size="lg" className="gap-3">
            <Link to="/pods">
              <BarChart2 className="h-7 w-7" />
              Go to Dashboard
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="gap-3">
            <a 
              href="https://github.com/CS-Amritha/DT" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Code className="h-7 w-7" />
              View Code
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
