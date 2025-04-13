
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FlowDiagramPage = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Flow Diagram</CardTitle>
          <CardDescription>
            Visual representation of data and process flows in the project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className="bg-gray-100 rounded-lg p-8 w-full max-w-3xl mb-4 text-center">
              {/* Placeholder for actual flow diagram */}
              <p className="text-gray-500 mb-4">Flow diagram visualization would be inserted here</p>
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <div className="bg-kubernetes-purple/10 p-4 rounded-lg">
                  <p className="font-medium">Data Input</p>
                </div>
                <div className="text-2xl">→</div>
                <div className="bg-kubernetes-purple/10 p-4 rounded-lg">
                  <p className="font-medium">Processing</p>
                </div>
                <div className="text-2xl">→</div>
                <div className="bg-kubernetes-purple/10 p-4 rounded-lg">
                  <p className="font-medium">Output</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Flow Description</h3>
            <p>
              This diagram illustrates how data flows through our system, from initial collection
              to processing and final visualization. Each node represents a key process point
              where transformation or validation occurs.
            </p>
            <p>
              The workflow ensures data integrity throughout the pipeline and provides multiple
              validation checkpoints to maintain reliability of outputs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlowDiagramPage;
