
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DataCollectionPage = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Collection</CardTitle>
          <CardDescription>
            Methods and processes for gathering project data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p>
              Our data collection strategy focuses on gathering comprehensive metrics from 
              Kubernetes clusters while minimizing performance impact. We employ several 
              collection methods to ensure complete coverage.
            </p>
            
            <h3 className="text-lg font-medium">Collection Methods</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-medium text-kubernetes-purple mb-2">API Server Metrics</h4>
                <p className="text-sm">
                  Direct polling of the Kubernetes API server for real-time cluster state and resource metrics.
                </p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-medium text-kubernetes-purple mb-2">Node Exporters</h4>
                <p className="text-sm">
                  Agents running on each node to collect hardware and OS-level metrics.
                </p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-medium text-kubernetes-purple mb-2">Event Streams</h4>
                <p className="text-sm">
                  Subscription to event streams for real-time notifications about cluster changes.
                </p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-medium text-kubernetes-purple mb-2">Log Aggregation</h4>
                <p className="text-sm">
                  Centralized collection of logs from all containers and system components.
                </p>
              </div>
            </div>
            
            <h3 className="text-lg font-medium">Data Processing Pipeline</h3>
            <p>
              Collected data goes through several processing stages:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Initial collection and validation</li>
              <li>Preprocessing to normalize formats</li>
              <li>Enrichment with contextual information</li>
              <li>Storage in appropriate data stores</li>
              <li>Indexing for efficient querying</li>
            </ol>
            
            <h3 className="text-lg font-medium">Data Retention Policy</h3>
            <p>
              We implement tiered retention policies based on data importance:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>High-resolution metrics: 7 days</li>
              <li>Aggregated metrics: 30 days</li>
              <li>Critical events and alerts: 90 days</li>
              <li>Historical trends: 1 year</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataCollectionPage;
