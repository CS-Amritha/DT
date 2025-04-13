
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ArchitecturePage = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Architecture</CardTitle>
          <CardDescription>
            Technical structure and components of our system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-gray-100 rounded-lg p-6 flex flex-col items-center">
              {/* Placeholder for architecture diagram */}
              <p className="text-gray-500 mb-4">Architecture diagram would be inserted here</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <div className="bg-blue-100 p-4 rounded-lg text-center">
                  <h4 className="font-medium mb-2">Frontend</h4>
                  <p className="text-sm">React, TypeScript, Tailwind CSS</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg text-center">
                  <h4 className="font-medium mb-2">API Layer</h4>
                  <p className="text-sm">RESTful endpoints, Authentication</p>
                </div>
                <div className="bg-purple-100 p-4 rounded-lg text-center">
                  <h4 className="font-medium mb-2">Backend</h4>
                  <p className="text-sm">Kubernetes, Docker, Microservices</p>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-medium">Architecture Overview</h3>
            <p>
              Our architecture follows a microservices approach, with containerized components
              running in Kubernetes. This provides scalability, resilience, and ease of deployment
              across different environments.
            </p>
            
            <h3 className="text-lg font-medium">Key Components</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Frontend dashboard built with React and TypeScript</li>
              <li>API gateway for handling requests and authentication</li>
              <li>Microservices for specific business domains</li>
              <li>Database layer with appropriate persistence solutions</li>
              <li>Kubernetes orchestration for container management</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArchitecturePage;
